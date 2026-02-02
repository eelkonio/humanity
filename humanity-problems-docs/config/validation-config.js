/**
 * Validation configuration for humanity problems documentation system
 * Centralizes all validation rules and standards
 */

export const ValidationConfig = {
  // Document structure requirements
  structure: {
    requiredSections: [
      'Abstract',
      'Introduction', 
      'Theoretical Framework',
      'Analysis',
      'Cross-Level Connections',
      'Historical Context',
      'Contemporary Manifestations',
      'Implications',
      'Limitations',
      'References',
      'Cross-References'
    ],
    
    requiredMetadata: [
      'Discipline',
      'Level', 
      'Keywords',
      'Related Documents'
    ],
    
    validLevels: [
      'Individual', 
      'Group', 
      'Societal', 
      'Cross-Level', 
      'Integrative'
    ],
    
    validDisciplines: [
      'Psychology', 
      'Sociology', 
      'Anthropology', 
      'Political Science',
      'Economics', 
      'History', 
      'Philosophy', 
      'Religious Studies',
      'Neuroscience', 
      'Evolutionary Psychology', 
      'Cognitive Science'
    ]
  },

  // Cross-reference validation rules
  crossReferences: {
    validTypes: ['see', 'related', 'compare'],
    
    validCategories: [
      'individual', 
      'group', 
      'societal', 
      'historical', 
      'integrative', 
      'specialized', 
      'foundational'
    ],
    
    minimumReferences: 1,
    
    // Reference appropriateness rules
    appropriatenessRules: {
      'see': {
        description: 'Direct references to specific related content',
        preferredTargets: ['different-level', 'different-category']
      },
      'related': {
        description: 'Related concepts with keyword or disciplinary overlap',
        requiresOverlap: true
      },
      'compare': {
        description: 'Comparative analysis between similar concepts',
        preferredTargets: ['same-level', 'similar-discipline']
      }
    }
  },

  // Academic citation standards
  citations: {
    supportedFormats: ['apa', 'mla', 'chicago'],
    
    requiredFields: ['author', 'title', 'year', 'publication'],
    
    minimumCitationDensity: 5, // per 1000 words
    
    academicRigorIndicators: [
      'theoretical framework',
      'empirical evidence', 
      'peer-reviewed',
      'methodology',
      'limitations'
    ],
    
    minimumRigorIndicators: 3
  },

  // Markdown feature requirements
  markdownFeatures: {
    required: [
      'tables',
      'diagrams', 
      'lists',
      'emphasis'
    ],
    
    recommended: [
      'footnotes',
      'blockquotes',
      'definition-lists',
      'task-lists'
    ],
    
    diagramTypes: ['mermaid'],
    
    tableRequirements: {
      minimumColumns: 2,
      requireHeaders: true,
      requireCaptions: false
    }
  },

  // Content quality standards
  quality: {
    minimumWordCount: 1000,
    
    maximumSectionLength: 2000,
    
    keywordRequirements: {
      minimum: 3,
      maximum: 10,
      format: 'comma-separated'
    },
    
    academicTone: {
      requiredElements: [
        'discipline-specific terminology',
        'theoretical references',
        'evidence-based arguments',
        'limitation acknowledgment'
      ],
      
      discouragedElements: [
        'first-person pronouns',
        'colloquial language',
        'unsupported claims',
        'absolute statements'
      ]
    }
  },

  // Hierarchical organization rules
  organization: {
    maxDepth: 3,
    
    categoryStructure: {
      'individual': {
        subcategories: ['psychology', 'cognition', 'behavior', 'pathology'],
        expectedDocuments: 5
      },
      'group': {
        subcategories: ['social-psychology', 'dynamics', 'organizations', 'collective'],
        expectedDocuments: 5
      },
      'societal': {
        subcategories: ['political', 'economic', 'cultural', 'technological'],
        expectedDocuments: 5
      },
      'historical': {
        subcategories: ['collapse', 'crises', 'conflicts', 'patterns'],
        expectedDocuments: 5
      },
      'integrative': {
        subcategories: ['systems', 'complexity', 'synthesis', 'projections'],
        expectedDocuments: 5
      },
      'specialized': {
        subcategories: ['topics', 'domains', 'applications'],
        expectedDocuments: 5
      }
    },
    
    navigationRequirements: {
      breadcrumbs: true,
      crossLevelLinks: true,
      categoryIndices: true
    }
  },

  // Validation thresholds and scoring
  scoring: {
    weights: {
      structure: 0.3,
      crossReferences: 0.2,
      citations: 0.2,
      markdownFeatures: 0.1,
      academicRigor: 0.2
    },
    
    passingScore: 0.8,
    
    warningThreshold: 0.9,
    
    errorPenalties: {
      missingSection: -0.1,
      brokenReference: -0.05,
      invalidCitation: -0.05,
      missingMetadata: -0.05
    }
  },

  // Workshop demonstration requirements
  workshop: {
    requiredFeatures: [
      'complex-tables',
      'mermaid-diagrams',
      'nested-lists',
      'academic-citations',
      'cross-references',
      'metadata-headers'
    ],
    
    demonstrationDocuments: [
      'evolutionary-foundations',
      'cognitive-architecture', 
      'social-psychology',
      'systems-theory'
    ],
    
    advancedFeatures: [
      'definition-lists',
      'task-lists',
      'footnotes',
      'blockquotes',
      'emphasis-combinations'
    ]
  }
};

// Validation rule functions
export const ValidationRules = {
  /**
   * Checks if document meets minimum academic standards
   */
  isAcademicallyRigorous(content, citationCount, wordCount) {
    const rigorScore = this.calculateRigorScore(content, citationCount, wordCount);
    return rigorScore >= ValidationConfig.scoring.passingScore;
  },

  /**
   * Calculates academic rigor score
   */
  calculateRigorScore(content, citationCount, wordCount) {
    let score = 0;
    
    // Citation density
    const citationDensity = (citationCount / wordCount) * 1000;
    if (citationDensity >= ValidationConfig.citations.minimumCitationDensity) {
      score += 0.3;
    }
    
    // Academic indicators
    const indicators = ValidationConfig.citations.academicRigorIndicators;
    const foundIndicators = indicators.filter(indicator => 
      new RegExp(indicator, 'i').test(content)
    );
    
    if (foundIndicators.length >= ValidationConfig.citations.minimumRigorIndicators) {
      score += 0.4;
    }
    
    // Word count
    if (wordCount >= ValidationConfig.quality.minimumWordCount) {
      score += 0.2;
    }
    
    // Theoretical framework presence
    if (/theoretical framework|conceptual model/i.test(content)) {
      score += 0.1;
    }
    
    return score;
  },

  /**
   * Validates cross-reference appropriateness
   */
  isReferenceAppropriate(sourceDoc, targetDoc, referenceType) {
    const rules = ValidationConfig.crossReferences.appropriatenessRules[referenceType];
    if (!rules) return false;
    
    switch (referenceType) {
      case 'see':
        return sourceDoc.level !== targetDoc.level || 
               sourceDoc.category !== targetDoc.category;
               
      case 'related':
        return this.hasKeywordOverlap(sourceDoc, targetDoc) ||
               sourceDoc.discipline === targetDoc.discipline;
               
      case 'compare':
        return sourceDoc.level === targetDoc.level ||
               sourceDoc.discipline === targetDoc.discipline;
               
      default:
        return false;
    }
  },

  /**
   * Checks for keyword overlap between documents
   */
  hasKeywordOverlap(doc1, doc2) {
    if (!doc1.keywords || !doc2.keywords) return false;
    
    return doc1.keywords.some(k1 => 
      doc2.keywords.some(k2 => 
        k1.toLowerCase().includes(k2.toLowerCase()) ||
        k2.toLowerCase().includes(k1.toLowerCase())
      )
    );
  },

  /**
   * Validates document completeness
   */
  isDocumentComplete(docInfo) {
    const requiredSections = ValidationConfig.structure.requiredSections;
    const requiredMetadata = ValidationConfig.structure.requiredMetadata;
    
    const hasAllSections = requiredSections.every(section => 
      docInfo.sections && docInfo.sections.includes(section)
    );
    
    const hasAllMetadata = requiredMetadata.every(field => 
      docInfo.metadata && docInfo.metadata[field]
    );
    
    return hasAllSections && hasAllMetadata;
  }
};

export default ValidationConfig;