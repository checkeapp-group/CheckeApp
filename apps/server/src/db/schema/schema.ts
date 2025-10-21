import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/mysql-core';
import { user } from './auth';

/**
 * Database Schema for Fact Verification System
 *
 * Defines the complete MySQL schema for the FactCheckerProject using Drizzle ORM.
 * Users submit claims for verification, which are processed through multiple stages:
 * verification → critical questions → source collection → final results with citations.
 *
 * All tables include comprehensive indexing, validation constraints, and process logging.
 */

export const verification = mysqlTable(
  'verification',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    originalText: text('original_text').notNull(),
    status: mysqlEnum('status', [
      'draft',
      'processing_questions',
      'sources_ready',
      'generating_summary',
      'completed',
      'error',
    ])
      .notNull()
      .default('draft'),
    shareToken: varchar('share_token', { length: 36 }).unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('idx_verification_user_id').on(table.userId),
    statusIdx: index('idx_verification_status').on(table.status),
    createdAtIdx: index('idx_verification_created_at').on(table.createdAt),
    userStatusIdx: index('idx_verification_user_status').on(table.userId, table.status),
    shareTokenIdx: index('idx_verification_share_token').on(table.shareToken),
    originalTextLengthCheck: check(
      'chk_verification_original_text_length',
      sql`CHAR_LENGTH(${table.originalText}) >= 10 AND CHAR_LENGTH(${table.originalText}) <= 5000`
    ),
  })
);

export const criticalQuestion = mysqlTable(
  'critical_questions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    verificationId: varchar('verification_id', { length: 36 })
      .notNull()
      .references(() => verification.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    originalQuestion: text('original_question').notNull(),
    isEdited: boolean('is_edited').notNull().default(false),
    orderIndex: int('order_index').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    verificationIdIdx: index('idx_critical_questions_verification_id').on(table.verificationId),
    orderIdx: index('idx_critical_questions_order').on(table.verificationId, table.orderIndex),
    verificationOrderUnique: unique('uk_critical_questions_verification_order').on(
      table.verificationId,
      table.orderIndex
    ),
    orderIndexCheck: check('chk_critical_questions_order_index', sql`${table.orderIndex} >= 0`),
    questionTextLengthCheck: check(
      'chk_critical_questions_text_length',
      sql`CHAR_LENGTH(${table.questionText}) >= 5 AND CHAR_LENGTH(${table.questionText}) <= 200`
    ),
  })
);

export const source = mysqlTable(
  'source',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    verificationId: varchar('verification_id', { length: 36 })
      .notNull()
      .references(() => verification.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 2048 }).notNull(),
    title: varchar('title', { length: 500 }),
    summary: text('summary'),
    domain: varchar('domain', { length: 255 }),
    favicon: varchar('favicon', { length: 2048 }),
    isSelected: boolean('is_selected').notNull().default(false),
    scrapingDate: timestamp('scraping_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    verificationIdIdx: index('idx_source_verification_id').on(table.verificationId),
    domainIdx: index('idx_source_domain').on(table.domain),
    isSelectedIdx: index('idx_source_is_selected').on(table.verificationId, table.isSelected),
    createdAtIdx: index('idx_source_created_at').on(table.createdAt),
    urlLengthCheck: check(
      'chk_source_url_length',
      sql`CHAR_LENGTH(${table.url}) > 0 AND CHAR_LENGTH(${table.url}) <= 2048`
    ),
    //urlFormatCheck: check(
    //'chk_source_url_format',
    // sql`${table.url} REGEXP '^https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)'`
    //),
  })
);

export const finalResult = mysqlTable(
  'final_results',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    verificationId: varchar('verification_id', { length: 36 })
      .notNull()
      .references(() => verification.id, { onDelete: 'cascade' })
      .unique(),
    finalText: text('final_text').notNull(),
    labelsJson: json('labels_json'),
    citationsJson: json('citations_json'),
    answersJson: json('answers_json'),
    metadata: json('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    verificationIdIdx: index('idx_final_results_verification_id').on(table.verificationId),
    createdAtIdx: index('idx_final_results_created_at').on(table.createdAt),
    finalTextLengthCheck: check(
      'chk_final_results_text_length',
      sql`CHAR_LENGTH(${table.finalText}) >= 10`
    ),
    labelsJsonValidCheck: check(
      'chk_final_results_labels_json',
      sql`${table.labelsJson} IS NULL OR JSON_VALID(${table.labelsJson})`
    ),
    citationsJsonValidCheck: check(
      'chk_final_results_citations_json',
      sql`${table.citationsJson} IS NULL OR JSON_VALID(${table.citationsJson})`
    ),
    answersJsonValidCheck: check(
      'chk_final_results_answers_json',
      sql`${table.answersJson} IS NULL OR JSON_VALID(${table.answersJson})`
    ),
    metadataJsonValidCheck: check(
      'chk_final_results_metadata_json',
      sql`${table.metadata} IS NULL OR JSON_VALID(${table.metadata})`
    ),
  })
);

export const processLog = mysqlTable(
  'process_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    verificationId: varchar('verification_id', { length: 36 })
      .notNull()
      .references(() => verification.id, { onDelete: 'cascade' }),
    step: varchar('step', { length: 100 }).notNull(),
    status: mysqlEnum('status', ['started', 'completed', 'error']).notNull(),
    errorMessage: text('error_message'),
    apiResponse: json('api_response'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    verificationIdIdx: index('idx_process_logs_verification_id').on(table.verificationId),
    stepStatusIdx: index('idx_process_logs_step_status').on(
      table.verificationId,
      table.step,
      table.status
    ),
    createdAtIdx: index('idx_process_logs_created_at').on(table.createdAt),
    statusCreatedIdx: index('idx_process_logs_status_created').on(table.status, table.createdAt),
    errorMessageCheck: check(
      'chk_process_logs_error_message',
      sql`(${table.status} = 'error' AND ${table.errorMessage} IS NOT NULL) OR (${table.status} != 'error')`
    ),
    stepLengthCheck: check(
      'chk_process_logs_step_length',
      sql`CHAR_LENGTH(${table.step}) >= 1 AND CHAR_LENGTH(${table.step}) <= 100`
    ),
    apiResponseValidCheck: check(
      'chk_process_logs_api_response',
      sql`${table.apiResponse} IS NULL OR JSON_VALID(${table.apiResponse})`
    ),
  })
);

// Relations for Drizzle Relational Queries
import { relations } from 'drizzle-orm';

export const verificationRelations = relations(verification, ({ one, many }) => ({
  user: one(user, {
    fields: [verification.userId],
    references: [user.id],
  }),
  criticalQuestion: many(criticalQuestion),
  source: many(source),
  finalResult: one(finalResult, {
    fields: [verification.id],
    references: [finalResult.verificationId],
  }),
  processLog: many(processLog),
}));

export const criticalQuestionRelations = relations(criticalQuestion, ({ one }) => ({
  verification: one(verification, {
    fields: [criticalQuestion.verificationId],
    references: [verification.id],
  }),
}));

export const sourceRelations = relations(source, ({ one }) => ({
  verification: one(verification, {
    fields: [source.verificationId],
    references: [verification.id],
  }),
}));

export const finalResultRelations = relations(finalResult, ({ one }) => ({
  verification: one(verification, {
    fields: [finalResult.verificationId],
    references: [verification.id],
  }),
}));

export const processLogRelations = relations(processLog, ({ one }) => ({
  verification: one(verification, {
    fields: [processLog.verificationId],
    references: [verification.id],
  }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type CriticalQuestion = typeof criticalQuestion.$inferSelect;
export type NewCriticalQuestion = typeof criticalQuestion.$inferInsert;

export type Source = typeof source.$inferSelect;
export type NewSource = typeof source.$inferInsert;

export type FinalResult = typeof finalResult.$inferSelect;
export type NewFinalResult = typeof finalResult.$inferInsert;

export type ProcessLog = typeof processLog.$inferSelect;
export type NewProcessLog = typeof processLog.$inferInsert;

// Enums for frontend usage
export const verificationtatus = {
  DRAFT: 'draft',
  PROCESSING_QUESTIONS: 'processing_questions',
  source_READY: 'sources_ready',
  GENERATING_SUMMARY: 'generating_summary',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const processLogtatus = {
  STARTED: 'started',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type verificationtatusType = (typeof verificationtatus)[keyof typeof verificationtatus];
export type processLogtatusType = (typeof processLogtatus)[keyof typeof processLogtatus];
