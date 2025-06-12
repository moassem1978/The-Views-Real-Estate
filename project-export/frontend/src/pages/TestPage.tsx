import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TestPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-4">
            Test Page Works!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            React routing is functioning properly.
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ If you can see this page, the React app is rendering correctly.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}