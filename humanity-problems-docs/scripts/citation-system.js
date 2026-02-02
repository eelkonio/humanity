import fs from 'fs';
import path from 'path';

/**
 * Academic citation system for humanity problems documentation
 * Manages and validates academic citations and references
 */
class CitationSystem {
  constructor() {
    this.citationFormats = {
      apa: /^([^,]+),\s*([^.]+)\.\s*\((\d{4})\)\.\s*([^.]+)\.\s*(.+)$/,
      mla: /^([^,]+),\s*([^.]+)\.\s*"([^"]+)"\.\s*([^,]+),\s*(\d{4})\.$/,
      chicago: /^([^,]+),\s*([^.]+)\.\s*"([^"]+)"\.\s*([^,]+)\s*(\d{4})\.$/
    };
    
    this.requiredCitationFields = ['author', 'title', 'year', 'publication'];
    this.citationDatabase = new Map();
  }

  /**
   * Validates citations in a document
   * @param {string} content - Document content
   * @returns {Object} Validation results
   */
  validateCitations(content) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      citations: [],
      inTextCitations: [],
      bibliography: []
    };

    // Extract in-text citations
    results.inTextCitations = this.extractInTextCitations(content);
    
    // Extract bibliography
    results.bibliography = this.extractBibliography(content);
    
    // Validate citation format
    this.validateCitationFormat(results.bibliography, results);
    
    // Validate in-text to bibliography matching
    this.validateCitationMatching(results.inTextCitations, results.bibliography, results);
    
    // Check for academic rigor indicators
    this.checkAcademicRigor(content, results);

    return results;
  }

  /**
   * Extracts in-text citations from content
   */
  extractInTextCitations(content) {
    const citations = [];
    
    // Pattern for (Author, Year) format
    const authorYearPattern = /\(([^,]+),\s*(\d{4})\)/g;
    let match;
    
    while ((match = authorYearPattern.exec(content)) !== null) {
      citations.push({
        type: 'author-year',
        author: match[1].trim(),
        year: match[2],
        position: match.index
      });
    }
    
    // Pattern for footnote references [^1]
    const footnotePattern = /\[\^([^\]]+)\]/g;
    while ((match = footnotePattern.exec(content)) !== null) {
      citations.push({
        type: 'footnote',
        id: match[1],
        position: match.index
      });
    }
    
    return citations;
  }

  /**
   * Extracts bibliography from References section
   */
  extractBibliography(content) {
    const bibliography = [];
    
    // Find References section
    const referencesMatch = content.match(/## References\s*\n([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (!referencesMatch) {
      return bibliography;
    }
    
    const referencesSection = referencesMatch[1];
    const lines = referencesSection.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        // Remove list markers
        const citation = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
        if (citation) {
          bibliography.push({
            raw: citation,
            parsed: this.parseCitation(citation)
          });
        }
      }
    }
    
    return bibliography;
  }

  /**
   * Parses a citation string to extract components
   */
  parseCitation(citation) {
    const parsed = {
      author: null,
      title: null,
      year: null,
      publication: null,
      format: 'unknown'
    };

    // Try different citation formats
    for (const [format, pattern] of Object.entries(this.citationFormats)) {
      const match = citation.match(pattern);
      if (match) {
        parsed.format = format;
        switch (format) {
          case 'apa':
            parsed.author = match[1];
            parsed.title = match[4];
            parsed.year = match[3];
            parsed.publication = match[5];
            break;
          case 'mla':
            parsed.author = match[1];
            parsed.title = match[3];
            parsed.year = match[5];
            parsed.publication = match[4];
            break;
          case 'chicago':
            parsed.author = match[1];
            parsed.title = match[3];
            parsed.year = match[5];
            parsed.publication = match[4];
            break;
        }
        break;
      }
    }

    // Fallback parsing for basic information
    if (parsed.format === 'unknown') {
      // Extract year
      const yearMatch = citation.match(/\((\d{4})\)|(\d{4})/);
      if (yearMatch) {
        parsed.year = yearMatch[1] || yearMatch[2];
      }
      
      // Extract author (first part before comma or period)
      const authorMatch = citation.match(/^([^,.]+)/);
      if (authorMatch) {
        parsed.author = authorMatch[1].trim();
      }
    }

    return parsed;
  }

  /**
   * Validates citation format consistency
   */
  validateCitationFormat(bibliography, results) {
    if (bibliography.length === 0) {
      results.warnings.push('No bibliography found in References section');
      return;
    }

    const formats = bibliography.map(b => b.parsed.format);
    const uniqueFormats = [...new Set(formats)];
    
    if (uniqueFormats.length > 1) {
      results.warnings.push(`Inconsistent citation formats found: ${uniqueFormats.join(', ')}`);
    }
    
    if (uniqueFormats.includes('unknown')) {
      const unknownCount = formats.filter(f => f === 'unknown').length;
      results.errors.push(`${unknownCount} citations could not be parsed - check formatting`);
      results.valid = false;
    }

    // Check for missing required fields
    for (const bib of bibliography) {
      const missing = this.requiredCitationFields.filter(field => !bib.parsed[field]);
      if (missing.length > 0) {
        results.warnings.push(`Citation missing fields: ${missing.join(', ')} - "${bib.raw.substring(0, 50)}..."`);
      }
    }
  }

  /**
   * Validates that in-text citations match bibliography entries
   */
  validateCitationMatching(inTextCitations, bibliography, results) {
    const bibAuthors = bibliography.map(b => b.parsed.author?.toLowerCase()).filter(Boolean);
    const bibYears = bibliography.map(b => b.parsed.year).filter(Boolean);
    
    for (const inText of inTextCitations) {
      if (inText.type === 'author-year') {
        const authorMatch = bibAuthors.some(author => 
          author.includes(inText.author.toLowerCase()) || 
          inText.author.toLowerCase().includes(author)
        );
        
        if (!authorMatch) {
          results.errors.push(`In-text citation author "${inText.author}" not found in bibliography`);
          results.valid = false;
        }
        
        if (!bibYears.includes(inText.year)) {
          results.warnings.push(`In-text citation year "${inText.year}" not found in bibliography`);
        }
      }
    }
    
    // Check for unused bibliography entries
    const usedAuthors = inTextCitations
      .filter(c => c.type === 'author-year')
      .map(c => c.author.toLowerCase());
    
    for (const bib of bibliography) {
      if (bib.parsed.author) {
        const isUsed = usedAuthors.some(used => 
          used.includes(bib.parsed.author.toLowerCase()) ||
          bib.parsed.author.toLowerCase().includes(used)
        );
        
        if (!isUsed) {
          results.warnings.push(`Bibliography entry not cited in text: "${bib.parsed.author}"`);
        }
      }
    }
  }

  /**
   * Checks for academic rigor indicators
   */
  checkAcademicRigor(content, results) {
    const rigorIndicators = {
      theoreticalFramework: /theoretical framework|theoretical model|conceptual framework/i,
      empiricalEvidence: /empirical evidence|research shows|studies indicate|data suggests/i,
      peerReviewed: /peer.?reviewed|journal|academic/i,
      methodology: /methodology|method|approach|analysis/i,
      limitations: /limitation|constraint|caveat|however|nevertheless/i
    };

    const foundIndicators = [];
    for (const [indicator, pattern] of Object.entries(rigorIndicators)) {
      if (pattern.test(content)) {
        foundIndicators.push(indicator);
      }
    }

    if (foundIndicators.length < 3) {
      results.warnings.push(`Limited academic rigor indicators found. Consider adding: ${
        Object.keys(rigorIndicators).filter(i => !foundIndicators.includes(i)).join(', ')
      }`);
    }

    // Check citation density
    const wordCount = content.split(/\s+/).length;
    const citationCount = results.inTextCitations.length;
    const citationDensity = citationCount / wordCount * 1000; // Citations per 1000 words
    
    if (citationDensity < 5) {
      results.warnings.push(`Low citation density (${citationDensity.toFixed(1)} per 1000 words). Consider adding more sources.`);
    }
  }

  /**
   * Generates citation suggestions based on content analysis
   */
  suggestCitations(content, discipline) {
    const suggestions = [];
    
    const disciplineKeywords = {
      'Psychology': ['cognitive', 'behavioral', 'psychological', 'mental', 'emotion'],
      'Sociology': ['social', 'society', 'group', 'community', 'culture'],
      'Anthropology': ['cultural', 'human', 'evolution', 'primitive', 'ritual'],
      'Political Science': ['political', 'government', 'policy', 'democracy', 'power'],
      'Economics': ['economic', 'market', 'financial', 'trade', 'wealth'],
      'History': ['historical', 'past', 'ancient', 'medieval', 'century'],
      'Philosophy': ['philosophical', 'ethics', 'moral', 'existence', 'meaning'],
      'Neuroscience': ['brain', 'neural', 'neuron', 'cognitive', 'neurological']
    };

    const keywords = disciplineKeywords[discipline] || [];
    const contentLower = content.toLowerCase();
    
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        suggestions.push({
          keyword,
          suggestion: `Consider citing foundational ${discipline.toLowerCase()} research on ${keyword}`,
          type: 'disciplinary'
        });
      }
    }

    // Suggest citations for unsupported claims
    const claimPatterns = [
      /research shows|studies indicate|evidence suggests/gi,
      /it is known that|it is established|it is clear/gi,
      /experts agree|scholars argue|researchers found/gi
    ];

    for (const pattern of claimPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        suggestions.push({
          pattern: pattern.source,
          suggestion: 'Unsupported claim detected - add specific citation',
          type: 'evidence'
        });
      }
    }

    return suggestions;
  }

  /**
   * Formats citation according to specified style
   */
  formatCitation(citationData, style = 'apa') {
    const { author, title, year, publication, pages, doi } = citationData;
    
    switch (style.toLowerCase()) {
      case 'apa':
        let apa = `${author} (${year}). ${title}. ${publication}`;
        if (pages) apa += `, ${pages}`;
        if (doi) apa += `. https://doi.org/${doi}`;
        return apa + '.';
        
      case 'mla':
        let mla = `${author}. "${title}." ${publication}`;
        if (pages) mla += `, ${pages}`;
        return mla + `, ${year}.`;
        
      case 'chicago':
        let chicago = `${author}. "${title}." ${publication}`;
        if (pages) chicago += `, ${pages}`;
        return chicago + ` (${year}).`;
        
      default:
        return `${author} (${year}). ${title}. ${publication}.`;
    }
  }
}

// Export for testing and use
export { CitationSystem };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const citationSystem = new CitationSystem();
  
  if (process.argv[2]) {
    const filePath = process.argv[2];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const results = citationSystem.validateCitations(content);
      
      console.log('\n=== Citation Validation Report ===\n');
      console.log(`In-text citations: ${results.inTextCitations.length}`);
      console.log(`Bibliography entries: ${results.bibliography.length}`);
      
      if (results.errors.length > 0) {
        console.log('\n=== Errors ===');
        for (const error of results.errors) {
          console.log(`❌ ${error}`);
        }
      }
      
      if (results.warnings.length > 0) {
        console.log('\n=== Warnings ===');
        for (const warning of results.warnings) {
          console.log(`⚠️  ${warning}`);
        }
      }
      
      if (results.valid && results.warnings.length === 0) {
        console.log('\n✅ All citations are properly formatted and complete!');
      }
    } else {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
  } else {
    console.log('Usage: node citation-system.js <markdown-file>');
    process.exit(1);
  }
}