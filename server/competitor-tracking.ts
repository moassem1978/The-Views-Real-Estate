// Competitor and Developer Tracking System for Egyptian Real Estate Market

export interface RealEstateCompany {
  id: string;
  name: string;
  type: 'broker' | 'developer' | 'platform';
  website?: string;
  keyProjects?: string[];
  marketPosition: 'major' | 'premium' | 'emerging';
  specialization?: string[];
  locations?: string[];
}

// Major Real Estate Companies to Track
export const TRACKED_COMPANIES: RealEstateCompany[] = [
  // Brokers and Platforms
  {
    id: 'nawy',
    name: 'Nawy',
    type: 'platform',
    website: 'nawy.com',
    marketPosition: 'major',
    specialization: ['online platform', 'property matching', 'financing'],
    locations: ['Cairo', 'Giza', 'New Capital', 'North Coast']
  },
  {
    id: 'coldwell-banker-egypt',
    name: 'Coldwell Banker Egypt',
    type: 'broker',
    website: 'coldwellbanker.com.eg',
    marketPosition: 'premium',
    specialization: ['luxury properties', 'international clients', 'investment'],
    locations: ['Cairo', 'New Capital', 'North Coast', 'Alexandria']
  },
  {
    id: 'bold-routes',
    name: 'Bold Routes',
    type: 'broker',
    marketPosition: 'emerging',
    specialization: ['residential', 'commercial'],
    locations: ['Cairo', 'Giza']
  },
  {
    id: 'the-address-investment',
    name: 'The Address Investment',
    type: 'broker',
    marketPosition: 'major',
    specialization: ['investment properties', 'luxury residential'],
    locations: ['Cairo', 'New Capital', 'North Coast']
  },

  // Major Developers in Egypt
  {
    id: 'emaar-misr',
    name: 'EMAAR Misr',
    type: 'developer',
    website: 'emaar.eg',
    keyProjects: ['Mivida', 'Uptown Cairo', 'Cairo Gate', 'Marassi'],
    marketPosition: 'major',
    specialization: ['luxury compounds', 'integrated communities'],
    locations: ['New Cairo', 'Sheikh Zayed', 'North Coast']
  },
  {
    id: 'sodic',
    name: 'Sodic',
    type: 'developer',
    website: 'sodic.com',
    keyProjects: ['Eastown', 'Westown', 'Villette', 'Katameya Dunes'],
    marketPosition: 'major',
    specialization: ['premium residential', 'golf communities'],
    locations: ['New Cairo', 'Sheikh Zayed', 'Katameya']
  },
  {
    id: 'palm-hills',
    name: 'Palm Hills Developments',
    type: 'developer',
    website: 'palm-hills.com',
    keyProjects: ['Hacienda White', 'Hacienda Bay', 'Palm Parks', 'Palm Hills October'],
    marketPosition: 'major',
    specialization: ['luxury resorts', 'residential compounds'],
    locations: ['6th October', 'North Coast', 'Sheikh Zayed']
  },
  {
    id: 'mountain-view',
    name: 'Mountain View',
    type: 'developer',
    website: 'mountain-view.com.eg',
    keyProjects: ['iCity', 'Chill Out Park', 'Mountain View North Coast'],
    marketPosition: 'major',
    specialization: ['entertainment', 'residential', 'commercial'],
    locations: ['New Cairo', 'North Coast', 'Sheikh Zayed']
  },
  {
    id: 'orascom',
    name: 'Orascom Development Egypt',
    type: 'developer',
    website: 'orascomdh.com',
    keyProjects: ['El Gouna', 'O West', 'Makadi Heights'],
    marketPosition: 'major',
    specialization: ['integrated towns', 'resorts', 'golf communities'],
    locations: ['Red Sea', 'Sheikh Zayed', 'North Coast']
  },
  {
    id: 'capital-group-properties',
    name: 'Capital Group Properties',
    type: 'developer',
    keyProjects: ['Sentra', 'East Tower', 'Golden Gate'],
    marketPosition: 'major',
    specialization: ['New Capital projects', 'commercial', 'residential'],
    locations: ['New Administrative Capital']
  },
  {
    id: 'misr-italia',
    name: 'Misr Italia Properties',
    type: 'developer',
    website: 'misritalia.com',
    keyProjects: ['Il Bosco', 'Vinci', 'Cairo Business Plaza'],
    marketPosition: 'major',
    specialization: ['luxury residential', 'commercial'],
    locations: ['New Cairo', 'New Capital']
  },
  {
    id: 'tatweer-misr',
    name: 'Tatweer Misr',
    type: 'developer',
    website: 'tatweermisreg.com',
    keyProjects: ['Fouka Bay', 'Bloomfields', 'Rivers'],
    marketPosition: 'major',
    specialization: ['coastal resorts', 'residential'],
    locations: ['North Coast', 'Sheikh Zayed', 'New Cairo']
  },
  {
    id: 'hyde-park',
    name: 'Hyde Park Developments',
    type: 'developer',
    website: 'hydeparkdevelopments.com',
    keyProjects: ['Hyde Park New Cairo', 'Hyde Park North Coast'],
    marketPosition: 'major',
    specialization: ['luxury residential', 'commercial'],
    locations: ['New Cairo', 'North Coast']
  },
  {
    id: 'la-vista',
    name: 'La Vista Developments',
    type: 'developer',
    keyProjects: ['Telal North Coast', 'La Vista City', 'Bay La Sun'],
    marketPosition: 'major',
    specialization: ['coastal resorts', 'residential'],
    locations: ['North Coast', 'Red Sea']
  },
  {
    id: 'ora-developers',
    name: 'Ora Developers',
    type: 'developer',
    keyProjects: ['Zed West', 'Zed East', 'ZED Park'],
    marketPosition: 'major',
    specialization: ['mixed-use developments', 'luxury residential'],
    locations: ['Sheikh Zayed', 'New Cairo']
  },
  {
    id: 'madinet-masr',
    name: 'Madinet Masr',
    type: 'developer',
    website: 'madinetmasr.com',
    keyProjects: ['Sarai', 'Taj City', 'LAYAN Residence'],
    marketPosition: 'major',
    specialization: ['affordable housing', 'middle-income residential'],
    locations: ['New Cairo', 'Mostakbal City']
  },
  {
    id: 'akam-alrajhi',
    name: 'Akam Alrajhi Developments',
    type: 'developer',
    keyProjects: ['District 5', 'Gardenia Springs'],
    marketPosition: 'major',
    specialization: ['luxury residential', 'New Capital'],
    locations: ['New Administrative Capital', 'New Cairo']
  },
  {
    id: 'hassan-allam',
    name: 'Hassan Allam Properties',
    type: 'developer',
    keyProjects: ['Swan Lake', 'Rabwa Heights'],
    marketPosition: 'major',
    specialization: ['residential compounds', 'commercial'],
    locations: ['New Cairo', 'North Coast']
  },
  {
    id: 'mobco',
    name: 'Mobco',
    type: 'developer',
    keyProjects: ['Piacera', 'Stone Residence'],
    marketPosition: 'major',
    specialization: ['luxury residential', 'commercial'],
    locations: ['Mostakbal City', 'New Capital']
  }
];

// Competitor Analysis Functions
export class CompetitorTracker {
  static getCompetitorsByType(type: 'broker' | 'developer' | 'platform'): RealEstateCompany[] {
    return TRACKED_COMPANIES.filter(company => company.type === type);
  }

  static getCompetitorsByLocation(location: string): RealEstateCompany[] {
    return TRACKED_COMPANIES.filter(company => 
      company.locations?.some(loc => 
        loc.toLowerCase().includes(location.toLowerCase())
      )
    );
  }

  static getMajorDevelopers(): RealEstateCompany[] {
    return TRACKED_COMPANIES.filter(company => 
      company.type === 'developer' && company.marketPosition === 'major'
    );
  }

  static getDirectCompetitors(): RealEstateCompany[] {
    return TRACKED_COMPANIES.filter(company => 
      company.type === 'broker' || company.type === 'platform'
    );
  }

  static getProjectCompetitors(location: string): RealEstateCompany[] {
    return this.getCompetitorsByLocation(location).filter(company => 
      company.type === 'developer'
    );
  }

  // SEO Competitor Keywords Analysis
  static getCompetitorKeywords(): string[] {
    const keywords: string[] = [];
    
    TRACKED_COMPANIES.forEach(company => {
      // Add company name variations
      keywords.push(company.name);
      keywords.push(`${company.name} Egypt`);
      keywords.push(`${company.name} properties`);
      
      // Add project-specific keywords
      if (company.keyProjects) {
        company.keyProjects.forEach(project => {
          keywords.push(project);
          keywords.push(`${project} for sale`);
          keywords.push(`${project} properties`);
          keywords.push(`${project} units`);
        });
      }
      
      // Add location + company keywords
      if (company.locations) {
        company.locations.forEach(location => {
          keywords.push(`${company.name} ${location}`);
          if (company.keyProjects) {
            company.keyProjects.forEach(project => {
              keywords.push(`${project} ${location}`);
            });
          }
        });
      }
    });
    
    return [...new Set(keywords)]; // Remove duplicates
  }
}

// Market Analysis Data
export const MARKET_INSIGHTS = {
  topDevelopers: [
    'EMAAR Misr',
    'Sodic',
    'Palm Hills Developments',
    'Mountain View',
    'Orascom Development Egypt'
  ],
  emergingDevelopers: [
    'Capital Group Properties',
    'Akam Alrajhi Developments',
    'Mobco'
  ],
  topBrokers: [
    'Nawy',
    'Coldwell Banker Egypt',
    'The Address Investment'
  ],
  hotLocations: [
    'New Administrative Capital',
    'New Cairo',
    'North Coast',
    'Sheikh Zayed',
    'Mostakbal City'
  ]
};

export default CompetitorTracker;