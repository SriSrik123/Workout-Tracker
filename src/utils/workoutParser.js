// workoutParser.js

// Helper to parse generated workout into main and lifting parts
export const parseGeneratedWorkout = (markdownContent) => {
    const mainWorkoutRegex = /## Warm-up[\s\S]*?(?=## Complimentary Lifting|## Cool-down|$)/i;
    const liftingWorkoutRegex = /## Complimentary Lifting[\s\S]*/i;
  
    let mainContent = markdownContent;
    let liftingContent = null;
  
    const liftingMatch = markdownContent.match(liftingWorkoutRegex);
    if (liftingMatch) {
      liftingContent = liftingMatch[0].trim();
      mainContent = markdownContent.replace(liftingContent, '').trim();
    }
  
    // Ensure main content starts properly if it was not clearly delineated before lifting
    const mainMatch = mainContent.match(mainWorkoutRegex);
    if (mainMatch) {
        mainContent = mainMatch[0].trim();
    } else {
        // Fallback if no clear Warm-up start or Cool-down end, take everything not lifting
        mainContent = mainContent.trim();
    }

    return {
      main: mainContent,
      lifting: liftingContent,
    };
};