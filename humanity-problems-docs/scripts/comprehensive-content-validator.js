import fs from 'fs';
import path from 'path';
import { ValidationConfig, ValidationRules } from '../config/validation-config.js';
import { DocumentStructureValidator } from './validate-structure.js';
import { CrossReferenceValidator } from './validate-references.js';
import { CitationSystem } from './citation-system.js';

/**
 * Comprehensive content validation system for humanity problems documentation
 * Validates disciplinary coverage completeness, cross-reference integrity, and academic standards
 */
class ComprehensiveContentValidator {
  constructor() {
    this.structureValidator = new DocumentStructureValidator();
    this.referenceValidator = new CrossReferenceValidator();
    this.citationSystem = new CitationSystem();
    
    this.validationResults = {
      disciplinaryCoverage: null,
      crossReferenceIntegrity: null,
      citationStandards: null,
      overallScore: 0,
      valid: false
    };
  }

  /**
   * Validates complete documentation system
   * @param {string} docsDir - Path to documentation directory
   * @returns {Object} Comprehensive validation results
   */
  async validateDocumentationSystem(docsDir) {
    console.log('Starting comprehensive content validation...\n');
    
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      scores: {},
      details: {}
    };

    try {
      // 1. Validate disciplinary coverage completeness
      console.log('1. Validating disciplinary coverage...');
      results.details.disciplinaryCoverage = await this.validateDisciplinaryCoverage(docsDir);
      
      // 2. Validate cross-reference integrity
      console.log('2. Validating cross-reference integrity...');
      results.details.crossReferenceIntegrity = await this.validateCrossReferenceIntegrity(docsDir);
      
      // 3. Validate citation format and academic standards
      console.log('3. Validating citation standards...');
      results.details.citationStandards = await this.validateCitationStandards(docsDir);
      
      // 4. Calculate overall scores
      results.scores = this.calculateOverallScores(results.details);
      
      // 5. Aggregate results
      this.aggregateResults(results);
      
      console.log('\nComprehensive validation completed.');
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Validation system error: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates disciplinary coverage completeness
   * Requirements: 1.1 - Complete disciplinary coverage
   */
  async validateDisciplinaryCoverage(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      coverage: {},
      missingDisciplines: [],
      score: 0
    };

    try {
      // Scan all documents and extract disciplines
      const documents = this.scanAllDocuments(docsDir);
      const foundDisciplines = new Set();
      const disciplineDocuments = {};

      for (const doc of documents) {
        const discipline = this.extractMetadata(doc.content, 'Discipline');
        if (discipline) {
          foundDisciplines.add(discipline);
          if (!disciplineDocuments[discipline]) {
            disciplineDocuments[discipline] = [];
          }
          disciplineDocuments[discipline].push(doc.path);
        }
      }

      // Check against required disciplines
      const requiredDisciplines = ValidationConfig.structure.validDisciplines;
      
      for (const discipline of requiredDisciplines) {
        if (foundDisciplines.has(discipline)) {
          results.coverage[discipline] = {
            present: true,
            documents: disciplineDocuments[discipline] || [],
            count: (disciplineDocuments[discipline] || []).length
          };
        } else {
          results.coverage[discipline] = {
            present: false,
            documents: [],
            count: 0
          };
          results.missingDisciplines.push(discipline);
          results.errors.push(`Missing required discipline: ${discipline}`);
          results.valid = false;
        }
      }

      // Check for adequate coverage per discipline
      for (const [discipline, info] of Object.entries(results.coverage)) {
        if (info.present && info.count < 2) {
          results.warnings.push(`Insufficient coverage for ${discipline}: only ${info.count} document(s)`);
        }
      }

      // Calculate coverage score
      const coverageRatio = foundDisciplines.size / requiredDisciplines.length;
      results.score = Math.min(1.0, coverageRatio);

      console.log(`   Disciplinary coverage: ${foundDisciplines.size}/${requiredDisciplines.length} disciplines`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Disciplinary coverage validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates cross-reference integrity across all documents
   * Requirements: 2.2 - Cross-reference integrity
   */
  async validateCrossReferenceIntegrity(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {},
      score: 0
    };

    try {
      // Use existing cross-reference validator
      this.referenceValidator.scanDocuments(docsDir);
      const refResults = this.referenceValidator.validateCrossReferences();
      
      // Merge results
      results.errors = refResults.errors;
      results.warnings = refResults.warnings;
      results.stats = refResults.stats;
      results.valid = refResults.valid;

      // Calculate integrity score
      const totalRefs = results.stats.totalReferences || 1;
      const brokenRefs = results.stats.brokenReferences || 0;
      const integrityRatio = (totalRefs - brokenRefs) / totalRefs;
      results.score = Math.max(0, integrityRatio);

      console.log(`   Cross-reference integrity: ${totalRefs - brokenRefs}/${totalRefs} valid references`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Cross-reference validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Validates citation format and academic standards
   * Requirements: 3.4 - Academic citation standards
   */
  async validateCitationStandards(docsDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      documentResults: [],
      overallStats: {
        totalDocuments: 0,
        documentsWithCitations: 0,
        totalCitations: 0,
        averageCitationDensity: 0,
        formatConsistency: 0
      },
      score: 0
    };

    try {
      const documents = this.scanAllDocuments(docsDir);
      const citationFormats = new Set();
      let totalCitationDensity = 0;
      let documentsWithCitations = 0;

      for (const doc of documents) {
        const citationResult = this.citationSystem.validateCitations(doc.content);
        
        results.documentResults.push({
          file: doc.path,
          result: citationResult
        });

        // Aggregate errors and warnings
        results.errors.push(...citationResult.errors.map(e => `${doc.path}: ${e}`));
        results.warnings.push(...citationResult.warnings.map(w => `${doc.path}: ${w}`));

        // Track citation statistics
        if (citationResult.bibliography.length > 0) {
          documentsWithCitations++;
          
          // Track citation formats
          for (const bib of citationResult.bibliography) {
            if (bib.parsed.format !== 'unknown') {
              citationFormats.add(bib.parsed.format);
            }
          }

          // Calculate citation density
          const wordCount = doc.content.split(/\s+/).length;
          const citationCount = citationResult.inTextCitations.length;
          const density = (citationCount / wordCount) * 1000;
          totalCitationDensity += density;
        }

        if (!citationResult.valid) {
          results.valid = false;
        }
      }

      // Calculate overall statistics
      results.overallStats.totalDocuments = documents.length;
      results.overallStats.documentsWithCitations = documentsWithCitations;
      results.overallStats.totalCitations = results.documentResults.reduce(
        (sum, dr) => sum + dr.result.inTextCitations.length, 0
      );
      results.overallStats.averageCitationDensity = documentsWithCitations > 0 ? 
        totalCitationDensity / documentsWithCitations : 0;
      results.overallStats.formatConsistency = citationFormats.size <= 1 ? 1.0 : 
        1.0 / citationFormats.size;

      // Calculate citation standards score
      const citationCoverageScore = documentsWithCitations / documents.length;
      const densityScore = Math.min(1.0, results.overallStats.averageCitationDensity / 
        ValidationConfig.citations.minimumCitationDensity);
      const formatScore = results.overallStats.formatConsistency;
      
      results.score = (citationCoverageScore + densityScore + formatScore) / 3;

      console.log(`   Citation standards: ${documentsWithCitations}/${documents.length} documents with citations`);
      
    } catch (error) {
      results.valid = false;
      results.errors.push(`Citation validation failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Scans all markdown documents in directory
   */
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
              content: content
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

  /**
   * Extracts metadata field from document content
   */
  extractMetadata(content, field) {
    const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'm');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
  }

  /**
   * Calculates overall validation scores
   */
  calculateOverallScores(details) {
    const weights = ValidationConfig.scoring.weights;
    
    const scores = {
      disciplinaryCoverage: details.disciplinaryCoverage?.score || 0,
      crossReferenceIntegrity: details.crossReferenceIntegrity?.score || 0,
      citationStandards: details.citationStandards?.score || 0
    };

    // Calculate weighted overall score
    const overallScore = 
      (scores.disciplinaryCoverage * weights.structure) +
      (scores.crossReferenceIntegrity * weights.crossReferences) +
      (scores.citationStandards * weights.citations);

    return {
      ...scores,
      overall: overallScore,
      passing: overallScore >= ValidationConfig.scoring.passingScore
    };
  }

  /**
   * Aggregates all validation results
   */
  aggregateResults(results) {
    // Collect all errors and warnings
    const allDetails = Object.values(results.details);
    
    results.errors = allDetails.reduce((acc, detail) => {
      return acc.concat(detail.errors || []);
    }, []);
    
    results.warnings = allDetails.reduce((acc, detail) => {
      return acc.concat(detail.warnings || []);
    }, []);

    // Overall validity
    results.valid = allDetails.every(detail => detail.valid !== false) && 
                   results.scores.passing;

    // Store in instance for reporting
    this.validationResults = {
      disciplinaryCoverage: results.details.disciplinaryCoverage,
      crossReferenceIntegrity: results.details.crossReferenceIntegrity,
      citationStandards: results.details.citationStandards,
      overallScore: results.scores.overall,
      valid: results.valid
    };
  }

  /**
   * Generates comprehensive validation report
   */
  generateComprehensiveReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('COMPREHENSIVE CONTENT VALIDATION REPORT');
    console.log('='.repeat(60));

    // Overall Summary
    console.log('\n📊 OVERALL SUMMARY');
    console.log(`Status: ${results.valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall Score: ${(results.scores.overall * 100).toFixed(1)}%`);
    console.log(`Passing Threshold: ${(ValidationConfig.scoring.passingScore * 100).toFixed(1)}%`);

    // Individual Scores
    console.log('\n📈 COMPONENT SCORES');
    console.log(`Disciplinary Coverage: ${(results.scores.disciplinaryCoverage * 100).toFixed(1)}%`);
    console.log(`Cross-Reference Integrity: ${(results.scores.crossReferenceIntegrity * 100).toFixed(1)}%`);
    console.log(`Citation Standards: ${(results.scores.citationStandards * 100).toFixed(1)}%`);

    // Detailed Results
    this.reportDisciplinaryCoverage(results.details.disciplinaryCoverage);
    this.reportCrossReferenceIntegrity(results.details.crossReferenceIntegrity);
    this.reportCitationStandards(results.details.citationStandards);

    // Issues Summary
    if (results.errors.length > 0 || results.warnings.length > 0) {
      console.log('\n🚨 ISSUES SUMMARY');
      console.log(`Total Errors: ${results.errors.length}`);
      console.log(`Total Warnings: ${results.warnings.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        results.errors.slice(0, 10).forEach(error => {
          console.log(`   • ${error}`);
        });
        if (results.errors.length > 10) {
          console.log(`   ... and ${results.errors.length - 10} more errors`);
        }
      }

      if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        results.warnings.slice(0, 10).forEach(warning => {
          console.log(`   • ${warning}`);
        });
        if (results.warnings.length > 10) {
          console.log(`   ... and ${results.warnings.length - 10} more warnings`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    
    return results;
  }

  /**
   * Reports disciplinary coverage details
   */
  reportDisciplinaryCoverage(coverage) {
    console.log('\n📚 DISCIPLINARY COVERAGE DETAILS');
    
    if (coverage.missingDisciplines.length > 0) {
      console.log(`Missing Disciplines: ${coverage.missingDisciplines.join(', ')}`);
    }

    console.log('\nCoverage by Discipline:');
    for (const [discipline, info] of Object.entries(coverage.coverage)) {
      const status = info.present ? '✅' : '❌';
      console.log(`   ${status} ${discipline}: ${info.count} document(s)`);
    }
  }

  /**
   * Reports cross-reference integrity details
   */
  reportCrossReferenceIntegrity(integrity) {
    console.log('\n🔗 CROSS-REFERENCE INTEGRITY DETAILS');
    console.log(`Total References: ${integrity.stats.totalReferences || 0}`);
    console.log(`Broken References: ${integrity.stats.brokenReferences || 0}`);
    console.log(`Orphaned Documents: ${integrity.stats.orphanedDocuments || 0}`);
    console.log(`Missing Back-References: ${integrity.stats.missingBackReferences || 0}`);
  }

  /**
   * Reports citation standards details
   */
  reportCitationStandards(citations) {
    console.log('\n📖 CITATION STANDARDS DETAILS');
    console.log(`Documents with Citations: ${citations.overallStats.documentsWithCitations}/${citations.overallStats.totalDocuments}`);
    console.log(`Total Citations: ${citations.overallStats.totalCitations}`);
    console.log(`Average Citation Density: ${citations.overallStats.averageCitationDensity.toFixed(1)} per 1000 words`);
    console.log(`Format Consistency: ${(citations.overallStats.formatConsistency * 100).toFixed(1)}%`);
  }
}

// Export for testing and use
export { ComprehensiveContentValidator };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ComprehensiveContentValidator();
  const docsDir = process.argv[2] || path.join(process.cwd(), 'docs');
  
  validator.validateDocumentationSystem(docsDir)
    .then(results => {
      validator.generateComprehensiveReport(results);
      process.exit(results.valid ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}