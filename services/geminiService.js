// Simplified Gemini service for AI insights
// In production, this would integrate with Google's Gemini AI API

export const generateEmotionalInsight = async (personality, metrics, userName = 'Friend') => {
  // Mock implementation - in production, this would call Gemini AI
  const insights = {
    Planner: `Great job, ${userName}! Your disciplined approach to saving ${metrics.savingsRatio.toFixed(1)}% of your income shows excellent financial planning. Keep up the consistent habits!`,
    Spender: `Hey ${userName}, I notice you enjoy life's pleasures! While spending can bring joy, consider setting aside a small amount each month for future goals. Even 5% can make a difference.`,
    Minimalist: `${userName}, your mindful spending approach is admirable! You're living below your means, which gives you great financial flexibility. Consider investing some of your surplus for long-term growth.`,
    Balancer: `${userName}, you've found a nice balance between enjoying today and planning for tomorrow. Your ${metrics.savingsRatio.toFixed(1)}% savings rate shows you're on a solid path!`,
  };

  return insights[personality] || `${userName}, you're developing your unique financial style. Keep tracking your progress and celebrating small wins along the way!`;
};

export const generateCreditStory = async (metrics, personality) => {
  // Mock implementation - in production, this would call Gemini AI
  const stories = {
    Planner: "Your consistent saving habits and regular income patterns demonstrate strong financial discipline. Lenders see you as a reliable borrower who manages money responsibly.",
    Spender: "While you enjoy spending, working on building a more consistent savings pattern could significantly improve your creditworthiness. Small changes can lead to big improvements.",
    Minimalist: "Your low spending relative to income shows excellent self-control. This conservative approach to money management is viewed very favorably by credit agencies.",
    Balancer: "You've struck a good balance between spending and saving. This measured approach to finances demonstrates the kind of stability that builds strong credit over time.",
  };

  const baseStory = stories[personality] || "You're building your financial story one transaction at a time.";
  
  let additionalNotes = "";
  if (metrics.overdrafts > 0) {
    additionalNotes += " Focus on avoiding overdrafts to strengthen your credit profile.";
  }
  if (metrics.consistencyScore > 80) {
    additionalNotes += " Your consistent income pattern is a strong positive factor.";
  }

  return baseStory + additionalNotes;
};

// Mock function for future AI integration
export const generatePersonalizedAdvice = async (userId, metrics, personality) => {
  // This would integrate with Gemini AI in production
  const advice = [
    "Consider setting up automatic transfers to savings",
    "Review your spending categories monthly",
    "Build an emergency fund covering 3-6 months of expenses",
    "Track your progress with regular financial check-ins"
  ];

  return advice.slice(0, 2); // Return top 2 pieces of advice
};
