export default function About() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About The Views Real Estate</h1>
          <p className="text-xl text-gray-600">Your trusted partner in luxury Egyptian real estate</p>
        </div>

        {/* Founder Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-64 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Mohamed Assem Photo</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Mohamed Assem</h2>
              <p className="text-lg text-primary font-semibold mb-4">Founder & Managing Director</p>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  With over 30 years of distinguished experience in the Egyptian real estate market, 
                  Mohamed Assem has established himself as one of the most trusted names in luxury property consulting.
                </p>
                
                <p>
                  His extensive expertise spans across premium developments including EMAAR Mivida, SODIC compounds, 
                  and exclusive residential projects throughout New Cairo, Sheikh Zayed, and Egypt's North Coast.
                </p>
                
                <p>
                  Mohamed's deep understanding of market dynamics, combined with his commitment to personalized service, 
                  has helped hundreds of clients find their perfect luxury homes and make sound investment decisions.
                </p>
                
                <p>
                  Under his leadership, The Views Real Estate has become synonymous with excellence in the 
                  high-end property sector, providing unparalleled insights and access to Egypt's most prestigious developments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Excellence</h3>
            <p className="text-gray-600">Delivering exceptional service and results in every transaction</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust</h3>
            <p className="text-gray-600">Building lasting relationships through transparency and integrity</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Expertise</h3>
            <p className="text-gray-600">Three decades of market knowledge and professional insight</p>
          </div>
        </div>
      </div>
    </div>
  );
}