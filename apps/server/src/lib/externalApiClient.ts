import {
  logProcessCompleted,
  logProcessError,
  logProcessStart,
} from '@/db/services/processLogs/processLogsService';

// API configuration from environment variables
const apiMode = process.env.API_MODE || 'development';
const isDevelopment = apiMode === 'development';

const config = {
  baseUrl: process.env.EXTERNAL_API_BASE_URL,
  apiKey: process.env.EXTERNAL_API_KEY,
  timeout: Number.parseInt(process.env.EXTERNAL_API_TIMEOUT || '60000'),
  maxRetries: Number.parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: Number.parseInt(process.env.RETRY_DELAY || '1000'),
  mode: apiMode,
};

// Validate configuration
if (!config.baseUrl) {
  throw new Error('EXTERNAL_API_BASE_URL must be configured for production mode');
}

if (!config.apiKey) {
  throw new Error('EXTERNAL_API_KEY must be configured for production mode');
}

// Log configuration on startup (only in development)
if (isDevelopment) {
  console.log(`🔧 External API Client initialized in ${config.mode} mode`);
  console.log(`📡 Base URL: ${config.baseUrl}`);
  console.log(`🔑 API Key: ${config.apiKey.substring(0, 10)}...`);
  console.log(`⏱️  Timeout: ${config.timeout}ms, Retries: ${config.maxRetries}`);
}

// Helper function to construct URL
function getEndpointUrl(endpoint: string, customUrl?: string): string {
  if (customUrl) {
    return customUrl;
  }
  return `${config.baseUrl}/${endpoint}`;
}

// Generic API call wrapper with logging and retries

export async function callExternalApiWithLogging<T>(
  verificationId: string,
  step: string,
  apiCall: () => Promise<T>
): Promise<T> {
  await logProcessStart(verificationId, step);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await apiCall();
      await logProcessCompleted(verificationId, step, result);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxRetries) {
        await logProcessError(verificationId, step, lastError.message, lastError);
        throw lastError;
      }

      const delay = config.retryDelay * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('API call failed after retries');
}

// API call helper with timeout and proper headers
async function makeApiCall<T>(url: string, data: any): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

   if (!config.apiKey) {
    throw new Error("CRITICAL: EXTERNAL_API_KEY is not defined at the time of API call.");
  }

  try {
    console.log(`[makeApiCall] Attempting to POST to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API_CALL_FAILED] URL: ${url}`);
      console.error(`[API_CALL_FAILED] Status: ${response.status} ${response.statusText}`);
      console.error(`[API_CALL_FAILED] Request Body Sent:`, JSON.stringify(data, null, 2));
      console.error(`[API_CALL_FAILED] Response Body:`, errorText);
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[makeApiCall CATCH BLOCK] An unexpected error occurred while calling ${url}.`);
    if (error instanceof Error) {
        console.error(`[makeApiCall CATCH BLOCK] Error Name: ${error.name}`);
        console.error(`[makeApiCall CATCH BLOCK] Error Message: ${error.message}`);
        console.error(`[makeApiCall CATCH BLOCK] Error Cause:`, (error as any).cause);
    } else {
        console.error(`[makeApiCall CATCH BLOCK] A non-Error object was thrown:`, error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateQuestions(data: {
  input: string;
  model: string;
  language: string;
  location: string;
}) {
  const url = `${config.baseUrl}/stepwise/critical-questions`;
  return makeApiCall<{ job_id: string }>(url, data);
}

export async function searchSources(data: {
  questions: string[];
  input: string;
  language: string;
  location: string;
  model: string;
}) {
  const url = `${config.baseUrl}/stepwise/search-sources`;
  return makeApiCall<{ job_id: string }>(url, data);
}

export async function generateArticle(data: {
  questions: string[];
  input: string;
  language: string;
  location: string;
  sources: any;
  model: string;
}) {
  const url = `${config.baseUrl}/stepwise/generate-article`;
  return makeApiCall<{ job_id: string }>(url, data);
}

export async function generateImage(data: {
  input: string;
  model: string;
  size?: string;
  style?: string;
}) {
  const url = `${config.baseUrl}/stepwise/generate-image`;
  return makeApiCall<{ job_id: string }>(url, data);
}

export async function refineQuestions(data: {
  questions: Array<{ id: string; question_text: string; order_index: number }>;
  input: string;
  refinement: string;
  language: string;
  location: string;
  model: string;
}) {
  const url = getEndpointUrl('refine-questions', process.env.EXTERNAL_API_REFINE_QUESTIONS_URL);
  return makeApiCall<{
    questions: { question_text: string; original_question: string; order_index: number }[];
  }>(url, data);
}

export async function getJobResult<T>(
  jobId: string
): Promise<{ status: string; result: T }> {
  const url = `${config.baseUrl}/result/${jobId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey!,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API call to get job result failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

export async function pollForResult<T>(
  jobId: string,
  stepName: string,
  verificationId: string
): Promise<T> {
  const maxAttempts = 50; 
  const delay = 4000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Polling] Attempt ${attempt}/${maxAttempts} for job ${jobId} (${stepName})`);
    
    const response = await getJobResult<T>(jobId);

    if (response.status === 'completed') {
      console.log(`[Polling] Job ${jobId} (${stepName}) completed successfully.`);
      if (!response.result) {
        await logProcessError(verificationId, stepName, `Job ${jobId} completed but returned no result.`);
        throw new Error(`Job ${jobId} (${stepName}) completed but returned no result.`);
      }
      return response.result;
    }

    if (response.status === 'failed' || response.status === 'error') {
      const errorMessage = `Job processing failed for step: ${stepName} (Job ID: ${jobId})`;
      console.error(`[Polling] Job ${jobId} (${stepName}) failed.`);
      await logProcessError(verificationId, stepName, errorMessage, response);
      throw new Error(errorMessage);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const timeoutMessage = `Polling timed out for job ${jobId} (${stepName}) after ${maxAttempts} attempts.`;
  await logProcessError(verificationId, stepName, timeoutMessage);
  throw new Error(timeoutMessage);
}

export { config as externalApiConfig };
