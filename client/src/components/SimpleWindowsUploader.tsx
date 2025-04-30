import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Info, Check, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Simple uploader with minimal dependencies for Windows compatibility
interface SimpleWindowsUploaderProps {
  propertyId: number;
  onSuccess?: (imageUrls: string[]) => void;
}

export default function SimpleWindowsUploader({ propertyId, onSuccess }: SimpleWindowsUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setUploadStatus('idle');
    }
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      // Create FormData object for the upload
      const formData = new FormData();
      
      // Add each file
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Log the upload details
      console.log(`Uploading ${selectedFiles.length} files for property ID ${propertyId}`);
      
      // Create the upload URL with the property ID
      const url = `/api/upload/windows?propertyId=${propertyId}`;
      
      // Perform the upload
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      // Handle non-successful responses
      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            errorMessage = `Upload failed with status ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const result = await response.json();
      console.log("Upload successful:", result);
      
      // Update status and show success message
      setUploadStatus('success');
      setStatusMessage(`Successfully uploaded ${result.count || result.imageUrls?.length || 0} images`);
      
      // Display success message
      toast({
        title: "Upload Successful",
        description: `Images uploaded successfully`,
        variant: "default"
      });
      
      // Clear the file input
      setSelectedFiles([]);
      
      // Call the success callback if provided
      if (onSuccess && result.imageUrls) {
        onSuccess(result.imageUrls);
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // Update status and show error message
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : "Failed to upload images");
      
      // Display error message
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
    <div className="bg-muted/30 border border-muted-foreground/20 rounded-lg p-4 my-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#B87333] mb-1">Simple Windows Upload</h3>
        <p className="text-sm text-muted-foreground">
          This simplified uploader works better with Windows systems. Images will be added to the property.
        </p>
      </div>
      
      {uploadStatus !== 'idle' && (
        <Alert 
          variant={uploadStatus === 'success' ? "default" : "destructive"}
          className="mb-4"
        >
          {uploadStatus === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {uploadStatus === 'success' ? 'Upload Complete' : 'Upload Failed'}
          </AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="windows-simple-files">Select Property Images</Label>
          <Input
            id="windows-simple-files"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Select multiple images (JPG, PNG) up to 5MB each
          </p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
            <div className="max-h-24 overflow-y-auto text-xs space-y-1 text-muted-foreground">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center">
                  <span className="truncate max-w-[250px]">{file.name}</span>
                  <span className="ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button
          type="button"
          onClick={uploadImages}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full bg-[#B87333] hover:bg-[#964B00] text-white"
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
        
        <div className="flex items-start gap-2 border-t border-border pt-3 mt-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            For best results on Windows, use smaller images in JPEG format and upload only a few at a time.
          </p>
        </div>
      </div>
    </div>
  );
}