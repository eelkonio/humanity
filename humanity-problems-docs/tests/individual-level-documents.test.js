import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Individual-Level Documents Unit Tests', () => {
  const docsPath = path.join(process.cwd(), 'docs', 'individual');
  
  // Test specific examples and edge cases for individual-level documents
  // Requirements: 7.1

  describe('Psychological Pathology Document', () => {
    let content;

    beforeEach(() => {
      const filePath = path.join(docsPath, 'psychological-pathology.md');
      content = fs.readFileSync(filePath, 'utf8');
    });

    it('should include DSM-5 diagnostic categories with prevalence data', () => {
      // Test specific example: DSM-5 categories must be present
      expect(content).toContain('DSM-5 Diagnostic Categories');
      expect(content).toContain('Neurodevelopmental');
      expect(content).toContain('Mood');
      expect(content).toContain('Anxiety');
      expect(content).toContain('Personality');
      
      // Test prevalence data is included
      expect(content).toMatch(/\d+\.\d+%/); // Should contain percentage values
      expect(content).toContain('Lifetime Prevalence');
      expect(content).toContain('Annual Prevalence');
    });

    it('should contain personality disorder clusters with specific examples', () => {
      // Test specific examples of personality disorder clusters
      expect(content).toContain('Cluster A');
      expect(content).toContain('Cluster B');
      expect(content).toContain('Cluster C');
      
      // Test specific disorders are mentioned
      expect(content).toContain('Borderline PD');
      expect(content).toContain('Narcissistic PD');
      expect(content).toContain('Antisocial PD');
    });

    it('should include treatment effectiveness data with specific success rates', () => {
      // Test treatment outcome tables with specific data
      expect(content).toContain('Response Rate');
      expect(content).toContain('Remission Rate');
      expect(content).toContain('Relapse Rate');
      
      // Test specific treatment modalities
      expect(content).toContain('CBT');
      expect(content).toContain('DBT');
      expect(content).toContain('Schema Therapy');
    });

    it('should contain case study examples with detailed symptom profiles', () => {
      // Test that case studies are present with specific details
      expect(content).toContain('Case Study');
      expect(content).toContain('Background');
      expect(content).toContain('Symptom Profile');
      expect(content).toContain('Treatment History');
      expect(content).toContain('Outcome');
    });

    it('should handle edge case of treatment-resistant conditions', () => {
      // Test edge case: treatment resistance
      expect(content).toContain('treatment-resistant');
      expect(content).toContain('Treatment Resistance Factors');
      expect(content).toContain('multiple medication trials');
    });
  });

  describe('Behavioral Economics Document', () => {
    let content;

    beforeEach(() => {
      const filePath = path.join(docsPath, 'behavioral-economics.md');
      content = fs.readFileSync(filePath, 'utf8');
    });

    it('should include prospect theory components with mathematical relationships', () => {
      // Test specific example: Prospect theory must be explained
      expect(content).toContain('Prospect Theory');
      expect(content).toContain('Value Function');
      expect(content).toContain('Probability Weighting');
      expect(content).toContain('Loss Aversion');
      
      // Test mathematical relationships
      expect(content).toMatch(/2\.\d+:1/); // Loss aversion ratio
    });

    it('should contain specific economic bias examples with real-world impacts', () => {
      // Test specific biases with examples
      expect(content).toContain('Anchoring');
      expect(content).toContain('Availability Heuristic');
      expect(content).toContain('Overconfidence');
      expect(content).toContain('Herding');
      
      // Test real-world impact data
      expect(content).toContain('annual return');
      expect(content).toContain('Performance Impact');
    });

    it('should include market anomaly data with persistence timeframes', () => {
      // Test market anomalies with specific timeframes
      expect(content).toContain('Momentum');
      expect(content).toContain('Reversal');
      expect(content).toContain('Size Effect');
      expect(content).toContain('Value Effect');
      
      // Test persistence data
      expect(content).toMatch(/\d+\+ years/);
    });

    it('should contain subprime crisis case study with behavioral factors', () => {
      // Test specific historical example
      expect(content).toContain('Subprime Mortgage Crisis');
      expect(content).toContain('Behavioral Factors');
      expect(content).toContain('trillion');
      expect(content).toContain('foreclosures');
    });

    it('should handle edge case of policy intervention effectiveness', () => {
      // Test edge case: policy interventions
      expect(content).toContain('Nudge Interventions');
      expect(content).toContain('Auto-enrollment');
      expect(content).toContain('Effectiveness');
      expect(content).toContain('Implementation Challenges');
    });
  });

  describe('Existential Psychology Document', () => {
    let content;

    beforeEach(() => {
      const filePath = path.join(docsPath, 'existential-psychology.md');
      content = fs.readFileSync(filePath, 'utf8');
    });

    it('should include the four ultimate concerns with specific manifestations', () => {
      // Test specific example: Four ultimate concerns
      expect(content).toContain('Death');
      expect(content).toContain('Meaninglessness');
      expect(content).toContain('Isolation');
      expect(content).toContain('Freedom');
      
      // Test specific manifestations
      expect(content).toContain('Mortality Salience');
      expect(content).toContain('Purpose Vacuum');
      expect(content).toContain('Existential Loneliness');
      expect(content).toContain('Choice Paralysis');
    });

    it('should contain terror management theory components', () => {
      // Test specific theoretical framework
      expect(content).toContain('Terror Management Theory');
      expect(content).toContain('Cultural Worldview');
      expect(content).toContain('Self-Esteem');
      expect(content).toContain('Close Relationships');
      expect(content).toContain('Meaning-Making');
    });

    it('should include historical examples of existential crises', () => {
      // Test specific historical examples
      expect(content).toContain('Friedrich Nietzsche');
      expect(content).toContain('Virginia Woolf');
      expect(content).toContain('Lost Generation');
      expect(content).toContain('1960s Counterculture');
      
      // Test crisis elements
      expect(content).toContain('God is dead');
      expect(content).toContain('World War I');
    });

    it('should contain philosophical framework comparisons', () => {
      // Test philosophical frameworks
      expect(content).toContain('Kierkegaard');
      expect(content).toContain('Sartre');
      expect(content).toContain('Camus');
      expect(content).toContain('Heidegger');
      
      // Test framework concepts
      expect(content).toContain('leap of faith');
      expect(content).toContain('bad faith');
      expect(content).toContain('absurd');
      expect(content).toContain('Being-toward-death');
    });

    it('should handle edge case of digital age existential challenges', () => {
      // Test edge case: modern existential issues
      expect(content).toContain('Digital Age');
      expect(content).toContain('Social Media');
      expect(content).toContain('Information Overload');
      expect(content).toContain('Virtual Reality');
      expect(content).toContain('Climate Change');
    });
  });

  describe('Addiction and Compulsion Document', () => {
    let content;

    beforeEach(() => {
      const filePath = path.join(docsPath, 'addiction-compulsion.md');
      content = fs.readFileSync(filePath, 'utf8');
    });

    it('should include brain reward system components with neurotransmitter details', () => {
      // Test specific neurobiological components
      expect(content).toContain('Ventral Tegmental Area');
      expect(content).toContain('Nucleus Accumbens');
      expect(content).toContain('Prefrontal Cortex');
      expect(content).toContain('Dopamine');
      
      // Test reward system functions
      expect(content).toContain('Reward Processing');
      expect(content).toContain('Executive Control');
      expect(content).toContain('Motivation Signal');
    });

    it('should contain substance categories with addiction potential ratings', () => {
      // Test substance classifications
      expect(content).toContain('Alcohol');
      expect(content).toContain('Opioids');
      expect(content).toContain('Stimulants');
      expect(content).toContain('Cannabis');
      expect(content).toContain('Nicotine');
      
      // Test addiction potential ratings
      expect(content).toContain('Very high');
      expect(content).toContain('High');
      expect(content).toContain('Moderate');
    });

    it('should include medication-assisted treatment options with effectiveness data', () => {
      // Test MAT options
      expect(content).toContain('Methadone');
      expect(content).toContain('Buprenorphine');
      expect(content).toContain('Naltrexone');
      expect(content).toContain('Naloxone');
      
      // Test effectiveness percentages
      expect(content).toMatch(/\d+-\d+% retention/);
    });

    it('should contain economic burden data with specific cost categories', () => {
      // Test economic impact data
      expect(content).toContain('Healthcare Costs');
      expect(content).toContain('Criminal Justice');
      expect(content).toContain('Lost Productivity');
      expect(content).toContain('billion');
      
      // Test specific substances
      expect(content).toContain('$249 billion'); // Alcohol total
      expect(content).toContain('$300 billion'); // Tobacco total
    });

    it('should handle edge case of behavioral addictions without substances', () => {
      // Test edge case: behavioral addictions
      expect(content).toContain('Behavioral Addictions');
      expect(content).toContain('Gambling');
      expect(content).toContain('Gaming');
      expect(content).toContain('Internet');
      expect(content).toContain('Shopping');
      
      // Test neurobiological similarity
      expect(content).toContain('Dopamine dysregulation');
      expect(content).toContain('Reward system activation');
    });
  });

  describe('Cognitive Biases and Heuristics Document', () => {
    let content;

    beforeEach(() => {
      const filePath = path.join(docsPath, 'cognitive-biases-heuristics.md');
      content = fs.readFileSync(filePath, 'utf8');
    });

    it('should include dual-process theory with System 1 and System 2 characteristics', () => {
      // Test dual-process theory components
      expect(content).toContain('System 1');
      expect(content).toContain('System 2');
      expect(content).toContain('Fast');
      expect(content).toContain('Slow');
      expect(content).toContain('Automatic');
      expect(content).toContain('Controlled');
    });

    it('should contain major bias categories with specific examples', () => {
      // Test major bias categories
      expect(content).toContain('Availability Heuristic');
      expect(content).toContain('Representativeness');
      expect(content).toContain('Anchoring');
      expect(content).toContain('Confirmation');
      expect(content).toContain('Overconfidence');
      
      // Test specific manifestations
      expect(content).toContain('Base Rate Neglect');
      expect(content).toContain('Conjunction Fallacy');
      expect(content).toContain('Dunning-Kruger');
    });

    it('should include domain-specific applications with error rates', () => {
      // Test domain applications
      expect(content).toContain('Medical Decision-Making');
      expect(content).toContain('Financial Decision-Making');
      expect(content).toContain('Political');
      
      // Test error manifestations
      expect(content).toContain('Diagnostic errors');
      expect(content).toContain('Investment');
      expect(content).toContain('Voter biases');
    });

    it('should contain debiasing strategies with effectiveness ratings', () => {
      // Test debiasing approaches
      expect(content).toContain('Education');
      expect(content).toContain('Training');
      expect(content).toContain('Incentives');
      expect(content).toContain('Accountability');
      
      // Test effectiveness data
      expect(content).toMatch(/\d+-\d+%/); // Success rate percentages
      expect(content).toContain('Success Rate');
    });

    it('should handle edge case of bias interactions and compound effects', () => {
      // Test edge case: bias interactions
      expect(content).toContain('Bias Cascades');
      expect(content).toContain('Amplification');
      expect(content).toContain('Echo Chamber');
      expect(content).toContain('Polarization');
      
      // Test compound effects
      expect(content).toContain('Reinforcement');
      expect(content).toContain('Social Reinforcement');
    });
  });

  describe('Cross-Document Integration Tests', () => {
    it('should have consistent cross-references between individual-level documents', () => {
      const files = [
        'psychological-pathology.md',
        'behavioral-economics.md', 
        'existential-psychology.md',
        'addiction-compulsion.md',
        'cognitive-biases-heuristics.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test cross-reference format
        expect(content).toMatch(/\*See also:/);
        expect(content).toMatch(/\[.+\]\(.+\)/); // Link format
        
        // Test navigation elements
        expect(content).toContain('---');
        expect(content).toContain('*See also:');
      });
    });

    it('should maintain consistent academic formatting across documents', () => {
      const files = [
        'psychological-pathology.md',
        'behavioral-economics.md',
        'existential-psychology.md', 
        'addiction-compulsion.md',
        'cognitive-biases-heuristics.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test required sections
        expect(content).toContain('## Abstract');
        expect(content).toContain('## Introduction');
        expect(content).toContain('## Conclusion');
        expect(content).toContain('## References');
        
        // Test academic elements
        expect(content).toContain('```mermaid');
        expect(content).toMatch(/\| .+ \| .+ \|/); // Table format
      });
    });

    it('should reference foundational documents appropriately', () => {
      const files = [
        'psychological-pathology.md',
        'behavioral-economics.md',
        'existential-psychology.md',
        'addiction-compulsion.md', 
        'cognitive-biases-heuristics.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should reference at least one foundational document
        const foundationalRefs = [
          'Cognitive Architecture',
          'Evolutionary Foundations', 
          'Neurobiological Constraints',
          'cognitive-architecture',
          'evolutionary-foundations',
          'neurobiological-constraints'
        ];
        
        const hasFoundationalRef = foundationalRefs.some(ref => 
          content.includes(ref)
        );
        
        expect(hasFoundationalRef).toBe(true);
      });
    });
  });

  describe('Content Quality Tests', () => {
    it('should contain sufficient academic depth in all documents', () => {
      const files = [
        'psychological-pathology.md',
        'behavioral-economics.md',
        'existential-psychology.md',
        'addiction-compulsion.md',
        'cognitive-biases-heuristics.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test minimum content length (academic rigor)
        expect(content.length).toBeGreaterThan(15000);
        
        // Test academic vocabulary usage
        const academicTerms = [
          'systematic', 'empirical', 'theoretical', 'framework',
          'methodology', 'analysis', 'evidence', 'research',
          'comprehensive', 'dysfunction', 'pathology', 'mechanisms'
        ];
        
        const academicTermCount = academicTerms.filter(term => 
          content.toLowerCase().includes(term)
        ).length;
        
        expect(academicTermCount).toBeGreaterThanOrEqual(4);
      });
    });

    it('should include quantitative data and statistics where appropriate', () => {
      const files = [
        'behavioral-economics.md',
        'addiction-compulsion.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test for quantitative data
        expect(content).toMatch(/\d+\.\d+%/); // Percentages
        expect(content).toMatch(/\$\d+/); // Dollar amounts (where relevant)
        expect(content).toMatch(/\d+:\d+/); // Ratios
      });
      
      // Test psychological pathology for percentages and dollar amounts
      const psychPath = path.join(docsPath, 'psychological-pathology.md');
      const psychContent = fs.readFileSync(psychPath, 'utf8');
      expect(psychContent).toMatch(/\d+\.\d+%/); // Percentages
      expect(psychContent).toMatch(/\$\d+/); // Dollar amounts
    });

    it('should demonstrate advanced markdown features as required', () => {
      const files = [
        'psychological-pathology.md',
        'behavioral-economics.md',
        'existential-psychology.md',
        'addiction-compulsion.md',
        'cognitive-biases-heuristics.md'
      ];

      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test advanced markdown features
        expect(content).toContain('```mermaid'); // Mermaid diagrams
        expect(content).toMatch(/\| .+ \| .+ \|/); // Tables
        expect(content).toMatch(/\*\*.+\*\*/); // Bold text
        expect(content).toMatch(/\[.+\]\(.+\)/); // Links
        
        // Test hierarchical structure
        expect(content).toMatch(/^### /m); // Third-level headers
        expect(content).toMatch(/^#### /m); // Fourth-level headers
      });
    });
  });
});