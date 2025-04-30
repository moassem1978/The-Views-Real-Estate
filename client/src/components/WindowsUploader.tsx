import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";

interface WindowsUploaderProps {
  propertyId: number;
  onSuccess?: (imageUrls: string[]) => void;
}

export default function WindowsUploader({ propertyId, onSuccess }: WindowsUploaderProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const uploadFiles = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create a FormData object
      const formData = new FormData();
      
      // Append each file with the field name 'files'
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Use the Windows-specific endpoint with propertyId as a query parameter
      const uploadUrl = `/api/upload/windows?propertyId=${propertyId}`;
      console.log(`Uploading ${files.length} files to ${uploadUrl}`);

      // Make the upload request
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, try to get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Windows upload successful:", result);

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${result.count} images`,
        variant: "default"
      });

      // Reset the file input
      setFiles(null);
      
      // Call the success callback if provided
      if (onSuccess && result.imageUrls) {
        onSuccess(result.imageUrls);
      }
    } catch (error) {
      console.error("Windows upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-muted/30 border rounded-lg p-4 mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Windows Upload Mode</h3>
        <p className="text-sm text-muted-foreground">
          Use this special uploader if you're having issues uploading images from Windows.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="windows-files">Select Images</Label>
          <Input
            id="windows-files"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can select multiple images (up to 10)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            onClick={uploadFiles}
            disabled={!files || files.length === 0 || uploading}
            className="bg-[#B87333] hover:bg-[#964B00] text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Images
              </>
            )}
          </Button>
          
          {files && files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}