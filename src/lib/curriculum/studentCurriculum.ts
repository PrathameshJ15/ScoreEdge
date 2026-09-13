import { AuthUser } from '@/context/AuthContext';

export interface EnrolledSubjectData {
  id: string;
  code: string;
  name: string;
  shortName: string;
  credits: number;
  readiness: number;
  inSemFocus: string;
  highYieldTopic: string;
  badge: string;
  recommendedActions: Array<{
    id: string;
    title: string;
    subtext: string;
    time: string;
    link: string;
    priority: 'HIGH_YIELD' | 'MEDIUM';
  }>;
}

// 1. FE Computer (Semester 2)
const FE_COMP_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'em2',
    code: '107008',
    name: 'Engineering Mathematics-II',
    shortName: 'EM-II',
    credits: 4,
    readiness: 85,
    inSemFocus: 'First Order Differential Equations & Applications (Unit 1 & 2)',
    highYieldTopic: 'Exact Differential Equations & Orthogonal Trajectories (96% Recurrence)',
    badge: 'Mathematical',
    recommendedActions: [
      {
        id: 'act-em2-1',
        title: 'Master Exact Differential Equations & Integrating Factors',
        subtext: 'High-yield 8-mark question in SPPU Dec 2023 & May 2024.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-em2-2',
        title: 'Solve Linear Differential Equations with Constant Coefficients',
        subtext: 'Frequent 6-mark question from Unit 2 Complementary Functions.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-em2-3',
        title: 'Practice Vector Calculus Gradient & Divergence Diagnostic',
        subtext: '10 questions with evaluator stepwise breakdown.',
        time: '15 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'bxe',
    code: '104010',
    name: 'Basic Electronics Engineering',
    shortName: 'BXE',
    credits: 3,
    readiness: 78,
    inSemFocus: 'Diodes & BJT Biasing Configurations (Unit 1 & 2)',
    highYieldTopic: 'CE Amplifier Circuit & DC Load Line Analysis (91% Recurrence)',
    badge: 'High Priority',
    recommendedActions: [
      {
        id: 'act-bxe-1',
        title: 'Draw & Explain Common Emitter (CE) Input/Output Characteristics',
        subtext: 'Essential 7-mark question in all recent university examinations.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-bxe-2',
        title: 'Calculate Ripple Factor for Full-Wave Bridge Rectifier',
        subtext: 'Numerical breakdown with SPPU examiner rubric.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'MEDIUM',
      },
      {
        id: 'act-bxe-3',
        title: 'Op-Amp Inverting vs Non-Inverting Configuration Quiz',
        subtext: 'Interactive diagnostic on OP-AMP 741 applications.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'pps',
    code: '110005',
    name: 'Programming and Problem Solving',
    shortName: 'PPS',
    credits: 4,
    readiness: 92,
    inSemFocus: 'Python Control Structures & Functions (Unit 1 & 2)',
    highYieldTopic: 'Recursive Functions & String Slicing Algorithms (94% Recurrence)',
    badge: 'Coding Core',
    recommendedActions: [
      {
        id: 'act-pps-1',
        title: 'Solve Nested Dictionary Manipulation & List Comprehension',
        subtext: 'High-frequency 8-mark coding question in SPPU Dec 2024.',
        time: '25 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-pps-2',
        title: 'Write File Handling Algorithm for Word Frequency Analysis',
        subtext: 'Common practical theory question from Unit 5.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-pps-3',
        title: 'Python Lambda Functions & Exception Handling Drill',
        subtext: 'Quick 10-minute diagnostic drill.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'phy',
    code: '107002',
    name: 'Engineering Physics',
    shortName: 'PHY',
    credits: 3,
    readiness: 74,
    inSemFocus: 'Wave Optics & Interference in Thin Films (Unit 1 & 2)',
    highYieldTopic: "Newton's Rings Diameter Equation & Wavelength (89% Recurrence)",
    badge: 'Analytical',
    recommendedActions: [
      {
        id: 'act-phy-1',
        title: "Derive Expression for Diameter of Newton's Dark Rings",
        subtext: 'Appears every alternate exam cycle for 6-8 marks.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-phy-2',
        title: 'Laser Population Inversion & Nd:YAG 4-Level Energy Scheme',
        subtext: 'Unit 3 key theory with labeled diagrams.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'MEDIUM',
      },
      {
        id: 'act-phy-3',
        title: 'Superconductivity Meissner Effect & BCS Theory Quiz',
        subtext: '10-question evaluation on magnetic levitation.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'sme',
    code: '102003',
    name: 'Systems in Mechanical Engineering',
    shortName: 'SME',
    credits: 3,
    readiness: 68,
    inSemFocus: 'Thermodynamic Systems & Power Plants (Unit 1 & 2)',
    highYieldTopic: '4-Stroke Petrol vs Diesel Engine Thermodynamic Cycles (92% Recurrence)',
    badge: 'Needs Revision',
    recommendedActions: [
      {
        id: 'act-sme-1',
        title: 'Draw & Compare Otto vs Diesel Cycle Indicator Diagrams',
        subtext: 'Guaranteed 8-mark comparative analysis question.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-sme-2',
        title: 'Electric Vehicle Architecture & Battery Management Systems',
        subtext: 'Modern NEP syllabus high-weightage topic.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-sme-3',
        title: 'Heat Exchangers & Refrigeration Cycle Diagnostic',
        subtext: 'COP calculation and components review.',
        time: '15 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 2. SE Computer (Semester 4 / 3)
const SE_COMP_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'dbms',
    code: '210241',
    name: 'Database Management Systems',
    shortName: 'DBMS',
    credits: 3,
    readiness: 88,
    inSemFocus: 'ER Models & Relational Algebra (Unit 1 & 2)',
    highYieldTopic: 'BCNF Lossless Join Decomposition (94% Recurrence)',
    badge: 'High Priority',
    recommendedActions: [
      {
        id: 'act-dbms-1',
        title: 'Master Normalization: 3NF vs BCNF Decomposition',
        subtext: 'High-yield 8-mark question in SPPU Dec 2023 & May 2024.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dbms-2',
        title: 'Solve Deadlock Prevention: Wait-Die vs Wound-Wait',
        subtext: 'Frequent 5-mark question from Unit 4 Concurrency Control.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dbms-3',
        title: 'Complete Unit 2 Relational Algebra Diagnostic Drill',
        subtext: '10 questions with evaluator explanations.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'dsa',
    code: '210242',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    credits: 4,
    readiness: 84,
    inSemFocus: 'Non-linear Trees & AVL Balancing (Unit 1 & 2)',
    highYieldTopic: 'Dijkstra Shortest Path vs Prim (88% Recurrence)',
    badge: 'Analytical',
    recommendedActions: [
      {
        id: 'act-dsa-1',
        title: 'Construct AVL Tree with Left & Right Rotations',
        subtext: 'Standard 8-mark question in all recent SPPU papers.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsa-2',
        title: 'Trace Dijkstra Algorithm with Adjacency Matrix',
        subtext: '7-mark stepwise trace with distance array.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsa-3',
        title: 'Hash Collisions & Quadratic Probing Drill',
        subtext: 'Unit 4 quick concept check.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'oop',
    code: '210243',
    name: 'Object Oriented Programming',
    shortName: 'OOP',
    credits: 3,
    readiness: 90,
    inSemFocus: 'Virtual Base Classes & Runtime Polymorphism (Unit 1 & 2)',
    highYieldTopic: 'Template Metaprogramming & Exception Safety (86% Recurrence)',
    badge: 'Core Concept',
    recommendedActions: [
      {
        id: 'act-oop-1',
        title: 'Write Virtual Destructor & VTABLE Memory Layout',
        subtext: 'Crucial 6-mark conceptual evaluator favorite.',
        time: '15 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-oop-2',
        title: 'Implement Generic Vector Class using C++ Templates',
        subtext: '8-mark code implementation question.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-oop-3',
        title: 'Standard Template Library (STL) Algorithm Quizzing',
        subtext: 'Iterators and Functors review.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'os',
    code: '210244',
    name: 'Operating Systems',
    shortName: 'OS',
    credits: 3,
    readiness: 72,
    inSemFocus: 'Process Synchronization & Banker Algorithm (Unit 1 & 2)',
    highYieldTopic: "Peterson's Solution & Semaphore Mutex (90% Recurrence)",
    badge: 'Needs Revision',
    recommendedActions: [
      {
        id: 'act-os-1',
        title: "Solve Banker's Safety & Resource Request Algorithm",
        subtext: 'Guaranteed 8-mark numerical in Unit 3.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-os-2',
        title: 'Compare Page Replacement Algorithms: FIFO, LRU, Optimal',
        subtext: '6-mark page fault calculation problem.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-os-3',
        title: 'Dining Philosophers Problem & Deadlock Detection Drill',
        subtext: '10-minute diagnostic on classical IPC.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'toc',
    code: '210245',
    name: 'Theory of Computation',
    shortName: 'TOC',
    credits: 3,
    readiness: 66,
    inSemFocus: 'DFA Minimization & NFA to DFA Equivalence (Unit 1 & 2)',
    highYieldTopic: 'Pumping Lemma for Regular Languages (95% Recurrence)',
    badge: 'Mathematical',
    recommendedActions: [
      {
        id: 'act-toc-1',
        title: 'Prove Non-Regularity using Pumping Lemma: L = {a^n b^n}',
        subtext: 'Classic 8-mark proof appearing in almost all papers.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-toc-2',
        title: 'Design Pushdown Automata (PDA) for Palindrome Strings',
        subtext: '7-mark transition function and state diagram.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-toc-3',
        title: 'Turing Machine Decidability & Halting Problem Quiz',
        subtext: 'Theory drill on Chomsky hierarchy.',
        time: '15 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 3. TE Information Technology (Semester 6)
const TE_IT_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'cns',
    code: '314451',
    name: 'Computer Networks & Security',
    shortName: 'CNS',
    credits: 4,
    readiness: 80,
    inSemFocus: 'Network Layer Routing Protocols & Subnetting (Unit 1 & 2)',
    highYieldTopic: 'OSPF vs BGP Protocol & RSA Cryptosystem (93% Recurrence)',
    badge: 'High Priority',
    recommendedActions: [
      {
        id: 'act-cns-1',
        title: 'Solve Subnetting and Variable Length Subnet Masking (VLSM)',
        subtext: 'Guaranteed 8-mark numerical in SPPU End-Sem.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cns-2',
        title: 'Trace RSA Algorithm Encryption and Decryption Steps',
        subtext: '6-mark key generation calculation.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cns-3',
        title: 'TCP 3-Way Handshake and Flow Control Diagnostic Drill',
        subtext: '12-minute review on transport protocols.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'wad',
    code: '314452',
    name: 'Web Application Development',
    shortName: 'WAD',
    credits: 3,
    readiness: 86,
    inSemFocus: 'RESTful Web APIs, React Architecture & Node.js (Unit 1 & 2)',
    highYieldTopic: 'JWT Authentication Flow & Asynchronous Event Loop (89% Recurrence)',
    badge: 'Full Stack',
    recommendedActions: [
      {
        id: 'act-wad-1',
        title: 'Design Secure REST API with Token-based Auth in Express',
        subtext: 'Frequent 8-mark architecture design question.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-wad-2',
        title: 'Explain React Virtual DOM Reconciliation vs Direct DOM',
        subtext: '6-mark core frontend concept.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-wad-3',
        title: 'MongoDB Aggregation Pipeline and Indexing Quiz',
        subtext: '10-minute database operations drill.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'dsba',
    code: '314453',
    name: 'Data Science & Big Data Analytics',
    shortName: 'DSBDA',
    credits: 3,
    readiness: 76,
    inSemFocus: 'Hadoop MapReduce Architecture & Data Preprocessing (Unit 1 & 2)',
    highYieldTopic: 'MapReduce WordCount Execution Pipeline & Spark RDDs (91% Recurrence)',
    badge: 'Analytics Core',
    recommendedActions: [
      {
        id: 'act-dsba-1',
        title: 'Trace MapReduce WordCount Data Flow with Combiner',
        subtext: 'Standard 8-mark diagrammatic question.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsba-2',
        title: 'Compare Resilient Distributed Datasets (RDD) vs DataFrames in Spark',
        subtext: '6-mark performance comparison.',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsba-3',
        title: 'Data Imputation & Normalization Statistical Diagnostic',
        subtext: 'Z-score vs MinMax scaling test.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'cc',
    code: '314454',
    name: 'Cloud Computing',
    shortName: 'CC',
    credits: 3,
    readiness: 82,
    inSemFocus: 'Cloud Service Models (IaaS, PaaS, SaaS) & Hypervisors (Unit 1 & 2)',
    highYieldTopic: 'Hardware vs OS Virtualization & Multi-Tenancy Security (87% Recurrence)',
    badge: 'Infrastructure',
    recommendedActions: [
      {
        id: 'act-cc-1',
        title: 'Differentiate Type-1 Bare-Metal vs Type-2 Hosted Hypervisors',
        subtext: 'Essential 6-mark architecture comparison.',
        time: '15 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cc-2',
        title: 'Explain Amazon S3 Storage Classes & DynamoDB Partitioning',
        subtext: '7-mark cloud design question.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'MEDIUM',
      },
      {
        id: 'act-cc-3',
        title: 'Serverless Functions vs Container Orchestration Quiz',
        subtext: 'AWS Lambda and Docker microservices check.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'smd',
    code: '314455',
    name: 'Software Modeling and Design',
    shortName: 'SMD',
    credits: 3,
    readiness: 70,
    inSemFocus: 'UML Behavioral Modeling & Design Patterns (Unit 1 & 2)',
    highYieldTopic: 'Gang of Four (GoF) Factory & Observer Design Pattern (90% Recurrence)',
    badge: 'Architecture',
    recommendedActions: [
      {
        id: 'act-smd-1',
        title: 'Draw Class Diagram and Sequence Diagram for ATM / Banking System',
        subtext: 'Guaranteed 8-mark case study question.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-smd-2',
        title: 'Implement Singleton and Factory Method Pattern with Code',
        subtext: '7-mark software engineering design.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-smd-3',
        title: 'Agile vs Waterfall Lifecycle Model Quiz',
        subtext: 'Scrum framework and user story estimation.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 4. BE Artificial Intelligence & Data Science (Semester 8)
const BE_AIDS_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'dlnn',
    code: '417521',
    name: 'Deep Learning & Neural Networks',
    shortName: 'DLNN',
    credits: 4,
    readiness: 92,
    inSemFocus: 'Multi-layer Perceptrons & Backpropagation (Unit 1 & 2)',
    highYieldTopic: 'Vanishing Gradient Problem & Adam Optimizer Math (95% Recurrence)',
    badge: 'AI Advanced',
    recommendedActions: [
      {
        id: 'act-dlnn-1',
        title: 'Derive Backpropagation Weight Update Equations via Chain Rule',
        subtext: 'High-yield 8-mark derivation in all recent exams.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dlnn-2',
        title: 'Trace Convolutional Feature Map Sizing with Stride & Padding',
        subtext: '6-mark numerical calculation problem.',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dlnn-3',
        title: 'Transformer Multi-Head Self-Attention Diagnostic Drill',
        subtext: 'Key concept breakdown with scoring rubrics.',
        time: '15 mins',
        link: '/dashboard/quizzes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'nlp',
    code: '417522',
    name: 'Natural Language Processing',
    shortName: 'NLP',
    credits: 3,
    readiness: 88,
    inSemFocus: 'Text Preprocessing, Word2Vec & N-gram Models (Unit 1 & 2)',
    highYieldTopic: 'Skip-gram vs CBOW Architecture & TF-IDF Vectorization (92% Recurrence)',
    badge: 'High Yield',
    recommendedActions: [
      {
        id: 'act-nlp-1',
        title: 'Explain Continuous Bag of Words (CBOW) vs Skip-Gram Training',
        subtext: 'Appears consistently for 8 marks.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-nlp-2',
        title: 'Compute TF-IDF Matrix for Sample Document Corpus',
        subtext: 'Stepwise numerical evaluation problem.',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-nlp-3',
        title: 'BERT Bidirectional Encodings & RoBERTa Fine-tuning Quiz',
        subtext: 'Modern NLP evaluation check.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'rl',
    code: '417523',
    name: 'Reinforcement Learning',
    shortName: 'RL',
    credits: 3,
    readiness: 84,
    inSemFocus: 'Markov Decision Processes (MDP) & Bellman Equation (Unit 1 & 2)',
    highYieldTopic: 'Q-Learning vs SARSA On-Policy vs Off-Policy (90% Recurrence)',
    badge: 'Algorithmic',
    recommendedActions: [
      {
        id: 'act-rl-1',
        title: 'Derive Bellman Optimality Equation for State-Value V*(s)',
        subtext: 'Core 8-mark derivation in Unit 2.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-rl-2',
        title: 'Trace Q-Table Update with Learning Rate Alpha and Discount Gamma',
        subtext: '7-mark numerical problem on grid world.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-rl-3',
        title: 'Deep Q-Networks (DQN) Experience Replay Buffer Quiz',
        subtext: 'Diagnostic on temporal difference error.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'bda',
    code: '417524',
    name: 'Big Data Analytics & MLOps',
    shortName: 'BDA',
    credits: 3,
    readiness: 79,
    inSemFocus: 'Stream Processing with Apache Kafka & Spark Streaming (Unit 1 & 2)',
    highYieldTopic: 'Kafka Broker Partitions, Consumer Groups & MLflow Pipelines (88% Recurrence)',
    badge: 'Enterprise ML',
    recommendedActions: [
      {
        id: 'act-bda-1',
        title: 'Describe Apache Kafka Distributed Architecture & Rebalancing',
        subtext: 'Frequent 7-mark architecture design question.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-bda-2',
        title: 'Design End-to-End MLOps Pipeline: Feature Store to Model Drift',
        subtext: '8-mark system design case study.',
        time: '25 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-bda-3',
        title: 'Sliding Window vs Tumbling Window Aggregation Quiz',
        subtext: '10-minute real-time stream processing test.',
        time: '10 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'asr',
    code: '417525',
    name: 'Autonomous Systems & Robotics',
    shortName: 'ASR',
    credits: 3,
    readiness: 85,
    inSemFocus: 'Kinematics, SLAM & Sensor Fusion (Unit 1 & 2)',
    highYieldTopic: 'Extended Kalman Filter (EKF) Localization & LiDAR Mapping (91% Recurrence)',
    badge: 'Robotics Core',
    recommendedActions: [
      {
        id: 'act-asr-1',
        title: 'Formulate Extended Kalman Filter (EKF) Prediction & Update Steps',
        subtext: '8-mark mathematical derivation.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-asr-2',
        title: 'Explain Simultaneous Localization and Mapping (SLAM) Loop Closure',
        subtext: '6-mark algorithmic explanation.',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-asr-3',
        title: 'ROS2 Node Pub-Sub Communication Diagnostic',
        subtext: 'Robot Operating System DDS architecture review.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 5. SE Electronics & Telecommunication (Semester 3)
const SE_ENTC_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'ss',
    code: '204181',
    name: 'Signals & Systems',
    shortName: 'SS',
    credits: 4,
    readiness: 70,
    inSemFocus: 'Continuous vs Discrete Signals & LTI Systems (Unit 1 & 2)',
    highYieldTopic: 'Continuous-Time Fourier Transform & Z-Transform ROC (94% Recurrence)',
    badge: 'Core Theory',
    recommendedActions: [
      {
        id: 'act-ss-1',
        title: 'Compute Linear Convolution of Two Discrete Sequences',
        subtext: 'Guaranteed 8-mark numerical in Unit 1.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-ss-2',
        title: 'Find Region of Convergence (ROC) and Inverse Z-Transform',
        subtext: '7-mark stepwise numerical problem.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-ss-3',
        title: 'Fourier Series Dirichlet Conditions Diagnostic Quiz',
        subtext: 'Harmonic analysis check.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'eca',
    code: '204182',
    name: 'Electronic Circuits & Applications',
    shortName: 'ECA',
    credits: 4,
    readiness: 78,
    inSemFocus: 'BJT & MOSFET Frequency Response (Unit 1 & 2)',
    highYieldTopic: 'High Frequency Hybrid-Pi Model & Miller Effect (90% Recurrence)',
    badge: 'Hardware Core',
    recommendedActions: [
      {
        id: 'act-eca-1',
        title: 'Derive Voltage Gain and Input Impedance for Hybrid-Pi Model',
        subtext: 'Appears every cycle for 8 marks.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-eca-2',
        title: 'Analyze Class A vs Class B Push-Pull Power Amplifier Efficiency',
        subtext: '7-mark theoretical efficiency proof (78.5%).',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-eca-3',
        title: 'Negative Feedback Amplifiers: Desensitivity and Bandwidth Drill',
        subtext: '12-minute feedback topologies test.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'dsd',
    code: '204183',
    name: 'Digital System Design',
    shortName: 'DSD',
    credits: 3,
    readiness: 82,
    inSemFocus: 'Karnaugh Maps, Quine-McCluskey & Sequential FSMs (Unit 1 & 2)',
    highYieldTopic: 'Mealy vs Moore Finite State Machine Design (92% Recurrence)',
    badge: 'Digital Logic',
    recommendedActions: [
      {
        id: 'act-dsd-1',
        title: 'Design Synchronous 3-Bit Up/Down Counter using JK Flip-Flops',
        subtext: 'Classic 8-mark design question with state table.',
        time: '22 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsd-2',
        title: 'Write VHDL Behavioral Architecture for 4:1 Multiplexer',
        subtext: '6-mark hardware description code.',
        time: '15 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-dsd-3',
        title: 'Sequence Detector (1011) Overlapping State Diagram Quiz',
        subtext: 'FSM minimization diagnostic.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'nt',
    code: '204184',
    name: 'Network Theory',
    shortName: 'NT',
    credits: 3,
    readiness: 65,
    inSemFocus: 'Mesh Analysis, Thevenin & Norton Theorems (Unit 1 & 2)',
    highYieldTopic: 'Maximum Power Transfer Theorem & Two-Port Parameters (91% Recurrence)',
    badge: 'Needs Revision',
    recommendedActions: [
      {
        id: 'act-nt-1',
        title: 'Determine Thevenin Equivalent Circuit across Load Resistor',
        subtext: 'Essential 8-mark circuit calculation.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-nt-2',
        title: 'Convert Z-Parameters to Y-Parameters & ABCD Transmission Matrix',
        subtext: '7-mark matrix relationship proof.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-nt-3',
        title: 'Transient Response of Series RLC Circuit under DC Excitation',
        subtext: 'Overdamped vs underdamped diagnostic.',
        time: '15 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'cs',
    code: '204185',
    name: 'Control Systems',
    shortName: 'CS',
    credits: 3,
    readiness: 75,
    inSemFocus: 'Transfer Functions, Block Diagram Reduction & Mason Gain (Unit 1 & 2)',
    highYieldTopic: 'Routh-Hurwitz Stability Criterion & Root Locus Plotting (96% Recurrence)',
    badge: 'Mathematical',
    recommendedActions: [
      {
        id: 'act-cs-1',
        title: 'Construct Complete Root Locus Plot with Asymptotes & Breakaway',
        subtext: 'Guaranteed 8-mark question in all SPPU papers.',
        time: '28 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cs-2',
        title: 'Determine System Stability using Routh Array with Special Cases',
        subtext: '6-mark characteristic equation problem.',
        time: '18 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cs-3',
        title: 'Bode Plot Gain Margin & Phase Margin Diagnostic Quiz',
        subtext: 'Frequency domain stability check.',
        time: '12 mins',
        link: '/dashboard/quizzes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 6. TE Computer Engineering (Semester 5/6)
const TE_COMP_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'cns',
    code: '310241',
    name: 'Computer Networks & Security',
    shortName: 'CNS',
    credits: 3,
    readiness: 82,
    inSemFocus: 'OSI vs TCP/IP, Data Link Framing & Error Correction (Unit 1 & 2)',
    highYieldTopic: 'Sliding Window Protocols & CRC Error Detection (94% Recurrence)',
    badge: 'Core High-Yield',
    recommendedActions: [
      {
        id: 'act-cns-1',
        title: 'Compute CRC-16 Checksum for Transmission Frames',
        subtext: 'Guaranteed 6-mark problem in SPPU In-Sem and End-Sem exams.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
      {
        id: 'act-cns-2',
        title: 'Compare Go-Back-N vs Selective Repeat ARQ Sliding Window',
        subtext: 'High-yield 8-mark comparative analysis.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'spos',
    code: '310242',
    name: 'Systems Programming & Operating System',
    shortName: 'SPOS',
    credits: 4,
    readiness: 76,
    inSemFocus: 'Pass-I & Pass-II Assembler Design, Macroprocessors (Unit 1 & 2)',
    highYieldTopic: 'Two-Pass Assembler Symbol Table & Opcode Processing (97% Recurrence)',
    badge: 'High Priority',
    recommendedActions: [
      {
        id: 'act-spos-1',
        title: 'Trace Pass-I Assembler Data Structures (MOT, POT, ST, LT)',
        subtext: '10-mark design question in SPPU previous exams.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'daa',
    code: '310243',
    name: 'Design & Analysis of Algorithms',
    shortName: 'DAA',
    credits: 3,
    readiness: 79,
    inSemFocus: 'Asymptotic Notations, Master Theorem & Divide and Conquer (Unit 1 & 2)',
    highYieldTopic: 'Master Theorem Recurrence Relations & Strassen Matrix Multiplication (92% Recurrence)',
    badge: 'Algorithmic',
    recommendedActions: [
      {
        id: 'act-daa-1',
        title: 'Solve Recurrence Relations using Master Theorem Case 1, 2, 3',
        subtext: 'Frequent 6-mark in-sem problem with stepwise proofs.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'dsbd',
    code: '310244',
    name: 'Data Science & Big Data Analytics',
    shortName: 'DSBDA',
    credits: 3,
    readiness: 84,
    inSemFocus: 'Hadoop Architecture, HDFS Blocks & MapReduce Framework (Unit 1 & 2)',
    highYieldTopic: 'MapReduce Execution Pipeline & Word Count Tracing (95% Recurrence)',
    badge: 'Analytics',
    recommendedActions: [
      {
        id: 'act-dsbd-1',
        title: 'Draw HDFS Read/Write Architecture with NameNode & DataNode',
        subtext: '8-mark university standard question with rubric.',
        time: '18 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'sma',
    code: '310245',
    name: 'Software Modeling & Architecture',
    shortName: 'SMA',
    credits: 3,
    readiness: 81,
    inSemFocus: 'UML 2.0 Class & Sequence Diagrams, Use-Case Specifications (Unit 1 & 2)',
    highYieldTopic: 'Statechart & Activity Diagrams for E-Commerce Checkout (88% Recurrence)',
    badge: 'Design',
    recommendedActions: [
      {
        id: 'act-sma-1',
        title: 'Construct Complete UML Class Diagram with Design Patterns',
        subtext: '8-mark comprehensive scenario question.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 7. BE Computer Engineering (Semester 7/8)
const BE_COMP_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'hpc',
    code: '410241',
    name: 'High Performance Computing',
    shortName: 'HPC',
    credits: 3,
    readiness: 78,
    inSemFocus: 'Parallel Hardware Architectures & OpenMP Multi-Threading (Unit 1 & 2)',
    highYieldTopic: 'Amdahl Law vs Gustafson Law & CUDA GPU Grid/Block Execution (95% Recurrence)',
    badge: 'System High-Yield',
    recommendedActions: [
      {
        id: 'act-hpc-1',
        title: 'Calculate Speedup & Efficiency using Amdahl Law',
        subtext: 'Frequent 6-mark numerical in SPPU End-Sem.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'ml',
    code: '410242',
    name: 'Machine Learning',
    shortName: 'ML',
    credits: 4,
    readiness: 88,
    inSemFocus: 'Supervised Learning, Cost Functions, Gradient Descent & SVM (Unit 1 & 2)',
    highYieldTopic: 'Support Vector Machine Maximal Margin Hyperplane Derivation (96% Recurrence)',
    badge: 'AI Core',
    recommendedActions: [
      {
        id: 'act-ml-1',
        title: 'Derive Support Vector Machine (SVM) Dual Formulation with KKT',
        subtext: 'Guaranteed 8-mark question in university exams.',
        time: '25 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'cs-be',
    code: '410243',
    name: 'Cyber Security & Forensics',
    shortName: 'CS',
    credits: 3,
    readiness: 85,
    inSemFocus: 'Cryptographic Algorithms, AES, RSA & Digital Signatures (Unit 1 & 2)',
    highYieldTopic: 'RSA Mathematical Key Generation & Decryption Proof (98% Recurrence)',
    badge: 'Security',
    recommendedActions: [
      {
        id: 'act-csbe-1',
        title: 'Solve RSA Numerical with Given Primes p, q and Public Exponent e',
        subtext: '8-mark numerical problem in every exam session.',
        time: '20 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'ai',
    code: '410244',
    name: 'Artificial Intelligence',
    shortName: 'AI',
    credits: 3,
    readiness: 83,
    inSemFocus: 'Heuristic Search, A* Algorithm & Alpha-Beta Pruning (Unit 1 & 2)',
    highYieldTopic: 'A* Algorithm Admissibility Proof & 8-Puzzle Solution Trace (94% Recurrence)',
    badge: 'Intelligent Systems',
    recommendedActions: [
      {
        id: 'act-ai-1',
        title: 'Trace A* Tree Search Step-by-Step with f(n) = g(n) + h(n)',
        subtext: '10-mark state-space graph search problem.',
        time: '22 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'blockchain',
    code: '410245',
    name: 'Blockchain Technology',
    shortName: 'BT',
    credits: 3,
    readiness: 80,
    inSemFocus: 'Consensus Mechanisms, Proof of Work (PoW) vs PoS, Ethereum EVM (Unit 1 & 2)',
    highYieldTopic: 'Merkle Tree Cryptographic Hash Verification & Smart Contract Lifecycle (91% Recurrence)',
    badge: 'Emerging Tech',
    recommendedActions: [
      {
        id: 'act-bt-1',
        title: 'Explain Merkle Root Construction and SPV Proofs',
        subtext: '7-mark theoretical architecture question.',
        time: '18 mins',
        link: '/dashboard/notes',
        priority: 'MEDIUM',
      },
    ],
  },
];

// 8. FE Common (Semester 1)
const FE_SEM1_SUBJECTS: EnrolledSubjectData[] = [
  {
    id: 'em1',
    code: '107001',
    name: 'Engineering Mathematics-I',
    shortName: 'EM-I',
    credits: 4,
    readiness: 80,
    inSemFocus: 'Matrices, System of Linear Equations & Eigenvalues (Unit 1 & 2)',
    highYieldTopic: 'Cayley-Hamilton Theorem & Diagonalization of Symmetric Matrices (96% Recurrence)',
    badge: 'Mathematical Foundation',
    recommendedActions: [
      {
        id: 'act-em1-1',
        title: 'Find Inverse and Powers using Cayley-Hamilton Theorem',
        subtext: 'Guaranteed 8-mark question in SPPU exams.',
        time: '22 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'phy',
    code: '107002',
    name: 'Engineering Physics',
    shortName: 'PHY',
    credits: 3,
    readiness: 78,
    inSemFocus: 'Wave Optics, Interference in Thin Films & Laser Systems (Unit 1 & 2)',
    highYieldTopic: 'Newton Rings Experiment & Ruby/He-Ne Laser Transitions (93% Recurrence)',
    badge: 'Sciences',
    recommendedActions: [
      {
        id: 'act-phy-1',
        title: 'Derive Diameter of Dark Rings in Newton Rings Experiment',
        subtext: '7-mark question in SPPU examinations.',
        time: '20 mins',
        link: '/dashboard/notes',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'bee',
    code: '103004',
    name: 'Basic Electrical Engineering',
    shortName: 'BEE',
    credits: 3,
    readiness: 74,
    inSemFocus: 'DC Circuit Analysis, Superposition & Thevenin Theorem (Unit 1 & 2)',
    highYieldTopic: 'Thevenin and Norton Equivalent Circuit Calculation (97% Recurrence)',
    badge: 'Core Foundation',
    recommendedActions: [
      {
        id: 'act-bee-1',
        title: 'Find Current across Load Resistor using Thevenin Theorem',
        subtext: '8-mark circuit calculation with stepwise checks.',
        time: '25 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'mech',
    code: '101011',
    name: 'Engineering Mechanics',
    shortName: 'EM',
    credits: 4,
    readiness: 72,
    inSemFocus: 'Concurrent & Non-Concurrent Force Systems, Equilibrium (Unit 1 & 2)',
    highYieldTopic: 'Lami Theorem & Friction on Inclined Planes (95% Recurrence)',
    badge: 'Mechanical Foundation',
    recommendedActions: [
      {
        id: 'act-em-1',
        title: 'Determine Resultant & Reactions in Truss Equilibrium',
        subtext: '10-mark free body diagram problem.',
        time: '28 mins',
        link: '/dashboard/questions',
        priority: 'HIGH_YIELD',
      },
    ],
  },
  {
    id: 'sme-sem1',
    code: '102013',
    name: 'Systems in Mechanical Engineering',
    shortName: 'SME',
    credits: 3,
    readiness: 82,
    inSemFocus: 'Thermodynamic Laws, Heat Engines, Boilers & Power Plants (Unit 1 & 2)',
    highYieldTopic: 'Carnot Cycle Efficiency & Steam Power Plant Flow Diagram (90% Recurrence)',
    badge: 'Applied Sciences',
    recommendedActions: [
      {
        id: 'act-sme-1',
        title: 'Draw & Label Complete Thermal Power Plant Schematic',
        subtext: '7-mark theoretical question with rubric.',
        time: '18 mins',
        link: '/dashboard/notes',
        priority: 'MEDIUM',
      },
    ],
  },
];

/**
 * Dynamically resolves enrolled subjects based on student's branch, academic year, and semester.
 */
export function getStudentEnrolledSubjects(user: {
  branch_code?: string | null;
  academic_year?: string | null;
  semester_number?: number | null;
  department?: string | null;
} | null): EnrolledSubjectData[] {
  if (!user) return SE_COMP_SUBJECTS;

  const branch = (user.branch_code || '').toUpperCase();
  const year = (user.academic_year || '').toUpperCase();
  const sem = Number(user.semester_number) || (year === 'FE' ? 2 : year === 'SE' ? 4 : year === 'TE' ? 6 : 8);

  // 1. FE First Year
  if (year === 'FE' || sem === 1 || sem === 2) {
    if (sem === 1) return FE_SEM1_SUBJECTS;
    return FE_COMP_SUBJECTS;
  }

  // 2. SE Second Year (Sem 3 & 4)
  if (year === 'SE' || sem === 3 || sem === 4) {
    if (branch === 'IT' || user.department?.toLowerCase().includes('information')) {
      return TE_IT_SUBJECTS;
    }
    if (branch === 'AI-DS' || branch === 'AIDS' || user.department?.toLowerCase().includes('artificial')) {
      return BE_AIDS_SUBJECTS;
    }
    if (branch === 'E&TC' || branch === 'ENTC' || user.department?.toLowerCase().includes('telecom') || user.department?.toLowerCase().includes('electronic')) {
      return SE_ENTC_SUBJECTS;
    }
    return SE_COMP_SUBJECTS;
  }

  // 3. TE Third Year (Sem 5 & 6)
  if (year === 'TE' || sem === 5 || sem === 6) {
    if (branch === 'IT' || user.department?.toLowerCase().includes('information')) {
      return TE_IT_SUBJECTS;
    }
    if (branch === 'AI-DS' || branch === 'AIDS' || user.department?.toLowerCase().includes('artificial')) {
      return BE_AIDS_SUBJECTS;
    }
    if (branch === 'E&TC' || branch === 'ENTC' || user.department?.toLowerCase().includes('telecom') || user.department?.toLowerCase().includes('electronic')) {
      return SE_ENTC_SUBJECTS;
    }
    return TE_COMP_SUBJECTS;
  }

  // 4. BE Final Year (Sem 7 & 8)
  if (year === 'BE' || sem === 7 || sem === 8) {
    if (branch === 'IT' || user.department?.toLowerCase().includes('information')) {
      return TE_IT_SUBJECTS;
    }
    if (branch === 'AI-DS' || branch === 'AIDS' || user.department?.toLowerCase().includes('artificial')) {
      return BE_AIDS_SUBJECTS;
    }
    if (branch === 'E&TC' || branch === 'ENTC' || user.department?.toLowerCase().includes('telecom') || user.department?.toLowerCase().includes('electronic')) {
      return SE_ENTC_SUBJECTS;
    }
    return BE_COMP_SUBJECTS;
  }

  // Fallback
  return SE_COMP_SUBJECTS;
}

export interface CatalogSubjectOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  academicYear: 'FE' | 'SE' | 'TE' | 'BE';
  semester: number;
  department: string;
  pattern: string;
  credits: number;
}

/**
 * Returns a comprehensive catalog of all SPPU subjects for the Backlog selection wizard.
 */
export function getAllCurriculumSubjectsCatalog(): CatalogSubjectOption[] {
  return [
    // FE Sem 1
    { id: 'em1', code: '107001', name: 'Engineering Mathematics-I', shortName: 'EM-I', academicYear: 'FE', semester: 1, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 4 },
    { id: 'phy-1', code: '107002', name: 'Engineering Physics', shortName: 'PHY', academicYear: 'FE', semester: 1, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'bee-1', code: '103004', name: 'Basic Electrical Engineering', shortName: 'BEE', academicYear: 'FE', semester: 1, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'mech-1', code: '101011', name: 'Engineering Mechanics', shortName: 'EM', academicYear: 'FE', semester: 1, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 4 },
    { id: 'sme-1', code: '102013', name: 'Systems in Mechanical Engineering', shortName: 'SME', academicYear: 'FE', semester: 1, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },

    // FE Sem 2
    { id: 'em2', code: '107008', name: 'Engineering Mathematics-II', shortName: 'EM-II', academicYear: 'FE', semester: 2, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 4 },
    { id: 'bxe-2', code: '104010', name: 'Basic Electronics Engineering', shortName: 'BXE', academicYear: 'FE', semester: 2, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'pps-2', code: '110005', name: 'Programming & Problem Solving (Python)', shortName: 'PPS', academicYear: 'FE', semester: 2, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'chem-2', code: '107009', name: 'Engineering Chemistry', shortName: 'CHEM', academicYear: 'FE', semester: 2, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'eg-2', code: '102012', name: 'Engineering Graphics', shortName: 'EG', academicYear: 'FE', semester: 2, department: 'First Year Common', pattern: '2024 Pattern (NEP)', credits: 3 },

    // SE Sem 3 & 4 (Computer Engineering)
    { id: 'dbms', code: '210241', name: 'Database Management Systems', shortName: 'DBMS', academicYear: 'SE', semester: 4, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 4 },
    { id: 'dsa', code: '210242', name: 'Data Structures & Algorithms', shortName: 'DSA', academicYear: 'SE', semester: 3, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 4 },
    { id: 'oop', code: '210243', name: 'Object Oriented Programming', shortName: 'OOP', academicYear: 'SE', semester: 3, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'os', code: '210244', name: 'Operating Systems', shortName: 'OS', academicYear: 'SE', semester: 4, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'toc', code: '210245', name: 'Theory of Computation', shortName: 'TOC', academicYear: 'SE', semester: 4, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'dm', code: '210240', name: 'Discrete Mathematics', shortName: 'DM', academicYear: 'SE', semester: 3, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 3 },
    { id: 'cg', code: '210246', name: 'Computer Graphics', shortName: 'CG', academicYear: 'SE', semester: 3, department: 'Computer Engineering', pattern: '2024 Pattern (NEP)', credits: 3 },

    // SE E&TC
    { id: 'ss', code: '204181', name: 'Signals & Systems', shortName: 'SS', academicYear: 'SE', semester: 3, department: 'Electronics & Telecommunication', pattern: '2019 Pattern', credits: 4 },
    { id: 'eca', code: '204182', name: 'Electronic Circuits & Analysis', shortName: 'ECA', academicYear: 'SE', semester: 3, department: 'Electronics & Telecommunication', pattern: '2019 Pattern', credits: 4 },
    { id: 'dsd', code: '204183', name: 'Digital System Design', shortName: 'DSD', academicYear: 'SE', semester: 3, department: 'Electronics & Telecommunication', pattern: '2019 Pattern', credits: 3 },
    { id: 'nt', code: '204184', name: 'Network Theory', shortName: 'NT', academicYear: 'SE', semester: 3, department: 'Electronics & Telecommunication', pattern: '2019 Pattern', credits: 3 },
    { id: 'cs-etc', code: '204185', name: 'Control Systems', shortName: 'CS', academicYear: 'SE', semester: 3, department: 'Electronics & Telecommunication', pattern: '2019 Pattern', credits: 3 },

    // TE IT
    { id: 'cns-it', code: '314441', name: 'Computer Networks & Security', shortName: 'CNS', academicYear: 'TE', semester: 6, department: 'Information Technology', pattern: '2019 Pattern', credits: 3 },
    { id: 'wad', code: '314442', name: 'Web Application Development', shortName: 'WAD', academicYear: 'TE', semester: 6, department: 'Information Technology', pattern: '2019 Pattern', credits: 3 },
    { id: 'dsbda', code: '314443', name: 'Data Science & Big Data Analytics', shortName: 'DSBDA', academicYear: 'TE', semester: 6, department: 'Information Technology', pattern: '2019 Pattern', credits: 3 },
    { id: 'cc-it', code: '314444', name: 'Cloud Computing', shortName: 'CC', academicYear: 'TE', semester: 6, department: 'Information Technology', pattern: '2019 Pattern', credits: 3 },
    { id: 'smd', code: '314445', name: 'Software Modeling & Design', shortName: 'SMD', academicYear: 'TE', semester: 6, department: 'Information Technology', pattern: '2019 Pattern', credits: 3 },

    // BE AI & DS
    { id: 'dlnn', code: '417521', name: 'Deep Learning & Neural Networks', shortName: 'DLNN', academicYear: 'BE', semester: 8, department: 'Artificial Intelligence & Data Science', pattern: '2019 Pattern', credits: 4 },
    { id: 'nlp', code: '417522', name: 'Natural Language Processing', shortName: 'NLP', academicYear: 'BE', semester: 8, department: 'Artificial Intelligence & Data Science', pattern: '2019 Pattern', credits: 3 },
    { id: 'rl', code: '417523', name: 'Reinforcement Learning', shortName: 'RL', academicYear: 'BE', semester: 8, department: 'Artificial Intelligence & Data Science', pattern: '2019 Pattern', credits: 3 },
    { id: 'bda', code: '417524', name: 'Big Data Analytics', shortName: 'BDA', academicYear: 'BE', semester: 8, department: 'Artificial Intelligence & Data Science', pattern: '2019 Pattern', credits: 3 },
    { id: 'asr', code: '417525', name: 'AI System Reliability & Ethics', shortName: 'ASR', academicYear: 'BE', semester: 8, department: 'Artificial Intelligence & Data Science', pattern: '2019 Pattern', credits: 3 },
  ];
}

/**
 * Filter catalog by criteria.
 */
export function getCurriculumByCriteria(filters: {
  year?: string;
  semester?: number;
  department?: string;
  pattern?: string;
}): CatalogSubjectOption[] {
  const all = getAllCurriculumSubjectsCatalog();
  return all.filter((s) => {
    if (filters.year && s.academicYear !== filters.year) return false;
    if (filters.semester && s.semester !== filters.semester) return false;
    if (filters.department && !s.department.toLowerCase().includes(filters.department.toLowerCase()) && filters.department !== 'All') return false;
    if (filters.pattern && s.pattern !== filters.pattern) return false;
    return true;
  });
}

/**
 * Returns dynamic questions for any subject.
 */
export function getSubjectQuestionItems(subjectId: string, subjectName?: string, subjectCode?: string) {
  const code = subjectCode || '210240';
  const name = subjectName || subjectId.toUpperCase();

  return [
    {
      id: `${subjectId}-q1`,
      subjectCode: code,
      unitNumber: 1,
      conceptCluster: `${name} Fundamentals & Architectures`,
      frequencyCount: 5,
      text: `Explain the foundational principles of ${name}. Detail the system architecture, component taxonomy, and primary design constraints with a labeled diagram.`,
      marks: 8,
      examYears: ['May 2024 (In-Sem)', 'Dec 2023 (End-Sem)', 'May 2022'],
      priority: 'MUST_STUDY' as const,
    },
    {
      id: `${subjectId}-q2`,
      subjectCode: code,
      unitNumber: 2,
      conceptCluster: 'Core Analytical Derivations & Algorithmic Tracing',
      frequencyCount: 4,
      text: `Derive the standard mathematical formulation / algorithmic complexity step for ${name} Unit 2. Provide comprehensive step-by-step proofs according to the SPPU marking rubric.`,
      marks: 6,
      examYears: ['Dec 2024 (End-Sem)', 'Dec 2023', 'May 2023'],
      priority: 'HIGH' as const,
    },
    {
      id: `${subjectId}-q3`,
      subjectCode: code,
      unitNumber: 3,
      conceptCluster: 'High-Yield Exam Scenarios',
      frequencyCount: 5,
      text: `Solve the practical university scenario for ${name} Unit 3. State all boundary assumptions, show intermediate transformations, and conclude with the optimal result.`,
      marks: 10,
      examYears: ['Nov 2024', 'May 2024', 'Dec 2022'],
      priority: 'MUST_STUDY' as const,
    },
    {
      id: `${subjectId}-q4`,
      subjectCode: code,
      unitNumber: 4,
      conceptCluster: 'Optimization & Implementation Techniques',
      frequencyCount: 3,
      text: `Critically compare the alternative strategies for ${name} Unit 4. Highlight tradeoffs in time complexity, space overhead, and hardware scalability.`,
      marks: 6,
      examYears: ['May 2024', 'Dec 2023', 'May 2021'],
      priority: 'HIGH' as const,
    },
    {
      id: `${subjectId}-q5`,
      subjectCode: code,
      unitNumber: 5,
      conceptCluster: 'Advanced Protocols & Case Studies',
      frequencyCount: 3,
      text: `Discuss the modern real-world deployment patterns and fault recovery schemes in ${name}. Reference recent engineering standards and benchmark results.`,
      marks: 8,
      examYears: ['Dec 2023', 'May 2022', 'Dec 2021'],
      priority: 'MEDIUM' as const,
    },
  ];
}

/**
 * Returns dynamic structured exam notes for any subject.
 */
export function getSubjectNoteItems(subjectId: string, subjectName?: string) {
  const name = subjectName || subjectId.toUpperCase();

  return [
    {
      id: `${subjectId}-note-1`,
      subjectId,
      unitId: `${subjectId}-u1`,
      unitNumber: 1,
      title: `${name}: Foundational Principles, Block Diagrams & Taxonomy`,
      summary: `Complete exam revision covering core definitions, SPPU 8-mark standard diagrams, and common pitfalls to avoid.`,
      readTime: '12 min read',
      isHighYield: true,
      scoringTips: [
        'Always draw the system block diagram with clear directional bus arrows (+2 Marks).',
        'State at least 4 distinct bullet comparisons rather than a single paragraph (+2 Marks).',
      ],
    },
    {
      id: `${subjectId}-note-2`,
      subjectId,
      unitId: `${subjectId}-u2`,
      unitNumber: 2,
      title: `${name}: Analytical Formulations & Stepwise Proofs`,
      summary: `High-yield reference equations, condition checks, and complete worked university numericals.`,
      readTime: '15 min read',
      isHighYield: true,
      scoringTips: [
        'State the boundary theorem before applying the derivation formula (+1 Mark).',
        'Underline final numeric answers and specify correct SI units (+1 Mark).',
      ],
    },
    {
      id: `${subjectId}-note-3`,
      subjectId,
      unitId: `${subjectId}-u3`,
      unitNumber: 3,
      title: `${name}: High-Frequency In-Sem & End-Sem Topics`,
      summary: `Synthesized summary of concepts repeated in over 85% of university question papers from 2019 to 2025.`,
      readTime: '18 min read',
      isHighYield: true,
      scoringTips: [
        'Highlight critical edge cases in pseudo-code algorithms (+2 Marks).',
        'Include time & space complexity analysis in the conclusion (+1 Mark).',
      ],
    },
  ];
}

/**
 * Returns dynamic past papers for any subject.
 */
export function getSubjectPYQPapers(subjectId: string, subjectCode?: string, subjectName?: string) {
  const code = subjectCode || 'SPPU-EXAM';
  const name = subjectName || subjectId.toUpperCase();

  return [
    { id: `${subjectId}-p1`, session: 'Dec 2024', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: `${code}-DEC24`, questionsCount: 16, subjectName: name },
    { id: `${subjectId}-p2`, session: 'May 2024', type: 'In-Sem Exam', marks: 30, duration: '1 Hour', code: `${code}-MAY24-IN`, questionsCount: 6, subjectName: name },
    { id: `${subjectId}-p3`, session: 'Dec 2023', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: `${code}-DEC23`, questionsCount: 16, subjectName: name },
    { id: `${subjectId}-p4`, session: 'May 2023', type: 'In-Sem Exam', marks: 30, duration: '1 Hour', code: `${code}-MAY23-IN`, questionsCount: 6, subjectName: name },
    { id: `${subjectId}-p5`, session: 'Dec 2022', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: `${code}-DEC22`, questionsCount: 16, subjectName: name },
  ];
}


