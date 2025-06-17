import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyCard from "./PropertyCard";
import PropertyForm from "../dashboard/PropertyForm";
import { Property } from "../../types";

interface PropertyListProps {
  showDeleteButton?: boolean;
  showAddButton?: boolean;
  maxItems?: number;
}

export default function PropertyList({ 
  showDeleteButton = false, 
  showAddButton = false,
  maxItems 
}: PropertyListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      
      const data = await response.json();
      const propertiesData = data.data || data;
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property deletion
  const handleDelete = async (propertyId: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Deletion failed");

      toast.success("Property deleted successfully");
      // Remove from local state
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete property");
    }
  };

  // Handle property form submission
  const handlePropertySubmit = (property: Property) => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev => 
        prev.map(p => p.id === property.id ? property : p)
      );
      toast.success("Property updated successfully");
    } else {
      // Add new property
      setProperties(prev => [property, ...prev]);
      toast.success("Property added successfully");
    }
    
    setShowForm(false);
    setEditingProperty(null);
  };

  // Filter properties based on search
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.propertyType && property.propertyType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Apply max items limit if specified
  const displayProperties = maxItems 
    ? filteredProperties.slice(0, maxItems)
    : filteredProperties;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        {showAddButton && (
          <Button 
            onClick={() => {
              setEditingProperty(null);
              setShowForm(true);
            }}
            className="bg-[#B87333] hover:bg-[#964B00] text-white"
          >
            Add Property
          </Button>
        )}
      </div>

      {/* Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingProperty(null);
                }}
              >
                Cancel
              </Button>
            </div>
            
            <PropertyForm
              property={editingProperty || undefined}
              onSubmit={handlePropertySubmit}
            />
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {displayProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No properties match your search." : "No properties found."}
          </p>
          {showAddButton && !searchTerm && (
            <Button 
              onClick={() => {
                setEditingProperty(null);
                setShowForm(true);
              }}
              className="bg-[#B87333] hover:bg-[#964B00] text-white"
            >
              Add Your First Property
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDelete}
                showDeleteButton={showDeleteButton}
              />
            ))}
          </div>

          {/* Show load more info if maxItems limit is applied */}
          {maxItems && filteredProperties.length > maxItems && (
            <div className="text-center py-4">
              <p className="text-gray-600">
                Showing {maxItems} of {filteredProperties.length} properties
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}