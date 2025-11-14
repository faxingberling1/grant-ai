// services/grantWatchApi.js
export class GrantWatchService {
  static async searchGrants(options = {}) {
    const { keyword = '', category = '', state = '', rows = 20 } = options;
    
    try {
      console.log('🔍 Searching GrantWatch with:', { keyword, category, state, rows });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enhanced mock GrantWatch data with realistic information
      const mockGrantWatchData = [
        {
          id: 'gw-001',
          title: 'Community Health Improvement Grants',
          agency: 'GrantWatch Foundation',
          category: 'Healthcare',
          description: 'Funding for community-based health initiatives focusing on preventive care and health education in underserved areas. Projects should demonstrate measurable impact on community health outcomes.',
          deadline: '2024-04-15',
          awardFloor: 25000,
          awardCeiling: 150000,
          estimatedFunding: '$25,000 - $150,000',
          eligibility: 'Nonprofits, Community Health Centers, Public Health Departments',
          website: 'https://www.grantwatch.com/opportunity/12345',
          contactEmail: 'healthgrants@grantwatch.org',
          state: 'National',
          focusArea: 'Public Health',
          lastUpdated: '2024-01-20',
          matchScore: 87,
          status: 'active',
          source: 'grantwatch',
          applicationProcess: 'Online application with supporting documents',
          tags: ['health', 'community', 'preventive-care']
        },
        {
          id: 'gw-002',
          title: 'Rural Education Development Fund',
          agency: 'Rural Education Initiative',
          category: 'Education',
          description: 'Grants to support educational programs in rural communities, including technology access, teacher training, and STEM education. Priority given to programs serving low-income students.',
          deadline: '2024-05-30',
          awardFloor: 50000,
          awardCeiling: 300000,
          estimatedFunding: '$50,000 - $300,000',
          eligibility: 'Schools, Educational Nonprofits, Community Organizations in Rural Areas',
          website: 'https://www.grantwatch.com/opportunity/12346',
          contactEmail: 'ruraled@grantwatch.org',
          state: 'Rural Areas',
          focusArea: 'Education',
          lastUpdated: '2024-01-18',
          matchScore: 92,
          status: 'active',
          source: 'grantwatch',
          applicationProcess: 'Two-stage application process',
          tags: ['education', 'rural', 'stem', 'technology']
        },
        {
          id: 'gw-003',
          title: 'Small Business Innovation Grants',
          agency: 'Economic Development Council',
          category: 'Business',
          description: 'Funding for innovative small businesses and startups in technology, manufacturing, and service sectors. Focus on job creation and economic growth in local communities.',
          deadline: '2024-03-31',
          awardFloor: 10000,
          awardCeiling: 100000,
          estimatedFunding: '$10,000 - $100,000',
          eligibility: 'Small Businesses, Startups, Entrepreneurs with viable business plans',
          website: 'https://www.grantwatch.com/opportunity/12347',
          contactEmail: 'businessgrants@grantwatch.org',
          state: 'Multiple',
          focusArea: 'Economic Development',
          lastUpdated: '2024-01-15',
          matchScore: 79,
          status: 'active',
          source: 'grantwatch',
          applicationProcess: 'Business plan submission and interview',
          tags: ['business', 'innovation', 'startup', 'economic-development']
        },
        {
          id: 'gw-004',
          title: 'Environmental Conservation Program',
          agency: 'Green Future Foundation',
          category: 'Environment',
          description: 'Support for conservation projects, renewable energy initiatives, and environmental education programs. Projects must demonstrate long-term environmental impact and community involvement.',
          deadline: '2024-06-15',
          awardFloor: 75000,
          awardCeiling: 500000,
          estimatedFunding: '$75,000 - $500,000',
          eligibility: 'Environmental Nonprofits, Conservation Groups, Educational Institutions, Community Organizations',
          website: 'https://www.grantwatch.com/opportunity/12348',
          contactEmail: 'environment@grantwatch.org',
          state: 'National',
          focusArea: 'Conservation',
          lastUpdated: '2024-01-22',
          matchScore: 85,
          status: 'upcoming',
          source: 'grantwatch',
          applicationProcess: 'Detailed project proposal required',
          tags: ['environment', 'conservation', 'renewable-energy', 'sustainability']
        },
        {
          id: 'gw-005',
          title: 'Arts and Culture Community Grants',
          agency: 'Cultural Heritage Fund',
          category: 'Arts',
          description: 'Funding for arts programs, cultural events, museum exhibits, and performing arts organizations. Emphasis on programs that increase community access to arts and cultural experiences.',
          deadline: '2024-04-30',
          awardFloor: 15000,
          awardCeiling: 100000,
          estimatedFunding: '$15,000 - $100,000',
          eligibility: 'Arts Organizations, Museums, Cultural Centers, Individual Artists with nonprofit sponsorship',
          website: 'https://www.grantwatch.com/opportunity/12349',
          contactEmail: 'artsgrants@grantwatch.org',
          state: 'Multiple',
          focusArea: 'Cultural Arts',
          lastUpdated: '2024-01-19',
          matchScore: 81,
          status: 'active',
          source: 'grantwatch',
          applicationProcess: 'Portfolio review and project description',
          tags: ['arts', 'culture', 'community', 'heritage']
        },
        {
          id: 'gw-006',
          title: 'STEM Workforce Development Initiative',
          agency: 'Technology Advancement Foundation',
          category: 'Education',
          description: 'Grants to develop STEM workforce training programs, particularly in underserved communities. Focus on technology skills, coding bootcamps, and STEM career pathways.',
          deadline: '2024-07-20',
          awardFloor: 100000,
          awardCeiling: 500000,
          estimatedFunding: '$100,000 - $500,000',
          eligibility: 'Educational Institutions, Workforce Development Nonprofits, Community Colleges',
          website: 'https://www.grantwatch.com/opportunity/12350',
          contactEmail: 'stemgrants@techfoundation.org',
          state: 'National',
          focusArea: 'STEM Education',
          lastUpdated: '2024-01-25',
          matchScore: 88,
          status: 'upcoming',
          source: 'grantwatch',
          applicationProcess: 'Program outline and outcomes assessment plan',
          tags: ['stem', 'workforce', 'technology', 'education']
        },
        {
          id: 'gw-007',
          title: 'Affordable Housing Development Grants',
          agency: 'Housing Solutions Network',
          category: 'Community Development',
          description: 'Funding for affordable housing development projects, including new construction, rehabilitation, and housing assistance programs. Priority for projects serving low-income families.',
          deadline: '2024-05-10',
          awardFloor: 50000,
          awardCeiling: 250000,
          estimatedFunding: '$50,000 - $250,000',
          eligibility: 'Housing Nonprofits, Community Development Corporations, Local Governments',
          website: 'https://www.grantwatch.com/opportunity/12351',
          contactEmail: 'housinggrants@hsn.org',
          state: 'Multiple',
          focusArea: 'Housing',
          lastUpdated: '2024-01-16',
          matchScore: 76,
          status: 'active',
          source: 'grantwatch',
          applicationProcess: 'Development plan and community impact assessment',
          tags: ['housing', 'community-development', 'affordable-housing']
        }
      ];

      // Filter based on search criteria
      let filteredGrants = mockGrantWatchData;
      
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        filteredGrants = filteredGrants.filter(grant => 
          grant.title.toLowerCase().includes(searchTerm) ||
          grant.description.toLowerCase().includes(searchTerm) ||
          grant.agency.toLowerCase().includes(searchTerm) ||
          grant.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      if (category && category !== 'All Categories') {
        filteredGrants = filteredGrants.filter(grant => 
          grant.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (state && state !== 'All States' && state !== 'all') {
        filteredGrants = filteredGrants.filter(grant => 
          grant.state.toLowerCase().includes(state.toLowerCase())
        );
      }
      
      return filteredGrants.slice(0, rows);
      
    } catch (error) {
      console.error('Error fetching GrantWatch data:', error);
      // Return mock data even if there's an error for demo purposes
      return this.getFallbackData();
    }
  }

  static getFallbackData() {
    // Simple fallback data in case of complete failure
    return [
      {
        id: 'gw-fallback-1',
        title: 'Community Development Grant',
        agency: 'GrantWatch Community Fund',
        category: 'Community Development',
        description: 'General community development funding for various local initiatives.',
        deadline: '2024-06-01',
        awardFloor: 10000,
        awardCeiling: 50000,
        estimatedFunding: '$10,000 - $50,000',
        eligibility: 'Community Organizations, Nonprofits',
        website: 'https://www.grantwatch.com',
        contactEmail: 'info@grantwatch.org',
        state: 'National',
        focusArea: 'Community',
        lastUpdated: '2024-01-20',
        matchScore: 75,
        status: 'active',
        source: 'grantwatch'
      }
    ];
  }

  static async getGrantDetails(grantId) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const details = {
      id: grantId,
      detailedDescription: 'Complete grant details including application process, requirements, and evaluation criteria. This grant focuses on creating sustainable impact in the community.',
      applicationProcess: 'Online application through GrantWatch portal with required supporting documents',
      evaluationCriteria: [
        'Community Impact (30%)',
        'Sustainability (25%)', 
        'Innovation (20%)',
        'Budget Appropriateness (15%)',
        'Organizational Capacity (10%)'
      ],
      documentsRequired: [
        'Detailed Project Proposal',
        'Organizational Budget',
        '501(c)(3) verification (if applicable)',
        'Board of Directors list',
        'Financial statements'
      ],
      reportingRequirements: 'Quarterly progress reports and final impact report required',
      keyDates: {
        applicationDeadline: '2024-04-15',
        reviewPeriod: '4-6 weeks',
        awardNotification: '2024-06-01',
        projectStart: '2024-07-01'
      },
      contactInfo: {
        name: 'Grant Program Manager',
        email: 'programs@grantwatch.org',
        phone: '(555) 123-4567'
      }
    };
    
    return details;
  }
}