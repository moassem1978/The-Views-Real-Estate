import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string;
  structuredData?: object;
}

export default function SEO({ 
  title, 
  description, 
  url, 
  image = "/og-image.jpg",
  type = "website",
  keywords,
  structuredData
}: SEOProps) {
  const fullTitle = `${title} | The Views Real Estate`;
  const fullUrl = `https://theviewsconsultancy.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://theviewsconsultancy.com${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
      
      {keywords && <meta name="keywords" content={keywords} />}

      {/* OpenGraph Tags for Facebook & LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="The Views Real Estate" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}