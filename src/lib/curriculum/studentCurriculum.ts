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
  const sem = user.semester_number || 4;

  // 1. FE First Year (Any branch or FE Comp)
  if (year === 'FE' || sem === 1 || sem === 2) {
    return FE_COMP_SUBJECTS;
  }

  // 2. IT (Information Technology) - TE or Sem 5/6
  if (branch === 'IT' || user.department?.toLowerCase().includes('information')) {
    return TE_IT_SUBJECTS;
  }

  // 3. AI-DS (Artificial Intelligence & Data Science) - BE or Sem 7/8
  if (branch === 'AI-DS' || branch === 'AIDS' || user.department?.toLowerCase().includes('artificial')) {
    return BE_AIDS_SUBJECTS;
  }

  // 4. E&TC (Electronics & Telecommunication)
  if (branch === 'E&TC' || branch === 'ENTC' || user.department?.toLowerCase().includes('telecom') || user.department?.toLowerCase().includes('electronic')) {
    return SE_ENTC_SUBJECTS;
  }

  // 5. Default Computer Engineering (SE or Sem 3/4)
  return SE_COMP_SUBJECTS;
}
