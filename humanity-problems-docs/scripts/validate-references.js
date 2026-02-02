import fs from 'fs';
import path from 'path';

/**
 * Cross-reference validation system for humanity problems documentation
 * Validates that cross-references between documents are complete and accurate
 */
class CrossReferenceValidator {
  constructor() {
    this.documents = new Map();
    this.crossReferences = new Map();
    this.categories = [
      'individual', 'group', 'societal', 'historical', 
      'integrative', 'specialized', 'foundational'
    ];
  }

  /**
   * Scans all documents and builds reference map
   * @param {string} docsDir - Path to documents directory
   */
  scanDocuments(docsDir) {
    this.documents.clear();
    this.crossReferences.clear();

    const walkDir = (dir, category = '') => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          const subCategory = path.basename(filePath);
          walkDir(filePath, subCategory);
        } else if (file.endsWith('.md') && file !== 'README.md') {
          this.processDocument(filePath, category);
        }
      }
    };

    walkDir(docsDir);
  }

  /**
   * Processes a single document to extract metadata and references
   */
  processDocument(filePath, category) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.md');
      
      const docInfo = {
        path: filePath,
        category: category,
        title: this.extractTitle(content),
        discipline: this.extractMetadata(content, 'Discipline'),
        level: this.extractMetadata(content, 'Level'),
        keywords: this.extractKeywords(content),
        outgoingRefs: this.extractCrossReferences(content),
        incomingRefs: []
      };

      this.documents.set(fileName, docInfo);
      
      // Store cross-references for validation
      for (const ref of docInfo.outgoingRefs) {
        const refKey = `${ref.category}→${ref.document}`;
        if (!this.crossReferences.has(refKey)) {
          this.crossReferences.set(refKey, []);
        }
        this.crossReferences.get(refKey).push({
          source: fileName,
          type: ref.type
        });
      }
      
    } catch (error) {
      console.warn(`Failed to process document ${filePath}: ${error.message}`);
    }
  }

  /**
   * Extracts document title from markdown content
   */
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  /**
   * Extracts metadata field value
   */
  extractMetadata(content, field) {
    const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)$`, 'm');
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Extracts keywords from metadata
   */
  extractKeywords(content) {
    const keywords = this.extractMetadata(content, 'Keywords');
    return keywords ? keywords.split(',').map(k => k.trim()) : [];
  }

  /**
   * Extracts cross-references from document content
   */
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

  /**
   * Validates all cross-references in the system
   */
  validateCrossReferences() {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        totalDocuments: this.documents.size,
        totalReferences: 0,
        brokenReferences: 0,
        orphanedDocuments: 0,
        missingBackReferences: 0
      }
    };

    // Build incoming reference map
    this.buildIncomingReferences();

    // Validate each document's references
    for (const [docName, docInfo] of this.documents) {
      this.validateDocumentReferences(docName, docInfo, results);
    }

    // Check for orphaned documents
    this.checkOrphanedDocuments(results);

    // Check for missing reciprocal references
    this.checkReciprocalReferences(results);

    results.valid = results.errors.length === 0;
    return results;
  }

  /**
   * Builds incoming reference map for all documents
   */
  buildIncomingReferences() {
    for (const [docName, docInfo] of this.documents) {
      for (const ref of docInfo.outgoingRefs) {
        const targetDoc = this.findDocumentByReference(ref);
        if (targetDoc) {
          targetDoc.incomingRefs.push({
            source: docName,
            type: ref.type
          });
        }
      }
    }
  }

  /**
   * Validates references for a single document
   */
  validateDocumentReferences(docName, docInfo, results) {
    results.stats.totalReferences += docInfo.outgoingRefs.length;

    for (const ref of docInfo.outgoingRefs) {
      const targetDoc = this.findDocumentByReference(ref);
      
      if (!targetDoc) {
        results.errors.push(
          `Broken reference in ${docName}: [${ref.type}: ${ref.category} → ${ref.document}] - target not found`
        );
        results.stats.brokenReferences++;
        results.valid = false;
      } else {
        // Validate reference appropriateness
        this.validateReferenceAppropriateness(docName, docInfo, ref, targetDoc, results);
      }
    }

    // Check minimum reference requirements
    if (docInfo.outgoingRefs.length === 0) {
      results.warnings.push(`Document ${docName} has no cross-references`);
    }
  }

  /**
   * Validates that references are appropriate (related content)
   */
  validateReferenceAppropriateness(sourceName, sourceDoc, ref, targetDoc, results) {
    // Check if reference type matches relationship
    if (ref.type === 'see' && sourceDoc.level === targetDoc.level) {
      // 'See' references should typically point to different levels or categories
      results.warnings.push(
        `Potentially inappropriate 'See' reference in ${sourceName}: both documents are at ${sourceDoc.level} level`
      );
    }

    // Check for keyword overlap in 'Related' references
    if (ref.type === 'related') {
      const keywordOverlap = sourceDoc.keywords.some(k => 
        targetDoc.keywords.some(tk => tk.toLowerCase().includes(k.toLowerCase()))
      );
      
      if (!keywordOverlap && sourceDoc.discipline !== targetDoc.discipline) {
        results.warnings.push(
          `Weak 'Related' reference in ${sourceName}: no keyword overlap or discipline connection with ${ref.document}`
        );
      }
    }
  }

  /**
   * Finds document by cross-reference
   */
  findDocumentByReference(ref) {
    // Try exact match first
    for (const [docName, docInfo] of this.documents) {
      if (docInfo.title.toLowerCase() === ref.document.toLowerCase() ||
          docName.toLowerCase() === ref.document.toLowerCase()) {
        return docInfo;
      }
    }

    // Try partial match
    for (const [docName, docInfo] of this.documents) {
      if (docInfo.title.toLowerCase().includes(ref.document.toLowerCase()) ||
          ref.document.toLowerCase().includes(docInfo.title.toLowerCase())) {
        return docInfo;
      }
    }

    return null;
  }

  /**
   * Checks for orphaned documents (no incoming references)
   */
  checkOrphanedDocuments(results) {
    for (const [docName, docInfo] of this.documents) {
      if (docInfo.incomingRefs.length === 0 && docInfo.outgoingRefs.length > 0) {
        results.warnings.push(`Potentially orphaned document: ${docName} (no incoming references)`);
        results.stats.orphanedDocuments++;
      }
    }
  }

  /**
   * Checks for missing reciprocal references
   */
  checkReciprocalReferences(results) {
    for (const [docName, docInfo] of this.documents) {
      for (const ref of docInfo.outgoingRefs) {
        if (ref.type === 'related') {
          const targetDoc = this.findDocumentByReference(ref);
          if (targetDoc) {
            const hasReciprocal = targetDoc.outgoingRefs.some(tRef => 
              tRef.type === 'related' && 
              (tRef.document.toLowerCase().includes(docInfo.title.toLowerCase()) ||
               docName.toLowerCase().includes(tRef.document.toLowerCase()))
            );
            
            if (!hasReciprocal) {
              results.warnings.push(
                `Missing reciprocal reference: ${docName} → ${ref.document} (consider adding reverse reference)`
              );
              results.stats.missingBackReferences++;
            }
          }
        }
      }
    }
  }

  /**
   * Generates comprehensive validation report
   */
  generateReport(results) {
    console.log('\n=== Cross-Reference Validation Report ===\n');
    
    console.log('Statistics:');
    console.log(`  Total documents: ${results.stats.totalDocuments}`);
    console.log(`  Total references: ${results.stats.totalReferences}`);
    console.log(`  Broken references: ${results.stats.brokenReferences}`);
    console.log(`  Orphaned documents: ${results.stats.orphanedDocuments}`);
    console.log(`  Missing back-references: ${results.stats.missingBackReferences}`);
    
    const referenceRatio = results.stats.totalDocuments > 0 ? 
      (results.stats.totalReferences / results.stats.totalDocuments).toFixed(2) : 0;
    console.log(`  Average references per document: ${referenceRatio}`);

    if (results.errors.length > 0) {
      console.log('\n=== Errors ===\n');
      for (const error of results.errors) {
        console.log(`❌ ${error}`);
      }
    }

    if (results.warnings.length > 0) {
      console.log('\n=== Warnings ===\n');
      for (const warning of results.warnings) {
        console.log(`⚠️  ${warning}`);
      }
    }

    if (results.valid && results.warnings.length === 0) {
      console.log('\n✅ All cross-references are valid and complete!');
    }

    return results;
  }

  /**
   * Suggests missing cross-references based on content analysis
   */
  suggestCrossReferences() {
    const suggestions = [];

    for (const [docName, docInfo] of this.documents) {
      // Suggest references based on keyword overlap
      for (const [otherName, otherInfo] of this.documents) {
        if (docName === otherName) continue;

        const keywordOverlap = docInfo.keywords.filter(k => 
          otherInfo.keywords.some(ok => ok.toLowerCase().includes(k.toLowerCase()))
        );

        if (keywordOverlap.length >= 2) {
          const alreadyReferenced = docInfo.outgoingRefs.some(ref => 
            ref.document.toLowerCase().includes(otherInfo.title.toLowerCase())
          );

          if (!alreadyReferenced) {
            suggestions.push({
              source: docName,
              target: otherName,
              reason: `Keyword overlap: ${keywordOverlap.join(', ')}`,
              type: 'related'
            });
          }
        }
      }

      // Suggest cross-level references
      if (docInfo.level && docInfo.level !== 'Cross-Level') {
        const otherLevels = ['Individual', 'Group', 'Societal'].filter(l => l !== docInfo.level);
        
        for (const level of otherLevels) {
          const levelDocs = Array.from(this.documents.values()).filter(d => d.level === level);
          
          for (const levelDoc of levelDocs) {
            const sharedKeywords = docInfo.keywords.filter(k => 
              levelDoc.keywords.some(lk => lk.toLowerCase().includes(k.toLowerCase()))
            );

            if (sharedKeywords.length > 0) {
              const alreadyReferenced = docInfo.outgoingRefs.some(ref => 
                ref.document.toLowerCase().includes(levelDoc.title.toLowerCase())
              );

              if (!alreadyReferenced) {
                suggestions.push({
                  source: docName,
                  target: path.basename(levelDoc.path, '.md'),
                  reason: `Cross-level connection (${docInfo.level} → ${level}): ${sharedKeywords.join(', ')}`,
                  type: 'see'
                });
              }
            }
          }
        }
      }
    }

    return suggestions;
  }
}

// Export for testing
export { CrossReferenceValidator };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new CrossReferenceValidator();
  const docsDir = path.join(process.cwd(), 'docs');
  
  validator.scanDocuments(docsDir);
  const results = validator.validateCrossReferences();
  validator.generateReport(results);
  
  // Show suggestions if requested
  if (process.argv.includes('--suggest')) {
    const suggestions = validator.suggestCrossReferences();
    
    if (suggestions.length > 0) {
      console.log('\n=== Suggested Cross-References ===\n');
      for (const suggestion of suggestions.slice(0, 10)) { // Limit to top 10
        console.log(`💡 ${suggestion.source} → ${suggestion.target}`);
        console.log(`   Type: [${suggestion.type}] Reason: ${suggestion.reason}\n`);
      }
    }
  }
  
  process.exit(results.valid ? 0 : 1);
}