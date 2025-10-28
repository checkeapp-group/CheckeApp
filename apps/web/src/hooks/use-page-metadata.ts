import { useEffect } from 'react';

/**
 * Hook to set page title, meta description, and Open Graph meta tags for Client Components in Next.js App Router
 * @param title - The page title
 * @param description - The page meta description
 * @param imageUrl
 */
export function usePageMetadata(title: string, description: string, imageUrl?: string) {
  useEffect(() => {
    // Set document title
    document.title = title;

    const finalImageUrl = imageUrl || '/og-image-default.png';

    const setMetaTag = (attribute: string, attributeValue: string, content: string) => {
      let metaTag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);

      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, attributeValue);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    setMetaTag('name', 'description', description);

    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', finalImageUrl);
    setMetaTag('property', 'og:type', 'website');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', finalImageUrl);

    return () => {
      // Cleanup not needed as new pages will override these values
    };
  }, [title, description, imageUrl]);
}
