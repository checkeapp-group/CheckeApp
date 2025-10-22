import { and, asc, desc, eq, like, sql } from 'drizzle-orm';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { finalResult, verification, type verificationtatusType } from '@/db/schema/schema';

type GetVerificationsListParams = {
  userId?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: verificationtatusType;
};

export async function getVerificationsList({
  userId,
  page,
  limit,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  status,
}: GetVerificationsListParams) {
  const offset = (page - 1) * limit;

  const whereConditions = [];
  if (userId) {
    whereConditions.push(eq(verification.userId, userId));
  }
  if (search) {
    whereConditions.push(like(verification.originalText, `%${search}%`));
  }
  if (status) {
    whereConditions.push(eq(verification.status, status));
  }

  // Mapeo de columnas para ordenación segura
  const sortableColumns: Record<string, any> = {
    createdAt: verification.createdAt,
    originalText: verification.originalText,
  };

  const orderBy = sortableColumns[sortBy]
    ? sortOrder === 'asc'
      ? asc(sortableColumns[sortBy])
      : desc(sortableColumns[sortBy])
    : desc(verification.createdAt);

  const verificationsQuery = db
    .select({
      id: verification.id,
      createdAt: verification.createdAt,
      originalText: verification.originalText,
      status: verification.status,
      userName: user.name,
      claim: sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${finalResult.metadata}, '$.main_claim'))`,
      label: sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${finalResult.metadata}, '$.label'))`,
    })
    .from(verification)
    .leftJoin(user, eq(verification.userId, user.id))
    .leftJoin(finalResult, eq(verification.id, finalResult.verificationId))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const totalCountQuery = db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(verification)
    .where(and(...whereConditions));

  const [verifications, total] = await Promise.all([verificationsQuery, totalCountQuery]);

  const totalCount = total[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    verifications,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
}
