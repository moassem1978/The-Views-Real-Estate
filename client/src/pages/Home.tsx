import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Home() {
  const { data: highlightedProperties } = useQuery({
    queryKey: ["/api/properties/highlighted"],
    queryFn: () => fetch("/api/properties/highlighted").then(res => res.json()),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Luxury Real Estate in Egypt
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover premium properties in Egypt's most prestigious developments. 
            From EMAAR Mivida to exclusive compounds, find your perfect luxury home.
          </p>
          <Link href="/properties">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Browse All Properties
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          
          {highlightedProperties && highlightedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlightedProperties.map((property: any) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {property.images?.[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-4">{property.city}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        {property.price ? `L.E ${Number(property.price).toLocaleString()}` : "Contact for Price"}
                      </span>
                      <Link href={`/properties/${property.id}`}>
                        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No featured properties available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Property Sales</h3>
              <p className="text-gray-600">Premium properties in Egypt's most exclusive developments</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
              <p className="text-gray-600">Expert insights into Egyptian real estate market trends</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Consultation</h3>
              <p className="text-gray-600">Personalized guidance for your real estate investment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}