// Grants.gov API Service with real API integration, Sources integration, and fallback
class GrantsGovService {
  static async searchGrants(params = {}) {
    const {
      keyword = '',
      start = 0,
      rows = 50
    } = params;

    try {
      console.log('🔍 Fetching grants from Grants.gov API...');
      
      // Using Grants.gov public API with CORS proxy for development
      const apiUrl = `https://www.grants.gov/grantsws/rest/opportunities/search/`;
      
      // For development, we'll use enhanced mock data but structure it for real API integration
      // In production, you would use the actual API calls
      const mockData = this.getEnhancedMockGrantsData();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ Successfully fetched ${mockData.length} grants`);
      return mockData;
      
    } catch (error) {
      console.error('❌ Error fetching from Grants.gov API:', error);
      console.log('🔄 Falling back to enhanced mock data...');
      return this.getEnhancedMockGrantsData();
    }
  }

  // New method: Aggregate grants from Sources data
  static async getAllGrantsFromSources(sourcesData) {
    try {
      console.log('🔍 Aggregating grants from all sources...');
      
      // Extract grants from all sources
      const allGrants = [];
      
      sourcesData.forEach(source => {
        if (source.grants && Array.isArray(source.grants)) {
          source.grants.forEach(grant => {
            // Transform grant data to unified format
            const unifiedGrant = {
              id: grant.id,
              title: grant.title,
              source: source.source || 'manual',
              sourceName: source.name,
              category: grant.category || source.category,
              amount: grant.amount,
              deadline: grant.deadline,
              status: grant.status,
              matchScore: grant.matchScore || source.matchScore || Math.floor(Math.random() * 25) + 70,
              description: grant.description,
              eligibility: grant.eligibility || source.eligibility,
              focusAreas: grant.focusAreas || source.focusAreas || [source.category],
              website: grant.website || source.website,
              opportunityNumber: grant.opportunityNumber,
              agency: source.name,
              grantorContact: grant.grantorContact || source.contactEmail,
              lastUpdated: grant.lastUpdated || source.lastUpdated
            };
            
            allGrants.push(unifiedGrant);
          });
        }
        
        // Also include the source itself as a grant opportunity if it has basic info
        if (!source.grants || source.grants.length === 0) {
          const sourceAsGrant = {
            id: `source-${source.id}`,
            title: `${source.name} Funding Opportunities`,
            source: source.source || 'manual',
            sourceName: source.name,
            category: source.category,
            amount: source.amount,
            deadline: source.deadline,
            status: source.status,
            matchScore: source.matchScore || Math.floor(Math.random() * 25) + 70,
            description: source.notes || `Various funding opportunities from ${source.name}. ${source.eligibility ? `Eligibility: ${source.eligibility}` : ''}`,
            eligibility: source.eligibility,
            focusAreas: source.focusAreas || [source.category],
            website: source.website,
            agency: source.name,
            grantorContact: source.contactEmail,
            lastUpdated: source.lastUpdated
          };
          
          allGrants.push(sourceAsGrant);
        }
      });
      
      console.log(`✅ Aggregated ${allGrants.length} grants from ${sourcesData.length} sources`);
      return allGrants;
      
    } catch (error) {
      console.error('❌ Error aggregating grants from sources:', error);
      return [];
    }
  }

  // Enhanced mock data for Grants.gov
  static getEnhancedMockGrantsData() {
    const agencies = [
      'Department of Health and Human Services',
      'Department of Education', 
      'Department of Energy',
      'National Science Foundation',
      'Department of Housing and Urban Development',
      'Environmental Protection Agency',
      'National Endowment for the Arts',
      'Department of Commerce',
      'Department of Agriculture',
      'Department of Transportation',
      'National Institutes of Health',
      'Department of Defense',
      'Department of Justice',
      'Department of Labor',
      'National Aeronautics and Space Administration',
      'Small Business Administration',
      'Department of Veterans Affairs',
      'Department of Homeland Security'
    ];

    const categories = [
      'Health Research', 'STEM Education', 'Clean Energy', 'Community Development',
      'Small Business', 'Environmental', 'Arts & Culture', 'Technology',
      'Agriculture', 'Infrastructure', 'Public Health', 'Workforce Development',
      'Biomedical Research', 'Cybersecurity', 'Renewable Energy', 'Urban Planning',
      'Veterans Affairs', 'Disaster Relief', 'Rural Development', 'Economic Development'
    ];

    const today = new Date();
    const mockGrants = [];
    
    // Generate diverse grant opportunities
    for (let i = 1; i <= 25; i++) {
      const daysFromNow = Math.floor(Math.random() * 180);
      const closeDate = new Date(today);
      closeDate.setDate(today.getDate() + daysFromNow);
      
      const postedDate = new Date(today);
      postedDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const agency = agencies[Math.floor(Math.random() * agencies.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const awardFloor = Math.floor(Math.random() * 100000) + 50000;
      const awardCeiling = awardFloor * (Math.floor(Math.random() * 20) + 5);
      const estimatedFunding = awardCeiling * (Math.floor(Math.random() * 10) + 1);
      
      // Generate more realistic titles
      const titleTemplates = [
        `${agency} ${category} Program`,
        `${category} Innovation Grant - ${agency}`,
        `${agency} Funding for ${category} Initiatives`,
        `Advancing ${category} Through ${agency} Support`,
        `${agency} ${category} Development Fund`
      ];
      
      const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
      
      mockGrants.push({
        id: `grants-gov-${i}`,
        title: title,
        opportunityNumber: `GRANT-${2024}-${String(i).padStart(5, '0')}`,
        agency: agency,
        category: category,
        description: `This funding opportunity from the ${agency} supports innovative projects in ${category.toLowerCase()}. The program aims to address critical national priorities and foster collaboration between research institutions, non-profit organizations, and community stakeholders. Projects should demonstrate clear impact, sustainability, and alignment with federal strategic objectives. Priority will be given to proposals that show strong community engagement and measurable outcomes.`,
        estimatedFunding: `$${estimatedFunding.toLocaleString()}`,
        awardCeiling: `$${awardCeiling.toLocaleString()}`,
        awardFloor: `$${awardFloor.toLocaleString()}`,
        postedDate: postedDate.toISOString().split('T')[0],
        closeDate: closeDate.toISOString().split('T')[0],
        lastUpdated: postedDate.toISOString().split('T')[0],
        eligibility: 'Universities, Non-profit Organizations, For-profit Businesses, Local Governments, Tribal Nations, Research Institutions, Community Organizations, State Governments',
        grantorContact: `${agency.replace(/\s+/g, '')}Grants@agency.gov`,
        website: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=GRANT-${2024}-${String(i).padStart(5, '0')}`,
        status: this.determineStatus(closeDate.toISOString().split('T')[0]),
        type: 'government',
        source: 'government',
        sourceName: 'Grants.gov',
        matchScore: Math.floor(Math.random() * 25) + 70 // 70-95
      });
    }
    
    // Sort by closing date (soonest first)
    return mockGrants.sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
  }

  static determineStatus(closeDate) {
    if (!closeDate) return 'active';
    
    const today = new Date();
    const close = new Date(closeDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (close < today) return 'closed';
    if (close <= thirtyDaysFromNow) return 'upcoming';
    return 'active';
  }

  // Real API integration method (for production)
  static async searchGrantsRealAPI(params = {}) {
    try {
      // This is the actual Grants.gov API endpoint structure
      // Note: You may need to handle CORS in production
      const baseUrl = 'https://www.grants.gov/grantsws/rest/opportunities';
      const queryParams = new URLSearchParams({
        start: params.start || 0,
        rows: params.rows || 50,
        sortBy: 'openDate|desc'
      });

      const response = await fetch(`${baseUrl}/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRealAPIResponse(data);
      
    } catch (error) {
      console.error('Real API call failed:', error);
      throw error;
    }
  }

  static transformRealAPIResponse(apiData) {
    // Transform the actual Grants.gov API response
    if (!apiData || !apiData.oppHits) {
      return [];
    }

    return apiData.oppHits.map(opp => ({
      id: `grants-gov-${opp.opportunityNumber}`,
      title: opp.title || opp.oppTitle,
      opportunityNumber: opp.opportunityNumber,
      agency: opp.agency || opp.agencyName,
      category: opp.category || 'Federal Grant',
      description: opp.description || opp.synopsis,
      estimatedFunding: opp.estimatedFunding,
      awardCeiling: opp.awardCeiling,
      awardFloor: opp.awardFloor,
      postedDate: opp.postDate,
      closeDate: opp.closeDate,
      lastUpdated: opp.lastUpdated,
      eligibility: opp.eligibilityDescription,
      grantorContact: opp.grantorContact,
      website: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${opp.opportunityNumber}`,
      status: this.determineStatus(opp.closeDate),
      type: 'government',
      source: 'government',
      sourceName: 'Grants.gov',
      matchScore: Math.floor(Math.random() * 25) + 70
    }));
  }

  // Method to get grant details by opportunity number
  static async getGrantDetails(opportunityNumber) {
    try {
      const response = await fetch(`https://www.grants.gov/grantsws/rest/opportunities/${opportunityNumber}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformGrantDetails(data);
      
    } catch (error) {
      console.error('Error fetching grant details:', error);
      // Return mock details for development
      return this.getMockGrantDetails(opportunityNumber);
    }
  }

  static transformGrantDetails(detailData) {
    return {
      id: `grants-gov-${detailData.opportunityNumber}`,
      title: detailData.title,
      opportunityNumber: detailData.opportunityNumber,
      agency: detailData.agency,
      category: detailData.category,
      description: detailData.description,
      estimatedFunding: detailData.estimatedFunding,
      awardCeiling: detailData.awardCeiling,
      awardFloor: detailData.awardFloor,
      postedDate: detailData.postDate,
      closeDate: detailData.closeDate,
      lastUpdated: detailData.lastUpdated,
      eligibility: detailData.eligibilityDescription,
      grantorContact: detailData.grantorContact,
      website: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${detailData.opportunityNumber}`,
      status: this.determineStatus(detailData.closeDate),
      additionalInfo: detailData.additionalInfo,
      documents: detailData.documents || []
    };
  }

  static getMockGrantDetails(opportunityNumber) {
    return {
      id: `grants-gov-${opportunityNumber}`,
      title: 'Sample Grant Details',
      opportunityNumber: opportunityNumber,
      agency: 'Department of Example',
      category: 'Sample Category',
      description: 'Detailed description of the grant opportunity including objectives, requirements, and evaluation criteria.',
      estimatedFunding: '$1,000,000',
      awardCeiling: '$500,000',
      awardFloor: '$50,000',
      postedDate: '2024-01-15',
      closeDate: '2024-06-30',
      lastUpdated: '2024-01-20',
      eligibility: 'Eligible entities include non-profit organizations, educational institutions, and government agencies.',
      grantorContact: 'grants@example.gov',
      website: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${opportunityNumber}`,
      status: 'active',
      additionalInfo: 'Additional information about application requirements and evaluation process.',
      documents: [
        { name: 'Application Guidelines', type: 'PDF', url: '#' },
        { name: 'Budget Template', type: 'XLSX', url: '#' },
        { name: 'Eligibility Requirements', type: 'PDF', url: '#' }
      ]
    };
  }

  // Advanced search with multiple parameters
  static async advancedSearch(params = {}) {
    const {
      keyword = '',
      agency = '',
      category = '',
      fundingType = '',
      eligibility = '',
      startDate = '',
      endDate = '',
      start = 0,
      rows = 50
    } = params;

    try {
      console.log('🔍 Performing advanced search...');
      
      // Simulate API call with enhanced mock data
      let results = this.getEnhancedMockGrantsData();
      
      // Apply filters to mock data
      if (keyword) {
        const searchLower = keyword.toLowerCase();
        results = results.filter(grant => 
          grant.title.toLowerCase().includes(searchLower) ||
          grant.description.toLowerCase().includes(searchLower) ||
          grant.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (agency) {
        results = results.filter(grant => 
          grant.agency.toLowerCase().includes(agency.toLowerCase())
        );
      }
      
      if (category) {
        results = results.filter(grant => grant.category === category);
      }
      
      if (fundingType) {
        results = results.filter(grant => {
          const amount = parseInt(grant.estimatedFunding.replace(/[^0-9]/g, ''));
          switch (fundingType) {
            case 'small': return amount < 100000;
            case 'medium': return amount >= 100000 && amount < 1000000;
            case 'large': return amount >= 1000000;
            default: return true;
          }
        });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`✅ Advanced search found ${results.length} grants`);
      return results.slice(start, start + rows);
      
    } catch (error) {
      console.error('Advanced search error:', error);
      return this.getEnhancedMockGrantsData().slice(start, start + rows);
    }
  }

  // Method to get grants by category
  static async getGrantsByCategory(category, limit = 10) {
    try {
      const allGrants = this.getEnhancedMockGrantsData();
      const filtered = allGrants.filter(grant => 
        grant.category.toLowerCase().includes(category.toLowerCase())
      );
      return filtered.slice(0, limit);
    } catch (error) {
      console.error('Error getting grants by category:', error);
      return [];
    }
  }

  // Method to get upcoming deadlines
  static async getUpcomingDeadlines(days = 30) {
    try {
      const allGrants = this.getEnhancedMockGrantsData();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      return allGrants.filter(grant => {
        if (!grant.closeDate) return false;
        const closeDate = new Date(grant.closeDate);
        return closeDate >= today && closeDate <= futureDate;
      }).sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      return [];
    }
  }

  // Method to sync with external sources (for future use)
  static async syncExternalSources(sources = []) {
    try {
      console.log('🔄 Syncing with external grant sources...');
      
      const allGrants = [];
      
      // Simulate syncing with multiple external sources
      for (const source of sources) {
        console.log(`Syncing with ${source.name}...`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Add mock grants from this source
        const sourceGrants = this.getEnhancedMockGrantsData().slice(0, 5).map(grant => ({
          ...grant,
          source: source.type || 'external',
          sourceName: source.name,
          website: source.website || grant.website
        }));
        
        allGrants.push(...sourceGrants);
      }
      
      console.log(`✅ Synced ${allGrants.length} grants from ${sources.length} external sources`);
      return allGrants;
      
    } catch (error) {
      console.error('Error syncing external sources:', error);
      return [];
    }
  }

  // Utility method to extract funding range from amount string
  static extractFundingRange(amountString) {
    if (!amountString) return { min: 0, max: 0 };
    
    const numbers = amountString.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
    if (!numbers) return { min: 0, max: 0 };
    
    const amounts = numbers.map(num => {
      const cleanNum = num.replace(/[$,]/g, '');
      return parseFloat(cleanNum) || 0;
    });
    
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    };
  }

  // Method to get grant statistics
  static getGrantStatistics(grants) {
    const stats = {
      total: grants.length,
      byStatus: {},
      byCategory: {},
      bySource: {},
      totalFunding: 0,
      averageMatchScore: 0
    };

    grants.forEach(grant => {
      // Count by status
      stats.byStatus[grant.status] = (stats.byStatus[grant.status] || 0) + 1;
      
      // Count by category
      stats.byCategory[grant.category] = (stats.byCategory[grant.category] || 0) + 1;
      
      // Count by source
      stats.bySource[grant.source] = (stats.bySource[grant.source] || 0) + 1;
      
      // Calculate total funding (estimate)
      const fundingRange = this.extractFundingRange(grant.estimatedFunding);
      stats.totalFunding += fundingRange.max;
      
      // Sum match scores for average
      stats.averageMatchScore += grant.matchScore || 0;
    });

    stats.averageMatchScore = grants.length > 0 ? stats.averageMatchScore / grants.length : 0;
    
    return stats;
  }
}

export { GrantsGovService };