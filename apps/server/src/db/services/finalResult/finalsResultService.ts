import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { finalResult, type NewFinalResult, source, verification } from '@/db/schema/schema';
import {
  callExternalApiWithLogging,
  generateArticle,
  generateImage,
  pollForResult,
} from '@/lib/externalApiClient';
import { getCriticalQuestions } from '../criticalQuestions/criticalQuestionService';
import { processAndDelegateImage } from '../images/imageService';
import { updateVerificationStatus } from '../verifications/verificationService';

type ArticleJobResult = {
  question: string;
  answer: string;
  metadata: {
    title: string;
    categories: string[];
    label: string;
    main_claim: string;
  };
  sources: Array<{ id: string; title: string; link: string; favicon: string; base_url: string }>;
  related_questions: Array<{ question: string; answer: string; sources_id: string[] }>;
};

type ImageJobResult = {
  image_description: string;
  image_url: string;
  size: string;
  cost: number;
};

export async function generateAndSaveFinalAnalysis(verificationId: string): Promise<void> {
  try {
    await updateVerificationStatus(verificationId, 'generating_summary');

    const verificationDetails = await db.query.verification.findFirst({
      where: eq(verification.id, verificationId),
    });
    if (!verificationDetails) {
      throw new Error(`Verificación con ID ${verificationId} no encontrada.`);
    }

    const selectedSourcesFromDB = await db
      .select()
      .from(source)
      .where(and(eq(source.verificationId, verificationId), eq(source.isSelected, true)));

    const questions = await getCriticalQuestions(verificationId);

    if (selectedSourcesFromDB.length === 0) {
      throw new Error('No se seleccionaron fuentes para el análisis.');
    }

    const sourcesForApi = selectedSourcesFromDB.map((s) => ({
      title: s.title,
      link: s.url,
      snippet: s.summary,
      favicon: s.favicon,
      base_url: s.domain,
    }));

    const articleJob = await callExternalApiWithLogging(verificationId, 'generate_article', () =>
      generateArticle({
        questions: questions.map((q) => q.questionText),
        input: verificationDetails.originalText,
        language: verificationDetails.language,
        location: 'es',
        sources: sourcesForApi,
        model: 'Latxa70B',
      })
    );

    const analysisResult = await pollForResult<ArticleJobResult>(
      articleJob.job_id,
      'generate_article',
      verificationId
    );
    await _saveFinalAnalysis(verificationId, analysisResult);

    await updateVerificationStatus(verificationId, 'generating_image');

    const articleTitle = analysisResult.metadata?.title || verificationDetails.originalText;

    try {
      const imageJob = await callExternalApiWithLogging(verificationId, 'generate_image', () =>
        generateImage({
          input: articleTitle,
          model: 'google/gemini-2.5-flash',
          size: '1920x1080',
        })
      );

      const imageResult = await pollForResult<ImageJobResult>(
        imageJob.job_id,
        'generate_image',
        verificationId
      );
      if (imageResult?.image_url) {
        const storedImagePath = await processAndDelegateImage(imageResult.image_url);

        await db
          .update(finalResult)
          .set({ imageUrl: storedImagePath })
          .where(eq(finalResult.verificationId, verificationId));

        console.log(
          `[FinalResultService] Image path saved to DB for verification: ${verificationId}`
        );
      }
    } catch (imageError) {
      console.error(
        `[FinalResultService] Image generation/processing failed for ${verificationId}, but the article was saved:`,
        imageError
      );
    }

    await updateVerificationStatus(verificationId, 'completed');

    console.log(
      `[FinalResultService] Proceso de análisis final completado para ${verificationId}.`
    );
  } catch (error) {
    console.error(
      `[FinalResultService] El análisis final falló catastróficamente para ${verificationId}:`,
      error
    );
    await updateVerificationStatus(verificationId, 'error');
    throw error;
  }
}

/**
 * Función auxiliar para guardar el resultado parseado en la base de datos.
 * @param verificationId
 * @param apiResponse
 */
async function _saveFinalAnalysis(
  verificationId: string,
  apiResponse: ArticleJobResult
): Promise<void> {
  try {
    const existingResult = await db.query.finalResult.findFirst({
      where: eq(finalResult.verificationId, verificationId),
    });

    if (existingResult) {
      console.warn(
        `[FinalResultService] Ya existía un resultado final para ${verificationId}. Se omitirá la inserción.`
      );
      return;
    }

    const metadata = apiResponse.metadata ?? {};

    const newFinalResult: NewFinalResult = {
      id: uuidv4(),
      verificationId,
      finalText: apiResponse.answer,
      labelsJson: metadata.categories ?? [],
      citationsJson: apiResponse.sources ?? [],
      answersJson: apiResponse.related_questions ?? [],
      metadata,
    };

    await db.insert(finalResult).values(newFinalResult);
    console.log(`Resultados del análisis final guardados para la verificación: ${verificationId}`);
  } catch (error) {
    console.error('Error guardando el análisis final:', error);
    throw new Error(
      `Fallo al guardar el análisis final: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

async function _saveImageResult(
  verificationId: string,
  imageResult: ImageJobResult
): Promise<void> {
  try {
    const imageData = {
      url: imageResult.image_url,
      description: imageResult.image_description,
    };

    await db
      .update(finalResult)
      .set({ imageJson: imageData })
      .where(eq(finalResult.verificationId, verificationId));

    console.log(`Resultado de la imagen guardado para la verificación: ${verificationId}`);
  } catch (error) {
    console.error('Error guardando el resultado de la imagen:', error);
  }
}
