import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { CrossReferenceValidator } from '../scripts/validate-references.js';
import fs from 'fs';
import path from 'path';

// Feature: humanity-problems-documentation, Property 6: Cross-Reference Completeness
describe('Cross-Reference Validation', () => {
  let validator;
  let tempDir;
  let tempFiles = [];

  beforeEach(() => {
    validator = new CrossReferenceValidator();
    tempDir = path.join(process.cwd(), 'temp-test-docs');
    
    // Create temp directory structure
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const categories = ['individual', 'group', 'societal'];
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

  it('should validate that cross-references between related documents exist and are complete', () => {
    // Property 6: Cross-Reference Completeness
    // For any complex topic spanning multiple documents, appropriate cross-references should exist between all related documents.
    // Validates: Requirements 2.2

    fc.assert(
      fc.property(
        fc.record({
          sourceDoc: fc.record({
            name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            title: fc.string({ minLength: 10, maxLength: 50 }),
            category: fc.constantFrom('individual', 'group', 'societal'),
            keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 4 })
          }),
          targetDoc: fc.record({
            name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            title: fc.string({ minLength: 10, maxLength: 50 }),
            category: fc.constantFrom('individual', 'group', 'societal'),
            keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 4 })
          }),
          referenceType: fc.constantFrom('see', 'related', 'compare')
        }),
        (testData) => {
          // Ensure documents have different names
          if (testData.sourceDoc.name === testData.targetDoc.name) {
            testData.targetDoc.name += '-alt';
          }

          // Create documents with cross-references
          const sourceContent = createDocumentWithReference(
            testData.sourceDoc,
            testData.targetDoc,
            testData.referenceType
          );
          
          const targetContent = createBasicDocument(testData.targetDoc);

          // Write documents to temp files
          const sourceFile = path.join(tempDir, testData.sourceDoc.category, `${testData.sourceDoc.name}.md`);
          const targetFile = path.join(tempDir, testData.targetDoc.category, `${testData.targetDoc.name}.md`);
          
          fs.writeFileSync(sourceFile, sourceContent);
          fs.writeFileSync(targetFile, targetContent);
          tempFiles.push(sourceFile, targetFile);

          // Scan and validate
          validator.scanDocuments(tempDir);
          const results = validator.validateCrossReferences();

          // Should find the documents
          expect(validator.documents.size).toBe(2);
          
          // Should have the cross-reference
          const sourceDocInfo = validator.documents.get(testData.sourceDoc.name);
          expect(sourceDocInfo).toBeDefined();
          expect(sourceDocInfo.outgoingRefs.length).toBe(1);
          expect(sourceDocInfo.outgoingRefs[0].type).toBe(testData.referenceType);
          expect(sourceDocInfo.outgoingRefs[0].document).toBe(testData.targetDoc.title);

          // Reference should be valid (not broken)
          const brokenRefs = results.errors.filter(error => error.includes('Broken reference'));
          expect(brokenRefs.length).toBe(0);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should detect broken cross-references to non-existent documents', () => {
    fc.assert(
      fc.property(
        fc.record({
          sourceDoc: fc.record({
            name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            title: fc.string({ minLength: 10, maxLength: 50 }),
            category: fc.constantFrom('individual', 'group', 'societal'),
            keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 4 })
          }),
          nonExistentRef: fc.record({
            title: fc.string({ minLength: 10, maxLength: 50 }),
            category: fc.constantFrom('individual', 'group', 'societal'),
            type: fc.constantFrom('see', 'related', 'compare')
          })
        }),
        (testData) => {
          // Create document with reference to non-existent document
          const content = `# ${testData.sourceDoc.title}

**Discipline:** Psychology  
**Level:** ${testData.sourceDoc.category}  
**Keywords:** ${testData.sourceDoc.keywords.join(', ')}  
**Related Documents:** None

## Abstract

Test document with broken reference.

## Introduction

Content here.

## Theoretical Framework

Framework content.

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

- [${testData.nonExistentRef.type}: ${testData.nonExistentRef.category} → ${testData.nonExistentRef.title}]

---

**Navigation:**  
← Previous | Index | Next →`;

          // Write only the source document (target doesn't exist)
          const sourceFile = path.join(tempDir, testData.sourceDoc.category, `${testData.sourceDoc.name}.md`);
          fs.writeFileSync(sourceFile, content);
          tempFiles.push(sourceFile);

          // Scan and validate
          validator.scanDocuments(tempDir);
          const results = validator.validateCrossReferences();

          // Should detect broken reference
          expect(results.valid).toBe(false);
          expect(results.errors.length).toBeGreaterThan(0);
          
          const brokenRefError = results.errors.find(error => 
            error.includes('Broken reference') && 
            error.includes(testData.nonExistentRef.title)
          );
          expect(brokenRefError).toBeDefined();

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should identify orphaned documents with no incoming references', () => {
    fc.assert(
      fc.property(
        fc.record({
          orphanDoc: fc.record({
            name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            title: fc.string({ minLength: 10, maxLength: 50 }),
            category: fc.constantFrom('individual', 'group', 'societal'),
            keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 4 })
          }),
          connectedDocs: fc.array(
            fc.record({
              name: fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
              title: fc.string({ minLength: 10, maxLength: 50 }),
              category: fc.constantFrom('individual', 'group', 'societal')
            }),
            { minLength: 2, maxLength: 3 }
          )
        }),
        (testData) => {
          // Ensure unique names
          const allNames = [testData.orphanDoc.name, ...testData.connectedDocs.map(d => d.name)];
          const uniqueNames = new Set(allNames);
          if (uniqueNames.size !== allNames.length) {
            // Skip this test case if names aren't unique
            return true;
          }

          // Create orphaned document (has outgoing refs but no incoming)
          const orphanContent = createDocumentWithReference(
            testData.orphanDoc,
            testData.connectedDocs[0],
            'related'
          );

          // Create connected documents that reference each other but not the orphan
          const connectedContents = testData.connectedDocs.map((doc, index) => {
            const nextDoc = testData.connectedDocs[(index + 1) % testData.connectedDocs.length];
            return createDocumentWithReference(doc, nextDoc, 'see');
          });

          // Write all documents
          const orphanFile = path.join(tempDir, testData.orphanDoc.category, `${testData.orphanDoc.name}.md`);
          fs.writeFileSync(orphanFile, orphanContent);
          tempFiles.push(orphanFile);

          for (let i = 0; i < testData.connectedDocs.length; i++) {
            const doc = testData.connectedDocs[i];
            const content = connectedContents[i];
            const file = path.join(tempDir, doc.category, `${doc.name}.md`);
            fs.writeFileSync(file, content);
            tempFiles.push(file);
          }

          // Scan and validate
          validator.scanDocuments(tempDir);
          const results = validator.validateCrossReferences();

          // Should identify orphaned document
          const orphanWarning = results.warnings.find(warning => 
            warning.includes('orphaned') && 
            warning.includes(testData.orphanDoc.name)
          );
          expect(orphanWarning).toBeDefined();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});

// Helper functions
function createDocumentWithReference(sourceDoc, targetDoc, refType) {
  return `# ${sourceDoc.title}

**Discipline:** Psychology  
**Level:** ${sourceDoc.category}  
**Keywords:** ${sourceDoc.keywords.join(', ')}  
**Related Documents:** ${targetDoc.title}

## Abstract

This document analyzes ${sourceDoc.title.toLowerCase()}.

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

- [${refType}: ${targetDoc.category} → ${targetDoc.title}]

---

**Navigation:**  
← Previous | Index | Next →`;
}

function createBasicDocument(doc) {
  return `# ${doc.title}

**Discipline:** Psychology  
**Level:** ${doc.category}  
**Keywords:** ${doc.keywords.join(', ')}  
**Related Documents:** None

## Abstract

Basic document for testing.

## Introduction

Introduction content.

## Theoretical Framework

Framework content.

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

No cross-references.

---

**Navigation:**  
← Previous | Index | Next →`;
}