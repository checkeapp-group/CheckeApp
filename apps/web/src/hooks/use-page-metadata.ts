import { useEffect } from 'react';

/**
 * Hook to set page title and meta description for Client Components in Next.js App Router
 * @param title - The page title
 * @param description - The page meta description
 */
export function usePageMetadata(title: string, description: string) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    return () => {
    };
  }, [title, description]);
}
