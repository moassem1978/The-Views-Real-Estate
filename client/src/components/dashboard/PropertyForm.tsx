import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Property {
  id?: number;
  title: string;
  description: string;
  price: number;
}

interface PropertyFormProps {
  property?: Property;
  onSubmit?: (property: Property) => void;
}

export default function PropertyForm({ property, onSubmit }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    price: property?.price?.toString() || "",
    // Extend with other fields as needed
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const method = property ? "PUT" : "POST";
      const endpoint = property ? `/api/properties/${property.id}` : "/api/properties";

      const submitData = {
        ...formData,
        price: parseInt(formData.price) || 0
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Failed to save property");

      const result = await response.json();
      toast.success("Property saved successfully");
      if (onSubmit) onSubmit(result);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Error saving property");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" value={formData.description} onChange={handleChange} />
      </div>
      
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
      </div>
      
      {/* Add more fields as needed */}
      <Button type="submit" className="bg-[#B87333] text-white">Save Property</Button>
    </form>
  );
}