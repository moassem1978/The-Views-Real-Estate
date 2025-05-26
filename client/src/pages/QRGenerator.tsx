
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const QRGenerator = () => {
  const [url, setUrl] = useState('https://www.theviewsconsultancy.com');
  const [size, setSize] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use QR Server API to generate QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png&margin=10`;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = qrUrl;
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'luxury-realty-qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  React.useEffect(() => {
    generateQR();
  }, [url, size]);

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-rich-black">
              QR Code Generator
            </CardTitle>
            <p className="text-gray-600">
              Generate QR codes for your website to share on social media
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">QR Code Size</Label>
              <Input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                min="200"
                max="800"
                step="50"
              />
            </div>

            <div className="flex flex-col items-center space-y-4">
              <canvas 
                ref={canvasRef}
                className="border border-gray-200 rounded-lg shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              <div className="flex gap-3">
                <Button onClick={generateQR} variant="outline">
                  Regenerate QR Code
                </Button>
                <Button onClick={downloadQR} className="bg-copper hover:bg-copper-dark">
                  Download QR Code
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Social Media Tips:</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Use 400x400px for Instagram posts</li>
                <li>• Use 600x600px for high-quality prints</li>
                <li>• Add your logo or branding around the QR code</li>
                <li>• Test the QR code before sharing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRGenerator;
