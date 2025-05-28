
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function QRGenerator() {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  const generateQR = async () => {
    if (!url) return;
    try {
      // Using QR Server API for QR code generation
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCode(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rich-black mb-4">QR Code Generator</h1>
            <p className="text-gray-600">Generate QR codes for URLs, text, or any content</p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Generate QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter URL or text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button onClick={generateQR} className="w-full">
                  Generate QR Code
                </Button>
                {qrCode && (
                  <div className="mt-4 flex justify-center">
                    <img src={qrCode} alt="QR Code" className="border border-gray-200 rounded" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
