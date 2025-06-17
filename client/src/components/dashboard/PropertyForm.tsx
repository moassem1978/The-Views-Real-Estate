import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PropertyForm({ property, onSubmit }) {
  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    price: property?.price || "",
    // Add other fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = property ? "PUT" : "POST";
      const endpoint = property ? `/api/properties/${property.id}` : "/api/properties";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save property");

      const result = await response.json();
      toast.success("Property saved successfully");

      if (onSubmit) onSubmit(result);
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("Error saving property");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <Input name="title" value={formData.title} onChange={handleChange} />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <Input name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
        <Input name="price" value={formData.price} onChange={handleChange} type="number" />
      </div>

      {/* Add additional form fields as needed */}

      <Button type="submit" className="bg-[#B87333] text-white px-6 py-3 rounded-md shadow-md">
        {property ? "Update Property" : "Create Property"}
      </Button>
    </form>
  );
}