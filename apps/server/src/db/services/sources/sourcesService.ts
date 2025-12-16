import { and, asc, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../..';
import type { NewSource, Source } from '../../schema/schema';
import { source } from '../../schema/schema';

type ApiSourceData = {
  url: string;
  title?: string | null;
  summary?: string | null;
  domain?: string | null;
  favicon?: string | null;
  isSelected?: boolean;
};

// Batch saves sources fetched from external API
export async function saveSourcesFromAPI(
  verificationId: string,
  sourcesData: ApiSourceData[]
): Promise<void> {
  try {
    if (!sourcesData || sourcesData.length === 0) {
      console.log(`No sources to save for verification: ${verificationId}`);
      return;
    }

    const sourceRecords: NewSource[] = sourcesData.map((apiSource) => ({
      id: uuidv4(),
      verificationId,
      url: apiSource.url,
      title: apiSource.title,
      summary: apiSource.summary,
      domain: apiSource.domain,
      favicon: apiSource.favicon,
      isSelected: true,
      scrapingDate: new Date(),
    }));
    await db.insert(source).values(sourceRecords);

    console.log(
      `[sourcesService] Saved ${sourceRecords.length} sources for verification: ${verificationId}`
    );
  } catch (error) {
    console.error('--- DETAILED ERROR in saveSourcesFromAPI ---');
    console.error(`Verification ID: ${verificationId}`);
    console.error(
      'Data received (first record):',
      sourcesData.length > 0 ? sourcesData[0] : 'No data'
    );
    console.error('Full Error Object:', error);
    console.error('--- END DETAILED ERROR ---');

    if (error instanceof Error && error.message.includes('Incorrect datetime value')) {
      throw new Error('Database error: Incorrect format for scrapingDate.');
    }
    throw new Error(
      'Failed to save sources from API: ' + (error instanceof Error ? error.message : String(error))
    );
  }
}

// Retrieves sources for verification with filtering and sorting
export async function getSources(
  verificationId: string,
  filters?: { domain?: string; sortBy?: string },
  searchQuery?: string
): Promise<Source[]> {
  try {
    const conditions: (SQL<unknown> | undefined)[] = [eq(source.verificationId, verificationId)];

    if (filters?.domain) {
      conditions.push(eq(source.domain, filters.domain));
    }

    if (searchQuery) {
      const query = `%${searchQuery}%`;
      conditions.push(or(like(source.title, query), like(source.summary, query)));
    }

    let orderBy = [desc(source.createdAt)];
    if (filters?.sortBy) {
      if (filters.sortBy === 'date_desc') {
        orderBy = [desc(source.createdAt)];
      } else if (filters.sortBy === 'date_asc') {
        orderBy = [asc(source.createdAt)];
      }
    }

    const result = await db
      .select()
      .from(source)
      .where(and(...conditions))
      .orderBy(...orderBy);

    return result;
  } catch (error) {
    console.error('Error getting sources:', error);
    throw new Error('Failed to retrieve sources');
  }
}

// Updates which sources are selected for final analysis
export async function updateSourceSelection(sourceId: string, isSelected: boolean): Promise<void> {
  try {
    await db.update(source).set({ isSelected }).where(eq(source.id, sourceId));
  } catch (error) {
    console.error('Error updating source selection:', error);
    throw new Error('Failed to update source selection');
  }
}

export async function createSource(data: {
  verificationId: string;
  url: string;
  title?: string | null;
  summary?: string | null;
  domain?: string | null;
  isSelected?: boolean;
}): Promise<Source> {
  try {
    const newId = uuidv4();

    const newSourceRecord: NewSource = {
      id: newId,
      verificationId: data.verificationId,
      url: data.url,
      title: data.title || null,
      summary: data.summary || null,
      domain: data.domain || null,
      isSelected: data.isSelected ?? false,
      scrapingDate: new Date(),
    };

    await db.insert(source).values(newSourceRecord);

    const result = await db.select().from(source).where(eq(source.id, newId)).limit(1);

    if (!result[0]) {
      throw new Error('No se pudo recuperar la fuente después de su creación.');
    }

    console.log(`[sourcesService] Fuente creada exitosamente con ID: ${newId}`);

    return result[0];
  } catch (error) {
    console.error('[sourcesService] Error al crear la fuente:', error);

    if (error instanceof Error && error.message.includes('foreign key constraint fails')) {
      throw new Error(`La verificación con ID "${data.verificationId}" no existe.`);
    }

    throw new Error('No se pudo añadir la nueva fuente a la base de datos.');
  }
}
