import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { finalResult, type NewFinalResult, source, verification } from '@/db/schema/schema';
import { callExternalApiWithLogging, generateAnalysis } from '@/lib/externalApiClient';
import { getCriticalQuestions } from '../criticalQuestions/criticalQuestionService';
import { updateVerificationStatus } from '../verifications/verificationService';

type FinalApiResponse = {
  answer: string;
  metadata: {
    categories: string[];
    title?: string;
    label?: string;
    main_claim?: string;
    language?: string;
    location?: string;
  };
  sources: Record<string, { url: string; source: string; favicon: string }>;
  related_questions: Record<string, string>;
};

export async function generateAndSaveFinalAnalysis(verificationId: string): Promise<void> {
  try {
    // Updates the status to indicate the process has started
    await updateVerificationStatus(verificationId, 'generating_summary');

    // Gets all necessary data from the DB
    const verificationDetails = await db.query.verification.findFirst({
      where: eq(verification.id, verificationId),
    });

    if (!verificationDetails) {
      throw new Error(`Verificación con ID ${verificationId} no encontrada.`);
    }

    const selectedSources = await db
      .select()
      .from(source)
      .where(and(eq(source.verificationId, verificationId), eq(source.isSelected, true)));

    const questions = await getCriticalQuestions(verificationId);

    if (selectedSources.length === 0) {
      throw new Error('No se seleccionaron fuentes para el análisis.');
    }

    // API calls with the external service
    const analysisResult = await callExternalApiWithLogging(
      verificationId,
      'generate_analysis',
      () =>
        generateAnalysis({
          question: questions,
          input: verificationDetails.originalText,
          language: 'es',
          location: 'es',
          sources: selectedSources.map((s) => ({
            source: s,
          })),
          model: 'gpt4o',
        })
    );

    // Saves the result in the DB
    await _saveFinalAnalysis(verificationId, analysisResult as FinalApiResponse);

    await updateVerificationStatus(verificationId, 'completed');
  } catch (error) {
    console.error(`[FinalResultService] El análisis final falló para ${verificationId}:`, error);
    await updateVerificationStatus(verificationId, 'error');
  }
}

/**
 * Función auxiliar para guardar el resultado parseado en la base de datos.
 * @param verificationId 
 * @param apiResponse 
 */
async function _saveFinalAnalysis(
  verificationId: string,
  apiResponse: FinalApiResponse
): Promise<void> {
  try {
    const newFinalResult: NewFinalResult = {
      id: uuidv4(),
      verificationId,
      finalText: apiResponse.answer,
      labelsJson: apiResponse.metadata.categories,
      citationsJson: apiResponse.sources,
      answersJson: apiResponse.related_questions,
      metadata: apiResponse.metadata,
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
