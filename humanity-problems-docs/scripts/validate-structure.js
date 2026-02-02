import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

/**
 * Document structure validator for humanity problems documentation system
 * Validates that documents follow the required template structure and formatting
 */
class DocumentStructureValidator {
  constructor() {
    this.requiredSections = [
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
    ];
    
    this.requiredMetadata = [
      'Discipline',
      'Level', 
      'Keywords',
      'Related Documents'
    ];
    
    this.validLevels = ['Individual', 'Group', 'Societal', 'Cross-Level', 'Integrative'];
    this.validDisciplines = [
      'Psychology', 'Sociology', 'Anthropology', 'Political Science',
      'Economics', 'History', 'Philosophy', 'Religious Studies',
      'Neuroscience', 'Evolutionary Psychology', 'Cognitive Science'
    ];
  }

  /**
   * Validates a single markdown document
   * @param {string} filePath - Path to the markdown file
   * @returns {Object} Validation result with errors and warnings
   */
  validateDocument(filePath) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      file: filePath
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = md.parse(content, {});
      
      // Extract metadata and sections
      const metadata = this.extractMetadata(content);
      const sections = this.extractSections(tokens);
      
      // Validate metadata
      this.validateMetadata(metadata, result);
      
      // Validate sections
      this.validateSections(sections, result);
      
      // Validate cross-references
      this.validateCrossReferences(content, result);
      
      // Validate markdown features
      this.validateMarkdownFeatures(content, tokens, result);
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to read or parse file: ${error.message}`);
    }

    return result;
  }

  /**
   * Extracts metadata from document header
   */
  extractMetadata(content) {
    const metadata = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\*\*([^:]+):\*\*\s*(.+)$/);
      if (match) {
        metadata[match[1]] = match[2].trim();
      }
    }
    
    return metadata;
  }

  /**
   * Extracts section headings from markdown tokens
   */
  extractSections(tokens) {
    const sections = [];
    
    for (const token of tokens) {
      if (token.type === 'heading_open') {
        const nextToken = tokens[tokens.indexOf(token) + 1];
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

  /**
   * Validates document metadata
   */
  validateMetadata(metadata, result) {
    // Check required metadata fields
    for (const field of this.requiredMetadata) {
      if (!metadata[field]) {
        result.errors.push(`Missing required metadata field: ${field}`);
        result.valid = false;
      }
    }

    // Validate level
    if (metadata.Level && !this.validLevels.includes(metadata.Level)) {
      result.errors.push(`Invalid level: ${metadata.Level}. Must be one of: ${this.validLevels.join(', ')}`);
      result.valid = false;
    }

    // Validate discipline
    if (metadata.Discipline && !this.validDisciplines.includes(metadata.Discipline)) {
      result.warnings.push(`Discipline '${metadata.Discipline}' not in standard list. Consider using: ${this.validDisciplines.join(', ')}`);
    }

    // Validate keywords format
    if (metadata.Keywords && !metadata.Keywords.includes(',')) {
      result.warnings.push('Keywords should be comma-separated for consistency');
    }
  }

  /**
   * Validates document sections
   */
  validateSections(sections, result) {
    const sectionTitles = sections.map(s => s.title);
    
    // Check for required sections
    for (const required of this.requiredSections) {
      if (!sectionTitles.includes(required)) {
        result.errors.push(`Missing required section: ${required}`);
        result.valid = false;
      }
    }

    // Check section hierarchy
    let currentLevel = 0;
    for (const section of sections) {
      if (section.level > currentLevel + 1) {
        result.warnings.push(`Section hierarchy skip detected: ${section.title} (level ${section.level})`);
      }
      currentLevel = section.level;
    }
  }

  /**
   * Validates cross-references format
   */
  validateCrossReferences(content, result) {
    // Check for proper cross-reference format
    const crossRefPattern = /\[(?:See|Related|Compare):\s*[^→]+\s*→\s*[^\]]+\]/g;
    const matches = content.match(crossRefPattern) || [];
    
    if (matches.length === 0) {
      result.warnings.push('No cross-references found. Consider adding references to related documents.');
    }

    // Check for malformed cross-references
    const malformedPattern = /\[(?:See|Related|Compare):[^\]]*\]/g;
    const allRefs = content.match(malformedPattern) || [];
    
    if (allRefs.length > matches.length) {
      result.errors.push('Malformed cross-references detected. Use format: [See: Category → Document]');
      result.valid = false;
    }
  }

  /**
   * Validates advanced markdown features usage
   */
  validateMarkdownFeatures(content, tokens, result) {
    const features = {
      tables: false,
      diagrams: false,
      footnotes: false,
      blockquotes: false,
      lists: false
    };

    // Check for tables
    if (tokens.some(t => t.type === 'table_open')) {
      features.tables = true;
    }

    // Check for Mermaid diagrams
    if (content.includes('```mermaid')) {
      features.diagrams = true;
    }

    // Check for footnotes
    if (content.match(/\[\^[^\]]+\]/)) {
      features.footnotes = true;
    }

    // Check for blockquotes
    if (tokens.some(t => t.type === 'blockquote_open')) {
      features.blockquotes = true;
    }

    // Check for lists
    if (tokens.some(t => t.type === 'bullet_list_open' || t.type === 'ordered_list_open')) {
      features.lists = true;
    }

    // Warn if advanced features are missing
    const missingFeatures = Object.entries(features)
      .filter(([_, used]) => !used)
      .map(([feature, _]) => feature);

    if (missingFeatures.length > 0) {
      result.warnings.push(`Consider using advanced markdown features: ${missingFeatures.join(', ')}`);
    }
  }

  /**
   * Validates all documents in the docs directory
   */
  validateAllDocuments() {
    const docsDir = path.join(process.cwd(), 'docs');
    const results = [];

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md') && file !== 'README.md') {
          results.push(this.validateDocument(filePath));
        }
      }
    };

    if (fs.existsSync(docsDir)) {
      walkDir(docsDir);
    }

    return results;
  }

  /**
   * Generates validation report
   */
  generateReport(results) {
    const totalFiles = results.length;
    const validFiles = results.filter(r => r.valid).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    console.log('\n=== Document Structure Validation Report ===\n');
    console.log(`Files validated: ${totalFiles}`);
    console.log(`Valid files: ${validFiles}`);
    console.log(`Files with errors: ${totalFiles - validFiles}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);

    if (totalErrors > 0 || totalWarnings > 0) {
      console.log('\n=== Issues Found ===\n');
      
      for (const result of results) {
        if (result.errors.length > 0 || result.warnings.length > 0) {
          console.log(`File: ${result.file}`);
          
          for (const error of result.errors) {
            console.log(`  ❌ ERROR: ${error}`);
          }
          
          for (const warning of result.warnings) {
            console.log(`  ⚠️  WARNING: ${warning}`);
          }
          
          console.log('');
        }
      }
    }

    return {
      totalFiles,
      validFiles,
      totalErrors,
      totalWarnings,
      success: totalErrors === 0
    };
  }
}

// Export for testing
export { DocumentStructureValidator };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DocumentStructureValidator();
  const results = validator.validateAllDocuments();
  const report = validator.generateReport(results);
  
  process.exit(report.success ? 0 : 1);
}