// Keyword Research for Top Real Estate Companies in Egypt & Dubai

const topCompanies = {
  egypt: [
    'aqarmap.com',
    'propertyfinder.eg', 
    'olx.com.eg',
    'hatlex.com',
    'elmalahy.com',
    'sabbour.com',
    'palmhills.com',
    'sodic.com',
    'hassan-allam.com',
    'orascom.com'
  ],
  dubai: [
    'propertyfinder.ae',
    'bayut.com',
    'dubizzle.com',
    'emaar.com',
    'damac.com',
    'binghatti.com',
    'sobha.com',
    'dxbproperties.com',
    'luxuryproperty.com',
    'fam.properties'
  ]
};

// Extract common real estate keywords used by top companies
const extractedKeywords = {
  egypt: [
    // Location-based keywords
    'properties for sale Egypt',
    'apartments for sale Cairo',
    'villas for sale New Cairo',
    'compounds New Cairo',
    'New Administrative Capital',
    'North Coast properties',
    'Katameya Heights',
    'Maadi properties',
    'Zamalek apartments',
    'Heliopolis real estate',
    'Sheikh Zayed properties',
    '6th October properties',
    'El Gouna properties',
    'Hurghada real estate',
    
    // Property types
    'luxury villas Egypt',
    'penthouses Cairo',
    'duplex apartments Egypt',
    'townhouses New Cairo',
    'studios for rent Cairo',
    'commercial properties Egypt',
    'office spaces Cairo',
    'retail shops Egypt',
    'land for sale Egypt',
    'chalets North Coast',
    
    // Investment terms
    'real estate investment Egypt',
    'property investment Cairo',
    'off-plan properties Egypt',
    'under construction Egypt',
    'resale properties Egypt',
    'rental yield Egypt',
    'capital appreciation Egypt',
    'installment plans Egypt',
    
    // Developer-specific
    'Sodic properties',
    'Palm Hills developments',
    'Hassan Allam Properties',
    'Orascom Development',
    'Sabbour Consulting',
    'Mountain View properties',
    'Talaat Moustafa Group',
    'Capital Group Properties'
  ],
  
  dubai: [
    // Location-based keywords
    'properties for sale Dubai',
    'Dubai Marina apartments',
    'Downtown Dubai properties',
    'Business Bay apartments',
    'Dubai Creek Harbour',
    'Dubai Hills Estate',
    'Jumeirah Beach Residence',
    'Palm Jumeirah villas',
    'Arabian Ranches properties',
    'Dubai South properties',
    'Dubailand developments',
    'Dubai Investment Park',
    'International City Dubai',
    'Dubai Silicon Oasis',
    'Al Barsha properties',
    'Jumeirah Village Circle',
    'Discovery Gardens Dubai',
    'Dubai Sports City',
    'Motor City Dubai',
    'The Greens Dubai',
    
    // Property types
    'luxury apartments Dubai',
    'penthouses Dubai Marina',
    'villas Palm Jumeirah',
    'townhouses Dubai Hills',
    'studios Business Bay',
    'office spaces DIFC',
    'retail units Dubai Mall',
    'warehouses Dubai South',
    'plots for sale Dubai',
    'beachfront properties Dubai',
    
    // Investment terms
    'off-plan properties Dubai',
    'ready properties Dubai',
    'freehold properties Dubai',
    'leasehold properties Dubai',
    'Dubai property investment',
    'rental yields Dubai',
    'capital gains Dubai',
    'payment plans Dubai',
    'handover ready Dubai',
    'pre-launch Dubai',
    
    // Developer-specific
    'Emaar properties Dubai',
    'Damac developments',
    'Binghatti properties',
    'Sobha Hartland',
    'Dubai Properties',
    'Nakheel developments',
    'Meraas properties',
    'Select Group Dubai',
    'Azizi Developments',
    'Danube Properties'
  ],
  
  // High-value long-tail keywords
  longTail: [
    'best real estate agent Egypt Dubai',
    'luxury property consultant Middle East',
    'Egypt Dubai property investment advisor',
    'international real estate broker Egypt',
    'offshore property investment Dubai',
    'Egyptian expat properties Dubai',
    'Dubai property for Egyptian investors',
    'luxury beachfront villas Egypt',
    'premium gated communities Cairo',
    'high-end apartments New Capital',
    'waterfront properties Dubai Marina',
    'golf course properties Dubai Hills',
    'furnished apartments short term Dubai',
    'holiday homes North Coast Egypt',
    'commercial real estate investment Dubai',
    'retail spaces prime locations Dubai',
    'office buildings business districts',
    'luxury penthouses city center',
    'family villas international schools',
    'investment properties high ROI'
  ],
  
  // Arabic keywords for Egypt market
  arabic: [
    'عقارات للبيع في مصر',
    'شقق للبيع في القاهرة',
    'فيلات للبيع في القاهرة الجديدة',
    'كمبوندات القاهرة الجديدة',
    'العاصمة الإدارية الجديدة',
    'الساحل الشمالي',
    'عقارات المعادي',
    'شقق الزمالك',
    'عقارات الشيخ زايد',
    'أكتوبر الجديدة',
    'استثمار عقاري مصر',
    'تقسيط عقارات مصر'
  ]
};

// Trending real estate keywords based on market analysis
const trendingKeywords = [
  'sustainable properties',
  'smart homes technology',
  'green building certification',
  'virtual property tours',
  'blockchain real estate',
  'fractional ownership',
  'co-living spaces',
  'flexible payment plans',
  'citizenship by investment',
  'golden visa properties',
  'remote work friendly homes',
  'pandemic-safe buildings',
  'contactless property viewing',
  'AI-powered property search',
  'cryptocurrency payment accepted'
];

console.log('Total keywords extracted:', 
  extractedKeywords.egypt.length + 
  extractedKeywords.dubai.length + 
  extractedKeywords.longTail.length + 
  extractedKeywords.arabic.length + 
  trendingKeywords.length
);