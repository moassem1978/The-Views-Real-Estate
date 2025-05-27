
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectFormData {
  projectName: string;
  description: string;
  location: string;
  aboutDeveloper: string;
  images: string[];
  unitTypes: string[];
}

export default function ProjectEntryForm({ onSubmit }: { onSubmit: (data: ProjectFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("projectName", { required: "Project name is required" })}
              placeholder="Project Name"
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm">{errors.projectName.message}</p>
            )}
          </div>

          <div>
            <Textarea
              {...register("description", { required: "Description is required" })}
              placeholder="Project Description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("location", { required: "Location is required" })}
              placeholder="Location"
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Textarea
              {...register("aboutDeveloper", { required: "Developer information is required" })}
              placeholder="About the Developer"
            />
            {errors.aboutDeveloper && (
              <p className="text-red-500 text-sm">{errors.aboutDeveloper.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
