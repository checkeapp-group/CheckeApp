import { eq } from 'drizzle-orm';
import type { Source } from '@/db/schema/schema';
import { source } from '@/db/schema/schema';
import { db } from '@/lib/db';

export async function saveSourcesFromAPI(verificationId: string, sources: Source[]): Promise<void> {
  try {
    for (const sourceData of sources) {
      await db.insert(source).values({
        id: sourceData.id,
        verificationId,
        url: sourceData.url,
        title: sourceData.title,
        summary: sourceData.summary,
      });
    }
  } catch (error) {
    console.error('Error saving sources from API:', error);
    throw new Error('Failed to save sources from API' + error);
  }
}

export async function getSources(verificationId: string): Promise<Source[]> {
  try {
    const result = await db
      .select()
      .from(source)
      .where(eq(source.verificationId, verificationId))
      .orderBy(source.createdAt);
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
