import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DocumentStructureValidator } from '../scripts/validate-structure.js';
import fs from 'fs';
import path from 'path';

// Feature: humanity-problems-documentation, Property 8: Structural Consistency
describe('Document Structure Validation', () => {
  const validator = new DocumentStructureValidator();

  it('should validate that all documents follow standardized formatting template', () => {
    // Property 8: Structural Consistency
    // For any document in the system, it should follow the standardized formatting template and structural conventions.
    // Validates: Requirements 2.4

    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }),
          discipline: fc.constantFrom(...validator.validDisciplines),
          level: fc.constantFrom(...validator.validLevels),
          keywords: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          relatedDocs: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 3 })
        }),
        (docData) => {
          // Generate a valid document following the template
          const content = generateValidDocument(docData);
          
          // Write to temporary file for validation
          const tempFile = path.join(process.cwd(), 'temp-test-doc.md');
          fs.writeFileSync(tempFile, content);
          
          try {
            const result = validator.validateDocument(tempFile);
            
            // Clean up
            fs.unlinkSync(tempFile);
            
            // A properly formatted document should pass validation
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
            
            return true;
          } catch (error) {
            // Clean up on error
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            throw error;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect missing required sections in documents', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }),
          discipline: fc.constantFrom(...validator.validDisciplines),
          level: fc.constantFrom(...validator.validLevels),
          missingSections: fc.subarray(validator.requiredSections, { minLength: 1, maxLength: 3 })
        }),
        (docData) => {
          // Generate document with missing sections
          const content = generateDocumentWithMissingSections(docData);
          
          const tempFile = path.join(process.cwd(), 'temp-test-doc-missing.md');
          fs.writeFileSync(tempFile, content);
          
          try {
            const result = validator.validateDocument(tempFile);
            
            // Clean up
            fs.unlinkSync(tempFile);
            
            // Document with missing sections should fail validation
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            // Should have errors for each missing section
            for (const missingSection of docData.missingSections) {
              const hasError = result.errors.some(error => 
                error.includes(`Missing required section: ${missingSection}`)
              );
              expect(hasError).toBe(true);
            }
            
            return true;
          } catch (error) {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            throw error;
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate metadata completeness and format', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }),
          missingMetadata: fc.subarray(validator.requiredMetadata, { minLength: 1, maxLength: 2 })
        }),
        (docData) => {
          // Generate document with missing metadata
          const content = generateDocumentWithMissingMetadata(docData);
          
          const tempFile = path.join(process.cwd(), 'temp-test-doc-meta.md');
          fs.writeFileSync(tempFile, content);
          
          try {
            const result = validator.validateDocument(tempFile);
            
            // Clean up
            fs.unlinkSync(tempFile);
            
            // Document with missing metadata should fail validation
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            // Should have errors for each missing metadata field
            for (const missingField of docData.missingMetadata) {
              const hasError = result.errors.some(error => 
                error.includes(`Missing required metadata field: ${missingField}`)
              );
              expect(hasError).toBe(true);
            }
            
            return true;
          } catch (error) {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            throw error;
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Helper functions for generating test documents
function generateValidDocument(docData) {
  const keywords = docData.keywords.join(', ');
  const relatedDocs = docData.relatedDocs.join(', ');
  
  return `# ${docData.title}

**Discipline:** ${docData.discipline}  
**Level:** ${docData.level}  
**Keywords:** ${keywords}  
**Related Documents:** ${relatedDocs}

## Abstract

This document provides a comprehensive analysis of the specified topic.

## Introduction

Context and scope of the analysis.

## Theoretical Framework

Academic frameworks and models employed in this analysis.

## Analysis

### Primary Analysis

Detailed examination of the core concepts.

### Secondary Analysis

Supporting analysis and evidence.

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

- [See: Individual → Cognitive Biases]
- [Related: Group → Social Dynamics]
- [Compare: Historical → Civilizational Collapse]

---

**Navigation:**  
← Previous Document | Category Index | Next Document →`;
}

function generateDocumentWithMissingSections(docData) {
  const keywords = ['keyword1', 'keyword2'].join(', ');
  
  let content = `# ${docData.title}

**Discipline:** ${docData.discipline}  
**Level:** ${docData.level}  
**Keywords:** ${keywords}  
**Related Documents:** Related Doc 1, Related Doc 2

## Abstract

This document provides analysis.

`;

  // Add only sections that are NOT in the missing sections list
  const sectionsToInclude = validator.requiredSections.filter(
    section => !docData.missingSections.includes(section)
  );
  
  for (const section of sectionsToInclude) {
    content += `## ${section}\n\nContent for ${section}.\n\n`;
  }
  
  return content;
}

function generateDocumentWithMissingMetadata(docData) {
  let content = `# ${docData.title}\n\n`;
  
  // Add only metadata that is NOT in the missing metadata list
  const metadataToInclude = validator.requiredMetadata.filter(
    field => !docData.missingMetadata.includes(field)
  );
  
  const metadataValues = {
    'Discipline': 'Psychology',
    'Level': 'Individual',
    'Keywords': 'keyword1, keyword2',
    'Related Documents': 'Doc1, Doc2'
  };
  
  for (const field of metadataToInclude) {
    content += `**${field}:** ${metadataValues[field]}  \n`;
  }
  
  content += `\n## Abstract\n\nDocument content.\n\n`;
  
  // Add all required sections to focus test on metadata
  for (const section of validator.requiredSections) {
    content += `## ${section}\n\nContent for ${section}.\n\n`;
  }
  
  return content;
}