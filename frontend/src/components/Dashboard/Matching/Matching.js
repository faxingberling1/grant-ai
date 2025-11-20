// frontend/src/components/Dashboard/Matching/Matching.js
import React, { useState, useEffect } from 'react';
import MatchResults from './MatchResults';
import ClientProfile from './ClientProfile';
import GrantRecommendations from './GrantRecommendations';
import ApiService from '../../../services/api';
import './Matching.css';

const Matching = () => {
  const [view, setView] = useState('analyze');
  const [clients, setClients] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Enhanced data extraction function
  const extractDataFromResponse = (response, dataKey, fallbackKey) => {
    console.log('🔍 Extracting data from response:', { response, dataKey, fallbackKey });
    
    // If response is already an array, return it
    if (Array.isArray(response)) {
      console.log('✅ Response is already an array');
      return response;
    }
    
    // If response has a data property that's an array
    if (response && Array.isArray(response.data)) {
      console.log('✅ Found data array in response.data');
      return response.data;
    }
    
    // If response has the specified dataKey that's an array
    if (response && Array.isArray(response[dataKey])) {
      console.log(`✅ Found data array in response.${dataKey}`);
      return response[dataKey];
    }
    
    // If response has fallbackKey that's an array
    if (fallbackKey && response && Array.isArray(response[fallbackKey])) {
      console.log(`✅ Found data array in response.${fallbackKey}`);
      return response[fallbackKey];
    }
    
    // If response has a success property and data
    if (response && response.success && Array.isArray(response[dataKey])) {
      console.log(`✅ Found data array in successful response.${dataKey}`);
      return response[dataKey];
    }
    
    // If response has clients/grantSources directly (for mock data)
    if (response && Array.isArray(response.clients)) {
      console.log('✅ Found clients array directly');
      return response.clients;
    }
    
    if (response && Array.isArray(response.grantSources)) {
      console.log('✅ Found grantSources array directly');
      return response.grantSources;
    }
    
    console.log('❌ No array data found in response');
    return [];
  };

  // Fetch clients and grant sources from API with fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setError(null);
        setUsingDemoData(false);
        
        console.log('🔍 Starting data fetch...');
        
        // Fetch clients and sources using ApiService
        const [clientsResponse, sourcesResponse] = await Promise.all([
          ApiService.getClients(),
          ApiService.getGrantSources()
        ]);
        
        console.log('📦 Raw API Responses:', {
          clientsResponse,
          sourcesResponse,
          clientsType: typeof clientsResponse,
          sourcesType: typeof sourcesResponse
        });
        
        // Extract data from responses with multiple fallback options
        const clientsData = extractDataFromResponse(clientsResponse, 'clients', 'data');
        const sourcesData = extractDataFromResponse(sourcesResponse, 'grantSources', 'sources');
        
        console.log('📊 Extracted data:', {
          clientsCount: clientsData.length,
          sourcesCount: sourcesData.length,
          clientsSample: clientsData[0],
          sourcesSample: sourcesData[0]
        });
        
        // Check if we have valid data
        const hasValidClients = Array.isArray(clientsData) && clientsData.length > 0;
        const hasValidSources = Array.isArray(sourcesData) && sourcesData.length > 0;
        
        if (hasValidClients && hasValidSources) {
          setClients(clientsData);
          setSources(sourcesData);
          console.log('✅ Successfully loaded real data from API');
        } else {
          console.warn('⚠️ Insufficient data from API, falling back to demo data');
          throw new Error(`Insufficient data: ${clientsData.length} clients, ${sourcesData.length} sources`);
        }
        
      } catch (err) {
        console.error('❌ Error in data fetching:', err);
        setError(`Data loading: ${err.message}. Using demo data for matching.`);
        setUsingDemoData(true);
        
        // Use mock data as fallback
        try {
          const mockClientsResponse = ApiService.getMockClients();
          const mockSourcesResponse = ApiService.getMockGrantSources();
          
          const demoClients = extractDataFromResponse(mockClientsResponse, 'clients', 'data');
          const demoSources = extractDataFromResponse(mockSourcesResponse, 'grantSources', 'sources');
          
          console.log('🔄 Loading demo data:', {
            demoClients: demoClients.length,
            demoSources: demoSources.length
          });
          
          setClients(demoClients);
          setSources(demoSources);
        } catch (mockError) {
          console.error('❌ Failed to load demo data:', mockError);
          setError('Failed to load both real and demo data. Please check your connection.');
          setClients([]);
          setSources([]);
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const analyzeClientMatches = async (client) => {
    setLoading(true);
    setSelectedClient(client);
    setError(null);

    try {
      console.log(`🔍 Analyzing matches for client: ${client.organizationName || client.name}`);
      
      // Use frontend AI analysis
      const analysisResults = await performAIAnalysis(client, sources);
      setAnalysis(analysisResults);
      setMatches(analysisResults.matches);
      setView('results');
      
      console.log(`✅ Analysis complete. Found ${analysisResults.matches.length} matches`);
    } catch (err) {
      console.error('❌ Error during analysis:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const performAIAnalysis = async (client, allSources) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🤖 Performing AI matching analysis...');
        
        let matches = [];
        let analysis = {
          clientStrengths: [],
          improvementAreas: [],
          matchFactors: [],
          timeline: [],
          summary: '',
          generatedAt: new Date().toISOString(),
          usingDemoData: usingDemoData
        };

        // Extract all grants from sources and analyze each one
        const allGrants = [];
        allSources.forEach(source => {
          if (source && source.grants && Array.isArray(source.grants)) {
            source.grants.forEach(grant => {
              if (grant) {
                const matchResult = calculateMatchScore(client, grant, source);
                
                allGrants.push({
                  grant,
                  source,
                  matchScore: matchResult,
                  matchReasons: getMatchReasons(client, grant, source, matchResult),
                  fitAnalysis: analyzeFit(client, grant, source, matchResult)
                });
              }
            });
          }
        });

        console.log(`📊 Analyzed ${allGrants.length} total grants`);

        // Filter and sort matches
        matches = allGrants
          .filter(item => item.matchScore.total >= 40)
          .map(item => ({
            ...item,
            timeline: generateTimeline(item.grant.deadline),
            actionSteps: generateActionSteps(client, item.grant, item.matchScore)
          }))
          .sort((a, b) => b.matchScore.total - a.matchScore.total);

        console.log(`🎯 Found ${matches.length} qualified matches`);

        // Generate comprehensive analysis
        analysis.clientStrengths = analyzeClientStrengths(client, matches);
        analysis.improvementAreas = analyzeImprovementAreas(client, matches);
        analysis.matchFactors = analyzeMatchFactors(client, matches);
        analysis.timeline = generateOverallTimeline(matches);
        analysis.summary = generateAnalysisSummary(client, matches, analysis);

        resolve({ matches, analysis });
      }, 1500);
    });
  };

  const calculateMatchScore = (client, grant, source) => {
    let totalScore = 0;
    const breakdown = {
      category: 0,
      budget: 0,
      geographic: 0,
      population: 0,
      experience: 0
    };
    const factors = [];

    // 1. Mission & Category Alignment (30% max)
    const categoryScore = calculateCategoryMatch(client, grant, source);
    breakdown.category = categoryScore.score;
    totalScore += categoryScore.score;
    factors.push(...categoryScore.factors);

    // 2. Budget Alignment (25% max)
    const budgetScore = calculateBudgetMatch(client, grant);
    breakdown.budget = budgetScore.score;
    totalScore += budgetScore.score;
    factors.push(...budgetScore.factors);

    // 3. Geographic Alignment (20% max)
    const geoScore = calculateGeographicMatch(client, source);
    breakdown.geographic = geoScore.score;
    totalScore += geoScore.score;
    factors.push(...geoScore.factors);

    // 4. Target Population Alignment (15% max)
    const populationScore = calculatePopulationMatch(client, grant);
    breakdown.population = populationScore.score;
    totalScore += populationScore.score;
    factors.push(...populationScore.factors);

    // 5. Experience & Capacity (10% max)
    const experienceScore = calculateExperienceMatch(client, grant, source);
    breakdown.experience = experienceScore.score;
    totalScore += experienceScore.score;
    factors.push(...experienceScore.factors);

    return {
      total: Math.min(Math.round(totalScore), 100),
      breakdown,
      factors: factors.slice(0, 5)
    };
  };

  const calculateCategoryMatch = (client, grant, source) => {
    let score = 0;
    const factors = [];

    // Direct category match with source (15 points)
    if (client?.category && source?.category && 
        client.category.toLowerCase() === source.category.toLowerCase()) {
      score += 15;
      factors.push('Perfect category alignment with source mission');
    }

    // Category match with grant (10 points)
    if (client?.category && grant?.category && 
        client.category.toLowerCase() === grant.category.toLowerCase()) {
      score += 10;
      factors.push('Strong alignment with grant category');
    } else if (client?.category && grant?.category) {
      // Partial match based on category similarity
      const clientCat = client.category.toLowerCase();
      const grantCat = grant.category.toLowerCase();
      
      if ((clientCat.includes('education') && grantCat.includes('education')) ||
          (clientCat.includes('health') && grantCat.includes('health')) ||
          (clientCat.includes('environment') && grantCat.includes('environment')) ||
          (clientCat.includes('arts') && grantCat.includes('arts'))) {
        score += 5;
        factors.push('Related category alignment');
      }
    }

    // Focus area overlap (5 points)
    const focusOverlap = calculateOverlapScore(client?.focusAreas, grant?.focusAreas);
    if (focusOverlap.score > 0) {
      score += Math.min(focusOverlap.score * 0.05, 5);
      if (focusOverlap.common.length > 0) {
        factors.push(`Focus area overlap: ${focusOverlap.common.join(', ')}`);
      }
    }

    return { score: Math.min(score, 30), factors };
  };

  const calculateBudgetMatch = (client, grant) => {
    let score = 0;
    const factors = [];
    
    const grantAmount = extractMaxAmount(grant?.amount);
    if (grantAmount && client?.budget) {
      const budgetRatio = client.budget / grantAmount;
      
      if (budgetRatio >= 0.8 && budgetRatio <= 1.5) {
        score += 20;
        factors.push('Ideal budget alignment for grant size');
      } else if (budgetRatio >= 0.5 && budgetRatio <= 2.0) {
        score += 15;
        factors.push('Reasonable budget range');
      } else if (budgetRatio >= 0.3) {
        score += 8;
        factors.push('Minimum budget capacity met');
      } else if (budgetRatio > 2.0) {
        score += 5;
        factors.push('Organization larger than typical grantee - consider partnership opportunities');
      } else {
        factors.push('Budget capacity may be insufficient for this grant');
      }

      if (budgetRatio >= 0.9 && budgetRatio <= 1.1) {
        score += 5;
        factors.push('Excellent budget fit');
      }
    } else {
      factors.push('Budget information incomplete');
    }

    return { score: Math.min(score, 25), factors };
  };

  const calculateGeographicMatch = (client, source) => {
    let score = 0;
    const factors = [];

    if (!client?.location) {
      factors.push('Client location not specified');
      return { score, factors };
    }

    const clientScope = client.location.toLowerCase();
    const sourceType = source?.type?.toLowerCase() || '';

    if (clientScope === 'national') {
      score += 18;
      factors.push('National scope compatible with most funders');
    } else if (clientScope === 'regional') {
      if (sourceType.includes('private') || sourceType.includes('regional') || sourceType.includes('community')) {
        score += 16;
        factors.push('Regional scope aligns with funder type');
      } else if (sourceType.includes('government')) {
        score += 12;
        factors.push('Regional scope may work with government funders');
      }
    } else if (clientScope === 'local') {
      if (sourceType.includes('community') || sourceType.includes('local')) {
        score += 18;
        factors.push('Local scope perfect for community funders');
      } else if (sourceType.includes('private')) {
        score += 10;
        factors.push('Local scope may work with some private foundations');
      }
    } else if (clientScope === 'statewide') {
      score += 15;
      factors.push('Statewide scope has good funding opportunities');
    }

    return { score: Math.min(score, 20), factors };
  };

  const calculatePopulationMatch = (client, grant) => {
    let score = 0;
    const factors = [];

    const populationOverlap = calculateOverlapScore(
      client?.targetPopulation || [], 
      extractTargetPopulation(grant)
    );
    
    score = Math.min(populationOverlap.score * 0.15, 15);
    
    if (populationOverlap.common.length > 0) {
      factors.push(`Serves similar populations: ${populationOverlap.common.join(', ')}`);
    } else {
      factors.push('Limited population overlap - consider adapting program focus');
    }

    return { score, factors };
  };

  const calculateExperienceMatch = (client, grant, source) => {
    let score = 0;
    const factors = [];

    if (hasRelevantExperience(client, source?.category) || 
        hasRelevantExperience(client, grant?.category)) {
      score += 6;
      factors.push('Proven track record in this field');
    }

    if (client?.operatingYears && client.operatingYears >= 3) {
      score += 2;
      factors.push('Established organization with experience');
    }

    if (hasSimilarGrantExperience(client, grant)) {
      score += 2;
      factors.push('Experience with grants of similar scale');
    }

    return { score: Math.min(score, 10), factors };
  };

  // Helper functions
  const calculateOverlapScore = (arr1 = [], arr2 = []) => {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
      return { score: 0, common: [] };
    }

    const common = arr1.filter(item => 
      arr2.some(arr2Item => 
        arr2Item?.toLowerCase().includes(item?.toLowerCase()) ||
        item?.toLowerCase().includes(arr2Item?.toLowerCase())
      )
    );
    
    const maxLength = Math.max(arr1.length, arr2.length);
    const score = maxLength > 0 ? (common.length / maxLength) * 100 : 0;
    
    return { score, common };
  };

  const extractMaxAmount = (amountString) => {
    if (!amountString) return null;
    
    try {
      const matches = amountString.match(/\$?([\d,]+)/g);
      if (matches) {
        const amounts = matches.map(amt => parseInt(amt.replace(/[$,]/g, '')));
        return Math.max(...amounts);
      }
    } catch (error) {
      console.warn('Error parsing grant amount:', amountString);
    }
    return null;
  };

  const extractTargetPopulation = (grant) => {
    if (!grant) return ['General Public'];
    
    const text = `${grant.eligibility || ''} ${grant.description || ''}`.toLowerCase();
    const populations = [];
    
    const populationMap = {
      'youth': 'Youth',
      'student': 'Youth', 
      'senior': 'Seniors',
      'elderly': 'Seniors',
      'low.income': 'Low-income households',
      'underserved': 'Low-income households',
      'bipoc': 'BIPOC communities',
      'minority': 'BIPOC communities',
      'rural': 'Rural populations',
      'indigenous': 'Indigenous communities',
      'disabilit': 'People with disabilities',
      'veteran': 'Veterans',
      'immigrant': 'Immigrants',
      'refugee': 'Refugees',
      'lgbtq': 'LGBTQ+ communities',
      'homeless': 'Homeless populations'
    };

    Object.entries(populationMap).forEach(([keyword, population]) => {
      if (text.includes(keyword)) {
        populations.push(population);
      }
    });
    
    return populations.length > 0 ? [...new Set(populations)] : ['General Public'];
  };

  const hasRelevantExperience = (client, category) => {
    if (!client?.previousGrants || !category) return false;
    
    return client.previousGrants.some(grant => 
      grant?.toLowerCase().includes(category?.toLowerCase()) ||
      category?.toLowerCase().includes(grant?.toLowerCase())
    );
  };

  const hasSimilarGrantExperience = (client, grant) => {
    if (!client?.previousGrants || !grant?.amount) return false;
    
    const grantAmount = extractMaxAmount(grant.amount);
    if (!grantAmount) return false;

    return client.previousGrants.some(previousGrant => {
      const previousAmount = extractMaxAmount(previousGrant);
      return previousAmount && 
             previousAmount >= grantAmount * 0.5 && 
             previousAmount <= grantAmount * 1.5;
    });
  };

  const getMatchReasons = (client, grant, source, matchScore) => {
    const reasons = [];
    
    if (matchScore.factors.length > 0) {
      reasons.push(...matchScore.factors.slice(0, 3));
    }
    
    if (client?.mission && grant?.description && 
        client.mission.length > 0 && grant.description.length > 0) {
      const missionWords = client.mission.toLowerCase().split(/\s+/);
      const grantWords = grant.description.toLowerCase().split(/\s+/);
      const commonWords = missionWords.filter(word => 
        grantWords.includes(word) && word.length > 4
      );
      if (commonWords.length >= 2) {
        reasons.push('Mission and grant description show strong alignment');
      }
    }
    
    return reasons.slice(0, 4);
  };

  const analyzeFit = (client, grant, source, matchScore) => {
    const fit = {
      strengths: [],
      considerations: [],
      recommendations: []
    };

    if (matchScore.breakdown.category >= 20) {
      fit.strengths.push('Strong mission and category alignment');
    }
    
    if (matchScore.breakdown.budget >= 15) {
      fit.strengths.push('Excellent budget compatibility');
    }
    
    if (matchScore.breakdown.experience >= 6) {
      fit.strengths.push('Proven track record in relevant area');
    }

    if (matchScore.breakdown.population < 8) {
      fit.considerations.push('Consider how your program could better serve the target population');
    }
    
    if (matchScore.breakdown.budget < 10) {
      fit.considerations.push('Budget capacity may need strengthening through partnerships');
    }

    if (matchScore.total >= 80) {
      fit.recommendations.push('High priority - excellent overall alignment');
    } else if (matchScore.total >= 60) {
      fit.recommendations.push('Strong candidate - good alignment with some areas for improvement');
    } else {
      fit.recommendations.push('Consider if this aligns with strategic priorities despite lower score');
    }

    if (grant?.deadline && daysUntilDeadline(grant.deadline) < 30) {
      fit.considerations.push('Very tight timeline - consider expedited process');
      fit.recommendations.push('Immediate action required if pursuing this opportunity');
    }

    return fit;
  };

  const daysUntilDeadline = (deadline) => {
    if (!deadline) return 365;
    
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.warn('Error parsing deadline:', deadline);
      return 365;
    }
  };

  const generateTimeline = (deadline) => {
    const days = daysUntilDeadline(deadline);
    
    if (days <= 0) {
      return [
        { step: 'Grant deadline passed', due: 'Overdue', status: 'overdue' }
      ];
    }
    
    return [
      { 
        step: 'Initial Research & Planning', 
        due: `${Math.max(3, Math.floor(days * 0.1))} days`, 
        status: 'pending' 
      },
      { 
        step: 'Proposal Draft Development', 
        due: `${Math.max(7, Math.floor(days * 0.4))} days`, 
        status: 'pending' 
      },
      { 
        step: 'Budget Preparation & Review', 
        due: `${Math.max(5, Math.floor(days * 0.6))} days`, 
        status: 'pending' 
      },
      { 
        step: 'Final Review & Edits', 
        due: `${Math.max(3, Math.floor(days * 0.8))} days`, 
        status: 'pending' 
      },
      { 
        step: 'Submission', 
        due: `${days} days`, 
        status: 'pending' 
      }
    ];
  };

  const generateActionSteps = (client, grant, matchScore) => {
    const steps = [
      'Review full RFP and application requirements carefully',
      'Gather organizational documents and financial statements',
      'Schedule proposal planning meeting with key team members'
    ];

    if (matchScore.breakdown.experience < 5) {
      steps.push('Develop case studies demonstrating relevant capacity and experience');
    }

    if (matchScore.breakdown.budget < 10) {
      steps.push('Explore partnership opportunities to strengthen budget capacity');
    }

    if (daysUntilDeadline(grant?.deadline) < 60) {
      steps.push('Expedite proposal development process');
      steps.push('Consider bringing in additional grant writing support');
    }

    if (matchScore.breakdown.population < 8) {
      steps.push('Consider program adaptations to better serve target population');
    }

    return steps;
  };

  const analyzeClientStrengths = (client, matches) => {
    const strengths = [];
    
    const highMatches = matches.filter(m => m.matchScore.total >= 75);
    if (highMatches.length >= 3) {
      strengths.push('Excellent alignment with multiple high-value opportunities');
    } else if (highMatches.length >= 1) {
      strengths.push('Strong alignment with several quality opportunities');
    }
    
    if (client?.previousGrants && client.previousGrants.length >= 2) {
      strengths.push('Proven track record of successful grant acquisition');
    }
    
    if (client?.budget >= 500000) {
      strengths.push('Substantial organizational capacity for significant grants');
    }
    
    if (matches.some(m => m.fitAnalysis.strengths.includes('Strong mission and category alignment'))) {
      strengths.push('Clear mission alignment with major funders in your field');
    }

    if (strengths.length === 0) {
      strengths.push('Diverse program focus with potential across multiple funding areas');
    }
    
    return strengths;
  };

  const analyzeImprovementAreas = (client, matches) => {
    const areas = [];
    
    const highQualityMatches = matches.filter(m => m.matchScore.total >= 80);
    if (highQualityMatches.length === 0) {
      areas.push('Consider expanding or refining program areas to access more high-quality opportunities');
    }
    
    if (!client?.previousGrants || client.previousGrants.length === 0) {
      areas.push('Build grant writing capacity and establish track record with smaller foundation grants');
    }
    
    const lowBudgetMatches = matches.filter(m => m.matchScore.breakdown.budget < 10);
    if (lowBudgetMatches.length > matches.length * 0.5) {
      areas.push('Develop partnership strategies and capacity building for larger funding opportunities');
    }

    const localClient = client?.location && client.location.toLowerCase() === 'local';
    if (localClient && matches.length < 3) {
      areas.push('Explore regional and national funding opportunities that accept local applicants');
    }
    
    return areas;
  };

  const analyzeMatchFactors = (client, matches) => {
    const factors = [];
    
    const categoryMatches = matches.filter(m => 
      client?.category && m.source?.category && 
      client.category.toLowerCase() === m.source.category.toLowerCase()
    );
    if (categoryMatches.length > 0) {
      factors.push(`Strong presence in ${client.category} funding space`);
    }
    
    const highBudgetMatches = matches.filter(m => m.matchScore.breakdown.budget >= 15);
    if (highBudgetMatches.length > 0) {
      factors.push('Well-positioned for major grants based on budget capacity');
    }
    
    const experienceMatches = matches.filter(m => m.matchScore.breakdown.experience >= 6);
    if (experienceMatches.length > 0) {
      factors.push('Strong experience base attractive to funders');
    }

    const sourceTypes = [...new Set(matches.map(m => m.source?.type))];
    if (sourceTypes.length >= 3) {
      factors.push('Diverse funding source opportunities available');
    }
    
    return factors;
  };

  const generateOverallTimeline = (matches) => {
    const deadlines = matches
      .map(m => ({ 
        grant: m.grant?.title || 'Unknown Grant', 
        source: m.source?.name || 'Unknown Source',
        deadline: m.grant?.deadline,
        daysUntil: daysUntilDeadline(m.grant?.deadline),
        matchScore: m.matchScore.total
      }))
      .filter(m => m.daysUntil > 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
    
    return deadlines;
  };

  const generateAnalysisSummary = (client, matches, analysis) => {
    const highMatchCount = matches.filter(m => m.matchScore.total >= 80).length;
    const totalOpportunities = matches.length;
    
    const clientName = client?.organizationName || client?.name || 'This organization';
    
    let summary = `AI analysis for ${clientName} identified `;
    
    if (highMatchCount >= 3) {
      summary += `exceptional funding potential with ${highMatchCount} high-quality matches (80%+ alignment). `;
    } else if (highMatchCount >= 1) {
      summary += `strong opportunities with ${highMatchCount} excellent matches and ${totalOpportunities} total qualified opportunities. `;
    } else if (totalOpportunities >= 5) {
      summary += `${totalOpportunities} solid funding opportunities with good alignment. `;
    } else {
      summary += `${totalOpportunities} potential opportunities with moderate alignment. `;
    }
    
    if (analysis.clientStrengths.length > 0) {
      summary += `Key organizational strengths include ${analysis.clientStrengths[0].toLowerCase()}. `;
    }
    
    if (analysis.improvementAreas.length > 0 && totalOpportunities < 10) {
      summary += `Recommendation: ${analysis.improvementAreas[0].toLowerCase()}.`;
    }
    
    if (!summary.endsWith('.') && !summary.endsWith('.')) {
      summary += ' Consider focusing on highest-scoring opportunities first.';
    }
    
    return summary;
  };

  const handleViewRecommendations = () => {
    setView('recommendations');
  };

  const handleNewAnalysis = () => {
    setView('analyze');
    setSelectedClient(null);
    setMatches([]);
    setAnalysis(null);
    setError(null);
  };

  if (dataLoading) {
    return (
      <div className="matching-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Loading Funding Data...</h3>
          <p>Preparing client and grant source information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-container">
      {usingDemoData && (
        <div className="demo-banner">
          <span>💡 Using demo data - Backend routes not implemented yet</span>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {view === 'analyze' && (
        <div className="matching-content">
          <div className="matching-header">
            <div className="header-content">
              <div className="header-title">
                <h1>Grant Matching Analysis</h1>
                <p>Select a client to analyze funding opportunities</p>
              </div>
            </div>
          </div>
          <ClientProfile
            clients={clients}
            onAnalyzeClient={analyzeClientMatches}
            loading={loading}
            error={error}
            usingDemoData={usingDemoData}
          />
        </div>
      )}

      {view === 'results' && (
        <MatchResults
          client={selectedClient}
          matches={matches}
          analysis={analysis}
          onViewRecommendations={handleViewRecommendations}
          onNewAnalysis={handleNewAnalysis}
          loading={loading}
          usingDemoData={usingDemoData}
        />
      )}

      {view === 'recommendations' && (
        <GrantRecommendations
          client={selectedClient}
          matches={matches}
          analysis={analysis}
          onBackToResults={() => setView('results')}
          onNewAnalysis={handleNewAnalysis}
          usingDemoData={usingDemoData}
        />
      )}
    </div>
  );
};

export default Matching;