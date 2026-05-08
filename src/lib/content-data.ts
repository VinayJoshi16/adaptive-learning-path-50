// Learning content modules
export interface Module {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  content: string;
  duration: number; // in minutes
  order: number; // Sequential order for unlocking
  topics: string[]; // Topic areas covered in this module
  videoUrl?: string; // Direct video URL (mp4, webm)
  youtubeUrl?: string; // YouTube video URL
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: 'a' | 'b' | 'c' | 'd';
  topic: string; // Which topic this question covers
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
    order: 1,
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'ML Applications'],
  },
  {
    id: 'data-preprocessing',
    title: 'Data Preprocessing Essentials',
    level: 'beginner',
    description: 'Master the art of preparing data for machine learning models.',
    content: `Data preprocessing is a crucial step that transforms raw data into a clean, usable format for machine learning algorithms.

**Key Preprocessing Steps:**
- **Data Cleaning**: Handling missing values and removing duplicates
- **Feature Scaling**: Normalizing and standardizing numerical features
- **Encoding**: Converting categorical variables to numerical format
- **Feature Selection**: Choosing the most relevant features

**Common Techniques:**
- Min-Max Scaling: Scales features to a fixed range (usually 0-1)
- Standard Scaling: Centers data around mean with unit variance
- One-Hot Encoding: Creates binary columns for categorical values

**Why It's Important:**
Good preprocessing can significantly improve model performance and training speed.`,
    duration: 12,
    order: 2,
    topics: ['Data Cleaning', 'Feature Scaling', 'Encoding', 'Feature Selection'],
  },
  {
    id: 'regression-models',
    title: 'Regression Models',
    level: 'beginner',
    description: 'Understand linear and polynomial regression for predicting continuous values.',
    content: `Regression models are used to predict continuous numerical values based on input features.

**Types of Regression:**
- **Linear Regression**: Models linear relationships between variables
- **Polynomial Regression**: Captures non-linear relationships
- **Ridge/Lasso Regression**: Regularized versions that prevent overfitting

**Key Concepts:**
- Coefficients represent the relationship strength
- R-squared measures how well the model fits the data
- Residuals are the differences between predicted and actual values

**Applications:**
- Predicting house prices
- Forecasting sales
- Estimating customer lifetime value

**Best Practices:**
Always check for linearity assumptions and handle outliers appropriately.`,
    duration: 15,
    order: 3,
    topics: ['Linear Regression', 'Polynomial Regression', 'Regularization', 'Model Evaluation'],
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
    order: 4,
    topics: ['Network Architecture', 'Backpropagation', 'CNN', 'RNN'],
  },
  {
    id: 'model-evaluation',
    title: 'Model Evaluation & Validation',
    level: 'intermediate',
    description: 'Learn techniques to properly evaluate and validate your ML models.',
    content: `Proper model evaluation ensures your machine learning models perform well on unseen data.

**Key Metrics:**
- **Accuracy**: Overall correctness of predictions
- **Precision**: Accuracy of positive predictions
- **Recall**: Ability to find all positive cases
- **F1-Score**: Harmonic mean of precision and recall

**Validation Techniques:**
- Train-Test Split: Simple division of data
- K-Fold Cross-Validation: More robust evaluation
- Stratified Sampling: Maintains class distribution

**Overfitting vs Underfitting:**
- Overfitting: Model memorizes training data
- Underfitting: Model is too simple

**Best Practices:**
Always use a holdout test set and never train on your evaluation data.`,
    duration: 18,
    order: 5,
    topics: ['Evaluation Metrics', 'Cross-Validation', 'Overfitting', 'Test Strategy'],
  },
  {
    id: 'ensemble-methods',
    title: 'Ensemble Learning Methods',
    level: 'intermediate',
    description: 'Combine multiple models for better predictions.',
    content: `Ensemble methods combine multiple machine learning models to produce better predictions than any single model.

**Types of Ensemble Methods:**
- **Bagging**: Bootstrap Aggregating - trains models on random subsets
- **Boosting**: Sequential training where each model corrects previous errors
- **Stacking**: Uses predictions of base models as input to a meta-model

**Popular Algorithms:**
- Random Forest: Ensemble of decision trees using bagging
- Gradient Boosting: XGBoost, LightGBM, CatBoost
- AdaBoost: Adaptive boosting for weak learners

**When to Use:**
Ensembles work best when base models have diverse errors and are individually reasonably accurate.

**Trade-offs:**
More complexity and training time, but often better performance.`,
    duration: 20,
    order: 6,
    topics: ['Bagging', 'Boosting', 'Random Forest', 'Gradient Boosting'],
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
    order: 7,
    topics: ['Transformers', 'GANs', 'Autoencoders', 'Transfer Learning'],
  },
  {
    id: 'nlp-fundamentals',
    title: 'Natural Language Processing',
    level: 'advanced',
    description: 'Process and understand human language with ML.',
    content: `Natural Language Processing (NLP) enables machines to understand, interpret, and generate human language.

**Core Concepts:**
- **Tokenization**: Breaking text into words or subwords
- **Embeddings**: Vector representations of words
- **Attention Mechanisms**: Focus on relevant parts of input

**Key Architectures:**
- Word2Vec and GloVe for word embeddings
- BERT for contextual understanding
- GPT for text generation

**NLP Tasks:**
- Sentiment Analysis
- Named Entity Recognition
- Machine Translation
- Question Answering

**Modern Advances:**
Large Language Models (LLMs) like GPT-4 and Claude represent the cutting edge of NLP capabilities.`,
    duration: 25,
    order: 8,
    topics: ['Tokenization', 'Word Embeddings', 'Attention', 'LLMs'],
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision Deep Dive',
    level: 'advanced',
    description: 'Enable machines to interpret and understand visual information.',
    content: `Computer Vision allows machines to derive meaningful information from digital images and videos.

**Core Techniques:**
- **Convolution**: Detecting patterns and features in images
- **Pooling**: Reducing spatial dimensions
- **Object Detection**: Locating objects in images

**Popular Architectures:**
- ResNet: Deep residual networks
- YOLO: Real-time object detection
- U-Net: Image segmentation

**Applications:**
- Facial Recognition
- Autonomous Driving
- Medical Image Analysis
- Augmented Reality

**Current Trends:**
Vision Transformers (ViT) are challenging CNN dominance, and multimodal models combine vision with language understanding.`,
    duration: 25,
    order: 9,
    topics: ['Convolution', 'Object Detection', 'Image Segmentation', 'Vision Transformers'],
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
    topic: 'Supervised Learning',
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
    topic: 'ML Applications',
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
    topic: 'Reinforcement Learning',
  },
  {
    id: 'q4-intro',
    moduleId: 'intro-ml',
    question: 'In unsupervised learning, the data is:',
    options: {
      a: 'Labeled with correct answers',
      b: 'Unlabeled and the model finds patterns',
      c: 'Always numerical',
      d: 'Supervised by humans',
    },
    correctOption: 'b',
    topic: 'Unsupervised Learning',
  },
  {
    id: 'q5-intro',
    moduleId: 'intro-ml',
    question: 'Which is NOT a type of machine learning?',
    options: {
      a: 'Supervised Learning',
      b: 'Unsupervised Learning',
      c: 'Mechanical Learning',
      d: 'Reinforcement Learning',
    },
    correctOption: 'c',
    topic: 'ML Applications',
  },
  // Data Preprocessing questions
  {
    id: 'q1-preprocess',
    moduleId: 'data-preprocessing',
    question: 'What is the purpose of feature scaling?',
    options: {
      a: 'To add more features',
      b: 'To normalize numerical features to a similar range',
      c: 'To remove all features',
      d: 'To make data larger',
    },
    correctOption: 'b',
    topic: 'Feature Scaling',
  },
  {
    id: 'q2-preprocess',
    moduleId: 'data-preprocessing',
    question: 'One-Hot Encoding is used to:',
    options: {
      a: 'Convert categorical variables to numerical format',
      b: 'Heat up the data',
      c: 'Remove missing values',
      d: 'Increase data size',
    },
    correctOption: 'a',
    topic: 'Encoding',
  },
  {
    id: 'q3-preprocess',
    moduleId: 'data-preprocessing',
    question: 'What is data cleaning primarily concerned with?',
    options: {
      a: 'Making data look pretty',
      b: 'Handling missing values and removing duplicates',
      c: 'Adding more data',
      d: 'Encrypting data',
    },
    correctOption: 'b',
    topic: 'Data Cleaning',
  },
  {
    id: 'q4-preprocess',
    moduleId: 'data-preprocessing',
    question: 'Min-Max Scaling transforms data to:',
    options: {
      a: 'A fixed range, usually 0-1',
      b: 'Always negative values',
      c: 'Random values',
      d: 'Only integers',
    },
    correctOption: 'a',
    topic: 'Feature Scaling',
  },
  {
    id: 'q5-preprocess',
    moduleId: 'data-preprocessing',
    question: 'Feature selection helps to:',
    options: {
      a: 'Add all possible features',
      b: 'Choose the most relevant features',
      c: 'Delete all features',
      d: 'Duplicate features',
    },
    correctOption: 'b',
    topic: 'Feature Selection',
  },
  // Regression questions
  {
    id: 'q1-regression',
    moduleId: 'regression-models',
    question: 'Linear regression is used to predict:',
    options: {
      a: 'Categories',
      b: 'Continuous numerical values',
      c: 'Images',
      d: 'Text',
    },
    correctOption: 'b',
    topic: 'Linear Regression',
  },
  {
    id: 'q2-regression',
    moduleId: 'regression-models',
    question: 'What does R-squared measure?',
    options: {
      a: 'The speed of the model',
      b: 'How well the model fits the data',
      c: 'The size of the data',
      d: 'The number of features',
    },
    correctOption: 'b',
    topic: 'Model Evaluation',
  },
  {
    id: 'q3-regression',
    moduleId: 'regression-models',
    question: 'Ridge and Lasso regression help prevent:',
    options: {
      a: 'Underfitting',
      b: 'Data loading',
      c: 'Overfitting',
      d: 'Feature creation',
    },
    correctOption: 'c',
    topic: 'Regularization',
  },
  {
    id: 'q4-regression',
    moduleId: 'regression-models',
    question: 'Polynomial regression is used for:',
    options: {
      a: 'Only linear relationships',
      b: 'Non-linear relationships',
      c: 'Classification tasks',
      d: 'Text processing',
    },
    correctOption: 'b',
    topic: 'Polynomial Regression',
  },
  {
    id: 'q5-regression',
    moduleId: 'regression-models',
    question: 'Residuals in regression represent:',
    options: {
      a: 'The model coefficients',
      b: 'Differences between predicted and actual values',
      c: 'The input features',
      d: 'The training time',
    },
    correctOption: 'b',
    topic: 'Model Evaluation',
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
    topic: 'Network Architecture',
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
    topic: 'Backpropagation',
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
    topic: 'CNN',
  },
  {
    id: 'q4-nn',
    moduleId: 'neural-networks',
    question: 'RNNs are particularly good at processing:',
    options: {
      a: 'Static images',
      b: 'Sequential data like text or time series',
      c: 'Tabular data',
      d: 'Random noise',
    },
    correctOption: 'b',
    topic: 'RNN',
  },
  {
    id: 'q5-nn',
    moduleId: 'neural-networks',
    question: 'The hidden layers in a neural network:',
    options: {
      a: 'Are invisible to users',
      b: 'Process and transform the data',
      c: 'Only store data',
      d: 'Are optional',
    },
    correctOption: 'b',
    topic: 'Network Architecture',
  },
  // Model Evaluation questions
  {
    id: 'q1-eval',
    moduleId: 'model-evaluation',
    question: 'Precision measures:',
    options: {
      a: 'The speed of predictions',
      b: 'The accuracy of positive predictions',
      c: 'The size of the model',
      d: 'Training time',
    },
    correctOption: 'b',
    topic: 'Evaluation Metrics',
  },
  {
    id: 'q2-eval',
    moduleId: 'model-evaluation',
    question: 'K-Fold Cross-Validation:',
    options: {
      a: 'Uses only one split of data',
      b: 'Provides more robust evaluation by using multiple splits',
      c: 'Is faster than train-test split',
      d: 'Requires labeled data',
    },
    correctOption: 'b',
    topic: 'Cross-Validation',
  },
  {
    id: 'q3-eval',
    moduleId: 'model-evaluation',
    question: 'Overfitting occurs when:',
    options: {
      a: 'The model is too simple',
      b: 'The model memorizes training data',
      c: 'There is not enough data',
      d: 'The model trains too fast',
    },
    correctOption: 'b',
    topic: 'Overfitting',
  },
  {
    id: 'q4-eval',
    moduleId: 'model-evaluation',
    question: 'F1-Score is the:',
    options: {
      a: 'Average of all metrics',
      b: 'Harmonic mean of precision and recall',
      c: 'Training accuracy',
      d: 'Number of features',
    },
    correctOption: 'b',
    topic: 'Evaluation Metrics',
  },
  {
    id: 'q5-eval',
    moduleId: 'model-evaluation',
    question: 'A holdout test set should:',
    options: {
      a: 'Be used for training',
      b: 'Never be seen during training',
      c: 'Be the largest portion of data',
      d: 'Contain only incorrect examples',
    },
    correctOption: 'b',
    topic: 'Test Strategy',
  },
  // Ensemble Methods questions
  {
    id: 'q1-ensemble',
    moduleId: 'ensemble-methods',
    question: 'Bagging stands for:',
    options: {
      a: 'Bag of Words',
      b: 'Bootstrap Aggregating',
      c: 'Basic Algorithm Gathering',
      d: 'Batch Averaging',
    },
    correctOption: 'b',
    topic: 'Bagging',
  },
  {
    id: 'q2-ensemble',
    moduleId: 'ensemble-methods',
    question: 'In boosting, each model:',
    options: {
      a: 'Trains independently',
      b: 'Corrects errors from previous models',
      c: 'Uses the same data',
      d: 'Has the same weights',
    },
    correctOption: 'b',
    topic: 'Boosting',
  },
  {
    id: 'q3-ensemble',
    moduleId: 'ensemble-methods',
    question: 'Random Forest is an ensemble of:',
    options: {
      a: 'Neural networks',
      b: 'Decision trees',
      c: 'Linear models',
      d: 'K-Nearest Neighbors',
    },
    correctOption: 'b',
    topic: 'Random Forest',
  },
  {
    id: 'q4-ensemble',
    moduleId: 'ensemble-methods',
    question: 'XGBoost is a type of:',
    options: {
      a: 'Bagging algorithm',
      b: 'Gradient boosting algorithm',
      c: 'Neural network',
      d: 'Clustering algorithm',
    },
    correctOption: 'b',
    topic: 'Gradient Boosting',
  },
  {
    id: 'q5-ensemble',
    moduleId: 'ensemble-methods',
    question: 'Ensemble methods work best when base models:',
    options: {
      a: 'Make the same errors',
      b: 'Have diverse errors',
      c: 'Are all identical',
      d: 'Are untrained',
    },
    correctOption: 'b',
    topic: 'Boosting',
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
    topic: 'Autoencoders',
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
    topic: 'Transformers',
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
    topic: 'Transfer Learning',
  },
  {
    id: 'q4-dl',
    moduleId: 'deep-learning',
    question: 'GANs consist of:',
    options: {
      a: 'Two competing networks',
      b: 'A single large network',
      c: 'Only convolutional layers',
      d: 'Decision trees',
    },
    correctOption: 'a',
    topic: 'GANs',
  },
  {
    id: 'q5-dl',
    moduleId: 'deep-learning',
    question: 'Dropout is used for:',
    options: {
      a: 'Removing data',
      b: 'Regularization to prevent overfitting',
      c: 'Speeding up training',
      d: 'Adding more layers',
    },
    correctOption: 'b',
    topic: 'Autoencoders',
  },
  // NLP questions
  {
    id: 'q1-nlp',
    moduleId: 'nlp-fundamentals',
    question: 'Tokenization is the process of:',
    options: {
      a: 'Creating tokens for authentication',
      b: 'Breaking text into words or subwords',
      c: 'Encrypting text',
      d: 'Deleting words',
    },
    correctOption: 'b',
    topic: 'Tokenization',
  },
  {
    id: 'q2-nlp',
    moduleId: 'nlp-fundamentals',
    question: 'Word embeddings represent words as:',
    options: {
      a: 'Images',
      b: 'Vectors in a continuous space',
      c: 'Binary numbers',
      d: 'Sound waves',
    },
    correctOption: 'b',
    topic: 'Word Embeddings',
  },
  {
    id: 'q3-nlp',
    moduleId: 'nlp-fundamentals',
    question: 'Attention mechanisms help models:',
    options: {
      a: 'Pay more attention to users',
      b: 'Focus on relevant parts of input',
      c: 'Train faster',
      d: 'Use less memory',
    },
    correctOption: 'b',
    topic: 'Attention',
  },
  {
    id: 'q4-nlp',
    moduleId: 'nlp-fundamentals',
    question: 'BERT is known for:',
    options: {
      a: 'Image generation',
      b: 'Contextual understanding of language',
      c: 'Video processing',
      d: 'Audio transcription',
    },
    correctOption: 'b',
    topic: 'LLMs',
  },
  {
    id: 'q5-nlp',
    moduleId: 'nlp-fundamentals',
    question: 'Large Language Models (LLMs) can:',
    options: {
      a: 'Only translate text',
      b: 'Generate, understand, and reason about text',
      c: 'Only classify sentiment',
      d: 'Only answer yes/no questions',
    },
    correctOption: 'b',
    topic: 'LLMs',
  },
  // Computer Vision questions
  {
    id: 'q1-cv',
    moduleId: 'computer-vision',
    question: 'Convolution in CNNs helps detect:',
    options: {
      a: 'Patterns and features in images',
      b: 'Text in images only',
      c: 'Audio signals',
      d: 'Database records',
    },
    correctOption: 'a',
    topic: 'Convolution',
  },
  {
    id: 'q2-cv',
    moduleId: 'computer-vision',
    question: 'YOLO is used for:',
    options: {
      a: 'Text generation',
      b: 'Real-time object detection',
      c: 'Audio processing',
      d: 'Data cleaning',
    },
    correctOption: 'b',
    topic: 'Object Detection',
  },
  {
    id: 'q3-cv',
    moduleId: 'computer-vision',
    question: 'Image segmentation divides an image into:',
    options: {
      a: 'Equal squares',
      b: 'Meaningful regions or objects',
      c: 'Random pieces',
      d: 'Black and white areas',
    },
    correctOption: 'b',
    topic: 'Image Segmentation',
  },
  {
    id: 'q4-cv',
    moduleId: 'computer-vision',
    question: 'Vision Transformers (ViT) apply:',
    options: {
      a: 'Convolution to images',
      b: 'Transformer architecture to image patches',
      c: 'RNNs to images',
      d: 'Decision trees to pixels',
    },
    correctOption: 'b',
    topic: 'Vision Transformers',
  },
  {
    id: 'q5-cv',
    moduleId: 'computer-vision',
    question: 'Pooling layers help:',
    options: {
      a: 'Add more pixels',
      b: 'Reduce spatial dimensions',
      c: 'Increase image size',
      d: 'Add color',
    },
    correctOption: 'b',
    topic: 'Convolution',
  },
  // Python Basics questions
  {
    id: 'q1-python',
    moduleId: 'python-basics',
    question: 'Which keyword is used to define a function in Python?',
    options: {
      a: 'function',
      b: 'def',
      c: 'func',
      d: 'define',
    },
    correctOption: 'b',
    topic: 'Python Syntax',
  },
  {
    id: 'q2-python',
    moduleId: 'python-basics',
    question: 'What is the output of: print(type([1, 2, 3]))?',
    options: {
      a: '<class \'tuple\'>',
      b: '<class \'list\'>',
      c: '<class \'dict\'>',
      d: '<class \'set\'>',
    },
    correctOption: 'b',
    topic: 'Data Structures',
  },
  {
    id: 'q3-python',
    moduleId: 'python-basics',
    question: 'Which loop is used to iterate over a sequence in Python?',
    options: {
      a: 'foreach',
      b: 'for',
      c: 'loop',
      d: 'repeat',
    },
    correctOption: 'b',
    topic: 'Control Flow',
  },
  {
    id: 'q4-python',
    moduleId: 'python-basics',
    question: 'How do you create a dictionary in Python?',
    options: {
      a: '[1, 2, 3]',
      b: '{"key": "value"}',
      c: '(1, 2, 3)',
      d: '{1, 2, 3}',
    },
    correctOption: 'b',
    topic: 'Data Structures',
  },
  {
    id: 'q5-python',
    moduleId: 'python-basics',
    question: 'What does the "elif" keyword represent?',
    options: {
      a: 'End of loop',
      b: 'Else if — an additional condition check',
      c: 'A variable name',
      d: 'A data type',
    },
    correctOption: 'b',
    topic: 'Control Flow',
  },
  // DSA Fundamentals questions
  {
    id: 'q1-dsa',
    moduleId: 'dsa-fundamentals',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: {
      a: 'O(n)',
      b: 'O(1)',
      c: 'O(log n)',
      d: 'O(n^2)',
    },
    correctOption: 'b',
    topic: 'Arrays',
  },
  {
    id: 'q2-dsa',
    moduleId: 'dsa-fundamentals',
    question: 'Which data structure uses LIFO (Last In, First Out) ordering?',
    options: {
      a: 'Queue',
      b: 'Stack',
      c: 'Array',
      d: 'Linked List',
    },
    correctOption: 'b',
    topic: 'Arrays',
  },
  {
    id: 'q3-dsa',
    moduleId: 'dsa-fundamentals',
    question: 'What is the worst-case time complexity of binary search?',
    options: {
      a: 'O(n)',
      b: 'O(log n)',
      c: 'O(1)',
      d: 'O(n log n)',
    },
    correctOption: 'b',
    topic: 'Algorithms',
  },
  {
    id: 'q4-dsa',
    moduleId: 'dsa-fundamentals',
    question: 'In a singly linked list, each node contains:',
    options: {
      a: 'Only data',
      b: 'Data and a pointer to the next node',
      c: 'Pointers to both next and previous nodes',
      d: 'An array of values',
    },
    correctOption: 'b',
    topic: 'Linked Lists',
  },
  {
    id: 'q5-dsa',
    moduleId: 'dsa-fundamentals',
    question: 'A binary tree where every node has at most two children is called:',
    options: {
      a: 'Graph',
      b: 'Binary tree',
      c: 'Linked List',
      d: 'Hash Table',
    },
    correctOption: 'b',
    topic: 'Trees',
  },
  // Java & OOP questions
  {
    id: 'q1-java',
    moduleId: 'java-oop',
    question: 'What is encapsulation in OOP?',
    options: {
      a: 'Inheriting from a parent class',
      b: 'Bundling data and methods that operate on that data within a class',
      c: 'Creating multiple forms of a method',
      d: 'Hiding the implementation of a class entirely',
    },
    correctOption: 'b',
    topic: 'Encapsulation',
  },
  {
    id: 'q2-java',
    moduleId: 'java-oop',
    question: 'Which keyword is used to inherit a class in Java?',
    options: {
      a: 'implements',
      b: 'extends',
      c: 'inherits',
      d: 'super',
    },
    correctOption: 'b',
    topic: 'Inheritance',
  },
  {
    id: 'q3-java',
    moduleId: 'java-oop',
    question: 'Polymorphism allows:',
    options: {
      a: 'Only one form of a method',
      b: 'Objects to take many forms and methods to behave differently based on the object',
      c: 'Hiding data from other classes',
      d: 'Creating abstract classes only',
    },
    correctOption: 'b',
    topic: 'Polymorphism',
  },
  {
    id: 'q4-java',
    moduleId: 'java-oop',
    question: 'An abstract class in Java:',
    options: {
      a: 'Can be instantiated directly',
      b: 'Cannot be instantiated and may contain abstract methods',
      c: 'Must have all methods implemented',
      d: 'Is the same as an interface',
    },
    correctOption: 'b',
    topic: 'OOP',
  },
  {
    id: 'q5-java',
    moduleId: 'java-oop',
    question: 'What is the purpose of the "this" keyword in Java?',
    options: {
      a: 'To create a new object',
      b: 'To refer to the current instance of the class',
      c: 'To call a static method',
      d: 'To import a package',
    },
    correctOption: 'b',
    topic: 'OOP',
  },
];

// Engagement intervention questions - generated from high engagement topics
export const interventionQuestions: QuizQuestion[] = [
  // General ML questions for refocus
  {
    id: 'int-1',
    moduleId: 'all',
    question: 'Quick check: What type of learning uses labeled data?',
    options: {
      a: 'Unsupervised Learning',
      b: 'Supervised Learning',
      c: 'Reinforcement Learning',
      d: 'Transfer Learning',
    },
    correctOption: 'b',
    topic: 'Supervised Learning',
  },
  {
    id: 'int-2',
    moduleId: 'all',
    question: 'What is the main goal of feature scaling?',
    options: {
      a: 'Make data larger',
      b: 'Normalize features to similar ranges',
      c: 'Remove features',
      d: 'Add noise',
    },
    correctOption: 'b',
    topic: 'Feature Scaling',
  },
  {
    id: 'int-3',
    moduleId: 'all',
    question: 'Neural networks are inspired by:',
    options: {
      a: 'Computer chips',
      b: 'The human brain',
      c: 'Solar panels',
      d: 'Databases',
    },
    correctOption: 'b',
    topic: 'Network Architecture',
  },
  {
    id: 'int-4',
    moduleId: 'all',
    question: 'Overfitting means the model:',
    options: {
      a: 'Is too simple',
      b: 'Memorizes training data too well',
      c: 'Trains too fast',
      d: 'Uses too little data',
    },
    correctOption: 'b',
    topic: 'Overfitting',
  },
];

export function getModuleById(id: string): Module | undefined {
  return modules.find(m => m.id === id) || codingModules.find(m => m.id === id);
}

export function getQuestionsByModuleId(moduleId: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.moduleId === moduleId);
}

export function getModulesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Module[] {
  return modules.filter(m => m.level === level);
}

export function getModuleByOrder(order: number, isCoding: boolean = false): Module | undefined {
  if (isCoding) return codingModules.find(m => m.order === order);
  return modules.find(m => m.order === order);
}

export function getNextModule(currentModuleId: string): Module | undefined {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return undefined;
  return getModuleByOrder(currentModule.order + 1);
}

export function getInterventionQuestions(topics: string[], count: number = 3): QuizQuestion[] {
  // Get questions that match the high-engagement topics
  const matchingQuestions = [...interventionQuestions, ...quizQuestions].filter(
    q => topics.includes(q.topic)
  );
  
  // Shuffle and return requested count
  const shuffled = matchingQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, 4));
}

export const codingModules: Module[] = [
  {
    id: 'python-basics',
    title: 'Python Basics',
    level: 'beginner',
    description: 'Learn the fundamentals of Python programming.',
    content: `Python is a high-level, interpreted programming language known for its readability and versatility.

**Key Concepts:**
- Variables and Data Types
- Control Flow (if/else, loops)
- Functions
- Data Structures (Lists, Dictionaries, Sets, Tuples)`,
    duration: 30,
    order: 1,
    topics: ['Python Syntax', 'Control Flow', 'Data Structures'],
  },
  {
    id: 'dsa-fundamentals',
    title: 'Data Structures & Algorithms',
    level: 'intermediate',
    description: 'Master core data structures and common algorithms.',
    content: `Data Structures and Algorithms form the foundation of efficient software engineering.

**Key Concepts:**
- Arrays and Linked Lists
- Stacks and Queues
- Trees and Graphs
- Sorting and Searching Algorithms
- Time & Space Complexity (Big O Notation)`,
    duration: 60,
    order: 2,
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Algorithms'],
  },
  {
    id: 'java-oop',
    title: 'Java & Object-Oriented Programming',
    level: 'intermediate',
    description: 'Understand OOP concepts using Java.',
    content: `Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible.

**Key Concepts:**
- Classes and Objects
- Inheritance
- Polymorphism
- Encapsulation
- Abstraction`,
    duration: 45,
    order: 3,
    topics: ['OOP', 'Inheritance', 'Polymorphism', 'Encapsulation'],
  }
];

export function getCodingModuleById(id: string): Module | undefined {
  return codingModules.find(m => m.id === id);
}

export function getCodingModuleByOrder(order: number): Module | undefined {
  return codingModules.find(m => m.order === order);
}

