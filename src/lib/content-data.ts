// Learning content modules
export interface Module {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  content: string;
  duration: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: 'a' | 'b' | 'c' | 'd';
}

export const modules: Module[] = [
  {
    id: 'intro-ml',
    title: 'Introduction to Machine Learning',
    level: 'beginner',
    description: 'Learn the fundamentals of machine learning, including key concepts and terminology.',
    content: `Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

**Key Concepts:**
- **Supervised Learning**: Training with labeled data to predict outcomes
- **Unsupervised Learning**: Finding patterns in unlabeled data
- **Reinforcement Learning**: Learning through rewards and penalties

**Applications:**
Machine learning powers many technologies we use daily, from recommendation systems on streaming platforms to spam filters in email.

**Why It Matters:**
Understanding ML fundamentals helps you grasp how modern AI systems make decisions and predictions.`,
    duration: 10,
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks Explained',
    level: 'intermediate',
    description: 'Understand how neural networks work and their architecture.',
    content: `Neural Networks are computing systems inspired by biological neural networks in the human brain.

**Architecture Components:**
- **Input Layer**: Receives the initial data
- **Hidden Layers**: Process and transform the data
- **Output Layer**: Produces the final prediction

**How They Learn:**
Neural networks learn through a process called backpropagation, adjusting connection weights based on prediction errors.

**Types of Neural Networks:**
- Feedforward Networks
- Convolutional Neural Networks (CNNs)
- Recurrent Neural Networks (RNNs)

**Applications:**
Image recognition, natural language processing, and autonomous vehicles all rely on neural networks.`,
    duration: 15,
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Advanced Concepts',
    level: 'advanced',
    description: 'Explore advanced deep learning techniques and architectures.',
    content: `Deep Learning uses multiple layers of neural networks to progressively extract higher-level features from raw input.

**Advanced Architectures:**
- **Transformers**: Attention-based models revolutionizing NLP
- **GANs**: Generative Adversarial Networks for content creation
- **Autoencoders**: Compression and feature learning

**Key Techniques:**
- Batch Normalization
- Dropout for Regularization
- Transfer Learning

**Optimization:**
Advanced optimizers like Adam and RMSprop help train deeper networks more efficiently.

**Cutting-Edge Applications:**
Large language models, diffusion models for image generation, and multimodal AI systems.`,
    duration: 20,
  },
];

export const quizQuestions: QuizQuestion[] = [
  // Intro to ML questions
  {
    id: 'q1-intro',
    moduleId: 'intro-ml',
    question: 'What is supervised learning?',
    options: {
      a: 'Learning without any data',
      b: 'Training with labeled data to predict outcomes',
      c: 'Learning only from images',
      d: 'A type of hardware',
    },
    correctOption: 'b',
  },
  {
    id: 'q2-intro',
    moduleId: 'intro-ml',
    question: 'Which of the following is an example of machine learning application?',
    options: {
      a: 'Calculator',
      b: 'Spam email filter',
      c: 'Light switch',
      d: 'Ruler',
    },
    correctOption: 'b',
  },
  {
    id: 'q3-intro',
    moduleId: 'intro-ml',
    question: 'What is reinforcement learning?',
    options: {
      a: 'Learning from labeled examples',
      b: 'Finding patterns without labels',
      c: 'Learning through rewards and penalties',
      d: 'Memorizing data',
    },
    correctOption: 'c',
  },
  // Neural Networks questions
  {
    id: 'q1-nn',
    moduleId: 'neural-networks',
    question: 'What inspired the design of neural networks?',
    options: {
      a: 'Computer chips',
      b: 'Biological neurons in the brain',
      c: 'Solar panels',
      d: 'Database tables',
    },
    correctOption: 'b',
  },
  {
    id: 'q2-nn',
    moduleId: 'neural-networks',
    question: 'What is backpropagation?',
    options: {
      a: 'Moving data backwards through networks',
      b: 'A type of neural network',
      c: 'Adjusting weights based on prediction errors',
      d: 'Deleting neurons',
    },
    correctOption: 'c',
  },
  {
    id: 'q3-nn',
    moduleId: 'neural-networks',
    question: 'Which type of neural network is commonly used for image recognition?',
    options: {
      a: 'Feedforward Networks',
      b: 'Convolutional Neural Networks (CNNs)',
      c: 'Simple Perceptrons',
      d: 'Decision Trees',
    },
    correctOption: 'b',
  },
  // Deep Learning questions
  {
    id: 'q1-dl',
    moduleId: 'deep-learning',
    question: 'What makes deep learning "deep"?',
    options: {
      a: 'It uses dark colors',
      b: 'Multiple layers of neural networks',
      c: 'It requires deep thinking',
      d: 'It goes deep underground',
    },
    correctOption: 'b',
  },
  {
    id: 'q2-dl',
    moduleId: 'deep-learning',
    question: 'What are Transformers primarily used for?',
    options: {
      a: 'Electrical engineering',
      b: 'Natural language processing',
      c: 'Toy manufacturing',
      d: 'Transportation',
    },
    correctOption: 'b',
  },
  {
    id: 'q3-dl',
    moduleId: 'deep-learning',
    question: 'What is Transfer Learning?',
    options: {
      a: 'Moving a model to a different computer',
      b: 'Using a pre-trained model for a new task',
      c: 'Transferring data between databases',
      d: 'A payment method',
    },
    correctOption: 'b',
  },
];

export function getModuleById(id: string): Module | undefined {
  return modules.find(m => m.id === id);
}

export function getQuestionsByModuleId(moduleId: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.moduleId === moduleId);
}

export function getModulesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Module[] {
  return modules.filter(m => m.level === level);
}
