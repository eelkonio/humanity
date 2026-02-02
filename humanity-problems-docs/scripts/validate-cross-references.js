#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CrossReferenceValidator {
    constructor(docsPath) {
        this.docsPath = docsPath;
        this.documents = new Map();
        this.crossReferences = new Map();
        this.brokenLinks = [];
        this.missingReferences = [];
        this.validationResults = {
            totalDocuments: 0,
            totalCrossReferences: 0,
            validReferences: 0,
            brokenReferences: 0,
            missingBackReferences: 0
        };
    }

    // Scan all markdown files and extract cross-references
    scanDocuments() {
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.')) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.md')) {
                    this.processDocument(fullPath);
                }
            }
        };
        
        scanDirectory(this.docsPath);
        this.validationResults.totalDocuments = this.documents.size;
    }

    // Process individual document and extract cross-references
    processDocument(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.docsPath, filePath);
        
        this.documents.set(relativePath, {
            path: filePath,
            content: content,
            title: this.extractTitle(content),
            internalLinks: this.extractInternalLinks(content),
            crossReferences: this.extractCrossReferences(content)
        });
    }

    // Extract document title
    extractTitle(content) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1] : 'Untitled';
    }

    // Extract internal markdown links
    extractInternalLinks(content) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [];
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const [fullMatch, text, url] = match;
            if (!url.startsWith('http') && !url.startsWith('#')) {
                links.push({
                    text: text,
                    url: url,
                    fullMatch: fullMatch
                });
            }
        }
        
        return links;
    }

    // Extract cross-reference patterns
    extractCrossReferences(content) {
        const patterns = [
            /\[See:\s*([^\]]+)\]/g,
            /\[Related:\s*([^\]]+)\]/g,
            /\[Compare:\s*([^\]]+)\]/g,
            /→\s*([^,\n]+)/g
        ];
        
        const references = [];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                references.push({
                    type: this.getRefType(match[0]),
                    reference: match[1].trim(),
                    fullMatch: match[0]
                });
            }
        }
        
        return references;
    }

    // Determine reference type
    getRefType(matchText) {
        if (matchText.includes('See:')) return 'see';
        if (matchText.includes('Related:')) return 'related';
        if (matchText.includes('Compare:')) return 'compare';
        if (matchText.includes('→')) return 'arrow';
        return 'unknown';
    }

    // Validate all cross-references
    validateReferences() {
        for (const [docPath, docData] of this.documents) {
            // Validate internal links
            for (const link of docData.internalLinks) {
                this.validateInternalLink(docPath, link);
            }
            
            // Validate cross-references
            for (const ref of docData.crossReferences) {
                this.validateCrossReference(docPath, ref);
            }
        }
        
        this.generateValidationReport();
    }

    // Validate individual internal link
    validateInternalLink(sourcePath, link) {
        const sourceDir = path.dirname(sourcePath);
        let targetPath;
        
        if (link.url.startsWith('../')) {
            targetPath = path.normalize(path.join(sourceDir, link.url));
        } else {
            targetPath = path.join(sourceDir, link.url);
        }
        
        // Check if target file exists
        const fullTargetPath = path.join(this.docsPath, targetPath);
        
        if (!fs.existsSync(fullTargetPath)) {
            this.brokenLinks.push({
                source: sourcePath,
                target: targetPath,
                linkText: link.text,
                type: 'broken_file'
            });
            this.validationResults.brokenReferences++;
        } else {
            this.validationResults.validReferences++;
        }
        
        this.validationResults.totalCrossReferences++;
    }

    // Validate cross-reference patterns
    validateCrossReference(sourcePath, ref) {
        // Parse reference format like "Category → Document"
        const parts = ref.reference.split('→').map(p => p.trim());
        
        if (parts.length === 2) {
            const [category, document] = parts;
            const expectedPath = this.findDocumentByName(category, document);
            
            if (!expectedPath) {
                this.missingReferences.push({
                    source: sourcePath,
                    reference: ref.reference,
                    type: ref.type,
                    category: category,
                    document: document
                });
                this.validationResults.brokenReferences++;
            } else {
                this.validationResults.validReferences++;
            }
        }
        
        this.validationResults.totalCrossReferences++;
    }

    // Find document by category and name
    findDocumentByName(category, documentName) {
        const categoryMap = {
            'Individual': 'individual',
            'Group': 'group',
            'Societal': 'societal',
            'Historical': 'historical',
            'Integrative': 'integrative',
            'Specialized': 'specialized'
        };
        
        const categoryPath = categoryMap[category] || category.toLowerCase();
        
        for (const [docPath, docData] of this.documents) {
            if (docPath.includes(`/${categoryPath}/`) && 
                (docData.title.includes(documentName) || 
                 path.basename(docPath, '.md').includes(documentName.toLowerCase().replace(/\s+/g, '-')))) {
                return docPath;
            }
        }
        
        return null;
    }

    // Generate comprehensive validation report
    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.validationResults,
            brokenLinks: this.brokenLinks,
            missingReferences: this.missingReferences,
            documentCoverage: this.analyzeDocumentCoverage(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    // Analyze document coverage in cross-references
    analyzeDocumentCoverage() {
        const coverage = new Map();
        
        for (const [docPath, docData] of this.documents) {
            coverage.set(docPath, {
                incomingReferences: 0,
                outgoingReferences: docData.crossReferences.length + docData.internalLinks.length,
                title: docData.title
            });
        }
        
        // Count incoming references
        for (const [docPath, docData] of this.documents) {
            for (const link of docData.internalLinks) {
                const targetPath = this.resolveRelativePath(docPath, link.url);
                if (coverage.has(targetPath)) {
                    coverage.get(targetPath).incomingReferences++;
                }
            }
        }
        
        return Array.from(coverage.entries()).map(([path, data]) => ({
            document: path,
            title: data.title,
            incomingReferences: data.incomingReferences,
            outgoingReferences: data.outgoingReferences,
            totalReferences: data.incomingReferences + data.outgoingReferences
        }));
    }

    // Resolve relative path
    resolveRelativePath(sourcePath, relativePath) {
        const sourceDir = path.dirname(sourcePath);
        return path.normalize(path.join(sourceDir, relativePath));
    }

    // Generate recommendations for improvement
    generateRecommendations() {
        const recommendations = [];
        
        if (this.brokenLinks.length > 0) {
            recommendations.push({
                type: 'broken_links',
                priority: 'high',
                message: `Fix ${this.brokenLinks.length} broken internal links`,
                details: this.brokenLinks.slice(0, 5) // Show first 5
            });
        }
        
        if (this.missingReferences.length > 0) {
            recommendations.push({
                type: 'missing_references',
                priority: 'medium',
                message: `Resolve ${this.missingReferences.length} missing cross-references`,
                details: this.missingReferences.slice(0, 5)
            });
        }
        
        // Check for isolated documents
        const coverage = this.analyzeDocumentCoverage();
        const isolatedDocs = coverage.filter(doc => doc.totalReferences < 2);
        
        if (isolatedDocs.length > 0) {
            recommendations.push({
                type: 'isolated_documents',
                priority: 'medium',
                message: `${isolatedDocs.length} documents have minimal cross-references`,
                details: isolatedDocs.slice(0, 5)
            });
        }
        
        return recommendations;
    }

    // Run complete validation
    run() {
        console.log('Starting cross-reference validation...');
        
        this.scanDocuments();
        console.log(`Found ${this.validationResults.totalDocuments} documents`);
        
        this.validateReferences();
        
        const report = this.generateValidationReport();
        
        // Write detailed report
        const reportPath = path.join(path.dirname(this.docsPath), 'cross-reference-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n=== Cross-Reference Validation Results ===');
        console.log(`Total Documents: ${report.summary.totalDocuments}`);
        console.log(`Total Cross-References: ${report.summary.totalCrossReferences}`);
        console.log(`Valid References: ${report.summary.validReferences}`);
        console.log(`Broken References: ${report.summary.brokenReferences}`);
        console.log(`Success Rate: ${((report.summary.validReferences / report.summary.totalCrossReferences) * 100).toFixed(1)}%`);
        
        if (report.brokenLinks.length > 0) {
            console.log(`\nBroken Links (${report.brokenLinks.length}):`);
            report.brokenLinks.slice(0, 10).forEach(link => {
                console.log(`  - ${link.source}: "${link.linkText}" → ${link.target}`);
            });
        }
        
        if (report.missingReferences.length > 0) {
            console.log(`\nMissing References (${report.missingReferences.length}):`);
            report.missingReferences.slice(0, 10).forEach(ref => {
                console.log(`  - ${ref.source}: ${ref.reference}`);
            });
        }
        
        console.log(`\nDetailed report saved to: ${reportPath}`);
        
        return report.summary.brokenReferences === 0;
    }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const docsPath = path.join(__dirname, '../docs');
    const validator = new CrossReferenceValidator(docsPath);
    const success = validator.run();
    process.exit(success ? 0 : 1);
}

export default CrossReferenceValidator;