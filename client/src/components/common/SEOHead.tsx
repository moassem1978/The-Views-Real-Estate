
interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noIndex?: boolean;
  pageName?: string;
}

interface SEOPageData {
  title: string;
  description: string;
  keywords: string;
  structured_data: any;
}

export default function SEOHead({
  title: propTitle,
  description: propDescription,
  keywords: propKeywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  structuredData: propStructuredData,
  noIndex = false,
  pageName
}: SEOHeadProps) {
  const [seoData, setSeoData] = useState<SEOPageData | null>(null);

  // Fetch dynamic SEO data if pageName is provided
  useEffect(() => {
    if (pageName) {
      fetch(`/api/seo/page/${pageName}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setSeoData(data);
        })
        .catch(console.error);
    }
  }, [pageName]);

  // Use dynamic SEO data if available, otherwise use props
  const title = seoData?.title || propTitle || 'The Views Real Estate Consultancy';
  const description = seoData?.description || propDescription || 'Premium real estate consultant Egypt Dubai';
  const keywords = seoData?.keywords || propKeywords;
  const structuredData = seoData?.structured_data || propStructuredData;

  useEffect(() => {
    // Set page title
    document.title = title;

    // Meta description
    updateMetaTag('name', 'description', description);
    
    // Keywords
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Robots
    if (noIndex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }

    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl);
    }

    // Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', window.location.href);
    
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
      updateMetaTag('property', 'og:image:alt', title);
    }

    // Twitter Card
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    
    if (ogImage) {
      updateMetaTag('name', 'twitter:image', ogImage);
    }

    // Structured Data
    if (structuredData) {
      injectStructuredData(structuredData);
    }

    return () => {
      // Cleanup structured data on unmount
      if (structuredData) {
        removeStructuredData();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData, noIndex]);

  const updateMetaTag = (attribute: string, name: string, content: string) => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateLinkTag = (rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  };

  const injectStructuredData = (data: object) => {
    let script = document.querySelector('#seo-structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  };

  const removeStructuredData = () => {
    const script = document.querySelector('#seo-structured-data');
    if (script) {
      script.remove();
    }
  };

  return null;
}
