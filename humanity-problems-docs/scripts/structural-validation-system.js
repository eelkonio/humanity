import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import { ValidationConfig } from '../config/validation-config.js';

/**
 * Structural validation system for humanity problems documentation
 * Validates template compliance, navigation pathways, and markdown feature usage
 */
class StructuralValidationSystem {
  constructor() {
    this.md = new MarkdownIt();
    this.templateRequirements = ValidationConfig.structure;
    this.markdownRequirements = ValidationConfig.markdownFeatures;
    this.organizationRequirements = ValidationConfig.organization;
  }

  /**
   * Validates complete structural integrity of documentation system
   * @param {string} docsDir - Path to documentation directory
   * @returns {Object} Comprehensive structural validation results
   */
  async validateStructuralIntegrity(docsDir) {
    console.log('Starting structural validation...\n');
    
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      details: {
        templateCompliance: null,
        navigationPathways: null,
        markdownFeatures: null,
        hierarchicalOrganization: null
      },
      scores: {},
      overallScore: 0
    };

    try {
      // 1. Validate template compliance
      console.log('1. Validating template compliance...');
      results.details.templateCompliance = await this.validateTemplateCompliance(docsDir);
      
      // 2. Validate navigation pathways
      console.log('2. Validating navigation pathways...');
      results.details.navigationPathways = await this.validateNavigationPathways(docsDir);
      
      // 3. Validate markdown feature usage
      console.log('3. Validating markdown feature usage...');
      results.details.markdownFeatures = await this.validateMarkdownFeatures(docsDir);
      
      // 4. Validate hierarchical organization
      console.log('4. Validating hierarchical organization...');
      results.details.hierarchicalOrganization = await this.validateHierarchicalOrganization(docsDir);
      
      // 5. Calculate scores and aggregate results
      this.calculateStructuralScores(results);
      this.aggregateStructuralResults(results);
      
      console.log('\nStructural validation completed.');
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Structural validation system error: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates template compliance across all documents
   * Requirements: 2.1, 2.4 - Consistent formatting and structure
   */
  async validateTemplateCompliance(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      documentResults: [],
      complianceStats: {
        totalDocuments: 0,
        compliantDocuments: 0,
        averageComplianceScore: 0
      },
      score: 0
    };

    try {
      const documents = this.scanAllDocuments(docsDir);
      let totalComplianceScore = 0;

      for (const doc of documents) {
        const docResult = this.validateDocumentTemplate(doc);
        results.documentResults.push(docResult);
        
        if (!docResult.valid) {
          results.valid = false;
        }
        
        results.errors.push(...docResult.errors.map(e => `${doc.name}: ${e}`));
        results.warnings.push(...docResult.warnings.map(w => `${doc.name}: ${w}`));
        
        totalComplianceScore += docResult.complianceScore;
        if (docResult.complianceScore >= 0.8) {
          results.complianceStats.compliantDocuments++;
        }
      }

      results.complianceStats.totalDocuments = documents.length;
      results.complianceStats.averageComplianceScore = documents.length > 0 ? 
        totalComplianceScore / documents.length : 0;
      
      results.score = results.complianceStats.averageComplianceScore;

      console.log(`   Template compliance: ${results.complianceStats.compliantDocuments}/${documents.length} documents compliant`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Template compliance validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates individual document template compliance
   */
  validateDocumentTemplate(doc) {
    const result = {
      file: doc.path,
      valid: true,
      errors: [],
      warnings: [],
      complianceScore: 0,
      checkedElements: {
        metadata: false,
        sections: false,
        structure: false,
        formatting: false
      }
    };

    try {
      const tokens = this.md.parse(doc.content, {});
      
      // Check metadata compliance
      const metadataScore = this.checkMetadataCompliance(doc.content, result);
      
      // Check section compliance
      const sectionScore = this.checkSectionCompliance(tokens, result);
      
      // Check structural compliance
      const structureScore = this.checkStructuralCompliance(tokens, result);
      
      // Check formatting compliance
      const formattingScore = this.checkFormattingCompliance(doc.content, result);
      
      // Calculate overall compliance score
      result.complianceScore = (metadataScore + sectionScore + structureScore + formattingScore) / 4;
      result.valid = result.complianceScore >= 0.6 && result.errors.length === 0;
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Template validation failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Checks metadata compliance for a document
   */
  checkMetadataCompliance(content, result) {
    let score = 0;
    const requiredFields = this.templateRequirements.requiredMetadata;
    let foundFields = 0;

    for (const field of requiredFields) {
      const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'm');
      const match = content.match(pattern);
      
      if (match && match[1].trim()) {
        foundFields++;
        
        // Validate specific field formats
        if (field === 'Level' && !this.templateRequirements.validLevels.includes(match[1].trim())) {
          result.warnings.push(`Invalid level value: ${match[1].trim()}`);
        }
        
        if (field === 'Keywords' && !match[1].includes(',')) {
          result.warnings.push('Keywords should be comma-separated');
        }
      } else {
        result.errors.push(`Missing required metadata field: ${field}`);
      }
    }

    score = foundFields / requiredFields.length;
    result.checkedElements.metadata = true;
    
    return score;
  }

  /**
   * Checks section compliance for a document
   */
  checkSectionCompliance(tokens, result) {
    const sections = this.extractSections(tokens);
    const sectionTitles = sections.map(s => s.title);
    const requiredSections = this.templateRequirements.requiredSections;
    
    let foundSections = 0;

    for (const required of requiredSections) {
      if (sectionTitles.includes(required)) {
        foundSections++;
      } else {
        result.errors.push(`Missing required section: ${required}`);
      }
    }

    // Check section hierarchy
    this.validateSectionHierarchy(sections, result);
    
    const score = foundSections / requiredSections.length;
    result.checkedElements.sections = true;
    
    return score;
  }

  /**
   * Checks structural compliance (heading hierarchy, organization)
   */
  checkStructuralCompliance(tokens, result) {
    let score = 1.0;
    
    // Check heading hierarchy
    const headings = tokens.filter(t => t.type === 'heading_open');
    let previousLevel = 0;
    
    for (const heading of headings) {
      const currentLevel = parseInt(heading.tag.substring(1));
      
      if (currentLevel > previousLevel + 1) {
        result.warnings.push(`Heading hierarchy skip detected: h${currentLevel} after h${previousLevel}`);
        score -= 0.1;
      }
      
      previousLevel = currentLevel;
    }

    // Check for proper document structure (title, content, navigation)
    const hasTitle = tokens.some(t => t.type === 'heading_open' && t.tag === 'h1');
    const hasNavigation = tokens.some(t => 
      t.type === 'inline' && t.content.includes('Navigation')
    );
    
    if (!hasTitle) {
      result.errors.push('Document missing main title (h1)');
      score -= 0.3;
    }
    
    if (!hasNavigation) {
      result.warnings.push('Document missing navigation section');
      score -= 0.1;
    }

    result.checkedElements.structure = true;
    return Math.max(0, score);
  }

  /**
   * Checks formatting compliance (markdown usage, consistency)
   */
  checkFormattingCompliance(content, result) {
    let score = 1.0;
    
    // Check for consistent emphasis usage
    const boldPattern = /\*\*[^*]+\*\*/g;
    const italicPattern = /\*[^*]+\*/g;
    
    const boldMatches = content.match(boldPattern) || [];
    const italicMatches = content.match(italicPattern) || [];
    
    if (boldMatches.length === 0 && italicMatches.length === 0) {
      result.warnings.push('No emphasis formatting found - consider using bold/italic for key terms');
      score -= 0.1;
    }

    // Check for proper list formatting
    const listPattern = /^\s*[-*+]\s+/gm;
    const numberedListPattern = /^\s*\d+\.\s+/gm;
    
    const hasLists = listPattern.test(content) || numberedListPattern.test(content);
    if (!hasLists) {
      result.warnings.push('No lists found - consider using lists for better organization');
      score -= 0.1;
    }

    // Check for proper link formatting
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const malformedLinkPattern = /\[[^\]]*\]\([^)]*\)/g;
    
    const validLinks = content.match(linkPattern) || [];
    const allLinks = content.match(malformedLinkPattern) || [];
    
    if (allLinks.length > validLinks.length) {
      result.warnings.push('Malformed links detected - check link syntax');
      score -= 0.1;
    }

    result.checkedElements.formatting = true;
    return Math.max(0, score);
  }

  /**
   * Validates navigation pathways between documents
   * Requirements: 2.3 - Clear navigation pathways
   */
  async validateNavigationPathways(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      pathwayStats: {
        totalDocuments: 0,
        documentsWithNavigation: 0,
        crossLevelConnections: 0,
        categoryConnections: 0
      },
      brokenPaths: [],
      score: 0
    };

    try {
      const documents = this.scanAllDocuments(docsDir);
      const documentMap = new Map();
      
      // Build document map
      for (const doc of documents) {
        documentMap.set(doc.name, doc);
      }

      let documentsWithNav = 0;
      let crossLevelConnections = 0;
      let categoryConnections = 0;

      for (const doc of documents) {
        // Check for navigation section
        if (doc.content.includes('Navigation') || doc.content.includes('←') || doc.content.includes('→')) {
          documentsWithNav++;
        } else {
          results.warnings.push(`${doc.name}: Missing navigation section`);
        }

        // Extract and validate navigation links
        const navLinks = this.extractNavigationLinks(doc.content);
        
        for (const link of navLinks) {
          if (!this.validateNavigationLink(link, documentMap)) {
            results.brokenPaths.push({
              source: doc.name,
              target: link.target,
              type: link.type
            });
            results.errors.push(`${doc.name}: Broken navigation link to ${link.target}`);
            results.valid = false;
          }
        }

        // Check for cross-level connections
        const docLevel = this.extractMetadata(doc.content, 'Level');
        const crossRefs = this.extractCrossReferences(doc.content);
        
        for (const ref of crossRefs) {
          const targetDoc = this.findDocumentByReference(ref, documentMap);
          if (targetDoc) {
            const targetLevel = this.extractMetadata(targetDoc.content, 'Level');
            if (docLevel !== targetLevel) {
              crossLevelConnections++;
            }
            categoryConnections++;
          }
        }
      }

      results.pathwayStats = {
        totalDocuments: documents.length,
        documentsWithNavigation: documentsWithNav,
        crossLevelConnections,
        categoryConnections
      };

      // Calculate navigation score
      const navCoverageScore = documentsWithNav / documents.length;
      const linkIntegrityScore = results.brokenPaths.length === 0 ? 1.0 : 
        Math.max(0, 1.0 - (results.brokenPaths.length / (documents.length * 3)));
      
      results.score = (navCoverageScore + linkIntegrityScore) / 2;

      console.log(`   Navigation pathways: ${documentsWithNav}/${documents.length} documents with navigation`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Navigation validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates markdown feature usage requirements
   * Requirements: 3.1, 3.2, 3.3 - Advanced markdown features
   */
  async validateMarkdownFeatures(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      featureUsage: {},
      documentResults: [],
      overallStats: {
        totalDocuments: 0,
        documentsWithRequiredFeatures: 0,
        averageFeatureScore: 0
      },
      score: 0
    };

    try {
      const documents = this.scanAllDocuments(docsDir);
      const requiredFeatures = this.markdownRequirements.required;
      const recommendedFeatures = this.markdownRequirements.recommended;
      
      let totalFeatureScore = 0;
      let documentsWithAllRequired = 0;

      // Initialize feature usage tracking
      for (const feature of [...requiredFeatures, ...recommendedFeatures]) {
        results.featureUsage[feature] = {
          documentsUsing: 0,
          totalUsages: 0,
          required: requiredFeatures.includes(feature)
        };
      }

      for (const doc of documents) {
        const docResult = this.analyzeDocumentFeatures(doc, requiredFeatures, recommendedFeatures);
        results.documentResults.push(docResult);
        
        totalFeatureScore += docResult.featureScore;
        
        if (docResult.hasAllRequired) {
          documentsWithAllRequired++;
        }

        // Update feature usage statistics
        for (const [feature, used] of Object.entries(docResult.featuresFound)) {
          if (used && results.featureUsage[feature]) {
            results.featureUsage[feature].documentsUsing++;
            results.featureUsage[feature].totalUsages += docResult.featureUsages[feature] || 1;
          }
        }

        // Collect errors and warnings
        results.errors.push(...docResult.errors.map(e => `${doc.name}: ${e}`));
        results.warnings.push(...docResult.warnings.map(w => `${doc.name}: ${w}`));
      }

      results.overallStats = {
        totalDocuments: documents.length,
        documentsWithRequiredFeatures: documentsWithAllRequired,
        averageFeatureScore: documents.length > 0 ? totalFeatureScore / documents.length : 0
      };

      // Check for missing required features across the system
      for (const feature of requiredFeatures) {
        if (results.featureUsage[feature].documentsUsing === 0) {
          results.errors.push(`Required feature '${feature}' not used in any document`);
          results.valid = false;
        }
      }

      results.score = results.overallStats.averageFeatureScore;

      console.log(`   Markdown features: ${documentsWithAllRequired}/${documents.length} documents with all required features`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Markdown feature validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Analyzes markdown features in a single document
   */
  analyzeDocumentFeatures(doc, requiredFeatures, recommendedFeatures) {
    const result = {
      file: doc.path,
      featuresFound: {},
      featureUsages: {},
      hasAllRequired: true,
      featureScore: 0,
      errors: [],
      warnings: []
    };

    const content = doc.content;
    const tokens = this.md.parse(content, {});

    // Check for tables
    result.featuresFound.tables = tokens.some(t => t.type === 'table_open');
    result.featureUsages.tables = (content.match(/\|.*\|/g) || []).length;

    // Check for diagrams (Mermaid)
    result.featuresFound.diagrams = content.includes('```mermaid');
    result.featureUsages.diagrams = (content.match(/```mermaid/g) || []).length;

    // Check for lists
    result.featuresFound.lists = tokens.some(t => 
      t.type === 'bullet_list_open' || t.type === 'ordered_list_open'
    );
    result.featureUsages.lists = (content.match(/^\s*[-*+\d]+[\.\)]\s+/gm) || []).length;

    // Check for emphasis
    result.featuresFound.emphasis = /\*\*[^*]+\*\*|\*[^*]+\*/.test(content);
    result.featureUsages.emphasis = (content.match(/\*\*[^*]+\*\*|\*[^*]+\*/g) || []).length;

    // Check for footnotes
    result.featuresFound.footnotes = /\[\^[^\]]+\]/.test(content);
    result.featureUsages.footnotes = (content.match(/\[\^[^\]]+\]/g) || []).length;

    // Check for blockquotes
    result.featuresFound.blockquotes = tokens.some(t => t.type === 'blockquote_open');
    result.featureUsages.blockquotes = (content.match(/^>\s+/gm) || []).length;

    // Check for definition lists (custom implementation)
    result.featuresFound['definition-lists'] = /^[^:\n]+:\s*$/gm.test(content);
    result.featureUsages['definition-lists'] = (content.match(/^[^:\n]+:\s*$/gm) || []).length;

    // Check for task lists
    result.featuresFound['task-lists'] = /^\s*- \[[x ]\]/gm.test(content);
    result.featureUsages['task-lists'] = (content.match(/^\s*- \[[x ]\]/gm) || []).length;

    // Validate required features
    for (const feature of requiredFeatures) {
      if (!result.featuresFound[feature]) {
        result.errors.push(`Missing required markdown feature: ${feature}`);
        result.hasAllRequired = false;
      }
    }

    // Check recommended features
    for (const feature of recommendedFeatures) {
      if (!result.featuresFound[feature]) {
        result.warnings.push(`Consider using recommended feature: ${feature}`);
      }
    }

    // Calculate feature score
    const requiredScore = requiredFeatures.filter(f => result.featuresFound[f]).length / requiredFeatures.length;
    const recommendedScore = recommendedFeatures.filter(f => result.featuresFound[f]).length / recommendedFeatures.length;
    
    result.featureScore = (requiredScore * 0.8) + (recommendedScore * 0.2);

    return result;
  }

  /**
   * Validates hierarchical organization integrity
   * Requirements: 2.1, 2.4 - Hierarchical organization
   */
  async validateHierarchicalOrganization(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      organizationStats: {
        totalCategories: 0,
        expectedCategories: 0,
        categoryCompleteness: {},
        hierarchyDepth: 0
      },
      score: 0
    };

    try {
      const expectedStructure = this.organizationRequirements.categoryStructure;
      const foundStructure = this.analyzeDirectoryStructure(docsDir);
      
      // Validate category structure
      for (const [category, requirements] of Object.entries(expectedStructure)) {
        const found = foundStructure[category];
        
        if (!found) {
          results.errors.push(`Missing required category: ${category}`);
          results.valid = false;
          results.organizationStats.categoryCompleteness[category] = {
            present: false,
            documentCount: 0,
            expectedCount: requirements.expectedDocuments
          };
        } else {
          const completeness = Math.min(1.0, found.documentCount / requirements.expectedDocuments);
          results.organizationStats.categoryCompleteness[category] = {
            present: true,
            documentCount: found.documentCount,
            expectedCount: requirements.expectedDocuments,
            completeness: completeness
          };
          
          if (completeness < 0.8) {
            results.warnings.push(
              `Category '${category}' has insufficient documents: ${found.documentCount}/${requirements.expectedDocuments}`
            );
          }
        }
      }

      // Calculate organization score
      const categoryPresenceScore = Object.values(results.organizationStats.categoryCompleteness)
        .filter(c => c.present).length / Object.keys(expectedStructure).length;
      
      const completenessScores = Object.values(results.organizationStats.categoryCompleteness)
        .map(c => c.completeness || 0);
      const averageCompleteness = completenessScores.length > 0 ? 
        completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length : 0;
      
      results.score = (categoryPresenceScore + averageCompleteness) / 2;

      results.organizationStats.totalCategories = Object.keys(foundStructure).length;
      results.organizationStats.expectedCategories = Object.keys(expectedStructure).length;

      console.log(`   Hierarchical organization: ${Object.keys(foundStructure).length}/${Object.keys(expectedStructure).length} categories present`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Hierarchical organization validation failed: ${error.message}`);
    }

    return results;
  }

  // Helper methods

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

  extractSections(tokens) {
    const sections = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open') {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === 'inline') {
          sections.push({
            level: parseInt(token.tag.substring(1)),
            title: nextToken.content
          });
        }
      }
    }
    
    return sections;
  }

  validateSectionHierarchy(sections, result) {
    let previousLevel = 0;
    
    for (const section of sections) {
      if (section.level > previousLevel + 1) {
        result.warnings.push(`Section hierarchy skip: ${section.title} (level ${section.level})`);
      }
      previousLevel = section.level;
    }
  }

  extractNavigationLinks(content) {
    const links = [];
    
    // Extract navigation section
    const navMatch = content.match(/\*\*Navigation:\*\*\s*\n(.*?)(?=\n\n|\n---|\n$)/s);
    if (navMatch) {
      const navContent = navMatch[1];
      
      // Extract links from navigation
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkPattern.exec(navContent)) !== null) {
        links.push({
          text: match[1],
          target: match[2],
          type: 'navigation'
        });
      }
    }
    
    return links;
  }

  validateNavigationLink(link, documentMap) {
    // For now, just check if it's a reasonable link format
    // In a real system, you'd validate against actual file structure
    return link.target && link.target.length > 0 && !link.target.startsWith('http');
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

  findDocumentByReference(ref, documentMap) {
    // Simple implementation - in practice you'd have more sophisticated matching
    for (const [name, doc] of documentMap) {
      if (name.toLowerCase().includes(ref.document.toLowerCase()) ||
          ref.document.toLowerCase().includes(name.toLowerCase())) {
        return doc;
      }
    }
    return null;
  }

  extractMetadata(content, field) {
    const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'm');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
  }

  analyzeDirectoryStructure(docsDir) {
    const structure = {};
    
    if (!fs.existsSync(docsDir)) return structure;
    
    const categories = fs.readdirSync(docsDir).filter(item => {
      const itemPath = path.join(docsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    for (const category of categories) {
      const categoryPath = path.join(docsDir, category);
      const files = fs.readdirSync(categoryPath).filter(file => 
        file.endsWith('.md') && file !== 'README.md'
      );
      
      structure[category] = {
        documentCount: files.length,
        documents: files
      };
    }
    
    return structure;
  }

  calculateStructuralScores(results) {
    const weights = {
      templateCompliance: 0.3,
      navigationPathways: 0.2,
      markdownFeatures: 0.3,
      hierarchicalOrganization: 0.2
    };

    results.scores = {
      templateCompliance: results.details.templateCompliance?.score || 0,
      navigationPathways: results.details.navigationPathways?.score || 0,
      markdownFeatures: results.details.markdownFeatures?.score || 0,
      hierarchicalOrganization: results.details.hierarchicalOrganization?.score || 0
    };

    results.overallScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (results.scores[key] * weight);
    }, 0);

    results.scores.overall = results.overallScore;
  }

  aggregateStructuralResults(results) {
    const allDetails = Object.values(results.details);
    
    results.errors = allDetails.reduce((acc, detail) => {
      return acc.concat(detail?.errors || []);
    }, []);
    
    results.warnings = allDetails.reduce((acc, detail) => {
      return acc.concat(detail?.warnings || []);
    }, []);

    results.valid = allDetails.every(detail => detail?.valid !== false) && 
                   results.overallScore >= ValidationConfig.scoring.passingScore;
  }

  /**
   * Generates structural validation report
   */
  generateStructuralReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('STRUCTURAL VALIDATION REPORT');
    console.log('='.repeat(60));

    console.log('\n📊 STRUCTURAL SUMMARY');
    console.log(`Status: ${results.valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall Score: ${(results.overallScore * 100).toFixed(1)}%`);

    console.log('\n📈 COMPONENT SCORES');
    console.log(`Template Compliance: ${(results.scores.templateCompliance * 100).toFixed(1)}%`);
    console.log(`Navigation Pathways: ${(results.scores.navigationPathways * 100).toFixed(1)}%`);
    console.log(`Markdown Features: ${(results.scores.markdownFeatures * 100).toFixed(1)}%`);
    console.log(`Hierarchical Organization: ${(results.scores.hierarchicalOrganization * 100).toFixed(1)}%`);

    if (results.errors.length > 0 || results.warnings.length > 0) {
      console.log('\n🚨 STRUCTURAL ISSUES');
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
}

// Export for testing and use
export { StructuralValidationSystem };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new StructuralValidationSystem();
  const docsDir = process.argv[2] || path.join(process.cwd(), 'docs');
  
  validator.validateStructuralIntegrity(docsDir)
    .then(results => {
      validator.generateStructuralReport(results);
      process.exit(results.valid ? 0 : 1);
    })
    .catch(error => {
      console.error('Structural validation failed:', error);
      process.exit(1);
    });
}