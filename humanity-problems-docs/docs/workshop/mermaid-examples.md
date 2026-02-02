# Mermaid Diagram Examples and Tutorial

## Introduction

Mermaid diagrams provide powerful visual representation capabilities for complex concepts, processes, and relationships. This tutorial showcases various Mermaid diagram types using examples from the Humanity's Fundamental Problems documentation system.

## Basic Mermaid Syntax

### Flowchart Basics

```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

**Code:**
```markdown
```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```
```

## Process Flow Diagrams

### Cognitive Bias Formation Process

```mermaid
flowchart TD
    A[Sensory Input] --> B[Attention Filter]
    B --> C{Matches Expectations?}
    
    C -->|Yes| D[Confirmation Bias Activated]
    C -->|No| E[Cognitive Dissonance]
    
    D --> F[Selective Information Processing]
    E --> G{Threat Level?}
    
    G -->|High| H[Defensive Processing]
    G -->|Low| I[Accommodation Attempt]
    
    F --> J[Biased Memory Encoding]
    H --> J
    I --> K[Belief Modification]
    
    J --> L[Reinforced Bias]
    K --> M[Updated Worldview]
    
    L --> N[Future Bias Susceptibility]
    M --> O[Improved Accuracy]
```

**Use Case**: Demonstrates how individual cognitive processes create systematic biases that affect decision-making.

### Group Decision-Making Failure Process

```mermaid
flowchart TD
    A[Individual Opinions] --> B[Group Formation]
    B --> C[Social Pressure Emergence]
    
    C --> D{Dissent Present?}
    D -->|Yes| E[Conformity Pressure]
    D -->|No| F[False Consensus]
    
    E --> G{Strong Leadership?}
    F --> H[Groupthink Development]
    
    G -->|Yes| I[Authority Deference]
    G -->|No| J[Majority Rule]
    
    I --> K[Dissent Suppression]
    J --> L[Minority Silencing]
    H --> M[Information Filtering]
    
    K --> N[Illusion of Unanimity]
    L --> N
    M --> N
    
    N --> O[Flawed Decision]
    O --> P[Negative Consequences]
    P --> Q[Group Blame/Scapegoating]
```

**Use Case**: Shows how individual biases aggregate into group-level dysfunction.

## System Architecture Diagrams

### Multi-Level Human Dysfunction System

```mermaid
graph TD
    subgraph "Individual Level"
        A[Cognitive Biases]
        B[Emotional Dysregulation]
        C[Evolutionary Mismatch]
    end
    
    subgraph "Group Level"
        D[Social Conformity]
        E[Organizational Pathology]
        F[Collective Irrationality]
    end
    
    subgraph "Societal Level"
        G[Institutional Failure]
        H[Cultural Pathology]
        I[System Breakdown]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> H
    F --> I
    
    G --> J[Civilizational Crisis]
    H --> J
    I --> J
    
    J --> K[Historical Pattern]
    K --> L[Recurring Cycles]
    
    L -.-> A
    L -.-> B
    L -.-> C
```

**Use Case**: Illustrates how problems scale across different levels of human organization.

### Feedback Loop Systems

```mermaid
graph LR
    A[Economic Inequality] --> B[Political Polarization]
    B --> C[Policy Gridlock]
    C --> D[Economic Stagnation]
    D --> A
    
    E[Individual Stress] --> F[Social Fragmentation]
    F --> G[Institutional Distrust]
    G --> H[Governance Failure]
    H --> I[Economic Instability]
    I --> E
    
    A -.-> E
    F -.-> B
```

**Use Case**: Shows circular causation patterns that reinforce societal problems.

## Timeline Diagrams

### Evolutionary Psychology Timeline

```mermaid
timeline
    title Human Psychological Evolution and Modern Dysfunction
    
    section Early Evolution (7-2 MYA)
        Basic Social Cognition : Rudimentary cooperation
                               : Simple tool use
                               : Basic communication
        
        Survival Adaptations : Fear responses
                            : Tribal loyalty
                            : Resource competition
    
    section Advanced Evolution (2-0.05 MYA)
        Complex Cognition : Language development
                         : Abstract reasoning
                         : Cultural transmission
        
        Social Complexity : Large group coordination
                         : Hierarchical organization
                         : Moral reasoning
    
    section Agricultural Revolution (10,000 YA)
        Lifestyle Changes : Sedentary communities
                         : Population growth
                         : Social stratification
        
        Emerging Problems : Inequality
                         : Disease spread
                         : Resource conflicts
    
    section Industrial Revolution (250 YA)
        Rapid Change : Urbanization
                    : Technological acceleration
                    : Global connectivity
        
        Modern Dysfunction : Information overload
                          : Social isolation
                          : Environmental destruction
    
    section Digital Age (30 YA - Present)
        Digital Revolution : Internet connectivity
                          : Social media
                          : Artificial intelligence
        
        Contemporary Crisis : Attention fragmentation
                           : Reality distortion
                           : Democratic erosion
```

**Use Case**: Shows how evolutionary adaptations become maladaptive in modern contexts.

### Civilizational Collapse Pattern

```mermaid
timeline
    title Typical Civilizational Collapse Pattern
    
    section Growth Phase (Centuries 1-3)
        Expansion : Territory acquisition
                 : Population growth
                 : Economic development
        
        Innovation : Technological advancement
                  : Cultural flowering
                  : Institutional development
    
    section Peak Phase (Centuries 3-5)
        Dominance : Regional hegemony
                 : Cultural influence
                 : Economic prosperity
        
        Complexity : Administrative sophistication
                  : Social stratification
                  : Specialization
    
    section Stress Phase (Centuries 5-7)
        Challenges : Resource depletion
                  : External pressures
                  : Internal conflicts
        
        Responses : Military expansion
                 : Administrative growth
                 : Social control
    
    section Decline Phase (Centuries 7-9)
        Breakdown : Economic crisis
                 : Political fragmentation
                 : Social unrest
        
        Collapse : Infrastructure failure
                : Population decline
                : Cultural loss
    
    section Recovery/Transformation (Centuries 9+)
        Aftermath : Successor states
                 : Cultural continuity
                 : Lessons learned
```

**Use Case**: Illustrates recurring patterns in civilizational rise and fall.

## Network Diagrams

### Interdisciplinary Knowledge Network

```mermaid
graph TB
    subgraph "Core Disciplines"
        A[Psychology]
        B[Sociology]
        C[Anthropology]
        D[Political Science]
        E[Economics]
        F[History]
    end
    
    subgraph "Specialized Fields"
        G[Evolutionary Psychology]
        H[Behavioral Economics]
        I[Social Psychology]
        J[Political Psychology]
        K[Economic History]
        L[Cultural Anthropology]
    end
    
    subgraph "Integrative Approaches"
        M[Systems Theory]
        N[Complexity Science]
        O[Interdisciplinary Studies]
    end
    
    A --> G
    A --> I
    A --> J
    
    B --> I
    
    C --> L
    
    D --> J
    
    E --> H
    E --> K
    
    F --> K
    
    G --> M
    H --> N
    I --> O
    J --> O
    K --> O
    L --> O
    
    M --> N
    N --> O
```

**Use Case**: Shows how different academic disciplines contribute to understanding human problems.

### Cross-Reference Relationship Map

```mermaid
graph LR
    subgraph "Individual Level"
        A[Cognitive Architecture]
        B[Evolutionary Foundations]
        C[Behavioral Economics]
    end
    
    subgraph "Group Level"
        D[Social Psychology]
        E[Group Decision-Making]
        F[Organizational Pathology]
    end
    
    subgraph "Societal Level"
        G[Political Systems]
        H[Economic Systems]
        I[Cultural Pathology]
    end
    
    A -.->|"cognitive biases"| E
    B -.->|"tribal psychology"| D
    C -.->|"market behavior"| H
    
    D -->|"social influence"| G
    E -->|"institutional failure"| F
    F -->|"governance breakdown"| G
    
    G <-->|"political economy"| H
    H <-->|"cultural values"| I
    I <-->|"legitimacy crisis"| G
```

**Use Case**: Visualizes conceptual connections between different documents in the system.

## State Diagrams

### Democratic Backsliding Process

```mermaid
stateDiagram-v2
    [*] --> Healthy_Democracy
    
    Healthy_Democracy --> Polarization : Social divisions emerge
    Polarization --> Institutional_Stress : Norms begin eroding
    Institutional_Stress --> Democratic_Backsliding : Authoritarian tactics
    Democratic_Backsliding --> Competitive_Authoritarianism : Elections manipulated
    Competitive_Authoritarianism --> Full_Authoritarianism : Opposition eliminated
    
    Polarization --> Healthy_Democracy : Reconciliation efforts
    Institutional_Stress --> Healthy_Democracy : Reform and renewal
    Democratic_Backsliding --> Institutional_Stress : Resistance successful
    
    Full_Authoritarianism --> [*] : System collapse
    Full_Authoritarianism --> Competitive_Authoritarianism : Liberalization pressure
```

**Use Case**: Shows how democratic systems can deteriorate through identifiable stages.

## Gantt Charts for Project Planning

### Documentation System Development

```mermaid
gantt
    title Humanity Problems Documentation Development
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Project Setup           :done,    setup, 2024-01-01, 2024-01-07
    Template Creation       :done,    templates, 2024-01-08, 2024-01-14
    Validation Framework    :done,    validation, 2024-01-15, 2024-01-21
    
    section Phase 2: Content Creation
    Individual Level Docs   :done,    individual, 2024-01-22, 2024-02-15
    Group Level Docs        :done,    group, 2024-02-16, 2024-03-10
    Societal Level Docs     :done,    societal, 2024-03-11, 2024-04-05
    Historical Analysis     :done,    historical, 2024-04-06, 2024-04-25
    
    section Phase 3: Integration
    Cross-References        :done,    crossref, 2024-04-26, 2024-05-05
    Index Creation          :active,  indexing, 2024-05-06, 2024-05-15
    Navigation System       :active,  navigation, 2024-05-16, 2024-05-25
    
    section Phase 4: Workshop
    Tutorial Materials      :         tutorials, 2024-05-26, 2024-06-05
    Example Preparation     :         examples, 2024-06-06, 2024-06-15
    Workshop Delivery       :         workshop, 2024-06-16, 2024-06-20
```

**Use Case**: Project management and timeline visualization for complex documentation projects.

## Best Practices for Mermaid Diagrams

### Design Principles

1. **Clarity Over Complexity**
   - Keep diagrams focused on key relationships
   - Avoid overcrowding with too many elements
   - Use clear, descriptive labels

2. **Consistent Styling**
   - Use consistent shapes for similar concepts
   - Maintain uniform color schemes
   - Apply consistent arrow styles

3. **Logical Flow**
   - Design for natural reading patterns (left-to-right, top-to-bottom)
   - Group related elements together
   - Use subgraphs for organization

### Technical Tips

1. **Node Naming**
   ```mermaid
   flowchart TD
       A[Clear Label] --> B[Another Clear Label]
       C{Decision Point} --> D((Process))
   ```

2. **Subgraph Organization**
   ```mermaid
   graph TD
       subgraph "Category 1"
           A[Item 1]
           B[Item 2]
       end
       
       subgraph "Category 2"
           C[Item 3]
           D[Item 4]
       end
   ```

3. **Link Styling**
   ```mermaid
   graph LR
       A --> B
       A -.-> C
       A ==> D
       A -->|"labeled"| E
   ```

## Exercise: Create Your Own Diagram

**Challenge**: Create a Mermaid diagram showing how a specific individual-level problem (e.g., confirmation bias, status anxiety, loss aversion) scales up to create group and societal-level dysfunction.

**Requirements**:
1. Use at least three different node types (rectangles, diamonds, circles)
2. Include subgraphs for different levels of analysis
3. Show both direct causation (solid arrows) and feedback loops (dotted arrows)
4. Include descriptive labels on key connections
5. Use consistent styling throughout

**Template**:
```markdown
```mermaid
graph TD
    subgraph "Individual Level"
        A[Your Individual Problem]
        B[Related Mechanism]
    end
    
    subgraph "Group Level"
        C[Group Manifestation]
        D[Collective Behavior]
    end
    
    subgraph "Societal Level"
        E[Institutional Impact]
        F[System Dysfunction]
    end
    
    A --> C
    B --> D
    C --> E
    D --> F
    
    F -.-> A
```
```

## Advanced Mermaid Features

### Custom Styling

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor': '#ff0000'}}}%%
graph TD
    A[Styled Node] --> B[Another Node]
    
    classDef important fill:#f9f,stroke:#333,stroke-width:4px
    class A important
```

### Interactive Elements

```mermaid
flowchart TD
    A[Click Me] --> B[Result]
    click A "https://example.com" "Tooltip text"
```

### Complex Relationships

```mermaid
graph TD
    A[Start] --> B[Process 1]
    A --> C[Process 2]
    B --> D[Merge Point]
    C --> D
    D --> E{Decision}
    E -->|Yes| F[Path 1]
    E -->|No| G[Path 2]
    F --> H[End]
    G --> H
```

---

**Next**: [Cross-Reference Guide](cross-reference-guide.md) | **Previous**: [Table Design Tutorial](table-design-tutorial.md)