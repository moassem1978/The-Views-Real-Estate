import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  images: File[];
  onUpload: (files: File[]) => void;
  onDelete: (index: number) => void;
}

export default function ImageUploader({ images, onUpload, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onUpload(filesArray);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <Card 
        className="border-2 border-dashed border-amber-300 p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-amber-600" />
          <div>
            <p className="text-lg font-medium text-amber-800">Drop images here or click to upload</p>
            <p className="text-sm text-gray-600">Supports PNG, JPG, JPEG files</p>
          </div>
          <Button variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50">
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, idx) => (
            <div key={idx} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(idx);
                    }}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {images.length} image{images.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}