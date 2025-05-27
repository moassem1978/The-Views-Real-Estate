
import React from 'react';

export default function HeatMap() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Property Heat Map</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Heat map visualization coming soon...</p>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, TrendingUp, BarChart3 } from "lucide-react";

export default function HeatMap() {
  useEffect(() => {
    document.title = "Property Heat Map - The Views Real Estate";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-rich-black mb-4">
            Property <span className="text-copper">Heat Map</span>
          </h1>
          <p className="text-lg text-rich-black-light max-w-2xl mx-auto">
            Explore property demand and pricing trends across different areas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-copper/20 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-copper mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rich-black mb-2">Heat Map Coming Soon</h3>
              <p className="text-rich-black-light">
                Interactive property heat map visualization will be available soon
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <MapPin className="h-8 w-8 text-copper mb-4" />
            <h3 className="font-semibold text-rich-black mb-2">Location Analysis</h3>
            <p className="text-rich-black-light text-sm">
              Analyze property demand by location and neighborhood
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <TrendingUp className="h-8 w-8 text-copper mb-4" />
            <h3 className="font-semibold text-rich-black mb-2">Price Trends</h3>
            <p className="text-rich-black-light text-sm">
              Track pricing trends and market fluctuations over time
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <BarChart3 className="h-8 w-8 text-copper mb-4" />
            <h3 className="font-semibold text-rich-black mb-2">Market Insights</h3>
            <p className="text-rich-black-light text-sm">
              Get detailed insights into market performance and opportunities
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
