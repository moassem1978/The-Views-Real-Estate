
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Blog() {
  useEffect(() => {
    const title = "Real Estate Blog Egypt Dubai - Market Insights & Property Trends | The Views";
    const description = "Expert insights on Egypt and Dubai real estate markets. Property investment guides, market trends, and luxury real estate analysis from Mohamed Assem.";
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Blog-specific keywords
    const keywords = 'real estate blog Egypt, Dubai property market trends, luxury property investment guide, New Cairo compound reviews, Dubai Marina property analysis, Hassan Allam properties insights, Binghatti developments review, property investment ROI Egypt Dubai, golden visa properties Dubai, real estate market forecast 2025';
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Add Blog schema
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "The Views Real Estate Blog",
      "description": "Expert insights on Egypt and Dubai real estate markets",
      "url": "https://www.theviewsconsultancy.com/blog",
      "author": {
        "@type": "Person",
        "name": "Mohamed Assem"
      }
    };

    let blogSchemaScript = document.querySelector('#blog-schema');
    if (!blogSchemaScript) {
      blogSchemaScript = document.createElement('script');
      blogSchemaScript.id = 'blog-schema';
      blogSchemaScript.type = 'application/ld+json';
      document.head.appendChild(blogSchemaScript);
    }
    blogSchemaScript.textContent = JSON.stringify(blogSchema);
  }, []);

  const blogPosts = [
    {
      title: "Dubai Marina vs Business Bay: Investment Comparison 2025",
      excerpt: "Comprehensive analysis of Dubai's top investment locations comparing rental yields, capital appreciation, and lifestyle amenities.",
      date: "2025-01-15",
      slug: "dubai-marina-vs-business-bay-investment"
    },
    {
      title: "New Cairo Compound Guide: Hassan Allam vs Competitors",
      excerpt: "Detailed comparison of New Cairo's premium compounds including Swan Lake Resort, amenities, pricing, and investment potential.",
      date: "2025-01-10",
      slug: "new-cairo-compound-guide-hassan-allam"
    },
    {
      title: "Golden Visa Properties Dubai: Complete Investment Guide",
      excerpt: "Everything you need to know about Dubai's golden visa program, eligible properties, and investment requirements.",
      date: "2025-01-05",
      slug: "golden-visa-properties-dubai-guide"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real Estate Market Insights & Property Trends
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Expert analysis of Egypt and Dubai property markets from Mohamed Assem, your trusted real estate consultant with 30+ years experience.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Topics</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Egypt Property Investment</h3>
                <p className="text-gray-600 text-sm">Compound living, North Coast properties, New Administrative Capital</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Dubai Real Estate</h3>
                <p className="text-gray-600 text-sm">Off-plan properties, golden visa eligibility, rental yields</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Market Analysis</h3>
                <p className="text-gray-600 text-sm">Price trends, ROI calculations, developer comparisons</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
