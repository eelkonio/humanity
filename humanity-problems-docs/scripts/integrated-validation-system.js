import fs from 'fs';
import path from 'path';
import { ComprehensiveContentValidator } from './comprehensive-content-validator.js';
import { StructuralValidationSystem } from './structural-validation-system.js';
import { MetadataIndexingSystem } from './metadata-indexing-system.js';
import { ValidationConfig } from '../config/validation-config.js';

/**
 * Integrated validation and quality assurance system
 * Combines content validation, structural validation, and metadata indexing
 * Provides comprehensive quality assessment for the documentation system
 */
class IntegratedValidationSystem {
  constructor() {
    this.contentValidator = new ComprehensiveContentValidator();
    this.structuralValidator = new StructuralValidationSystem();
    this.indexingSystem = new MetadataIndexingSystem();
    
    this.validationConfig = ValidationConfig;
    this.overallResults = null;
  }

  /**
   * Runs complete validation and quality assurance process
   * @param {string} docsDir - Path to documentation directory
   * @param {Object} options - Validation options
   * @returns {Object} Comprehensive validation results
   */
  async runCompleteValidation(docsDir, options = {}) {
    console.log('🚀 Starting Integrated Validation and Quality Assurance System');
    console.log('='.repeat(70));
    
    const startTime = Date.now();
    
    const results = {
      valid: true,
      timestamp: new Date().toISOString(),
      executionTime: 0,
      overallScore: 0,
      components: {
        contentValidation: null,
        structuralValidation: null,
        metadataIndexing: null
      },
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        passedComponents: 0,
        totalComponents: 3
      },
      recommendations: [],
      qualityMetrics: {},
      errors: [],
      warnings: []
    };

    try {
      // 1. Content Validation
      console.log('\n📚 Phase 1: Content Validation');
      console.log('-'.repeat(40));
      results.components.contentValidation = await this.contentValidator.validateDocumentationSystem(docsDir);
      
      // 2. Structural Validation
      console.log('\n🏗️  Phase 2: Structural Validation');
      console.log('-'.repeat(40));
      results.components.structuralValidation = await this.structuralValidator.validateStructuralIntegrity(docsDir);
      
      // 3. Metadata and Indexing
      console.log('\n🔍 Phase 3: Metadata and Indexing');
      console.log('-'.repeat(40));
      results.components.metadataIndexing = await this.indexingSystem.createComprehensiveIndex(docsDir);
      
      // 4. Calculate overall results
      console.log('\n📊 Phase 4: Results Analysis');
      console.log('-'.repeat(40));
      this.calculateOverallResults(results);
      
      // 5. Generate recommendations
      this.generateRecommendations(results);
      
      // 6. Calculate quality metrics
      this.calculateQualityMetrics(results);
      
      // 7. Export results if requested
      if (options.exportResults) {
        await this.exportResults(results, options.outputDir || './validation-results');
      }
      
      results.executionTime = Date.now() - startTime;
      this.overallResults = results;
      
      console.log('\n✅ Integrated validation completed');
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Integrated validation system error: ${error.message}`);
      results.executionTime = Date.now() - startTime;
    }

    return results;
  }

  /**
   * Calculates overall validation results and scores
   */
  calculateOverallResults(results) {
    const components = results.components;
    
    // Aggregate errors and warnings
    const allComponents = Object.values(components);
    
    results.errors = allComponents.reduce((acc, component) => {
      return acc.concat(component?.errors || []);
    }, []);
    
    results.warnings = allComponents.reduce((acc, component) => {
      return acc.concat(component?.warnings || []);
    }, []);
    
    results.summary.totalErrors = results.errors.length;
    results.summary.totalWarnings = results.warnings.length;
    
    // Calculate component pass/fail
    results.summary.passedComponents = allComponents.filter(component => 
      component?.valid !== false
    ).length;
    
    // Calculate weighted overall score
    const weights = this.validationConfig.scoring.weights;
    const componentScores = {
      content: this.getComponentScore(components.contentValidation),
      structural: this.getComponentScore(components.structuralValidation),
      indexing: this.getComponentScore(components.metadataIndexing)
    };
    
    results.overallScore = 
      (componentScores.content * (weights.structure + weights.crossReferences + weights.citations)) +
      (componentScores.structural * (weights.markdownFeatures)) +
      (componentScores.indexing * 0.2); // Indexing gets remaining weight
    
    // Overall validity
    results.valid = allComponents.every(component => component?.valid !== false) && 
                   results.overallScore >= this.validationConfig.scoring.passingScore;

    console.log(`   Overall Score: ${(results.overallScore * 100).toFixed(1)}%`);
    console.log(`   Components Passed: ${results.summary.passedComponents}/${results.summary.totalComponents}`);
    console.log(`   Total Issues: ${results.summary.totalErrors} errors, ${results.summary.totalWarnings} warnings`);
  }

  /**
   * Extracts score from component results
   */
  getComponentScore(component) {
    if (!component) return 0;
    
    // Try different score field names based on component type
    return component.scores?.overall || 
           component.overallScore || 
           component.score || 
           0;
  }

  /**
   * Generates actionable recommendations based on validation results
   */
  generateRecommendations(results) {
    const recommendations = [];
    const components = results.components;
    
    // Content validation recommendations
    if (components.contentValidation) {
      const content = components.contentValidation;
      
      if (content.details?.disciplinaryCoverage?.missingDisciplines?.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'content',
          issue: 'Missing disciplinary coverage',
          recommendation: `Add documents covering: ${content.details.disciplinaryCoverage.missingDisciplines.join(', ')}`,
          impact: 'Improves comprehensive academic coverage'
        });
      }
      
      if (content.details?.citationStandards?.overallStats?.averageCitationDensity < 5) {
        recommendations.push({
          priority: 'medium',
          category: 'content',
          issue: 'Low citation density',
          recommendation: 'Increase academic citations to at least 5 per 1000 words',
          impact: 'Enhances academic rigor and credibility'
        });
      }
    }
    
    // Structural validation recommendations
    if (components.structuralValidation) {
      const structural = components.structuralValidation;
      
      if (structural.details?.markdownFeatures?.overallStats?.documentsWithRequiredFeatures < 
          structural.details?.markdownFeatures?.overallStats?.totalDocuments * 0.8) {
        recommendations.push({
          priority: 'medium',
          category: 'structural',
          issue: 'Insufficient markdown feature usage',
          recommendation: 'Add tables, diagrams, and advanced formatting to more documents',
          impact: 'Improves document presentation and workshop value'
        });
      }
      
      if (structural.details?.navigationPathways?.pathwayStats?.documentsWithNavigation < 
          structural.details?.navigationPathways?.pathwayStats?.totalDocuments * 0.9) {
        recommendations.push({
          priority: 'low',
          category: 'structural',
          issue: 'Missing navigation elements',
          recommendation: 'Add navigation sections to all documents',
          impact: 'Improves user experience and document connectivity'
        });
      }
    }
    
    // Indexing recommendations
    if (components.metadataIndexing) {
      const indexing = components.metadataIndexing;
      
      if (indexing.metadata?.taggingCompleteness?.completenessScore < 0.9) {
        recommendations.push({
          priority: 'high',
          category: 'metadata',
          issue: 'Incomplete metadata',
          recommendation: 'Ensure all documents have complete metadata fields',
          impact: 'Enables better searchability and organization'
        });
      }
      
      if (indexing.indices?.crossReferences?.totalReferences < 
          indexing.indices?.documents?.totalDocuments * 2) {
        recommendations.push({
          priority: 'medium',
          category: 'metadata',
          issue: 'Insufficient cross-references',
          recommendation: 'Add more cross-references between related documents',
          impact: 'Improves document interconnectedness and navigation'
        });
      }
    }
    
    // Overall system recommendations
    if (results.overallScore < 0.9) {
      recommendations.push({
        priority: 'high',
        category: 'system',
        issue: 'Overall quality below excellence threshold',
        recommendation: 'Focus on highest priority issues first, then address medium priority items',
        impact: 'Achieves excellence in documentation quality'
      });
    }
    
    results.recommendations = recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log(`   Generated ${recommendations.length} recommendations`);
  }

  /**
   * Calculates comprehensive quality metrics
   */
  calculateQualityMetrics(results) {
    const components = results.components;
    
    results.qualityMetrics = {
      // Content Quality Metrics
      disciplinaryCoverage: this.calculateDisciplinaryCoverage(components.contentValidation),
      academicRigor: this.calculateAcademicRigor(components.contentValidation),
      citationQuality: this.calculateCitationQuality(components.contentValidation),
      
      // Structural Quality Metrics
      templateCompliance: this.calculateTemplateCompliance(components.structuralValidation),
      markdownSophistication: this.calculateMarkdownSophistication(components.structuralValidation),
      navigationIntegrity: this.calculateNavigationIntegrity(components.structuralValidation),
      
      // Indexing Quality Metrics
      metadataCompleteness: this.calculateMetadataCompleteness(components.metadataIndexing),
      searchability: this.calculateSearchability(components.metadataIndexing),
      organizationalIntegrity: this.calculateOrganizationalIntegrity(components.metadataIndexing),
      
      // Overall Quality Metrics
      systemMaturity: this.calculateSystemMaturity(results),
      workshopReadiness: this.calculateWorkshopReadiness(results),
      academicStandard: this.calculateAcademicStandard(results)
    };

    console.log(`   Quality metrics calculated: ${Object.keys(results.qualityMetrics).length} metrics`);
  }

  // Quality metric calculation methods

  calculateDisciplinaryCoverage(contentValidation) {
    if (!contentValidation?.details?.disciplinaryCoverage) return 0;
    return contentValidation.details.disciplinaryCoverage.score || 0;
  }

  calculateAcademicRigor(contentValidation) {
    if (!contentValidation?.details?.citationStandards) return 0;
    const citations = contentValidation.details.citationStandards;
    return Math.min(1.0, citations.overallStats?.averageCitationDensity / 10 || 0);
  }

  calculateCitationQuality(contentValidation) {
    if (!contentValidation?.details?.citationStandards) return 0;
    return contentValidation.details.citationStandards.score || 0;
  }

  calculateTemplateCompliance(structuralValidation) {
    if (!structuralValidation?.details?.templateCompliance) return 0;
    return structuralValidation.details.templateCompliance.score || 0;
  }

  calculateMarkdownSophistication(structuralValidation) {
    if (!structuralValidation?.details?.markdownFeatures) return 0;
    return structuralValidation.details.markdownFeatures.score || 0;
  }

  calculateNavigationIntegrity(structuralValidation) {
    if (!structuralValidation?.details?.navigationPathways) return 0;
    return structuralValidation.details.navigationPathways.score || 0;
  }

  calculateMetadataCompleteness(metadataIndexing) {
    if (!metadataIndexing?.metadata?.taggingCompleteness) return 0;
    return metadataIndexing.metadata.taggingCompleteness.completenessScore || 0;
  }

  calculateSearchability(metadataIndexing) {
    if (!metadataIndexing?.indices) return 0;
    const indices = metadataIndexing.indices;
    const hasAllIndices = indices.keywords && indices.topics && indices.disciplines && indices.levels;
    return hasAllIndices ? 1.0 : 0.5;
  }

  calculateOrganizationalIntegrity(metadataIndexing) {
    if (!metadataIndexing?.metadata?.hierarchicalIntegrity) return 0;
    return metadataIndexing.metadata.hierarchicalIntegrity.organizationScore || 0;
  }

  calculateSystemMaturity(results) {
    // System maturity based on overall completeness and integration
    const componentScores = [
      this.getComponentScore(results.components.contentValidation),
      this.getComponentScore(results.components.structuralValidation),
      this.getComponentScore(results.components.metadataIndexing)
    ];
    
    const averageScore = componentScores.reduce((a, b) => a + b, 0) / componentScores.length;
    const errorPenalty = Math.min(0.2, results.summary.totalErrors * 0.01);
    
    return Math.max(0, averageScore - errorPenalty);
  }

  calculateWorkshopReadiness(results) {
    // Workshop readiness based on markdown features and presentation quality
    const structural = results.components.structuralValidation;
    if (!structural?.details?.markdownFeatures) return 0;
    
    const featureScore = structural.details.markdownFeatures.score || 0;
    const navigationScore = structural.details?.navigationPathways?.score || 0;
    
    return (featureScore * 0.7) + (navigationScore * 0.3);
  }

  calculateAcademicStandard(results) {
    // Academic standard based on content rigor and citation quality
    const content = results.components.contentValidation;
    if (!content?.details) return 0;
    
    const disciplinaryScore = content.details.disciplinaryCoverage?.score || 0;
    const citationScore = content.details.citationStandards?.score || 0;
    
    return (disciplinaryScore * 0.5) + (citationScore * 0.5);
  }

  /**
   * Exports comprehensive validation results
   */
  async exportResults(results, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export main results
    const mainResultsPath = path.join(outputDir, 'validation-results.json');
    fs.writeFileSync(mainResultsPath, JSON.stringify(results, null, 2));

    // Export component results separately
    for (const [componentName, componentResults] of Object.entries(results.components)) {
      if (componentResults) {
        const componentPath = path.join(outputDir, `${componentName}-results.json`);
        fs.writeFileSync(componentPath, JSON.stringify(componentResults, null, 2));
      }
    }

    // Export recommendations as CSV
    if (results.recommendations.length > 0) {
      const csvPath = path.join(outputDir, 'recommendations.csv');
      const csvContent = this.convertRecommendationsToCSV(results.recommendations);
      fs.writeFileSync(csvPath, csvContent);
    }

    // Export quality metrics
    const metricsPath = path.join(outputDir, 'quality-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify(results.qualityMetrics, null, 2));

    console.log(`   Results exported to: ${outputDir}`);
  }

  /**
   * Converts recommendations to CSV format
   */
  convertRecommendationsToCSV(recommendations) {
    const headers = ['Priority', 'Category', 'Issue', 'Recommendation', 'Impact'];
    const rows = recommendations.map(rec => [
      rec.priority,
      rec.category,
      `"${rec.issue}"`,
      `"${rec.recommendation}"`,
      `"${rec.impact}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Generates comprehensive validation report
   */
  generateComprehensiveReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE VALIDATION AND QUALITY ASSURANCE REPORT');
    console.log('='.repeat(80));

    // Executive Summary
    console.log('\n📋 EXECUTIVE SUMMARY');
    console.log(`Validation Status: ${results.valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall Quality Score: ${(results.overallScore * 100).toFixed(1)}%`);
    console.log(`Execution Time: ${(results.executionTime / 1000).toFixed(2)} seconds`);
    console.log(`Components Passed: ${results.summary.passedComponents}/${results.summary.totalComponents}`);

    // Component Scores
    console.log('\n📊 COMPONENT PERFORMANCE');
    const contentScore = this.getComponentScore(results.components.contentValidation);
    const structuralScore = this.getComponentScore(results.components.structuralValidation);
    const indexingScore = this.getComponentScore(results.components.metadataIndexing);
    
    console.log(`Content Validation: ${(contentScore * 100).toFixed(1)}%`);
    console.log(`Structural Validation: ${(structuralScore * 100).toFixed(1)}%`);
    console.log(`Metadata & Indexing: ${(indexingScore * 100).toFixed(1)}%`);

    // Quality Metrics
    console.log('\n🎯 QUALITY METRICS');
    const metrics = results.qualityMetrics;
    console.log(`System Maturity: ${(metrics.systemMaturity * 100).toFixed(1)}%`);
    console.log(`Workshop Readiness: ${(metrics.workshopReadiness * 100).toFixed(1)}%`);
    console.log(`Academic Standard: ${(metrics.academicStandard * 100).toFixed(1)}%`);
    console.log(`Disciplinary Coverage: ${(metrics.disciplinaryCoverage * 100).toFixed(1)}%`);
    console.log(`Metadata Completeness: ${(metrics.metadataCompleteness * 100).toFixed(1)}%`);

    // Issues Summary
    if (results.summary.totalErrors > 0 || results.summary.totalWarnings > 0) {
      console.log('\n🚨 ISSUES SUMMARY');
      console.log(`Critical Errors: ${results.summary.totalErrors}`);
      console.log(`Warnings: ${results.summary.totalWarnings}`);

      if (results.errors.length > 0) {
        console.log('\n❌ TOP CRITICAL ERRORS:');
        results.errors.slice(0, 5).forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
        if (results.errors.length > 5) {
          console.log(`   ... and ${results.errors.length - 5} more errors`);
        }
      }
    }

    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 TOP RECOMMENDATIONS');
      results.recommendations.slice(0, 5).forEach((rec, index) => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${index + 1}. ${priorityIcon} [${rec.category.toUpperCase()}] ${rec.issue}`);
        console.log(`      → ${rec.recommendation}`);
      });
      if (results.recommendations.length > 5) {
        console.log(`   ... and ${results.recommendations.length - 5} more recommendations`);
      }
    }

    // Next Steps
    console.log('\n🎯 NEXT STEPS');
    if (results.valid) {
      console.log('✅ Documentation system meets quality standards');
      console.log('✅ Ready for workshop demonstration');
      console.log('💡 Consider addressing recommendations for excellence');
    } else {
      console.log('❌ Address critical errors before proceeding');
      console.log('🔧 Focus on high-priority recommendations');
      console.log('🔄 Re-run validation after fixes');
    }

    console.log('\n' + '='.repeat(80));
    
    return results;
  }

  /**
   * Quick validation check (faster, less comprehensive)
   */
  async runQuickValidation(docsDir) {
    console.log('⚡ Running Quick Validation Check...\n');
    
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      quickChecks: {
        documentCount: 0,
        metadataComplete: 0,
        crossReferencesValid: 0,
        markdownFeaturesUsed: 0
      }
    };

    try {
      // Quick document scan
      const documents = this.scanDocuments(docsDir);
      results.quickChecks.documentCount = documents.length;

      // Quick metadata check
      let completeMetadata = 0;
      let validCrossRefs = 0;
      let markdownFeatures = 0;

      for (const doc of documents) {
        // Check metadata
        if (this.hasCompleteMetadata(doc.content)) {
          completeMetadata++;
        }

        // Check cross-references
        if (this.hasValidCrossReferences(doc.content)) {
          validCrossRefs++;
        }

        // Check markdown features
        if (this.hasAdvancedMarkdown(doc.content)) {
          markdownFeatures++;
        }
      }

      results.quickChecks.metadataComplete = completeMetadata;
      results.quickChecks.crossReferencesValid = validCrossRefs;
      results.quickChecks.markdownFeaturesUsed = markdownFeatures;

      // Quick validation
      if (documents.length < 20) {
        results.warnings.push('Document count below expected minimum (20)');
      }

      if (completeMetadata / documents.length < 0.8) {
        results.errors.push('More than 20% of documents missing complete metadata');
        results.valid = false;
      }

      console.log(`📄 Documents: ${documents.length}`);
      console.log(`📝 Complete Metadata: ${completeMetadata}/${documents.length}`);
      console.log(`🔗 Valid Cross-References: ${validCrossRefs}/${documents.length}`);
      console.log(`✨ Advanced Markdown: ${markdownFeatures}/${documents.length}`);
      console.log(`\n${results.valid ? '✅ Quick validation passed' : '❌ Quick validation failed'}`);

    } catch (error) {
      results.valid = false;
      results.errors.push(`Quick validation error: ${error.message}`);
    }

    return results;
  }

  // Helper methods for quick validation

  scanDocuments(docsDir) {
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
              content: content
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };

    walkDir(docsDir);
    return documents;
  }

  hasCompleteMetadata(content) {
    const requiredFields = ['Discipline', 'Level', 'Keywords'];
    return requiredFields.every(field => {
      const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'm');
      return pattern.test(content);
    });
  }

  hasValidCrossReferences(content) {
    const crossRefPattern = /\[(?:See|Related|Compare):\s*[^→]+\s*→\s*[^\]]+\]/;
    return crossRefPattern.test(content);
  }

  hasAdvancedMarkdown(content) {
    const features = [
      /\|.*\|/, // Tables
      /```mermaid/, // Diagrams
      /\*\*[^*]+\*\*/, // Bold
      /^\s*[-*+]\s+/m // Lists
    ];
    
    return features.filter(pattern => pattern.test(content)).length >= 2;
  }
}

// Export for testing and use
export { IntegratedValidationSystem };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validationSystem = new IntegratedValidationSystem();
  const docsDir = process.argv[2] || path.join(process.cwd(), 'docs');
  
  const options = {
    exportResults: process.argv.includes('--export'),
    outputDir: process.argv.includes('--output') ? 
      process.argv[process.argv.indexOf('--output') + 1] : './validation-results',
    quick: process.argv.includes('--quick')
  };

  const validationPromise = options.quick ? 
    validationSystem.runQuickValidation(docsDir) :
    validationSystem.runCompleteValidation(docsDir, options);

  validationPromise
    .then(results => {
      if (!options.quick) {
        validationSystem.generateComprehensiveReport(results);
      }
      process.exit(results.valid ? 0 : 1);
    })
    .catch(error => {
      console.error('Integrated validation failed:', error);
      process.exit(1);
    });
}