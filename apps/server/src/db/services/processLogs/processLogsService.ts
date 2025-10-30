import { db } from '@/db';
import { processLog, type NewProcessLog } from '@/db/schema/schema';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export type ProcessLogStatus = 'started' | 'completed' | 'error';

/**
 * Creates a new process log entry
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @param status - The status of the step
 * @param errorMessage - Optional error message (required if status is 'error')
 * @param apiResponse - Optional API response data
 * @returns Promise with the created process log ID
 */

// biome-ignore lint/nursery/useMaxParams: Process logging requires multiple parameters for comprehensive tracking
export async function createProcessLog(
  verificationId: string,
  step: string,
  status: ProcessLogStatus,
  errorMessage?: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  apiResponse?: any
): Promise<string> {
  // Aditional validation
  if (status === 'error' && !errorMessage) {
    throw new Error('Error message is required when status is "error"');
  }

  const logId = uuidv4();

  const newProcessLog: NewProcessLog = {
    id: logId,
    verificationId,
    step,
    status,
    errorMessage: errorMessage || null,
    apiResponse: apiResponse || null,
  };

  try {
    await db.insert(processLog).values(newProcessLog);

    console.log(
      `📝 Process log created: ${logId} for verification: ${verificationId} - ${step} (${status})`
    );

    return logId;
  } catch (error) {
    console.error('❌ Error creating process log:', error);
    throw new Error(
      `Failed to create process log: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Logs the start of a process step
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @param status - The status (defaults to 'started')
 * @param apiResponse - Optional API response data
 * @returns Promise with the created log ID
 */
// biome-ignore lint/nursery/useMaxParams: Wrapper function maintains same signature as base function
// biome-ignore lint/suspicious/useAwait: Maintains original function signature for consistency
export async function logProcessStart(
  verificationId: string,
  step: string,
  status: ProcessLogStatus = 'started',
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  apiResponse?: any
): Promise<string> {
  return createProcessLog(verificationId, step, status, undefined, apiResponse);
}

/**
 * Logs the completion of a process step
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @param apiResponse - Optional API response data
 * @returns Promise with the created log ID
 */

// biome-ignore lint/suspicious/useAwait: <explanation>
export  async function logProcessCompleted(
  verificationId: string,
  step: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  apiResponse?: any
): Promise<string> {
  return createProcessLog(verificationId, step, 'completed', undefined, apiResponse);
}

/**
 * Logs an error in a process step
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @param errorMessage - The error message
 * @param apiResponse - Optional API response data that caused the error
 * @returns Promise with the created log ID
 */
// biome-ignore lint/nursery/useMaxParams: Error logging requires all parameters for proper troubleshooting

// biome-ignore lint/suspicious/useAwait: <explanation>
export  async function logProcessError(
  verificationId: string,
  step: string,
  errorMessage: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  apiResponse?: any
): Promise<string> {
  // Aditional validation
  if (!errorMessage || errorMessage.trim().length === 0) {
    throw new Error('Error message cannot be empty');
  }

  return createProcessLog(verificationId, step, 'error', errorMessage, apiResponse);
}

/**
 * Gets all process logs for a specific verification
 * @param verificationId - The verification ID
 * @returns Promise with array of process logs for the verification ordered by creation time
 */
export async function getVerificationProcessLogs(verificationId: string) {
  try {
    const logs = await db
      .select()
      .from(processLog)
      .where(eq(processLog.verificationId, verificationId))
      .orderBy(desc(processLog.createdAt));

    console.log(`📋 Retrieved ${logs.length} process logs for verification: ${verificationId}`);
    return logs;
  } catch (error) {
    console.error('❌ Error retrieving verification process logs:', error);
    throw new Error(
      `Failed to retrieve process logs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets the latest process log for a specific step in a verification
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @returns Promise with the latest log or null if not found
 */
export async function getLatestProcessLogForStep(verificationId: string, step: string) {
  try {
    const logs = await db
      .select()
      .from(processLog)
      .where(and(eq(processLog.verificationId, verificationId), eq(processLog.step, step)))
      .orderBy(desc(processLog.createdAt))
      .limit(1);

    return logs.length > 0 ? logs[0] : null;
  } catch (error) {
    console.error('❌ Error getting latest process log for step:', error);
    throw new Error(
      `Failed to get latest process log: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Checks if a specific step has completed successfully
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @returns Promise with boolean indicating if step completed
 */
export async function isStepCompleted(verificationId: string, step: string): Promise<boolean> {
  try {
    const latestLog = await getLatestProcessLogForStep(verificationId, step);
    return latestLog?.status === 'completed';
  } catch (error) {
    console.error('❌ Error checking if step completed:', error);
    return false;
  }
}

/**
 * Gets all error logs for a verification
 * @param verificationId - The verification ID
 * @returns Promise with array of error logs
 */
export async function getVerificationErrors(verificationId: string) {
  try {
    const logs = await db
      .select()
      .from(processLog)
      .where(and(eq(processLog.verificationId, verificationId), eq(processLog.status, 'error')))
      .orderBy(desc(processLog.createdAt));

    console.log(`🚨 Retrieved ${logs.length} error logs for verification: ${verificationId}`);
    return logs;
  } catch (error) {
    console.error('❌ Error retrieving verification error logs:', error);
    throw new Error(
      `Failed to retrieve error logs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper function to log a complete process step (start -> completion/error)
 * This is useful for wrapping async operations with automatic logging
 * @param verificationId - The verification ID
 * @param step - The process step name
 * @param operation - The async operation to execute
 * @param logApiResponse - Whether to log the API response (defaults to true)
 * @returns Promise with the operation result
 */
// biome-ignore lint/nursery/useMaxParams: Wrapper function needs all parameters for comprehensive process tracking
export async function logProcessStep<T>(
  verificationId: string,
  step: string,
  operation: () => Promise<T>,
  logApiResponse = true
): Promise<T> {
  await logProcessStart(verificationId, step);

  try {
    const result = await operation();
    await logProcessCompleted(verificationId, step, logApiResponse ? result : undefined);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await logProcessError(
      verificationId,
      step,
      errorMessage,
      logApiResponse && error ? error : undefined
    );
    throw error;
  }
}

/**
 * Utility function to get process statistics for a verification
 * @param verificationId - The verification ID
 * @returns Promise with process statistics
 */
export async function getProcessStatistics(verificationId: string) {
  try {
    const logs = await getVerificationProcessLogs(verificationId);

    const stats = {
      total: logs.length,
      started: logs.filter((log) => log.status === 'started').length,
      completed: logs.filter((log) => log.status === 'completed').length,
      errors: logs.filter((log) => log.status === 'error').length,
      uniqueSteps: new Set(logs.map((log) => log.step)).size,
      lastActivity: logs[0]?.createdAt || null,
    };

    console.log(`📊 Process statistics for verification ${verificationId}:`, stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting process statistics:', error);
    throw new Error(
      `Failed to get process statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Cleans up old process logs (useful for maintenance)
 * @param daysOld - Number of days old to consider for cleanup
 * @returns Promise with number of deleted logs
 */
export async function cleanupOldProcessLogs(daysOld = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.delete(processLog).where(
      eq(processLog.createdAt, cutoffDate)
    );

    console.log(`🧹 Cleaned up old process logs older than ${daysOld} days`);
    return result.length || 0;
  } catch (error) {
    console.error('❌ Error cleaning up old process logs:', error);
    throw new Error(
      `Failed to cleanup old logs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
