import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

export default function PropertyDetails() {
  const [match, params] = useRoute("/properties/:id");
  const propertyId = params?.id;

  const { data: property, isLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => fetch(`/api/properties/${propertyId}`).then(res => res.json()),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Property not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">{property.title}</h1>
        
        {/* Property Images */}
        <div className="mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images.map((image: string, index: number) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Information</h2>
              <div className="space-y-2">
                <p><strong>Location:</strong> {property.address}, {property.city}, {property.country}</p>
                <p><strong>Project:</strong> {property.projectName}</p>
                <p><strong>Developer:</strong> {property.developerName}</p>
                <p><strong>Property Type:</strong> {property.propertyType}</p>
                <p><strong>Listing Type:</strong> {property.listingType}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="space-y-2">
                {property.bedrooms && <p><strong>Bedrooms:</strong> {property.bedrooms}</p>}
                {property.bathrooms && <p><strong>Bathrooms:</strong> {property.bathrooms}</p>}
                {property.builtUpArea && <p><strong>Built-up Area:</strong> {property.builtUpArea} sqm</p>}
                {property.plotSize && <p><strong>Plot Size:</strong> {property.plotSize} sqm</p>}
                {property.floor && <p><strong>Floor:</strong> {property.floor}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>

          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-primary mb-4">
              {property.price ? `L.E ${Number(property.price).toLocaleString()}` : "Contact for Price"}
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-semibold">
              Contact for More Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}