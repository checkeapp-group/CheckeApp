import { and, asc, desc, eq, like, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import type { NewSource, Source } from '@/db/schema/schema';
import { source } from '@/db/schema/schema';

export async function saveSourcesFromAPI(verificationId: string, sources: Source[]): Promise<void> {
  try {
    if (!sources || sources.length === 0) {
      console.log(`No sources to save for verification: ${verificationId}`);
      return;
    }

    const sourceRecords: NewSource[] = sources.map((apiSource) => ({
      id: uuidv4(),
      verificationId,
      url: apiSource.url,
      title: apiSource.title,
      summary: apiSource.summary,
      domain: apiSource.domain,
      isSelected: apiSource.isSelected,
      scrapingDate: new Date(),
    }));

    await db.insert(source).values(sourceRecords);

    console.log(
      `[sourcesService] Saved ${sourceRecords.length} sources for verification: ${verificationId}`
    );
  } catch (error) {
    console.error('Error saving sources from API:', error);
    throw new Error('Failed to save sources from API' + error);
  }
}

export async function getSources(
  verificationId: string,
  filters?: { domain?: string; sortBy?: string },
  searchQuery?: string
): Promise<Source[]> {
  try {
    const conditions = [eq(source.verificationId, verificationId)];

    if (filters?.domain) {
      conditions.push(eq(source.domain, filters.domain));
    }

    if (searchQuery) {
      const query = `%${searchQuery}%`;
      conditions.push(or(like(source.title, query), like(source.summary, query)));
    }

    let orderBy = [desc(source.createdAt)];
    if (filters?.sortBy) {
      if (filters.sortBy === 'date_desc') orderBy = [desc(source.createdAt)];
      if (filters.sortBy === 'date_asc') orderBy = [asc(source.createdAt)];
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

export async function updateSourceSelection(sourceId: string, isSelected: boolean): Promise<void> {
  try {
    await db.update(source).set({ isSelected }).where(eq(source.id, sourceId));
  } catch (error) {
    console.error('Error updating source selection:', error);
    throw new Error('Failed to update source selection');
  }
}
