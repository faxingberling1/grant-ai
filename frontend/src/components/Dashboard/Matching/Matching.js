// frontend/src/components/Dashboard/Matching/Matching.js
import React, { useState, useEffect } from 'react';
import MatchResults from './MatchResults';
import ClientProfile from './ClientProfile';
import GrantRecommendations from './GrantRecommendations';
import './Matching.css';

const Matching = () => {
  const [view, setView] = useState('analyze'); // 'analyze', 'results', 'recommendations'
  const [clients, setClients] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock clients data
    const mockClients = [
      {
        id: '1',
        name: 'Tech4Kids Foundation',
        type: 'nonprofit',
        category: 'Education',
        mission: 'Providing STEM education to underprivileged youth',
        budget: 500000,
        location: 'National',
        targetPopulation: ['Youth', 'Low-income households', 'BIPOC communities'],
        focusAreas: ['STEM Education', 'Youth Development', 'Technology Access'],
        previousGrants: ['NSF Education Grant - $250,000', 'Google.org Tech Initiative - $150,000'],
        eligibility: '501(c)(3) nonprofit, 3+ years of operation',
        contact: {
          name: 'Sarah Johnson',
          email: 'sarah@tech4kids.org',
          phone: '(555) 123-4567'
        }
      },
      {
        id: '2',
        name: 'Green Earth Alliance',
        type: 'nonprofit',
        category: 'Environment',
        mission: 'Promoting environmental conservation and sustainable practices',
        budget: 750000,
        location: 'Regional',
        targetPopulation: ['General Public', 'Rural populations', 'Indigenous communities'],
        focusAreas: ['Environmental Conservation', 'Climate Change', 'Sustainable Agriculture'],
        previousGrants: ['EPA Conservation Grant - $500,000', 'Ford Foundation - $200,000'],
        eligibility: '501(c)(3) nonprofit, environmental focus',
        contact: {
          name: 'Michael Chen',
          email: 'michael@greenearth.org',
          phone: '(555) 234-5678'
        }
      },
      {
        id: '3',
        name: 'Community Health Alliance',
        type: 'nonprofit',
        category: 'Healthcare',
        mission: 'Improving healthcare access in underserved communities',
        budget: 1200000,
        location: 'Local',
        targetPopulation: ['Low-income households', 'Seniors', 'People with disabilities'],
        focusAreas: ['Healthcare Access', 'Preventive Care', 'Mental Health'],
        previousGrants: ['Robert Wood Johnson Foundation - $750,000', 'State Health Dept - $300,000'],
        eligibility: '501(c)(3) nonprofit, healthcare provider',
        contact: {
          name: 'Dr. Maria Rodriguez',
          email: 'maria@healthalliance.org',
          phone: '(555) 345-6789'
        }
      },
      {
        id: '4',
        name: 'Arts for All Initiative',
        type: 'nonprofit',
        category: 'Arts & Culture',
        mission: 'Making arts education accessible to all communities',
        budget: 300000,
        location: 'Statewide',
        targetPopulation: ['Youth', 'Seniors', 'People with disabilities'],
        focusAreas: ['Arts Education', 'Cultural Programs', 'Community Arts'],
        previousGrants: ['NEA Arts Grant - $100,000', 'Local Arts Council - $50,000'],
        eligibility: '501(c)(3) nonprofit, arts organization',
        contact: {
          name: 'Emily Watson',
          email: 'emily@artsforall.org',
          phone: '(555) 456-7890'
        }
      }
    ];

    // Mock sources data (simplified from Sources.js)
    const mockSources = [
      {
        id: '1',
        name: 'National Science Foundation',
        type: 'government',
        category: 'STEM Education',
        grants: [
          {
            id: 'nsf-1',
            title: 'STEM Education Research Grants',
            amount: '$500,000 - $1,500,000',
            deadline: '2024-03-15',
            category: 'Research',
            status: 'active',
            eligibility: 'Universities, Research Institutions, Non-profit STEM Organizations',
            focusAreas: ['STEM Education', 'Research', 'Technology']
          }
        ]
      },
      {
        id: '2',
        name: 'Ford Foundation',
        type: 'private_foundation',
        category: 'Social Justice',
        grants: [
          {
            id: 'ford-1',
            title: 'Racial Justice Initiative',
            amount: '$250,000 - $1,000,000',
            deadline: '2024-06-30',
            category: 'Social Justice',
            status: 'active',
            eligibility: 'Nonprofits, Community Organizations, Advocacy Groups',
            focusAreas: ['Social Justice', 'Equity', 'Community Development']
          }
        ]
      },
      {
        id: '3',
        name: 'Department of Energy',
        type: 'government',
        category: 'Clean Energy',
        grants: [
          {
            id: 'doe-1',
            title: 'Solar Energy Research Program',
            amount: '$1,000,000 - $5,000,000',
            deadline: '2024-04-20',
            category: 'Research',
            status: 'active',
            eligibility: 'Research Institutions, Energy Companies, Universities',
            focusAreas: ['Renewable Energy', 'Climate Change', 'Innovation']
          }
        ]
      }
    ];

    setClients(mockClients);
    setSources(mockSources);
  }, []);

  const analyzeClientMatches = (client) => {
    setLoading(true);
    setSelectedClient(client);

    // Simulate AI analysis with timeout
    setTimeout(() => {
      const analysisResults = performAIAnalysis(client, sources);
      setAnalysis(analysisResults);
      setMatches(analysisResults.matches);
      setView('results');
      setLoading(false);
    }, 2000);
  };

  const performAIAnalysis = (client, allSources) => {
    let matches = [];
    let analysis = {
      clientStrengths: [],
      improvementAreas: [],
      matchFactors: [],
      timeline: []
    };

    // Analyze each source and grant for matches
    allSources.forEach(source => {
      source.grants.forEach(grant => {
        const matchScore = calculateMatchScore(client, grant, source);
        
        if (matchScore >= 60) { // Only include matches with 60%+ score
          matches.push({
            grant,
            source,
            matchScore,
            matchReasons: getMatchReasons(client, grant, source),
            fitAnalysis: analyzeFit(client, grant, source),
            timeline: generateTimeline(grant.deadline),
            actionSteps: generateActionSteps(client, grant)
          });
        }
      });
    });

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Generate client analysis
    analysis.clientStrengths = analyzeClientStrengths(client, matches);
    analysis.improvementAreas = analyzeImprovementAreas(client, matches);
    analysis.matchFactors = analyzeMatchFactors(client, matches);
    analysis.timeline = generateOverallTimeline(matches);

    return { matches, analysis };
  };

  const calculateMatchScore = (client, grant, source) => {
    let score = 0;
    let factors = [];

    // Category match (30%)
    if (client.category === source.category) {
      score += 30;
      factors.push('Perfect category alignment');
    } else if (hasOverlap(client.focusAreas, grant.focusAreas)) {
      score += 20;
      factors.push('Focus area overlap');
    }

    // Budget alignment (25%)
    const grantAmount = extractMaxAmount(grant.amount);
    if (grantAmount && client.budget) {
      const budgetRatio = Math.min(client.budget / grantAmount, 1);
      if (budgetRatio >= 0.8) {
        score += 25;
        factors.push('Ideal budget alignment');
      } else if (budgetRatio >= 0.5) {
        score += 15;
        factors.push('Reasonable budget range');
      }
    }

    // Geographic alignment (20%)
    if (client.location === 'National' || 
        (client.location === 'Regional' && source.type === 'private_foundation') ||
        (client.location === 'Local' && source.type === 'community')) {
      score += 20;
      factors.push('Geographic compatibility');
    }

    // Target population alignment (15%)
    if (hasOverlap(client.targetPopulation, extractTargetPopulation(grant))) {
      score += 15;
      factors.push('Target population match');
    }

    // Previous experience bonus (10%)
    if (hasRelevantExperience(client, source.category)) {
      score += 10;
      factors.push('Relevant previous experience');
    }

    return Math.min(score, 100);
  };

  // Helper functions for analysis
  const hasOverlap = (arr1, arr2) => {
    return arr1.some(item => arr2.includes(item));
  };

  const extractMaxAmount = (amountString) => {
    const match = amountString.match(/\$?([\d,]+)/g);
    if (match) {
      const amounts = match.map(amt => parseInt(amt.replace(/[$,]/g, '')));
      return Math.max(...amounts);
    }
    return null;
  };

  const extractTargetPopulation = (grant) => {
    // This would be more sophisticated in a real implementation
    const populationKeywords = {
      'STEM Education': ['Youth', 'Students'],
      'Social Justice': ['BIPOC communities', 'Marginalized groups'],
      'Environment': ['General Public', 'Communities'],
      'Healthcare': ['Low-income households', 'Seniors']
    };
    return populationKeywords[grant.category] || ['General Public'];
  };

  const hasRelevantExperience = (client, category) => {
    return client.previousGrants.some(grant => 
      grant.toLowerCase().includes(category.toLowerCase())
    );
  };

  const getMatchReasons = (client, grant, source) => {
    const reasons = [];
    
    if (client.category === source.category) {
      reasons.push(`Your ${client.category} focus aligns perfectly with ${source.name}'s mission`);
    }
    
    if (hasOverlap(client.focusAreas, grant.focusAreas)) {
      reasons.push(`Shared focus on ${client.focusAreas.find(f => grant.focusAreas.includes(f))}`);
    }
    
    if (hasOverlap(client.targetPopulation, extractTargetPopulation(grant))) {
      reasons.push(`Target population alignment`);
    }
    
    return reasons;
  };

  const analyzeFit = (client, grant, source) => {
    const fit = {
      strengths: [],
      considerations: []
    };

    // Strengths
    if (client.category === source.category) {
      fit.strengths.push('Perfect mission alignment');
    }
    if (client.budget >= extractMaxAmount(grant.amount) * 0.5) {
      fit.strengths.push('Strong financial capacity');
    }
    if (hasRelevantExperience(client, source.category)) {
      fit.strengths.push('Proven track record in this area');
    }

    // Considerations
    if (client.budget < extractMaxAmount(grant.amount) * 0.3) {
      fit.considerations.push('May need additional funding partners');
    }
    if (grant.deadline && daysUntilDeadline(grant.deadline) < 60) {
      fit.considerations.push('Tight application timeline');
    }

    return fit;
  };

  const daysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  const generateTimeline = (deadline) => {
    const days = daysUntilDeadline(deadline);
    return [
      { step: 'Initial Research', due: '1 week', status: 'pending' },
      { step: 'Proposal Draft', due: `${Math.max(7, days - 45)} days`, status: 'pending' },
      { step: 'Budget Preparation', due: `${Math.max(7, days - 30)} days`, status: 'pending' },
      { step: 'Final Review', due: `${Math.max(3, days - 14)} days`, status: 'pending' },
      { step: 'Submission', due: `${days} days`, status: 'pending' }
    ];
  };

  const generateActionSteps = (client, grant) => {
    const steps = [
      'Review full RFP requirements',
      'Gather required documentation',
      'Schedule planning meeting with team'
    ];

    if (!hasRelevantExperience(client, grant.category)) {
      steps.push('Develop case studies demonstrating relevant capacity');
    }

    if (daysUntilDeadline(grant.deadline) < 90) {
      steps.push('Expedite proposal development process');
    }

    return steps;
  };

  const analyzeClientStrengths = (client, matches) => {
    const strengths = [];
    
    if (matches.some(m => m.matchScore >= 90)) {
      strengths.push('Excellent alignment with multiple high-value opportunities');
    }
    
    if (client.previousGrants.length >= 2) {
      strengths.push('Strong track record of successful grant acquisition');
    }
    
    if (client.budget >= 500000) {
      strengths.push('Substantial organizational capacity for large grants');
    }
    
    return strengths;
  };

  const analyzeImprovementAreas = (client, matches) => {
    const areas = [];
    
    if (!matches.some(m => m.matchScore >= 80)) {
      areas.push('Consider expanding program areas to access more funding opportunities');
    }
    
    if (client.previousGrants.length === 0) {
      areas.push('Build grant writing capacity and track record');
    }
    
    return areas;
  };

  const analyzeMatchFactors = (client, matches) => {
    const factors = [];
    
    const categoryMatches = matches.filter(m => client.category === m.source.category);
    if (categoryMatches.length > 0) {
      factors.push(`Strong presence in ${client.category} funding space`);
    }
    
    const highBudgetMatches = matches.filter(m => 
      client.budget >= extractMaxAmount(m.grant.amount) * 0.7
    );
    if (highBudgetMatches.length > 0) {
      factors.push('Well-positioned for major grants');
    }
    
    return factors;
  };

  const generateOverallTimeline = (matches) => {
    const deadlines = matches
      .map(m => ({ grant: m.grant.title, deadline: m.grant.deadline }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);
    
    return deadlines;
  };

  const handleViewRecommendations = () => {
    setView('recommendations');
  };

  const handleNewAnalysis = () => {
    setView('analyze');
    setSelectedClient(null);
    setMatches([]);
    setAnalysis(null);
  };

  return (
    <div className="matching-container">
      {view === 'analyze' && (
        <ClientProfile
          clients={clients}
          onAnalyzeClient={analyzeClientMatches}
          loading={loading}
        />
      )}

      {view === 'results' && (
        <MatchResults
          client={selectedClient}
          matches={matches}
          analysis={analysis}
          onViewRecommendations={handleViewRecommendations}
          onNewAnalysis={handleNewAnalysis}
          loading={loading}
        />
      )}

      {view === 'recommendations' && (
        <GrantRecommendations
          client={selectedClient}
          matches={matches}
          analysis={analysis}
          onBackToResults={() => setView('results')}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  );
};

export default Matching;