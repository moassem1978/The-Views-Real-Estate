import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export default function SEO({
  title = "The Views Real Estate | Luxury Homes in Egypt, Dubai & London",
  description = "Discover premium properties with The Views Real Estate – specializing in Egypt, North Coast, Dubai, and London. Explore villas, penthouses, and investment opportunities.",
  image = "https://theviewsconsultancy.com/og-image.jpg",
  url = "https://theviewsconsultancy.com/",
  type = "website",
  noIndex = false,
  structuredData
}: SEOProps) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "The Views Real Estate",
    "url": "https://theviewsconsultancy.com",
    "logo": "https://theviewsconsultancy.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "sameAs": [
      "https://www.facebook.com/theviewsrealestate",
      "https://www.instagram.com/theviewsrealestate"
    ]
  };

  const finalStructuredData = structuredData || baseStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
}