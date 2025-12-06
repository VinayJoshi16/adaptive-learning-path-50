// Recommendation types
export type RecommendationType = 'remedial' | 'repeat' | 'advanced';

export interface RecommendationResult {
  type: RecommendationType;
  message: string;
  nextModuleLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Rule-based recommendation engine
export function getRuleBasedRecommendation(
  engagementScore: number,
  quizScore: number,
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
): RecommendationResult {
  // High performance: advance to next level
  if (quizScore >= 80 && engagementScore >= 70) {
    const nextLevel = getNextLevel(currentLevel);
    return {
      type: 'advanced',
      message: `Excellent work! Your high engagement (${engagementScore}%) and strong quiz performance (${quizScore}%) show you've mastered this content.`,
      nextModuleLevel: nextLevel,
    };
  }

  // Moderate performance: repeat same level
  if (
    (quizScore >= 50 && quizScore < 80) ||
    (engagementScore >= 40 && engagementScore < 70)
  ) {
    return {
      type: 'repeat',
      message: `Good progress! Consider reviewing this topic again to strengthen your understanding. Engagement: ${engagementScore}%, Quiz: ${quizScore}%`,
      nextModuleLevel: currentLevel,
    };
  }

  // Low performance: remedial content
  const previousLevel = getPreviousLevel(currentLevel);
  return {
    type: 'remedial',
    message: `Let's take a step back and reinforce the fundamentals. Low engagement (${engagementScore}%) or quiz score (${quizScore}%) suggests you might benefit from foundational content.`,
    nextModuleLevel: previousLevel,
  };
}

// Simple ML-based recommendation (simulated decision tree logic)
export function getMLBasedRecommendation(
  engagementScore: number,
  quizScore: number,
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
): RecommendationResult {
  // Convert level to numeric
  const levelMap = { beginner: 0, intermediate: 1, advanced: 2 };
  const levelNum = levelMap[currentLevel];

  // Feature engineering
  const avgScore = (engagementScore + quizScore) / 2;
  const performanceGap = Math.abs(engagementScore - quizScore);
  
  // Decision tree logic (simulating trained model)
  let prediction: RecommendationType;
  
  if (avgScore >= 75 && performanceGap < 30) {
    prediction = 'advanced';
  } else if (avgScore >= 45 || (engagementScore >= 60 && quizScore >= 40)) {
    prediction = 'repeat';
  } else {
    prediction = 'remedial';
  }

  const resultMap: Record<RecommendationType, RecommendationResult> = {
    advanced: {
      type: 'advanced',
      message: `AI Analysis: Strong consistent performance detected. Engagement (${engagementScore}%) and quiz score (${quizScore}%) indicate readiness for advanced content.`,
      nextModuleLevel: getNextLevel(currentLevel),
    },
    repeat: {
      type: 'repeat',
      message: `AI Analysis: Mixed performance signals. Recommend consolidating current level knowledge before advancing.`,
      nextModuleLevel: currentLevel,
    },
    remedial: {
      type: 'remedial',
      message: `AI Analysis: Performance indicates gaps in foundational understanding. Remedial content recommended.`,
      nextModuleLevel: getPreviousLevel(currentLevel),
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
