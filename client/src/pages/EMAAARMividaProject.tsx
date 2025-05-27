export default function EMAAARMividaProject() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">EMAAR Mivida</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Premium Living in New Cairo</h2>
          
          <p className="text-gray-700 mb-6">
            EMAAR Mivida is one of Egypt's most prestigious residential compounds, 
            offering luxury living in the heart of New Cairo. This exclusive development 
            combines modern architecture with natural landscapes to create an 
            unparalleled living experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Prime New Cairo location</li>
                <li>• Luxury villas and apartments</li>
                <li>• Modern amenities and facilities</li>
                <li>• Landscaped green spaces</li>
                <li>• 24/7 security and maintenance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Swimming pools and sports facilities</li>
                <li>• Commercial and retail areas</li>
                <li>• Educational institutions nearby</li>
                <li>• Healthcare facilities</li>
                <li>• Parks and recreational areas</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-semibold">
              View Available Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}