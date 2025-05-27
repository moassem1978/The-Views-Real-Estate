import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building2, MapPin, TrendingUp, Award, Users, Clock } from "lucide-react";

// High-traffic keywords landing page for Egyptian real estate
function RealEstateEgyptSEO() {
  useEffect(() => {
    // Ultra-targeted SEO for high-traffic Egyptian real estate keywords
    const title = "عقارات للبيع في مصر | شقق وفيلل وشاليهات للبيع | Real Estate Egypt for Sale";
    const description = "أفضل عقارات للبيع في مصر - شقق، فيلل، شاليهات في القاهرة والساحل الشمالي والعاصمة الإدارية. Best properties for sale in Egypt - apartments, villas, chalets in Cairo, North Coast, New Capital.";
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // High-traffic Egyptian real estate keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'عقارات للبيع, عقارات مصر, شقق للبيع مصر, فيلل للبيع, شاليهات للبيع, عقارات القاهرة, عقارات الساحل الشمالي, عقارات العاصمة الإدارية, شقق التجمع الخامس, عقارات الشيخ زايد, عقارات 6 أكتوبر, عقارات مدينة نصر, عقارات مصر الجديدة, أسعار العقارات في مصر, أرخص شقق للبيع, properties for sale Egypt, real estate Egypt, apartments for sale Cairo, villas for sale Egypt, chalets North Coast, Egypt property prices, best real estate Egypt, luxury properties Egypt, investment properties Egypt, EMAAR Egypt, Sodic Egypt, Palm Hills Egypt, Mountain View Egypt, real estate broker Egypt, property investment Egypt, Egyptian real estate market, Cairo real estate, Alexandria real estate, North Coast real estate, New Capital real estate, Egyptian developers, real estate companies Egypt, property search Egypt, buy property Egypt, sell property Egypt, rent property Egypt, real estate agent Egypt, property valuation Egypt, real estate trends Egypt, Egyptian property law, property financing Egypt, mortgage Egypt, real estate investment Egypt');

    // Add structured data for better search visibility
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate",
      "description": "Premium real estate consultancy specializing in luxury properties across Egypt",
      "url": window.location.href,
      "logo": "/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Egypt",
        "addressLocality": "Cairo"
      },
      "areaServed": [
        "Cairo",
        "North Coast",
        "New Administrative Capital",
        "Alexandria",
        "Sheikh Zayed",
        "6th of October",
        "New Cairo",
        "Heliopolis",
        "Maadi"
      ],
      "serviceType": [
        "Real Estate Sales",
        "Property Investment Consulting",
        "Luxury Property Services",
        "Property Management",
        "Real Estate Valuation"
      ]
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // Add hreflang for Arabic
    let hreflangAr = document.querySelector('link[rel="alternate"][hreflang="ar"]');
    if (!hreflangAr) {
      hreflangAr = document.createElement('link');
      hreflangAr.setAttribute('rel', 'alternate');
      hreflangAr.setAttribute('hreflang', 'ar');
      document.head.appendChild(hreflangAr);
    }
    hreflangAr.setAttribute('href', window.location.href);

  }, []);

  return null;
}

export default function RealEstateEgypt() {
  return (
    <div className="min-h-screen">
      <RealEstateEgyptSEO />
      <Header />
      
      {/* Hero Section with High-Traffic Keywords */}
      <section className="relative py-20 bg-gradient-to-br from-cream/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
              <span className="block">عقارات للبيع في مصر</span>
              <span className="block text-3xl md:text-4xl text-copper mt-2">
                Real Estate Egypt for Sale
              </span>
            </h1>
            <p className="text-xl text-rich-black/80 mb-8 leading-relaxed">
              أفضل العقارات في مصر - شقق، فيلل، شاليهات في أرقى المشاريع<br/>
              Premium properties in Egypt's most prestigious developments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-copper hover:bg-copper-dark text-white px-8 py-4 text-lg">
                  تصفح جميع العقارات - Browse All Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-copper text-copper hover:bg-copper hover:text-white px-8 py-4 text-lg">
                  استشارة مجانية - Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Traffic Keywords Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-rich-black mb-12">
            أشهر المناطق العقارية في مصر
            <span className="block text-xl text-copper mt-2">Top Real Estate Areas in Egypt</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cairo Properties */}
            <div className="bg-cream/20 p-6 rounded-lg border border-copper/10">
              <MapPin className="h-8 w-8 text-copper mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">عقارات القاهرة</h3>
              <p className="text-rich-black/70 mb-4">
                شقق وفيلل في التجمع الخامس، الشيخ زايد، 6 أكتوبر، مدينة نصر، مصر الجديدة
              </p>
              <Link href="/cairo-properties">
                <Button variant="outline" className="border-copper text-copper hover:bg-copper hover:text-white">
                  عرض عقارات القاهرة
                </Button>
              </Link>
            </div>

            {/* North Coast Properties */}
            <div className="bg-cream/20 p-6 rounded-lg border border-copper/10">
              <Building2 className="h-8 w-8 text-copper mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">عقارات الساحل الشمالي</h3>
              <p className="text-rich-black/70 mb-4">
                شاليهات وفيلل في مراسي، الجونة، سيدي عبد الرحمن، هاسيندا باي
              </p>
              <Link href="/north-coast-properties">
                <Button variant="outline" className="border-copper text-copper hover:bg-copper hover:text-white">
                  عرض شاليهات الساحل
                </Button>
              </Link>
            </div>

            {/* New Capital Properties */}
            <div className="bg-cream/20 p-6 rounded-lg border border-copper/10">
              <TrendingUp className="h-8 w-8 text-copper mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">عقارات العاصمة الإدارية</h3>
              <p className="text-rich-black/70 mb-4">
                شقق ودوبلكس في أحدث مشاريع العاصمة الإدارية الجديدة
              </p>
              <Link href="/properties?city=New Administrative Capital">
                <Button variant="outline" className="border-copper text-copper hover:bg-copper hover:text-white">
                  عرض عقارات العاصمة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Developers Section */}
      <section className="py-16 bg-cream/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-rich-black mb-12">
            أشهر المطورين العقاريين
            <span className="block text-xl text-copper mt-2">Top Real Estate Developers</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-rich-black mb-2">إعمار مصر</h3>
              <p className="text-sm text-rich-black/70">EMAAR Egypt - Mivida, Uptown Cairo</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-rich-black mb-2">سوديك</h3>
              <p className="text-sm text-rich-black/70">Sodic - Eastown, Westown, Villette</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-rich-black mb-2">بالم هيلز</h3>
              <p className="text-sm text-rich-black/70">Palm Hills - Hacienda, Palm Parks</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-rich-black mb-2">ماونتن فيو</h3>
              <p className="text-sm text-rich-black/70">Mountain View - iCity, Chill Out Park</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-rich-black mb-12">
            لماذا تختار The Views Real Estate؟
            <span className="block text-xl text-copper mt-2">Why Choose The Views Real Estate?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="h-12 w-12 text-copper mx-auto mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">30+ سنة خبرة</h3>
              <p className="text-rich-black/70">
                أكثر من 30 عامًا من الخبرة في السوق العقاري المصري مع محمد عاصم
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-copper mx-auto mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">آلاف العملاء الراضين</h3>
              <p className="text-rich-black/70">
                خدمنا آلاف العملاء في جميع أنحاء مصر بأعلى مستوى من الاحترافية
              </p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 text-copper mx-auto mb-4" />
              <h3 className="text-xl font-bold text-rich-black mb-3">خدمة 24/7</h3>
              <p className="text-rich-black/70">
                نحن متاحون على مدار الساعة لتقديم أفضل الخدمات العقارية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-copper text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            هل تبحث عن العقار المثالي؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            تواصل معنا اليوم للحصول على استشارة مجانية ومساعدتك في العثور على العقار المناسب
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-copper hover:bg-cream px-8 py-4 text-lg">
                اتصل بنا الآن - Contact Us Now
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-copper px-8 py-4 text-lg">
                تصفح العقارات - Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}