import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ComprehensiveContentValidator } from '../scripts/comprehensive-content-validator.js';
import { StructuralValidationSystem } from '../scripts/structural-validation-system.js';
import { MetadataIndexingSystem } from '../scripts/metadata-indexing-system.js';
import { IntegratedValidationSystem } from '../scripts/integrated-validation-system.js';
import fs from 'fs';
import path from 'path';

// Feature: humanity-problems-documentation, Property 1: Complete Disciplinary Coverage
// Feature: humanity-problems-documentation, Property 9: Comprehensive Indexing  
// Feature: humanity-problems-documentation, Property 15: Theoretical Framework Referencing
describe('Validation System Properties', () => {
  let tempDir;
  let tempFiles = [];

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'temp-validation-test');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create category directories
    const categories = ['individual', 'group', 'societal', 'historical', 'integrative'];
    for (const category of categories) {
      const categoryDir = path.join(tempDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir);
      }
    }
  });

  afterEach(() => {
    // Clean up temp files
    for (const file of tempFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    tempFiles = [];
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Property 1: Complete Disciplinary Coverage', () => {
    it('should validate that all required academic disciplines are represented in the documentation system', () => {
      // Property 1: Complete Disciplinary Coverage
      // For any required academic discipline, the documentation system should contain dedicated analysis files
      // Validates: Requirements 1.1

      fc.assert(
        fc.property(
          fc.record({
            disciplines: fc.shuffledSubarray([
              'Psychology', 'Sociology', 'Anthropology', 'Political Science',
              'Economics', 'History', 'Philosophy', 'Religious Studies',
              'Neuroscience', 'Evolutionary Psychology', 'Cognitive Science'
            ], { minLength: 5, maxLength: 11 }),
            documentsPerDiscipline: fc.integer({ min: 1, max: 3 })
          }),
          (testData) => {
            const validator = new ComprehensiveContentValidator();
            
            // Create documents for each discipline
            const createdFiles = [];
            
            for (const discipline of testData.disciplines) {
              for (let i = 0; i < testData.documentsPerDiscipline; i++) {
                const docName = `${discipline.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`;
                const content = generateValidDocumentWithDiscipline(discipline, docName);
                
                const category = getRandomCategory();
                const filePath = path.join(tempDir, category, `${docName}.md`);
                
                fs.writeFileSync(filePath, content);
                createdFiles.push(filePath);
                tempFiles.push(filePath);
              }
            }
            
            // Validate disciplinary coverage
            return validator.validateDisciplinaryCoverage(tempDir)
              .then(results => {
                // Should find all created disciplines
                for (const discipline of testData.disciplines) {
                  expect(results.coverage[discipline]).toBeDefined();
                  expect(results.coverage[discipline].present).toBe(true);
                  expect(results.coverage[discipline].count).toBeGreaterThanOrEqual(1);
                }
                
                // Coverage score should reflect the proportion of disciplines covered
                const totalRequired = 11; // Total number of valid disciplines
                const expectedScore = testData.disciplines.length / totalRequired;
                expect(results.score).toBeCloseTo(expectedScore, 2);
                
                return true;
              });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should detect missing disciplines and calculate accurate coverage scores', () => {
      fc.assert(
        fc.property(
          fc.record({
            presentDisciplines: fc.shuffledSubarray([
              'Psychology', 'Sociology', 'Anthropology', 'Political Science'
            ], { minLength: 1, maxLength: 4 }),
            missingDisciplines: fc.shuffledSubarray([
              'Economics', 'History', 'Philosophy', 'Religious Studies'
            ], { minLength: 1, maxLength: 4 })
          }),
          (testData) => {
            const validator = new ComprehensiveContentValidator();
            
            // Create documents only for present disciplines
            for (const discipline of testData.presentDisciplines) {
              const docName = discipline.toLowerCase().replace(/\s+/g, '-');
              const content = generateValidDocumentWithDiscipline(discipline, docName);
              
              const filePath = path.join(tempDir, 'individual', `${docName}.md`);
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            return validator.validateDisciplinaryCoverage(tempDir)
              .then(results => {
                // Should detect missing disciplines
                for (const discipline of testData.missingDisciplines) {
                  expect(results.coverage[discipline]).toBeDefined();
                  expect(results.coverage[discipline].present).toBe(false);
                  expect(results.coverage[discipline].count).toBe(0);
                }
                
                // Should find present disciplines
                for (const discipline of testData.presentDisciplines) {
                  expect(results.coverage[discipline]).toBeDefined();
                  expect(results.coverage[discipline].present).toBe(true);
                  expect(results.coverage[discipline].count).toBeGreaterThan(0);
                }
                
                // Should have errors for missing disciplines
                expect(results.missingDisciplines.length).toBeGreaterThan(0);
                expect(results.valid).toBe(false);
                
                return true;
              });
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 9: Comprehensive Indexing', () => {
    it('should create searchable indices for all documents with proper metadata and cross-references', () => {
      // Property 9: Comprehensive Indexing
      // For any document in the system, it should include proper metadata tags, categories, and index entries for discoverability
      // Validates: Requirements 2.5

      fc.assert(
        fc.property(
          fc.record({
            documents: fc.array(
              fc.record({
                name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                discipline: fc.constantFrom('Psychology', 'Sociology', 'Anthropology', 'Political Science'),
                level: fc.constantFrom('Individual', 'Group', 'Societal'),
                keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 5 }),
                category: fc.constantFrom('individual', 'group', 'societal')
              }),
              { minLength: 3, maxLength: 8 }
            )
          }),
          (testData) => {
            const indexingSystem = new MetadataIndexingSystem();
            
            // Ensure unique document names
            const uniqueNames = new Set();
            const validDocuments = testData.documents.filter(doc => {
              if (uniqueNames.has(doc.name)) {
                return false;
              }
              uniqueNames.add(doc.name);
              return true;
            });
            
            if (validDocuments.length === 0) {
              return true; // Skip this test case
            }
            
            // Create documents with comprehensive metadata
            for (const docData of validDocuments) {
              const content = generateDocumentWithComprehensiveMetadata(docData);
              const filePath = path.join(tempDir, docData.category, `${docData.name}.md`);
              
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            return indexingSystem.createComprehensiveIndex(tempDir)
              .then(results => {
                // Should successfully index all documents
                expect(results.indices.documents.indexedDocuments).toBe(validDocuments.length);
                expect(results.indices.documents.totalDocuments).toBe(validDocuments.length);
                
                // Should create keyword index
                expect(results.indices.keywords.totalKeywords).toBeGreaterThan(0);
                expect(Object.keys(results.indices.keywords.keywordMap).length).toBeGreaterThan(0);
                
                // Should create discipline index
                const disciplinesUsed = [...new Set(validDocuments.map(d => d.discipline))];
                for (const discipline of disciplinesUsed) {
                  expect(results.indices.disciplines.disciplineMap[discipline]).toBeDefined();
                  expect(results.indices.disciplines.disciplineMap[discipline].documentCount).toBeGreaterThan(0);
                }
                
                // Should create level index
                const levelsUsed = [...new Set(validDocuments.map(d => d.level))];
                for (const level of levelsUsed) {
                  expect(results.indices.levels.levelMap[level]).toBeDefined();
                  expect(results.indices.levels.levelMap[level].documentCount).toBeGreaterThan(0);
                }
                
                // Should have search capabilities
                expect(results.searchCapabilities.keywordSearch).toBeDefined();
                expect(results.searchCapabilities.topicSearch).toBeDefined();
                expect(results.searchCapabilities.disciplineSearch).toBeDefined();
                
                // Overall indexing should be successful
                expect(results.valid).toBe(true);
                expect(results.score).toBeGreaterThan(0.5);
                
                return true;
              });
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should maintain index integrity when documents have cross-references', () => {
      fc.assert(
        fc.property(
          fc.record({
            sourceDoc: fc.record({
              name: fc.string({ minLength: 5, maxLength: 15 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
              discipline: fc.constantFrom('Psychology', 'Sociology'),
              level: fc.constantFrom('Individual', 'Group'),
              keywords: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 2, maxLength: 4 })
            }),
            targetDoc: fc.record({
              name: fc.string({ minLength: 5, maxLength: 15 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
              discipline: fc.constantFrom('Anthropology', 'Political Science'),
              level: fc.constantFrom('Societal', 'Group'),
              keywords: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 2, maxLength: 4 })
            }),
            referenceType: fc.constantFrom('see', 'related', 'compare')
          }),
          (testData) => {
            // Ensure different document names
            if (testData.sourceDoc.name === testData.targetDoc.name) {
              testData.targetDoc.name += '-alt';
            }
            
            const indexingSystem = new MetadataIndexingSystem();
            
            // Create source document with cross-reference to target
            const sourceContent = generateDocumentWithCrossReference(
              testData.sourceDoc,
              testData.targetDoc,
              testData.referenceType
            );
            
            const targetContent = generateDocumentWithComprehensiveMetadata(testData.targetDoc);
            
            const sourceFile = path.join(tempDir, 'individual', `${testData.sourceDoc.name}.md`);
            const targetFile = path.join(tempDir, 'group', `${testData.targetDoc.name}.md`);
            
            fs.writeFileSync(sourceFile, sourceContent);
            fs.writeFileSync(targetFile, targetContent);
            tempFiles.push(sourceFile, targetFile);
            
            return indexingSystem.createComprehensiveIndex(tempDir)
              .then(results => {
                // Should index both documents
                expect(results.indices.documents.indexedDocuments).toBe(2);
                
                // Should create cross-reference index
                expect(results.indices.crossReferences.totalReferences).toBeGreaterThan(0);
                
                // Should find the cross-reference in the index
                const crossRefKey = `${testData.sourceDoc.name}->${testData.targetDoc.name}`;
                const hasReference = Object.keys(results.indices.crossReferences.referenceMap)
                  .some(key => key.includes(testData.sourceDoc.name) && key.includes(testData.targetDoc.name));
                
                expect(hasReference).toBe(true);
                
                // Cross-reference should be validated (target exists)
                const refEntries = Object.values(results.indices.crossReferences.referenceMap);
                const validatedRefs = refEntries.filter(ref => ref.validated);
                expect(validatedRefs.length).toBeGreaterThan(0);
                
                return true;
              });
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 15: Theoretical Framework Referencing', () => {
    it('should validate that theoretical discussions properly reference established academic frameworks', () => {
      // Property 15: Theoretical Framework Referencing
      // For any theoretical discussion, established academic frameworks and models should be properly referenced and cited
      // Validates: Requirements 4.2

      fc.assert(
        fc.property(
          fc.record({
            documents: fc.array(
              fc.record({
                name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                discipline: fc.constantFrom('Psychology', 'Sociology', 'Philosophy', 'Political Science'),
                theoreticalFrameworks: fc.shuffledSubarray([
                  'Cognitive Behavioral Theory', 'Social Learning Theory', 'Systems Theory',
                  'Evolutionary Psychology', 'Psychoanalytic Theory', 'Social Identity Theory'
                ], { minLength: 1, maxLength: 3 }),
                citations: fc.array(
                  fc.record({
                    author: fc.string({ minLength: 5, maxLength: 20 }),
                    year: fc.integer({ min: 1950, max: 2023 }),
                    title: fc.string({ minLength: 10, maxLength: 50 })
                  }),
                  { minLength: 2, maxLength: 5 }
                )
              }),
              { minLength: 2, maxLength: 5 }
            )
          }),
          (testData) => {
            const validator = new ComprehensiveContentValidator();
            
            // Ensure unique document names
            const uniqueNames = new Set();
            const validDocuments = testData.documents.filter(doc => {
              if (uniqueNames.has(doc.name)) {
                return false;
              }
              uniqueNames.add(doc.name);
              return true;
            });
            
            if (validDocuments.length === 0) {
              return true; // Skip this test case
            }
            
            // Create documents with theoretical frameworks and citations
            for (const docData of validDocuments) {
              const content = generateDocumentWithTheoreticalFrameworks(docData);
              const category = getRandomCategory();
              const filePath = path.join(tempDir, category, `${docData.name}.md`);
              
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            return validator.validateCitationStandards(tempDir)
              .then(results => {
                // Should find documents with citations
                expect(results.overallStats.documentsWithCitations).toBeGreaterThan(0);
                expect(results.overallStats.totalCitations).toBeGreaterThan(0);
                
                // Should have reasonable citation density
                expect(results.overallStats.averageCitationDensity).toBeGreaterThan(0);
                
                // Should validate citation formats
                for (const docResult of results.documentResults) {
                  if (docResult.result.bibliography.length > 0) {
                    // Should have proper bibliography entries
                    expect(docResult.result.bibliography.length).toBeGreaterThan(0);
                    
                    // Should have in-text citations
                    expect(docResult.result.inTextCitations.length).toBeGreaterThan(0);
                    
                    // Citations should be parseable
                    const parseableCitations = docResult.result.bibliography.filter(
                      bib => bib.parsed.format !== 'unknown'
                    );
                    expect(parseableCitations.length).toBeGreaterThan(0);
                  }
                }
                
                // Overall citation standards should be reasonable
                expect(results.score).toBeGreaterThan(0.3);
                
                return true;
              });
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should detect missing theoretical frameworks in academic documents', () => {
      fc.assert(
        fc.property(
          fc.record({
            documentsWithFrameworks: fc.array(
              fc.record({
                name: fc.string({ minLength: 5, maxLength: 15 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                hasFramework: fc.constant(true)
              }),
              { minLength: 1, maxLength: 3 }
            ),
            documentsWithoutFrameworks: fc.array(
              fc.record({
                name: fc.string({ minLength: 5, maxLength: 15 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                hasFramework: fc.constant(false)
              }),
              { minLength: 1, maxLength: 3 }
            )
          }),
          (testData) => {
            const validator = new StructuralValidationSystem();
            
            // Ensure unique names across both arrays
            const allNames = [
              ...testData.documentsWithFrameworks.map(d => d.name),
              ...testData.documentsWithoutFrameworks.map(d => d.name)
            ];
            const uniqueNames = new Set(allNames);
            
            if (uniqueNames.size !== allNames.length) {
              return true; // Skip if names aren't unique
            }
            
            // Create documents with and without theoretical frameworks
            for (const docData of testData.documentsWithFrameworks) {
              const content = generateDocumentWithTheoreticalSection(docData.name, true);
              const filePath = path.join(tempDir, 'individual', `${docData.name}.md`);
              
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            for (const docData of testData.documentsWithoutFrameworks) {
              const content = generateDocumentWithTheoreticalSection(docData.name, false);
              const filePath = path.join(tempDir, 'group', `${docData.name}.md`);
              
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            return validator.validateStructuralIntegrity(tempDir)
              .then(results => {
                // Should validate template compliance
                expect(results.details.templateCompliance).toBeDefined();
                
                // Documents with proper theoretical frameworks should score higher
                const docsWithFrameworks = results.details.templateCompliance.documentResults
                  .filter(doc => testData.documentsWithFrameworks.some(d => doc.file.includes(d.name)));
                
                const docsWithoutFrameworks = results.details.templateCompliance.documentResults
                  .filter(doc => testData.documentsWithoutFrameworks.some(d => doc.file.includes(d.name)));
                
                if (docsWithFrameworks.length > 0 && docsWithoutFrameworks.length > 0) {
                  const avgScoreWith = docsWithFrameworks.reduce((sum, doc) => sum + doc.complianceScore, 0) / docsWithFrameworks.length;
                  const avgScoreWithout = docsWithoutFrameworks.reduce((sum, doc) => sum + doc.complianceScore, 0) / docsWithoutFrameworks.length;
                  
                  // Documents with theoretical frameworks should generally score better
                  expect(avgScoreWith).toBeGreaterThanOrEqual(avgScoreWithout);
                }
                
                return true;
              });
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Integrated System Properties', () => {
    it('should maintain consistency across all validation components', () => {
      fc.assert(
        fc.property(
          fc.record({
            documentSet: fc.array(
              fc.record({
                name: fc.string({ minLength: 5, maxLength: 15 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                discipline: fc.constantFrom('Psychology', 'Sociology', 'Anthropology'),
                level: fc.constantFrom('Individual', 'Group', 'Societal'),
                category: fc.constantFrom('individual', 'group', 'societal'),
                hasCompleteMetadata: fc.boolean(),
                hasAdvancedMarkdown: fc.boolean(),
                hasCitations: fc.boolean()
              }),
              { minLength: 3, maxLength: 6 }
            )
          }),
          (testData) => {
            // Ensure unique names
            const uniqueNames = new Set();
            const validDocs = testData.documentSet.filter(doc => {
              if (uniqueNames.has(doc.name)) {
                return false;
              }
              uniqueNames.add(doc.name);
              return true;
            });
            
            if (validDocs.length < 2) {
              return true; // Skip if not enough unique documents
            }
            
            const integratedSystem = new IntegratedValidationSystem();
            
            // Create documents with varying quality levels
            for (const docData of validDocs) {
              const content = generateVariableQualityDocument(docData);
              const filePath = path.join(tempDir, docData.category, `${docData.name}.md`);
              
              fs.writeFileSync(filePath, content);
              tempFiles.push(filePath);
            }
            
            return integratedSystem.runCompleteValidation(tempDir)
              .then(results => {
                // Should complete all validation phases
                expect(results.components.contentValidation).toBeDefined();
                expect(results.components.structuralValidation).toBeDefined();
                expect(results.components.metadataIndexing).toBeDefined();
                
                // Should calculate overall score
                expect(results.overallScore).toBeGreaterThanOrEqual(0);
                expect(results.overallScore).toBeLessThanOrEqual(1);
                
                // Should generate quality metrics
                expect(results.qualityMetrics).toBeDefined();
                expect(results.qualityMetrics.systemMaturity).toBeGreaterThanOrEqual(0);
                expect(results.qualityMetrics.workshopReadiness).toBeGreaterThanOrEqual(0);
                expect(results.qualityMetrics.academicStandard).toBeGreaterThanOrEqual(0);
                
                // Should provide recommendations
                expect(Array.isArray(results.recommendations)).toBe(true);
                
                // Component scores should be consistent with overall assessment
                const componentScores = [
                  results.components.contentValidation?.scores?.overall || 0,
                  results.components.structuralValidation?.overallScore || 0,
                  results.components.metadataIndexing?.score || 0
                ];
                
                const avgComponentScore = componentScores.reduce((a, b) => a + b, 0) / componentScores.length;
                
                // Overall score should be reasonably related to component scores
                expect(Math.abs(results.overallScore - avgComponentScore)).toBeLessThan(0.5);
                
                return true;
              });
          }
        ),
        { numRuns: 5 } // Fewer runs due to complexity
      );
    });
  });
});

// Helper functions for generating test documents

function generateValidDocumentWithDiscipline(discipline, docName) {
  return `# ${docName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Discipline:** ${discipline}  
**Level:** Individual  
**Keywords:** ${discipline.toLowerCase()}, analysis, research  
**Related Documents:** None

## Abstract

This document provides a comprehensive analysis from a ${discipline.toLowerCase()} perspective.

## Introduction

Context and scope of the ${discipline.toLowerCase()} analysis.

## Theoretical Framework

Academic frameworks and models employed in ${discipline.toLowerCase()}.

## Analysis

Detailed examination of the core concepts in ${discipline.toLowerCase()}.

## Cross-Level Connections

Connections to individual, group, and societal levels of analysis.

## Historical Context

Historical precedents and patterns relevant to this ${discipline.toLowerCase()} topic.

## Contemporary Manifestations

Current examples and applications of the analyzed concepts.

## Implications

Broader implications and consequences of the analysis.

## Limitations

Theoretical limitations and areas of scholarly debate in ${discipline.toLowerCase()}.

## References

1. Academic Source 1 (${new Date().getFullYear()})
2. Academic Source 2 (${new Date().getFullYear() - 1})

## Cross-References

- [See: Individual → Cognitive Analysis]
- [Related: Group → Social Dynamics]

---

**Navigation:**  
← Previous Document | Category Index | Next Document →`;
}

function generateDocumentWithComprehensiveMetadata(docData) {
  const keywords = docData.keywords.join(', ');
  
  return `# ${docData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Discipline:** ${docData.discipline}  
**Level:** ${docData.level}  
**Keywords:** ${keywords}  
**Related Documents:** Related Doc 1, Related Doc 2

## Abstract

This document provides comprehensive analysis with full metadata.

## Introduction

Context and scope of the analysis.

## Theoretical Framework

Academic frameworks and models employed in this analysis.

## Analysis

| Aspect | Description | Impact |
|--------|-------------|--------|
| Primary | Main analysis | High |
| Secondary | Supporting analysis | Medium |

\`\`\`mermaid
graph TD
    A[Concept A] --> B[Concept B]
    B --> C[Outcome]
\`\`\`

## Cross-Level Connections

Connections to individual, group, and societal levels of analysis.

## Historical Context

Historical precedents and patterns relevant to this topic.

## Contemporary Manifestations

Current examples and applications of the analyzed concepts.

## Implications

Broader implications and consequences of the analysis.

## Limitations

Theoretical limitations and areas of scholarly debate.

## References

1. Academic Source 1
2. Academic Source 2

## Cross-References

- [See: ${docData.level} → Related Analysis]
- [Related: ${docData.category} → Connected Topic]

---

**Navigation:**  
← Previous Document | Category Index | Next Document →`;
}

function generateDocumentWithCrossReference(sourceDoc, targetDoc, referenceType) {
  const keywords = sourceDoc.keywords.join(', ');
  
  return `# ${sourceDoc.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Discipline:** ${sourceDoc.discipline}  
**Level:** ${sourceDoc.level}  
**Keywords:** ${keywords}  
**Related Documents:** ${targetDoc.name}

## Abstract

This document analyzes concepts with cross-references.

## Introduction

Context and scope of the analysis.

## Theoretical Framework

Academic frameworks employed.

## Analysis

Detailed analysis content.

## Cross-Level Connections

Connections to other levels.

## Historical Context

Historical precedents.

## Contemporary Manifestations

Current examples.

## Implications

Broader implications.

## Limitations

Theoretical limitations.

## References

Academic sources.

## Cross-References

- [${referenceType}: ${targetDoc.level.toLowerCase()} → ${targetDoc.name.replace(/-/g, ' ')}]

---

**Navigation:**  
← Previous | Index | Next →`;
}

function generateDocumentWithTheoreticalFrameworks(docData) {
  const keywords = docData.keywords.join(', ');
  const frameworks = docData.theoreticalFrameworks.join(', ');
  
  let citationsSection = '## References\n\n';
  let inTextCitations = '';
  
  for (let i = 0; i < docData.citations.length; i++) {
    const citation = docData.citations[i];
    citationsSection += `${i + 1}. ${citation.author} (${citation.year}). ${citation.title}. Academic Journal.\n`;
    
    if (i === 0) {
      inTextCitations = `Research by ${citation.author} (${citation.year}) demonstrates the importance of theoretical frameworks.`;
    }
  }
  
  return `# ${docData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Discipline:** ${docData.discipline}  
**Level:** Individual  
**Keywords:** ${keywords}  
**Related Documents:** None

## Abstract

This document employs multiple theoretical frameworks: ${frameworks}.

## Introduction

Context and scope employing established theoretical frameworks.

## Theoretical Framework

This analysis draws upon several established frameworks including ${frameworks}. ${inTextCitations}

These frameworks provide the foundation for understanding complex phenomena.

## Analysis

Detailed analysis using the theoretical frameworks.

## Cross-Level Connections

Connections to other levels.

## Historical Context

Historical precedents.

## Contemporary Manifestations

Current examples.

## Implications

Broader implications.

## Limitations

Theoretical limitations and areas of debate.

${citationsSection}

## Cross-References

- [See: Individual → Framework Analysis]

---

**Navigation:**  
← Previous | Index | Next →`;
}

function generateDocumentWithTheoreticalSection(docName, hasFramework) {
  const frameworkContent = hasFramework ? 
    `This analysis employs established theoretical frameworks including Cognitive Behavioral Theory and Systems Theory. These frameworks provide the foundation for understanding complex phenomena.` :
    `This document provides analysis without specific theoretical frameworks.`;
  
  return `# ${docName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Discipline:** Psychology  
**Level:** Individual  
**Keywords:** analysis, research, theory  
**Related Documents:** None

## Abstract

Document with ${hasFramework ? 'comprehensive' : 'basic'} theoretical foundation.

## Introduction

Context and scope.

## Theoretical Framework

${frameworkContent}

## Analysis

Analysis content.

## Cross-Level Connections

Connections content.

## Historical Context

Historical content.

## Contemporary Manifestations

Contemporary content.

## Implications

Implications content.

## Limitations

Limitations content.

## References

References content.

## Cross-References

Cross-references content.

---

**Navigation:**  
← Previous | Index | Next →`;
}

function generateVariableQualityDocument(docData) {
  let content = `# ${docData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n`;
  
  // Add metadata based on hasCompleteMetadata flag
  if (docData.hasCompleteMetadata) {
    content += `**Discipline:** ${docData.discipline}  
**Level:** ${docData.level}  
**Keywords:** analysis, research, ${docData.discipline.toLowerCase()}  
**Related Documents:** Related Doc 1\n\n`;
  } else {
    content += `**Discipline:** ${docData.discipline}  \n\n`;
  }
  
  content += `## Abstract\n\nDocument with ${docData.hasCompleteMetadata ? 'complete' : 'incomplete'} metadata.\n\n`;
  
  // Add required sections
  const sections = [
    'Introduction', 'Theoretical Framework', 'Analysis', 'Cross-Level Connections',
    'Historical Context', 'Contemporary Manifestations', 'Implications', 'Limitations'
  ];
  
  for (const section of sections) {
    content += `## ${section}\n\n${section} content.\n\n`;
  }
  
  // Add advanced markdown if specified
  if (docData.hasAdvancedMarkdown) {
    content += `## Advanced Features\n\n`;
    content += `| Feature | Usage | Impact |\n|---------|-------|--------|\n| Tables | Yes | High |\n| Diagrams | Yes | Medium |\n\n`;
    content += `\`\`\`mermaid\ngraph TD\n    A[Input] --> B[Process]\n    B --> C[Output]\n\`\`\`\n\n`;
  }
  
  // Add citations if specified
  if (docData.hasCitations) {
    content += `## References\n\n1. Author, A. (2023). Research Title. Academic Journal.\n2. Author, B. (2022). Another Study. Science Publication.\n\n`;
  } else {
    content += `## References\n\nNo references.\n\n`;
  }
  
  content += `## Cross-References\n\n- [See: ${docData.level} → Related Topic]\n\n`;
  content += `---\n\n**Navigation:**  \n← Previous | Index | Next →`;
  
  return content;
}

function getRandomCategory() {
  const categories = ['individual', 'group', 'societal', 'historical', 'integrative'];
  return categories[Math.floor(Math.random() * categories.length)];
}