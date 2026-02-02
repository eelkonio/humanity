import fs from 'fs';
import path from 'path';
import { ValidationConfig } from '../config/validation-config.js';

/**
 * Metadata and indexing system for humanity problems documentation
 * Implements comprehensive tagging, categorization, and searchable indexing
 */
class MetadataIndexingSystem {
  constructor() {
    this.documentIndex = new Map();
    this.keywordIndex = new Map();
    this.disciplineIndex = new Map();
    this.levelIndex = new Map();
    this.topicIndex = new Map();
    this.crossReferenceIndex = new Map();
    
    this.validationConfig = ValidationConfig;
    this.indexingResults = {
      totalDocuments: 0,
      indexedDocuments: 0,
      totalKeywords: 0,
      totalTopics: 0,
      hierarchyIntegrity: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Creates comprehensive metadata and indexing system
   * @param {string} docsDir - Path to documentation directory
   * @returns {Object} Indexing results and validation
   */
  async createComprehensiveIndex(docsDir) {
    console.log('Starting metadata and indexing system creation...\n');
    
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      indices: {
        documents: null,
        keywords: null,
        disciplines: null,
        levels: null,
        topics: null,
        crossReferences: null
      },
      metadata: {
        taggingCompleteness: null,
        categorizationAccuracy: null,
        hierarchicalIntegrity: null
      },
      searchCapabilities: {
        keywordSearch: null,
        topicSearch: null,
        disciplineSearch: null,
        crossReferenceSearch: null
      },
      score: 0
    };

    try {
      // 1. Build comprehensive document index
      console.log('1. Building document index...');
      results.indices.documents = await this.buildDocumentIndex(docsDir);
      
      // 2. Create keyword and topic indices
      console.log('2. Creating keyword and topic indices...');
      results.indices.keywords = await this.buildKeywordIndex();
      results.indices.topics = await this.buildTopicIndex();
      
      // 3. Build discipline and level indices
      console.log('3. Building discipline and level indices...');
      results.indices.disciplines = await this.buildDisciplineIndex();
      results.indices.levels = await this.buildLevelIndex();
      
      // 4. Create cross-reference index
      console.log('4. Creating cross-reference index...');
      results.indices.crossReferences = await this.buildCrossReferenceIndex();
      
      // 5. Validate metadata completeness
      console.log('5. Validating metadata completeness...');
      results.metadata = await this.validateMetadataCompleteness();
      
      // 6. Validate hierarchical organization integrity
      console.log('6. Validating hierarchical organization...');
      results.metadata.hierarchicalIntegrity = await this.validateHierarchicalIntegrity();
      
      // 7. Create search capabilities
      console.log('7. Creating search capabilities...');
      results.searchCapabilities = await this.createSearchCapabilities();
      
      // 8. Calculate overall score
      results.score = this.calculateIndexingScore(results);
      
      // 9. Aggregate results
      this.aggregateIndexingResults(results);
      
      console.log('\nMetadata and indexing system creation completed.');
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Indexing system error: ${error.message}`);
    }

    return results;
  }

  /**
   * Builds comprehensive document index with full metadata
   * Requirements: 2.5 - Comprehensive indexing and categorization
   */
  async buildDocumentIndex(docsDir) {
    const indexResults = {
      valid: true,
      errors: [],
      warnings: [],
      totalDocuments: 0,
      indexedDocuments: 0,
      documents: {},
      score: 0
    };

    try {
      const documents = this.scanAllDocuments(docsDir);
      
      for (const doc of documents) {
        try {
          const metadata = this.extractComprehensiveMetadata(doc);
          const docIndex = {
            path: doc.path,
            name: doc.name,
            category: doc.category,
            metadata: metadata,
            content: {
              wordCount: doc.content.split(/\s+/).length,
              sectionCount: this.countSections(doc.content),
              tableCount: this.countTables(doc.content),
              diagramCount: this.countDiagrams(doc.content),
              citationCount: this.countCitations(doc.content)
            },
            relationships: {
              crossReferences: this.extractCrossReferences(doc.content),
              relatedDocuments: this.extractRelatedDocuments(doc.content),
              keywords: metadata.keywords || []
            },
            lastModified: fs.statSync(doc.path).mtime,
            indexed: new Date()
          };

          // Validate metadata completeness
          const metadataValidation = this.validateDocumentMetadata(metadata);
          if (!metadataValidation.valid) {
            indexResults.errors.push(...metadataValidation.errors.map(e => `${doc.name}: ${e}`));
            indexResults.warnings.push(...metadataValidation.warnings.map(w => `${doc.name}: ${w}`));
          }

          this.documentIndex.set(doc.name, docIndex);
          indexResults.documents[doc.name] = docIndex;
          indexResults.indexedDocuments++;
          
        } catch (error) {
          indexResults.errors.push(`Failed to index ${doc.name}: ${error.message}`);
          indexResults.valid = false;
        }
      }

      indexResults.totalDocuments = documents.length;
      indexResults.score = indexResults.indexedDocuments / indexResults.totalDocuments;

      console.log(`   Document index: ${indexResults.indexedDocuments}/${indexResults.totalDocuments} documents indexed`);
      
    } catch (error) {
      indexResults.valid = false;
      indexResults.errors.push(`Document indexing failed: ${error.message}`);
    }

    return indexResults;
  }

  /**
   * Builds keyword index for searchable content discovery
   */
  async buildKeywordIndex() {
    const keywordResults = {
      valid: true,
      errors: [],
      warnings: [],
      totalKeywords: 0,
      keywordMap: {},
      keywordFrequency: {},
      score: 0
    };

    try {
      for (const [docName, docIndex] of this.documentIndex) {
        const keywords = docIndex.metadata.keywords || [];
        
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().trim();
          
          if (!this.keywordIndex.has(normalizedKeyword)) {
            this.keywordIndex.set(normalizedKeyword, {
              documents: [],
              frequency: 0,
              relatedKeywords: new Set()
            });
          }
          
          const keywordEntry = this.keywordIndex.get(normalizedKeyword);
          keywordEntry.documents.push(docName);
          keywordEntry.frequency++;
          
          // Build related keywords from same document
          for (const otherKeyword of keywords) {
            if (otherKeyword !== keyword) {
              keywordEntry.relatedKeywords.add(otherKeyword.toLowerCase().trim());
            }
          }
        }
      }

      // Convert to serializable format
      for (const [keyword, data] of this.keywordIndex) {
        keywordResults.keywordMap[keyword] = {
          documents: data.documents,
          frequency: data.frequency,
          relatedKeywords: Array.from(data.relatedKeywords)
        };
        keywordResults.keywordFrequency[keyword] = data.frequency;
      }

      keywordResults.totalKeywords = this.keywordIndex.size;
      keywordResults.score = keywordResults.totalKeywords > 0 ? 1.0 : 0.0;

      console.log(`   Keyword index: ${keywordResults.totalKeywords} unique keywords indexed`);
      
    } catch (error) {
      keywordResults.valid = false;
      keywordResults.errors.push(`Keyword indexing failed: ${error.message}`);
    }

    return keywordResults;
  }

  /**
   * Builds topic index based on content analysis
   */
  async buildTopicIndex() {
    const topicResults = {
      valid: true,
      errors: [],
      warnings: [],
      totalTopics: 0,
      topicMap: {},
      topicHierarchy: {},
      score: 0
    };

    try {
      // Extract topics from document titles and sections
      for (const [docName, docIndex] of this.documentIndex) {
        const topics = this.extractTopicsFromDocument(docIndex);
        
        for (const topic of topics) {
          const normalizedTopic = this.normalizeTopic(topic);
          
          if (!this.topicIndex.has(normalizedTopic)) {
            this.topicIndex.set(normalizedTopic, {
              documents: [],
              level: docIndex.metadata.level,
              discipline: docIndex.metadata.discipline,
              subtopics: new Set(),
              parentTopics: new Set()
            });
          }
          
          const topicEntry = this.topicIndex.get(normalizedTopic);
          topicEntry.documents.push(docName);
        }
      }

      // Build topic hierarchy
      this.buildTopicHierarchy();

      // Convert to serializable format
      for (const [topic, data] of this.topicIndex) {
        topicResults.topicMap[topic] = {
          documents: data.documents,
          level: data.level,
          discipline: data.discipline,
          subtopics: Array.from(data.subtopics),
          parentTopics: Array.from(data.parentTopics)
        };
      }

      topicResults.totalTopics = this.topicIndex.size;
      topicResults.topicHierarchy = this.getTopicHierarchy();
      topicResults.score = topicResults.totalTopics > 0 ? 1.0 : 0.0;

      console.log(`   Topic index: ${topicResults.totalTopics} topics identified`);
      
    } catch (error) {
      topicResults.valid = false;
      topicResults.errors.push(`Topic indexing failed: ${error.message}`);
    }

    return topicResults;
  }

  /**
   * Builds discipline-based index
   */
  async buildDisciplineIndex() {
    const disciplineResults = {
      valid: true,
      errors: [],
      warnings: [],
      disciplineMap: {},
      coverage: {},
      score: 0
    };

    try {
      const validDisciplines = this.validationConfig.structure.validDisciplines;
      
      // Initialize discipline index
      for (const discipline of validDisciplines) {
        this.disciplineIndex.set(discipline, {
          documents: [],
          keywords: new Set(),
          topics: new Set(),
          levels: new Set()
        });
      }

      // Populate discipline index
      for (const [docName, docIndex] of this.documentIndex) {
        const discipline = docIndex.metadata.discipline;
        
        if (discipline && this.disciplineIndex.has(discipline)) {
          const disciplineEntry = this.disciplineIndex.get(discipline);
          disciplineEntry.documents.push(docName);
          
          // Add keywords and topics
          for (const keyword of docIndex.metadata.keywords || []) {
            disciplineEntry.keywords.add(keyword);
          }
          
          if (docIndex.metadata.level) {
            disciplineEntry.levels.add(docIndex.metadata.level);
          }
        } else if (discipline) {
          disciplineResults.warnings.push(`Unknown discipline: ${discipline} in ${docName}`);
        }
      }

      // Calculate coverage
      for (const [discipline, data] of this.disciplineIndex) {
        disciplineResults.disciplineMap[discipline] = {
          documents: data.documents,
          documentCount: data.documents.length,
          keywords: Array.from(data.keywords),
          topics: Array.from(data.topics),
          levels: Array.from(data.levels)
        };
        
        disciplineResults.coverage[discipline] = {
          documentCount: data.documents.length,
          hasDocuments: data.documents.length > 0
        };
      }

      // Calculate discipline coverage score
      const disciplinesWithDocs = Object.values(disciplineResults.coverage)
        .filter(c => c.hasDocuments).length;
      disciplineResults.score = disciplinesWithDocs / validDisciplines.length;

      console.log(`   Discipline index: ${disciplinesWithDocs}/${validDisciplines.length} disciplines covered`);
      
    } catch (error) {
      disciplineResults.valid = false;
      disciplineResults.errors.push(`Discipline indexing failed: ${error.message}`);
    }

    return disciplineResults;
  }

  /**
   * Builds level-based index (Individual, Group, Societal, etc.)
   */
  async buildLevelIndex() {
    const levelResults = {
      valid: true,
      errors: [],
      warnings: [],
      levelMap: {},
      distribution: {},
      score: 0
    };

    try {
      const validLevels = this.validationConfig.structure.validLevels;
      
      // Initialize level index
      for (const level of validLevels) {
        this.levelIndex.set(level, {
          documents: [],
          disciplines: new Set(),
          keywords: new Set(),
          crossLevelConnections: []
        });
      }

      // Populate level index
      for (const [docName, docIndex] of this.documentIndex) {
        const level = docIndex.metadata.level;
        
        if (level && this.levelIndex.has(level)) {
          const levelEntry = this.levelIndex.get(level);
          levelEntry.documents.push(docName);
          
          if (docIndex.metadata.discipline) {
            levelEntry.disciplines.add(docIndex.metadata.discipline);
          }
          
          for (const keyword of docIndex.metadata.keywords || []) {
            levelEntry.keywords.add(keyword);
          }
          
          // Track cross-level connections
          for (const ref of docIndex.relationships.crossReferences) {
            const targetDoc = this.documentIndex.get(ref.document);
            if (targetDoc && targetDoc.metadata.level !== level) {
              levelEntry.crossLevelConnections.push({
                target: ref.document,
                targetLevel: targetDoc.metadata.level,
                type: ref.type
              });
            }
          }
        } else if (level) {
          levelResults.warnings.push(`Unknown level: ${level} in ${docName}`);
        }
      }

      // Convert to serializable format
      for (const [level, data] of this.levelIndex) {
        levelResults.levelMap[level] = {
          documents: data.documents,
          documentCount: data.documents.length,
          disciplines: Array.from(data.disciplines),
          keywords: Array.from(data.keywords),
          crossLevelConnections: data.crossLevelConnections
        };
        
        levelResults.distribution[level] = data.documents.length;
      }

      // Calculate level distribution score
      const levelsWithDocs = Object.values(levelResults.distribution)
        .filter(count => count > 0).length;
      levelResults.score = levelsWithDocs / validLevels.length;

      console.log(`   Level index: ${levelsWithDocs}/${validLevels.length} levels covered`);
      
    } catch (error) {
      levelResults.valid = false;
      levelResults.errors.push(`Level indexing failed: ${error.message}`);
    }

    return levelResults;
  }

  /**
   * Builds cross-reference index for relationship mapping
   */
  async buildCrossReferenceIndex() {
    const refResults = {
      valid: true,
      errors: [],
      warnings: [],
      totalReferences: 0,
      referenceMap: {},
      referenceTypes: {},
      score: 0
    };

    try {
      for (const [docName, docIndex] of this.documentIndex) {
        for (const ref of docIndex.relationships.crossReferences) {
          const refKey = `${docName}->${ref.document}`;
          
          if (!this.crossReferenceIndex.has(refKey)) {
            this.crossReferenceIndex.set(refKey, {
              source: docName,
              target: ref.document,
              type: ref.type,
              category: ref.category,
              validated: false,
              bidirectional: false
            });
          }
          
          refResults.totalReferences++;
          
          // Track reference types
          if (!refResults.referenceTypes[ref.type]) {
            refResults.referenceTypes[ref.type] = 0;
          }
          refResults.referenceTypes[ref.type]++;
        }
      }

      // Validate cross-references and check for bidirectional relationships
      for (const [refKey, refData] of this.crossReferenceIndex) {
        const targetDoc = this.documentIndex.get(refData.target);
        refData.validated = targetDoc !== undefined;
        
        if (!refData.validated) {
          refResults.errors.push(`Broken cross-reference: ${refData.source} -> ${refData.target}`);
          refResults.valid = false;
        }
        
        // Check for bidirectional reference
        const reverseKey = `${refData.target}->${refData.source}`;
        if (this.crossReferenceIndex.has(reverseKey)) {
          refData.bidirectional = true;
        }
        
        refResults.referenceMap[refKey] = refData;
      }

      refResults.score = refResults.totalReferences > 0 ? 1.0 : 0.0;

      console.log(`   Cross-reference index: ${refResults.totalReferences} references indexed`);
      
    } catch (error) {
      refResults.valid = false;
      refResults.errors.push(`Cross-reference indexing failed: ${error.message}`);
    }

    return refResults;
  }

  /**
   * Validates metadata completeness across all documents
   * Requirements: 2.5 - Comprehensive tagging and categorization
   */
  async validateMetadataCompleteness() {
    const metadataResults = {
      taggingCompleteness: {
        valid: true,
        errors: [],
        warnings: [],
        completenessScore: 0,
        documentsWithCompleteMetadata: 0
      },
      categorizationAccuracy: {
        valid: true,
        errors: [],
        warnings: [],
        accuracyScore: 0,
        correctlyCategorizeddocuments: 0
      }
    };

    try {
      const requiredFields = this.validationConfig.structure.requiredMetadata;
      let completeDocuments = 0;
      let correctlyCategorizeddocuments = 0;

      for (const [docName, docIndex] of this.documentIndex) {
        const metadata = docIndex.metadata;
        
        // Check metadata completeness
        let missingFields = 0;
        for (const field of requiredFields) {
          if (!metadata[field.toLowerCase()] || metadata[field.toLowerCase()].trim() === '') {
            metadataResults.taggingCompleteness.errors.push(
              `${docName}: Missing required metadata field: ${field}`
            );
            missingFields++;
          }
        }
        
        if (missingFields === 0) {
          completeDocuments++;
        }

        // Check categorization accuracy
        const level = metadata.level;
        const discipline = metadata.discipline;
        const category = docIndex.category;
        
        let categorizationCorrect = true;
        
        if (level && !this.validationConfig.structure.validLevels.includes(level)) {
          metadataResults.categorizationAccuracy.errors.push(
            `${docName}: Invalid level: ${level}`
          );
          categorizationCorrect = false;
        }
        
        if (discipline && !this.validationConfig.structure.validDisciplines.includes(discipline)) {
          metadataResults.categorizationAccuracy.warnings.push(
            `${docName}: Non-standard discipline: ${discipline}`
          );
        }
        
        // Check if document is in appropriate category directory
        const expectedCategories = this.getExpectedCategoriesForLevel(level);
        if (expectedCategories.length > 0 && !expectedCategories.includes(category)) {
          metadataResults.categorizationAccuracy.warnings.push(
            `${docName}: Document may be in wrong category. Level: ${level}, Category: ${category}`
          );
        }
        
        if (categorizationCorrect) {
          correctlyCategorizeddocuments++;
        }
      }

      const totalDocuments = this.documentIndex.size;
      
      metadataResults.taggingCompleteness.documentsWithCompleteMetadata = completeDocuments;
      metadataResults.taggingCompleteness.completenessScore = totalDocuments > 0 ? 
        completeDocuments / totalDocuments : 0;
      
      metadataResults.categorizationAccuracy.correctlyCategorizeddocuments = correctlyCategorizeddocuments;
      metadataResults.categorizationAccuracy.accuracyScore = totalDocuments > 0 ? 
        correctlyCategorizeddocuments / totalDocuments : 0;

      if (metadataResults.taggingCompleteness.errors.length > 0) {
        metadataResults.taggingCompleteness.valid = false;
      }
      
      if (metadataResults.categorizationAccuracy.errors.length > 0) {
        metadataResults.categorizationAccuracy.valid = false;
      }

      console.log(`   Metadata completeness: ${completeDocuments}/${totalDocuments} documents with complete metadata`);
      
    } catch (error) {
      metadataResults.taggingCompleteness.valid = false;
      metadataResults.taggingCompleteness.errors.push(`Metadata validation failed: ${error.message}`);
    }

    return metadataResults;
  }

  /**
   * Validates hierarchical organization integrity
   * Requirements: 2.1, 2.4 - Hierarchical organization integrity
   */
  async validateHierarchicalIntegrity() {
    const hierarchyResults = {
      valid: true,
      errors: [],
      warnings: [],
      organizationScore: 0,
      categoryIntegrity: {},
      levelDistribution: {}
    };

    try {
      const expectedStructure = this.validationConfig.organization.categoryStructure;
      
      // Analyze actual vs expected structure
      for (const [category, requirements] of Object.entries(expectedStructure)) {
        const documentsInCategory = Array.from(this.documentIndex.values())
          .filter(doc => doc.category === category);
        
        hierarchyResults.categoryIntegrity[category] = {
          expectedDocuments: requirements.expectedDocuments,
          actualDocuments: documentsInCategory.length,
          completeness: Math.min(1.0, documentsInCategory.length / requirements.expectedDocuments),
          subcategoryDistribution: {}
        };
        
        if (documentsInCategory.length < requirements.expectedDocuments * 0.5) {
          hierarchyResults.warnings.push(
            `Category '${category}' significantly under-populated: ${documentsInCategory.length}/${requirements.expectedDocuments}`
          );
        }
      }

      // Check level distribution
      for (const level of this.validationConfig.structure.validLevels) {
        const documentsAtLevel = Array.from(this.documentIndex.values())
          .filter(doc => doc.metadata.level === level);
        
        hierarchyResults.levelDistribution[level] = documentsAtLevel.length;
      }

      // Calculate organization score
      const categoryScores = Object.values(hierarchyResults.categoryIntegrity)
        .map(cat => cat.completeness);
      hierarchyResults.organizationScore = categoryScores.length > 0 ? 
        categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length : 0;

      console.log(`   Hierarchical integrity: ${(hierarchyResults.organizationScore * 100).toFixed(1)}% organization score`);
      
    } catch (error) {
      hierarchyResults.valid = false;
      hierarchyResults.errors.push(`Hierarchical validation failed: ${error.message}`);
    }

    return hierarchyResults;
  }

  /**
   * Creates comprehensive search capabilities
   */
  async createSearchCapabilities() {
    const searchResults = {
      keywordSearch: this.createKeywordSearchIndex(),
      topicSearch: this.createTopicSearchIndex(),
      disciplineSearch: this.createDisciplineSearchIndex(),
      crossReferenceSearch: this.createCrossReferenceSearchIndex(),
      fullTextSearch: this.createFullTextSearchIndex()
    };

    console.log(`   Search capabilities: 5 search indices created`);
    
    return searchResults;
  }

  // Helper methods for search capabilities

  createKeywordSearchIndex() {
    const searchIndex = {};
    
    for (const [keyword, data] of this.keywordIndex) {
      searchIndex[keyword] = {
        documents: data.documents,
        frequency: data.frequency,
        relatedKeywords: Array.from(data.relatedKeywords)
      };
    }
    
    return {
      index: searchIndex,
      searchFunction: (query) => this.searchByKeyword(query),
      totalEntries: Object.keys(searchIndex).length
    };
  }

  createTopicSearchIndex() {
    const searchIndex = {};
    
    for (const [topic, data] of this.topicIndex) {
      searchIndex[topic] = {
        documents: data.documents,
        level: data.level,
        discipline: data.discipline
      };
    }
    
    return {
      index: searchIndex,
      searchFunction: (query) => this.searchByTopic(query),
      totalEntries: Object.keys(searchIndex).length
    };
  }

  createDisciplineSearchIndex() {
    const searchIndex = {};
    
    for (const [discipline, data] of this.disciplineIndex) {
      searchIndex[discipline] = {
        documents: data.documents,
        keywords: Array.from(data.keywords),
        levels: Array.from(data.levels)
      };
    }
    
    return {
      index: searchIndex,
      searchFunction: (query) => this.searchByDiscipline(query),
      totalEntries: Object.keys(searchIndex).length
    };
  }

  createCrossReferenceSearchIndex() {
    const searchIndex = {};
    
    for (const [refKey, refData] of this.crossReferenceIndex) {
      searchIndex[refKey] = refData;
    }
    
    return {
      index: searchIndex,
      searchFunction: (source, target) => this.searchCrossReferences(source, target),
      totalEntries: Object.keys(searchIndex).length
    };
  }

  createFullTextSearchIndex() {
    const searchIndex = {};
    
    for (const [docName, docIndex] of this.documentIndex) {
      // Create simplified full-text index (in practice, you'd use a proper search engine)
      const words = docIndex.content ? 
        docIndex.content.toLowerCase().split(/\s+/).filter(word => word.length > 3) : [];
      
      searchIndex[docName] = {
        wordCount: words.length,
        uniqueWords: [...new Set(words)].length,
        metadata: docIndex.metadata
      };
    }
    
    return {
      index: searchIndex,
      searchFunction: (query) => this.searchFullText(query),
      totalEntries: Object.keys(searchIndex).length
    };
  }

  // Search functions (simplified implementations)

  searchByKeyword(query) {
    const results = [];
    const normalizedQuery = query.toLowerCase().trim();
    
    for (const [keyword, data] of this.keywordIndex) {
      if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) {
        results.push({
          keyword,
          documents: data.documents,
          relevance: keyword === normalizedQuery ? 1.0 : 0.5
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  searchByTopic(query) {
    const results = [];
    const normalizedQuery = query.toLowerCase().trim();
    
    for (const [topic, data] of this.topicIndex) {
      if (topic.includes(normalizedQuery)) {
        results.push({
          topic,
          documents: data.documents,
          level: data.level,
          discipline: data.discipline
        });
      }
    }
    
    return results;
  }

  searchByDiscipline(discipline) {
    const data = this.disciplineIndex.get(discipline);
    return data ? {
      discipline,
      documents: data.documents,
      keywords: Array.from(data.keywords),
      levels: Array.from(data.levels)
    } : null;
  }

  searchCrossReferences(source, target = null) {
    const results = [];
    
    for (const [refKey, refData] of this.crossReferenceIndex) {
      if (refData.source === source && (target === null || refData.target === target)) {
        results.push(refData);
      }
    }
    
    return results;
  }

  searchFullText(query) {
    // Simplified full-text search implementation
    const results = [];
    const normalizedQuery = query.toLowerCase();
    
    for (const [docName, docIndex] of this.documentIndex) {
      const content = docIndex.content || '';
      if (content.toLowerCase().includes(normalizedQuery)) {
        results.push({
          document: docName,
          metadata: docIndex.metadata,
          relevance: (content.toLowerCase().match(new RegExp(normalizedQuery, 'g')) || []).length
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Utility methods

  scanAllDocuments(docsDir) {
    const documents = [];
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md') && file !== 'README.md') {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            documents.push({
              path: filePath,
              name: path.basename(filePath, '.md'),
              content: content,
              category: path.basename(path.dirname(filePath))
            });
          } catch (error) {
            console.warn(`Failed to read ${filePath}: ${error.message}`);
          }
        }
      }
    };

    walkDir(docsDir);
    return documents;
  }

  extractComprehensiveMetadata(doc) {
    const metadata = {};
    
    // Extract standard metadata fields
    const fields = ['Discipline', 'Level', 'Keywords', 'Related Documents'];
    
    for (const field of fields) {
      const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'm');
      const match = doc.content.match(pattern);
      if (match) {
        const value = match[1].trim();
        metadata[field.toLowerCase().replace(' ', '')] = field === 'Keywords' ? 
          value.split(',').map(k => k.trim()) : value;
      }
    }
    
    return metadata;
  }

  validateDocumentMetadata(metadata) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    const requiredFields = ['discipline', 'level', 'keywords'];
    
    for (const field of requiredFields) {
      if (!metadata[field]) {
        validation.errors.push(`Missing required metadata: ${field}`);
        validation.valid = false;
      }
    }

    return validation;
  }

  countSections(content) {
    return (content.match(/^##\s+/gm) || []).length;
  }

  countTables(content) {
    return (content.match(/\|.*\|/g) || []).length;
  }

  countDiagrams(content) {
    return (content.match(/```mermaid/g) || []).length;
  }

  countCitations(content) {
    return (content.match(/\([^,]+,\s*\d{4}\)/g) || []).length;
  }

  extractCrossReferences(content) {
    const refs = [];
    const pattern = /\[(See|Related|Compare):\s*([^→]+)\s*→\s*([^\]]+)\]/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      refs.push({
        type: match[1].toLowerCase(),
        category: match[2].trim().toLowerCase(),
        document: match[3].trim()
      });
    }

    return refs;
  }

  extractRelatedDocuments(content) {
    const pattern = /\*\*Related Documents:\*\*\s*(.+)/m;
    const match = content.match(pattern);
    
    if (match) {
      return match[1].split(',').map(doc => doc.trim()).filter(doc => doc.length > 0);
    }
    
    return [];
  }

  extractTopicsFromDocument(docIndex) {
    const topics = [];
    
    // Extract from title
    const titleWords = docIndex.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    );
    topics.push(titleWords.join(' '));
    
    // Extract from keywords
    if (docIndex.metadata.keywords) {
      topics.push(...docIndex.metadata.keywords);
    }
    
    return topics;
  }

  normalizeTopic(topic) {
    return topic.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
  }

  buildTopicHierarchy() {
    // Simplified topic hierarchy building
    for (const [topic, data] of this.topicIndex) {
      const words = topic.split('-');
      
      if (words.length > 1) {
        const parentTopic = words.slice(0, -1).join('-');
        if (this.topicIndex.has(parentTopic)) {
          data.parentTopics.add(parentTopic);
          this.topicIndex.get(parentTopic).subtopics.add(topic);
        }
      }
    }
  }

  getTopicHierarchy() {
    const hierarchy = {};
    
    for (const [topic, data] of this.topicIndex) {
      if (data.parentTopics.size === 0) {
        hierarchy[topic] = this.buildTopicTree(topic);
      }
    }
    
    return hierarchy;
  }

  buildTopicTree(topic) {
    const data = this.topicIndex.get(topic);
    if (!data) return null;
    
    const tree = {
      topic,
      documents: data.documents,
      subtopics: {}
    };
    
    for (const subtopic of data.subtopics) {
      tree.subtopics[subtopic] = this.buildTopicTree(subtopic);
    }
    
    return tree;
  }

  getExpectedCategoriesForLevel(level) {
    const levelCategoryMap = {
      'Individual': ['individual'],
      'Group': ['group'],
      'Societal': ['societal'],
      'Cross-Level': ['individual', 'group', 'societal', 'integrative'],
      'Integrative': ['integrative']
    };
    
    return levelCategoryMap[level] || [];
  }

  calculateIndexingScore(results) {
    const weights = {
      documentIndex: 0.3,
      keywordIndex: 0.2,
      disciplineIndex: 0.2,
      levelIndex: 0.1,
      topicIndex: 0.1,
      crossReferenceIndex: 0.1
    };

    const scores = {
      documentIndex: results.indices.documents?.score || 0,
      keywordIndex: results.indices.keywords?.score || 0,
      disciplineIndex: results.indices.disciplines?.score || 0,
      levelIndex: results.indices.levels?.score || 0,
      topicIndex: results.indices.topics?.score || 0,
      crossReferenceIndex: results.indices.crossReferences?.score || 0
    };

    return Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (scores[key] * weight);
    }, 0);
  }

  aggregateIndexingResults(results) {
    const allIndices = Object.values(results.indices);
    const allMetadata = Object.values(results.metadata);
    
    results.errors = [...allIndices, ...allMetadata].reduce((acc, component) => {
      return acc.concat(component?.errors || []);
    }, []);
    
    results.warnings = [...allIndices, ...allMetadata].reduce((acc, component) => {
      return acc.concat(component?.warnings || []);
    }, []);

    results.valid = [...allIndices, ...allMetadata].every(component => component?.valid !== false) && 
                   results.score >= this.validationConfig.scoring.passingScore;
  }

  /**
   * Generates comprehensive indexing report
   */
  generateIndexingReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('METADATA AND INDEXING SYSTEM REPORT');
    console.log('='.repeat(60));

    console.log('\n📊 INDEXING SUMMARY');
    console.log(`Status: ${results.valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall Score: ${(results.score * 100).toFixed(1)}%`);

    console.log('\n📈 INDEX STATISTICS');
    console.log(`Documents Indexed: ${results.indices.documents?.indexedDocuments || 0}`);
    console.log(`Keywords Indexed: ${results.indices.keywords?.totalKeywords || 0}`);
    console.log(`Topics Identified: ${results.indices.topics?.totalTopics || 0}`);
    console.log(`Cross-References: ${results.indices.crossReferences?.totalReferences || 0}`);

    console.log('\n🔍 SEARCH CAPABILITIES');
    console.log(`Keyword Search: ${results.searchCapabilities.keywordSearch?.totalEntries || 0} entries`);
    console.log(`Topic Search: ${results.searchCapabilities.topicSearch?.totalEntries || 0} entries`);
    console.log(`Discipline Search: ${results.searchCapabilities.disciplineSearch?.totalEntries || 0} entries`);
    console.log(`Cross-Reference Search: ${results.searchCapabilities.crossReferenceSearch?.totalEntries || 0} entries`);

    if (results.errors.length > 0 || results.warnings.length > 0) {
      console.log('\n🚨 INDEXING ISSUES');
      console.log(`Errors: ${results.errors.length}`);
      console.log(`Warnings: ${results.warnings.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        results.errors.slice(0, 10).forEach(error => {
          console.log(`   • ${error}`);
        });
      }

      if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        results.warnings.slice(0, 10).forEach(warning => {
          console.log(`   • ${warning}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    
    return results;
  }

  /**
   * Exports indices to JSON files for external use
   */
  async exportIndices(outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const exports = {
      documentIndex: Object.fromEntries(this.documentIndex),
      keywordIndex: Object.fromEntries(this.keywordIndex),
      disciplineIndex: Object.fromEntries(this.disciplineIndex),
      levelIndex: Object.fromEntries(this.levelIndex),
      topicIndex: Object.fromEntries(this.topicIndex),
      crossReferenceIndex: Object.fromEntries(this.crossReferenceIndex)
    };

    for (const [name, index] of Object.entries(exports)) {
      const filePath = path.join(outputDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(index, null, 2));
      console.log(`Exported ${name} to ${filePath}`);
    }

    return exports;
  }
}

// Export for testing and use
export { MetadataIndexingSystem };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const indexingSystem = new MetadataIndexingSystem();
  const docsDir = process.argv[2] || path.join(process.cwd(), 'docs');
  const outputDir = process.argv[3] || path.join(process.cwd(), 'indices');
  
  indexingSystem.createComprehensiveIndex(docsDir)
    .then(results => {
      indexingSystem.generateIndexingReport(results);
      
      if (process.argv.includes('--export')) {
        return indexingSystem.exportIndices(outputDir);
      }
      
      return results;
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Indexing system failed:', error);
      process.exit(1);
    });
}