import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DirectUploaderProps {
  onUploadSuccess: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

const DirectUploader: React.FC<DirectUploaderProps> = ({ 
  onUploadSuccess, 
  maxFiles = 10,
  label = "Upload Images" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check if we're exceeding the maximum number of files
      if (selectedFiles.length > maxFiles) {
        toast({
          title: "Too Many Files",
          description: `You can only upload a maximum of ${maxFiles} files at once.`,
          variant: "destructive",
        });
        return;
      }
      
      // Log info about the selected files
      console.log(`Selected ${selectedFiles.length} files for upload`);
      selectedFiles.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.name}, size: ${Math.round(file.size/1024)}KB, type: ${file.type}`);
      });
      
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a FormData object to send the files
      const formData = new FormData();
      
      // Add each file to the FormData
      files.forEach(file => {
        formData.append('files', file);
      });
      
      console.log(`Uploading ${files.length} files via DirectUploader`);
      
      // Try each endpoint in sequence until one works
      const endpoints = [
        '/api/upload/bypass',
        '/api/simple-upload',
        '/api/basic-upload'
      ];
      
      let uploadSuccessful = false;
      let imageUrls: string[] = [];
      
      for (const endpoint of endpoints) {
        if (uploadSuccessful) break;
        
        try {
          console.log(`Trying upload to ${endpoint}...`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            console.error(`Upload to ${endpoint} failed with status ${response.status}`);
            const errorText = await response.text();
            console.error(`Error details: ${errorText}`);
            continue; // Try the next endpoint
          }
          
          const result = await response.json();
          console.log(`Upload to ${endpoint} succeeded:`, result);
          
          if (result.imageUrls || result.urls) {
            imageUrls = result.imageUrls || result.urls;
            uploadSuccessful = true;
            
            // Call the callback with the image URLs
            onUploadSuccess(imageUrls);
            
            toast({
              title: "Upload Successful",
              description: `Successfully uploaded ${imageUrls.length} images`,
            });
          } else {
            console.error(`${endpoint} response missing image URLs:`, result);
          }
        } catch (error) {
          console.error(`Error with ${endpoint}:`, error);
        }
      }
      
      if (!uploadSuccessful) {
        throw new Error("All upload methods failed");
      }
      
      // Clear the file input after successful upload
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-2">{label}</h3>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {files.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {files.length} file(s) selected
          </p>
        )}
      </div>
      
      <Button 
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="w-full"
      >
        {isUploading ? "Uploading..." : "Upload Files"}
      </Button>
    </div>
  );
};

export default DirectUploader;