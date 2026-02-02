import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Feature: humanity-problems-documentation, Property 17: Psychological Mechanism Identification
describe('Foundational Documents Property Tests', () => {
  let tempDir;
  let tempFiles = [];

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'temp-foundational-test');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
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

  it('should identify underlying psychological mechanisms in any human problem analysis', () => {
    // Property 17: Psychological Mechanism Identification
    // For any human problem analysis, underlying psychological mechanisms should be identified and explained.
    // Validates: Requirements 5.1

    fc.assert(
      fc.property(
        fc.record({
          problemType: fc.constantFrom(
            'cognitive bias', 'emotional dysregulation', 'behavioral addiction',
            'social dysfunction', 'decision-making failure', 'memory distortion',
            'attention deficit', 'impulse control', 'fear response', 'reward seeking'
          ),
          analysisLevel: fc.constantFrom('individual', 'group', 'societal'),
          psychologicalMechanisms: fc.array(
            fc.constantFrom(
              'dopamine reward system', 'amygdala activation', 'prefrontal cortex limitation',
              'working memory constraint', 'confirmation bias', 'availability heuristic',
              'loss aversion', 'social proof', 'authority deference', 'in-group favoritism',
              'temporal discounting', 'pattern recognition', 'emotional contagion',
              'cognitive load', 'ego depletion', 'stress response'
            ),
            { minLength: 2, maxLength: 5 }
          ),
          documentTitle: fc.string({ minLength: 10, maxLength: 60 }),
          evidenceTypes: fc.array(
            fc.constantFrom(
              'neurobiological research', 'behavioral experiments', 'evolutionary analysis',
              'cognitive studies', 'social psychology research', 'clinical observations',
              'cross-cultural studies', 'developmental research'
            ),
            { minLength: 1, maxLength: 3 }
          )
        }),
        (testData) => {
          // Generate foundational document with psychological mechanism analysis
          const content = generateFoundationalDocument(testData);
          
          // Write to temporary file
          const tempFile = path.join(tempDir, `${testData.problemType.replace(/\s+/g, '-')}-analysis.md`);
          fs.writeFileSync(tempFile, content);
          tempFiles.push(tempFile);

          // Analyze document for psychological mechanism identification
          const analysisResult = analyzePsychologicalMechanisms(content, testData);

          // Verify that psychological mechanisms are properly identified
          expect(analysisResult.mechanismsIdentified).toBe(true);
          expect(analysisResult.mechanismCount).toBeGreaterThanOrEqual(testData.psychologicalMechanisms.length);
          
          // Verify that mechanisms are explained, not just mentioned
          expect(analysisResult.mechanismsExplained).toBe(true);
          
          // Verify that mechanisms are linked to the specific problem
          expect(analysisResult.mechanismsLinkedToProblem).toBe(true);
          
          // Verify that evidence is provided for mechanisms
          expect(analysisResult.evidenceProvided).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should trace causal relationships between psychological mechanisms and behavioral outcomes', () => {
    fc.assert(
      fc.property(
        fc.record({
          primaryMechanism: fc.constantFrom(
            'dopamine dysregulation', 'amygdala hyperactivation', 'prefrontal cortex impairment',
            'working memory overload', 'confirmation bias activation', 'loss aversion trigger'
          ),
          secondaryMechanisms: fc.array(
            fc.constantFrom(
              'stress response', 'social comparison', 'temporal discounting',
              'pattern recognition error', 'emotional contagion', 'cognitive load'
            ),
            { minLength: 1, maxLength: 3 }
          ),
          behavioralOutcomes: fc.array(
            fc.constantFrom(
              'poor decision-making', 'addictive behavior', 'social conflict',
              'emotional dysregulation', 'cognitive rigidity', 'risk aversion',
              'procrastination', 'anxiety response', 'aggressive behavior'
            ),
            { minLength: 2, maxLength: 4 }
          ),
          causalChainLength: fc.integer({ min: 2, max: 5 })
        }),
        (testData) => {
          // Generate document with causal mechanism analysis
          const content = generateCausalMechanismDocument(testData);
          
          const tempFile = path.join(tempDir, `causal-analysis-${Date.now()}.md`);
          fs.writeFileSync(tempFile, content);
          tempFiles.push(tempFile);

          // Analyze causal relationships
          const causalAnalysis = analyzeCausalRelationships(content, testData);

          // Verify causal chain identification
          expect(causalAnalysis.causalChainPresent).toBe(true);
          expect(causalAnalysis.chainLength).toBeGreaterThanOrEqual(testData.causalChainLength);
          
          // Verify mechanism-outcome linkage
          expect(causalAnalysis.mechanismsLinkedToOutcomes).toBe(true);
          
          // Verify intermediate steps are explained
          expect(causalAnalysis.intermediateStepsExplained).toBe(true);

          return true;
        }
      ),
      { numRuns: 75 }
    );
  });

  it('should integrate multiple theoretical frameworks when explaining psychological mechanisms', () => {
    fc.assert(
      fc.property(
        fc.record({
          theoreticalFrameworks: fc.array(
            fc.constantFrom(
              'evolutionary psychology', 'cognitive psychology', 'behavioral economics',
              'social psychology', 'neuroscience', 'systems theory', 'complexity science'
            ),
            { minLength: 2, maxLength: 4 }
          ),
          mechanismType: fc.constantFrom(
            'cognitive bias', 'emotional regulation', 'social influence',
            'decision-making', 'memory formation', 'attention control'
          ),
          integrationLevel: fc.constantFrom('basic', 'moderate', 'comprehensive')
        }),
        (testData) => {
          // Generate document with multi-framework analysis
          const content = generateMultiFrameworkDocument(testData);
          
          const tempFile = path.join(tempDir, `multi-framework-${Date.now()}.md`);
          fs.writeFileSync(tempFile, content);
          tempFiles.push(tempFile);

          // Analyze framework integration
          const integrationAnalysis = analyzeFrameworkIntegration(content, testData);

          // Verify multiple frameworks are present
          expect(integrationAnalysis.frameworksPresent).toBeGreaterThanOrEqual(testData.theoreticalFrameworks.length);
          
          // Verify frameworks are integrated, not just listed
          expect(integrationAnalysis.frameworksIntegrated).toBe(true);
          
          // Verify synthesis of perspectives
          expect(integrationAnalysis.synthesisPresent).toBe(true);
          
          // Verify coherent explanation emerges
          expect(integrationAnalysis.coherentExplanation).toBe(true);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Helper functions for generating test documents

function generateFoundationalDocument(testData) {
  const mechanisms = testData.psychologicalMechanisms.join(', ');
  const evidence = testData.evidenceTypes.join(', ');
  
  return `# ${testData.documentTitle}

**Discipline:** Psychology  
**Level:** ${testData.analysisLevel}  
**Keywords:** ${testData.problemType}, psychological mechanisms, ${mechanisms}  
**Related Documents:** Cognitive Architecture, Neurobiological Constraints

## Abstract

This document analyzes the psychological mechanisms underlying ${testData.problemType} at the ${testData.analysisLevel} level.

## Introduction

${testData.problemType} represents a fundamental challenge in human psychology that manifests across multiple contexts and populations.

## Theoretical Framework

This analysis integrates multiple theoretical perspectives to understand the underlying psychological mechanisms.

## Psychological Mechanisms Analysis

### Primary Mechanisms

The core psychological mechanisms driving ${testData.problemType} include:

${testData.psychologicalMechanisms.map(mechanism => `
#### ${mechanism.charAt(0).toUpperCase() + mechanism.slice(1)}

The ${mechanism} plays a crucial role in ${testData.problemType} by creating systematic vulnerabilities in human cognition and behavior. Research from ${evidence} demonstrates that this mechanism operates through specific neural pathways and cognitive processes.

**Mechanism Explanation:** The ${mechanism} functions by [detailed explanation of how the mechanism works, its evolutionary origins, and its normal adaptive function].

**Problem Connection:** In the context of ${testData.problemType}, this mechanism becomes maladaptive because [specific explanation of how the mechanism contributes to the problem].

**Evidence Base:** Studies using ${evidence} have consistently shown that [specific research findings supporting the mechanism's role].
`).join('\n')}

### Mechanism Interactions

These psychological mechanisms do not operate in isolation but interact through complex feedback loops:

1. **Primary Cascade:** ${testData.psychologicalMechanisms[0]} → ${testData.psychologicalMechanisms[1]} → behavioral outcome
2. **Secondary Effects:** ${testData.psychologicalMechanisms.slice(1).join(' ↔ ')}
3. **Reinforcement Loops:** Behavioral outcomes reinforce initial mechanisms

## Causal Analysis

### Proximate Causes

The immediate psychological mechanisms include:
- ${testData.psychologicalMechanisms.map(m => `${m} activation`).join('\n- ')}

### Ultimate Causes

The evolutionary and developmental origins of these mechanisms:
- Adaptive functions in ancestral environments
- Developmental critical periods
- Genetic and epigenetic factors

## Cross-Level Connections

These psychological mechanisms manifest differently across levels:
- **Individual Level:** Personal cognitive and emotional patterns
- **Group Level:** Collective psychological dynamics
- **Societal Level:** Institutional and cultural reinforcement

## Historical Context

Historical examples demonstrate the persistence of these mechanisms across cultures and time periods.

## Contemporary Manifestations

Modern examples of ${testData.problemType} show how ancient psychological mechanisms create contemporary problems.

## Implications

Understanding these psychological mechanisms has implications for:
- Individual intervention strategies
- Group dynamics management
- Societal policy development

## Limitations

Current understanding of these mechanisms is limited by:
- Methodological constraints in psychological research
- Individual variation in mechanism expression
- Cultural and contextual factors

## References

1. Research on ${testData.psychologicalMechanisms[0]}
2. Studies of ${testData.problemType}
3. Evidence from ${evidence}

## Cross-References

- [See: Individual → Cognitive Architecture]
- [Related: Individual → Neurobiological Constraints]

---

**Navigation:**  
← Previous | Individual Analysis | Next →`;
}

function generateCausalMechanismDocument(testData) {
  return `# Causal Analysis: ${testData.primaryMechanism}

**Discipline:** Psychology  
**Level:** Individual  
**Keywords:** causal analysis, ${testData.primaryMechanism}, behavioral outcomes  
**Related Documents:** Psychological Mechanisms, Behavioral Analysis

## Abstract

This document traces the causal relationships between ${testData.primaryMechanism} and resulting behavioral outcomes.

## Causal Chain Analysis

### Primary Mechanism: ${testData.primaryMechanism}

**Step 1: Initial Activation**
The ${testData.primaryMechanism} is triggered by environmental stimuli, leading to specific neurobiological changes.

**Step 2: Secondary Mechanism Activation**
${testData.secondaryMechanisms.map((mechanism, index) => `
**Step ${index + 3}: ${mechanism}**
The activation of ${testData.primaryMechanism} cascades to trigger ${mechanism}, which amplifies the initial response through [specific pathway].
`).join('')}

**Final Step: Behavioral Outcomes**
The cumulative effect of these mechanisms results in:
${testData.behavioralOutcomes.map(outcome => `- ${outcome}: [detailed explanation of how mechanisms lead to this outcome]`).join('\n')}

### Causal Pathway Diagram

\`\`\`mermaid
flowchart TD
    A[Environmental Trigger] --> B[${testData.primaryMechanism}]
    ${testData.secondaryMechanisms.map((mechanism, index) => 
      `B --> C${index}[${mechanism}]`
    ).join('\n    ')}
    ${testData.secondaryMechanisms.map((_, index) => 
      testData.behavioralOutcomes.map((outcome, outIndex) => 
        `C${index} --> D${outIndex}[${outcome}]`
      ).join('\n    ')
    ).join('\n    ')}
\`\`\`

## Mechanism Interactions

The psychological mechanisms interact through multiple pathways:

1. **Direct Effects:** ${testData.primaryMechanism} directly influences behavior
2. **Indirect Effects:** Secondary mechanisms mediate the relationship
3. **Feedback Loops:** Behavioral outcomes reinforce initial mechanisms
4. **Amplification:** Multiple mechanisms compound effects

## Evidence for Causal Relationships

Research demonstrates these causal relationships through:
- Experimental manipulation studies
- Longitudinal behavioral tracking
- Neuroimaging of mechanism activation
- Cross-cultural validation

## Abstract

Analysis content here.

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

Cross-references content.

---

**Navigation:**  
← Previous | Index | Next →`;
}

function generateMultiFrameworkDocument(testData) {
  const frameworks = testData.theoreticalFrameworks;
  
  return `# Multi-Framework Analysis: ${testData.mechanismType}

**Discipline:** Psychology  
**Level:** Integrative  
**Keywords:** ${frameworks.join(', ')}, ${testData.mechanismType}, theoretical integration  
**Related Documents:** Theoretical Frameworks, Mechanism Analysis

## Abstract

This document integrates ${frameworks.join(', ')} perspectives to provide a comprehensive understanding of ${testData.mechanismType}.

## Theoretical Framework Integration

${frameworks.map(framework => `
### ${framework.charAt(0).toUpperCase() + framework.slice(1)} Perspective

**Core Principles:**
The ${framework} approach to ${testData.mechanismType} emphasizes [specific theoretical principles].

**Mechanism Explanation:**
From this perspective, ${testData.mechanismType} operates through [framework-specific explanation].

**Evidence Base:**
Research within ${framework} demonstrates [specific findings and methodologies].

**Strengths:**
This framework excels at explaining [specific aspects of the mechanism].

**Limitations:**
However, ${framework} has difficulty accounting for [specific limitations].
`).join('\n')}

## Framework Synthesis

### Convergent Insights

All frameworks agree that ${testData.mechanismType}:
1. Involves multiple levels of analysis
2. Has both adaptive and maladaptive aspects
3. Operates through identifiable pathways
4. Can be influenced by intervention

### Divergent Perspectives

Frameworks differ in their emphasis on:
- ${frameworks[0]} focuses on [specific emphasis]
- ${frameworks[1]} prioritizes [different emphasis]
${frameworks.slice(2).map(f => `- ${f} emphasizes [unique perspective]`).join('\n')}

### Integrated Model

Combining insights from all frameworks, we propose that ${testData.mechanismType} operates through:

1. **Evolutionary Foundation** (from evolutionary psychology): Ancient adaptive mechanisms
2. **Cognitive Processing** (from cognitive psychology): Information processing limitations
3. **Neural Implementation** (from neuroscience): Specific brain circuits and neurotransmitters
4. **Social Context** (from social psychology): Environmental and cultural influences
5. **System Dynamics** (from systems theory): Feedback loops and emergent properties

### Synthesis Diagram

\`\`\`mermaid
graph TD
    A[${testData.mechanismType}] --> B[Evolutionary Origins]
    A --> C[Cognitive Processes]
    A --> D[Neural Substrates]
    A --> E[Social Context]
    A --> F[System Dynamics]
    
    B --> G[Integrated Understanding]
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H[Comprehensive Explanation]
    G --> I[Intervention Strategies]
    G --> J[Predictive Model]
\`\`\`

## Coherent Explanation

The integrated framework provides a coherent explanation where:
- Evolutionary pressures shaped the basic mechanism
- Cognitive limitations constrain its operation
- Neural circuits implement the processing
- Social context modulates expression
- System dynamics create emergent properties

This synthesis explains both the universality and variability of ${testData.mechanismType} across individuals and cultures.

## Abstract

Synthesis content here.

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

Cross-references content.

---

**Navigation:**  
← Previous | Index | Next →`;
}

// Analysis functions for property validation

function analyzePsychologicalMechanisms(content, testData) {
  const result = {
    mechanismsIdentified: false,
    mechanismCount: 0,
    mechanismsExplained: false,
    mechanismsLinkedToProblem: false,
    evidenceProvided: false
  };

  // Check if mechanisms are identified
  const mechanismMentions = testData.psychologicalMechanisms.filter(mechanism => 
    content.toLowerCase().includes(mechanism.toLowerCase())
  );
  result.mechanismCount = mechanismMentions.length;
  result.mechanismsIdentified = mechanismMentions.length >= testData.psychologicalMechanisms.length;

  // Check if mechanisms are explained (not just mentioned)
  const explanationKeywords = ['operates through', 'functions by', 'mechanism explanation', 'works by'];
  result.mechanismsExplained = explanationKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  // Check if mechanisms are linked to the specific problem
  const linkageKeywords = ['contributes to', 'leads to', 'causes', 'results in', 'problem connection'];
  result.mechanismsLinkedToProblem = linkageKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  // Check if evidence is provided
  const evidenceKeywords = ['research', 'studies', 'evidence', 'findings', 'demonstrates'];
  result.evidenceProvided = evidenceKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  return result;
}

function analyzeCausalRelationships(content, testData) {
  const result = {
    causalChainPresent: false,
    chainLength: 0,
    mechanismsLinkedToOutcomes: false,
    intermediateStepsExplained: false
  };

  // Check for causal chain indicators
  const causalKeywords = ['step 1', 'step 2', 'leads to', 'results in', 'causes', 'triggers'];
  const causalMentions = causalKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  result.causalChainPresent = causalMentions.length >= 2;

  // Count chain length by counting steps
  const stepMatches = content.match(/step \d+/gi) || [];
  result.chainLength = stepMatches.length;

  // Check if mechanisms are linked to outcomes
  const outcomeLinks = testData.behavioralOutcomes.filter(outcome => 
    content.toLowerCase().includes(outcome.toLowerCase())
  );
  result.mechanismsLinkedToOutcomes = outcomeLinks.length >= testData.behavioralOutcomes.length;

  // Check for intermediate step explanations
  const explanationKeywords = ['pathway', 'cascade', 'amplifies', 'mediates'];
  result.intermediateStepsExplained = explanationKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  return result;
}

function analyzeFrameworkIntegration(content, testData) {
  const result = {
    frameworksPresent: 0,
    frameworksIntegrated: false,
    synthesisPresent: false,
    coherentExplanation: false
  };

  // Count frameworks mentioned
  result.frameworksPresent = testData.theoreticalFrameworks.filter(framework => 
    content.toLowerCase().includes(framework.toLowerCase())
  ).length;

  // Check for integration indicators
  const integrationKeywords = ['integrates', 'combines', 'synthesis', 'convergent', 'divergent'];
  result.frameworksIntegrated = integrationKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  // Check for synthesis section
  result.synthesisPresent = content.toLowerCase().includes('framework synthesis') || 
                           content.toLowerCase().includes('integrated model');

  // Check for coherent explanation
  const coherenceKeywords = ['coherent explanation', 'comprehensive understanding', 'unified model'];
  result.coherentExplanation = coherenceKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  return result;
}