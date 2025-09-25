import { extract } from '@extractus/article-extractor';

export type ArticleData = {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  author?: string;
  source?: string;
  content?: string;
};

/**
 * Extracts structured article data from a given URL.
 *
 * This function uses the @extractus/article-extractor library to fetch and parse
 * a web page, extracting key information like the title, main content, author,
 * and featured image. It includes a standard User-Agent header to avoid 403
 * Forbidden errors from sites that block basic scraping.
 *
 * @param {string} targetUrl The URL of the article to be processed.
 * @returns {Promise<ArticleData>} A promise that resolves to an object
 *          containing the extracted article data.
 * @throws {Error} Throws an error if the URL is invalid, the page cannot be
 *          fetched (e.g., 403, 404), or if no meaningful content can be extracted.
 */
export async function extractArticleData(targetUrl: string): Promise<ArticleData> {
  try {
    new URL(targetUrl);

    const fetchOptions = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };

    const data = await extract(targetUrl, null, fetchOptions);

    if (!(data && (data.title || data.description || data.content))) {
      throw new Error('No relevant information could be extracted from the article.');
    }

    console.log(`[ArticleExtractor] Data extracted successfully from ${targetUrl}`);

    return {
      url: data.url,
      title: data.title,
      description: data.description,
      image: data.image,
      author: data.author,
      source: data.source || new URL(targetUrl).hostname,
      content: data.content,
    };
  } catch (error) {
    console.error(`[ArticleExtractor] Error processing URL ${targetUrl}:`, error);

    if (error instanceof TypeError) {
      throw new Error('Invalid URL provided. Please check the format.');
    }

    if (error instanceof Error) {
      if (error.message.includes('403')) {
        throw new Error('The source website is blocking automated access (Error 403).');
      }
      if (error.message.includes('404')) {
        throw new Error('The article was not found at the provided URL (Error 404).');
      }
    }

    throw new Error(
      'Could not process the URL. Please ensure the link is correct and publicly accessible.'
    );
  }
}