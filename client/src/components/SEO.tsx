import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({
  title = "The Views Consultancy – Luxury Real Estate Egypt & Dubai",
  description = "Bespoke high-end property advisory for prime locations in Egypt and Dubai. Resale and primary listings by top developers like Emaar, Sodic, and more.",
  image = "/og-default.svg",
  url = "https://theviewsconsultancy.com",
}: SEOProps) {
  const fullUrl = url.startsWith('http') ? url : `https://theviewsconsultancy.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://theviewsconsultancy.com${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="UTF-8" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Language & Branding */}
      <html lang="en" />
      <link rel="icon" href="/favicon.ico" />

      {/* Company Schema Markup */}
      <script type="application/ld+json">
        {`{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "The Views Consultancy",
          "url": "https://theviewsconsultancy.com",
          "logo": "https://theviewsconsultancy.com/logo.png",
          "email": "Sales@theviewsconsultancy.com",
          "telephone": "+201063111136",
          "sameAs": [
            "https://www.facebook.com/theviewsconsultancy"
          ]
        }`}
      </script>
    </Helmet>
  );
}