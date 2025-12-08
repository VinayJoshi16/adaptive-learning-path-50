// Recommendation types
export type RecommendationType = 'remedial' | 'repeat' | 'advanced';

export interface RecommendationResult {
  type: RecommendationType;
  message: string;
  nextModuleLevel: 'beginner' | 'intermediate' | 'advanced';
  passed: boolean; // Whether the quiz was passed (>= 80%)
}

// Passing score threshold
export const PASSING_SCORE = 80;

// Rule-based recommendation engine
export function getRuleBasedRecommendation(
  engagementScore: number,
  quizScore: number,
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
): RecommendationResult {
  const passed = quizScore >= PASSING_SCORE;
  
  // High performance: advance to next level
  if (quizScore >= PASSING_SCORE && engagementScore >= 70) {
    const nextLevel = getNextLevel(currentLevel);
    return {
      type: 'advanced',
      message: `Excellent work! Your high engagement (${engagementScore}%) and strong quiz performance (${quizScore}%) show you've mastered this content. You may proceed to the next module!`,
      nextModuleLevel: nextLevel,
      passed: true,
    };
  }

  // Passed quiz but low engagement
  if (quizScore >= PASSING_SCORE && engagementScore < 70) {
    return {
      type: 'advanced',
      message: `You passed the quiz (${quizScore}%)! Consider improving your engagement (${engagementScore}%) in future modules for better retention.`,
      nextModuleLevel: getNextLevel(currentLevel),
      passed: true,
    };
  }

  // Moderate performance: repeat same level (did not pass)
  if (quizScore >= 50 && quizScore < PASSING_SCORE) {
    return {
      type: 'repeat',
      message: `You scored ${quizScore}%, but you need ${PASSING_SCORE}% to pass. Review the material and try again.`,
      nextModuleLevel: currentLevel,
      passed: false,
    };
  }

  // Low performance: remedial content
  const previousLevel = getPreviousLevel(currentLevel);
  return {
    type: 'remedial',
    message: `Your score of ${quizScore}% suggests you might benefit from revisiting foundational content. Keep practicing!`,
    nextModuleLevel: previousLevel,
    passed: false,
  };
}

// Enhanced ML-based recommendation engine with more sophisticated logic
export function getMLBasedRecommendation(
  engagementScore: number,
  quizScore: number,
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
): RecommendationResult {
  const passed = quizScore >= PASSING_SCORE;
  
  // Feature engineering
  const avgScore = (engagementScore + quizScore) / 2;
  const performanceGap = Math.abs(engagementScore - quizScore);
  const engagementWeight = 0.3;
  const quizWeight = 0.7;
  const weightedScore = engagementScore * engagementWeight + quizScore * quizWeight;
  
  // Level difficulty modifier
  const levelModifier: Record<string, number> = {
    beginner: 1.0,
    intermediate: 0.95,
    advanced: 0.9,
  };
  
  const adjustedScore = weightedScore * levelModifier[currentLevel];
  
  // Decision tree with multiple factors
  let prediction: RecommendationType;
  let confidence: 'high' | 'medium' | 'low';
  
  // Strong pass: high weighted score AND passed quiz
  if (adjustedScore >= 75 && passed && performanceGap < 40) {
    prediction = 'advanced';
    confidence = performanceGap < 20 ? 'high' : 'medium';
  }
  // Passed but inconsistent performance
  else if (passed && performanceGap >= 40) {
    prediction = 'advanced';
    confidence = 'low';
  }
  // Just passed
  else if (passed) {
    prediction = 'advanced';
    confidence = 'medium';
  }
  // Close to passing with good engagement
  else if (quizScore >= 60 && engagementScore >= 70) {
    prediction = 'repeat';
    confidence = 'medium';
  }
  // Moderate performance
  else if (avgScore >= 45 || (engagementScore >= 60 && quizScore >= 40)) {
    prediction = 'repeat';
    confidence = 'low';
  }
  // Poor performance
  else {
    prediction = 'remedial';
    confidence = avgScore < 30 ? 'high' : 'medium';
  }

  const confidenceText = confidence === 'high' ? '(High confidence)' : 
                         confidence === 'medium' ? '(Medium confidence)' : 
                         '(Low confidence - consider additional review)';

  const resultMap: Record<RecommendationType, RecommendationResult> = {
    advanced: {
      type: 'advanced',
      message: `🤖 AI Analysis ${confidenceText}: Strong performance detected with weighted score of ${Math.round(adjustedScore)}%. You demonstrated ${engagementScore}% engagement and ${quizScore}% quiz accuracy. You may proceed to the next module!`,
      nextModuleLevel: getNextLevel(currentLevel),
      passed: true,
    },
    repeat: {
      type: 'repeat',
      message: `🤖 AI Analysis ${confidenceText}: Your quiz score of ${quizScore}% is below the ${PASSING_SCORE}% passing threshold. The model detected ${performanceGap > 30 ? 'inconsistent' : 'moderate'} performance. Recommend reviewing this module before proceeding.`,
      nextModuleLevel: currentLevel,
      passed: false,
    },
    remedial: {
      type: 'remedial',
      message: `🤖 AI Analysis ${confidenceText}: Performance analysis indicates gaps in foundational understanding. Consider reviewing prerequisite content to build a stronger foundation.`,
      nextModuleLevel: getPreviousLevel(currentLevel),
      passed: false,
    },
  };

  return resultMap[prediction];
}

function getNextLevel(
  current: 'beginner' | 'intermediate' | 'advanced'
): 'beginner' | 'intermediate' | 'advanced' {
  if (current === 'beginner') return 'intermediate';
  if (current === 'intermediate') return 'advanced';
  return 'advanced';
}

function getPreviousLevel(
  current: 'beginner' | 'intermediate' | 'advanced'
): 'beginner' | 'intermediate' | 'advanced' {
  if (current === 'advanced') return 'intermediate';
  if (current === 'intermediate') return 'beginner';
  return 'beginner';
}
