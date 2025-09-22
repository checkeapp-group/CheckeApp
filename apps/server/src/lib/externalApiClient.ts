import type { CriticalQuestion, Source } from '@/db/schema/schema';
import {
  logProcessCompleted,
  logProcessError,
  logProcessStart,
} from '@/db/services/processLogs/processLogsService';

// API configuration from environment variables
const apiMode = process.env.API_MODE || 'development';
const isDevelopment = apiMode === 'development';

const config = {
  // Default to fake API for development, require explicit configuration for production
  baseUrl:
    process.env.EXTERNAL_API_BASE_URL || (isDevelopment ? 'http://localhost:3000/api/fakeAPI' : ''),
  apiKey: process.env.EXTERNAL_API_KEY || (isDevelopment ? 'fake-api-key-for-development' : ''),
  timeout: Number.parseInt(process.env.EXTERNAL_API_TIMEOUT || '60000'),
  maxRetries: Number.parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: Number.parseInt(process.env.RETRY_DELAY || '1000'),

  // API mode for debugging/logging
  mode: apiMode,

  // Individual endpoint URLs (can be overridden)
  generateQuestionsUrl: process.env.EXTERNAL_API_GENERATE_QUESTIONS_URL,
  searchSourcesUrl: process.env.EXTERNAL_API_SEARCH_SOURCES_URL,
  generateAnalysisUrl: process.env.EXTERNAL_API_GENERATE_ANALYSIS_URL,
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

      // Wait before retrying (exponential backoff)
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success === false) {
      throw new Error(`API returned error: ${result.error} - ${result.message}`);
    }

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Specific API functions
// biome-ignore lint/suspicious/useAwait: <explanation>
export async function generateQuestions(data: {
  verification_id: string;
  original_text: string;
  language?: string;
  max_questions?: number;
}) {
  const url = getEndpointUrl('generate-questions', config.generateQuestionsUrl);
  return makeApiCall(url, data);
}

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function searchSources(data: {
  verification_id: string;
  questions: Array<{
    id: string;
    question_text: string;
    order_index: number;
  }>;
  original_text: string;
  search_parameters?: {
    max_sources?: number;
    language?: string;
    date_range?: string;
  };
}) {
  const url = getEndpointUrl('search-sources', config.searchSourcesUrl);
  return makeApiCall(url, data);
}

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function generateAnalysis(data: {
  question: CriticalQuestion[];
  input: string;
  language: string;
  location: string;
  sources: Array<{
    source: Source;
  }>;
  model: string;
}) {
  const url = getEndpointUrl('generate-analysis', config.generateAnalysisUrl);
  const apiPayload = {
    question: data.question,
    input: data.input,
    language: data.language,
    location: data.location,
    'Listas de fuentes': data.sources,
    model: data.model,
  };
  return makeApiCall(url, apiPayload);
}

// Export the configuration for debugging/testing
export { config as externalApiConfig };
