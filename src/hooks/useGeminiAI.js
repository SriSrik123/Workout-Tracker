import { useState, useCallback } from 'react';
import { parseGeneratedWorkout } from '../utils/workoutParser';

const useGeminiAI = (
  sportType,
  sportGoal,
  sportLevel,
  daysPerWeek,
  workoutDuration,
  liftingGoal,
  equipment,
  desiredWorkoutDistance,
  workoutFocus,
  performanceMetric,
  heartRateResting,
  sleepHours,
  sleepScore,
  energyScore,
  lastGeneratedMainSportWorkoutDetails,
  setMessage
) => {
  const [generatedWorkout, setGeneratedWorkout] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiQALoading, setAiQALoading] = useState(false);

  const buildWorkoutPrompt = useCallback((additionalFeedback = '') => {
    const selectedEquipment = Object.keys(equipment)
      .filter(key => equipment[key])
      .map(key => key.replace(/([A-Z])/g, ' $1').toLowerCase());

    const availableEquipmentString = selectedEquipment.length > 0
      ? selectedEquipment.join(', ')
      : 'No special equipment available';

    const liftingComplement = liftingGoal !== 'None'
      ? `The user also has a complimentary lifting goal: "${liftingGoal}". Please design a short (e.g., 15-20 min) strength/mobility session relevant to this goal. This should be a distinct section in the workout plan, clearly marked as "## Complimentary Lifting".`
      : '';

    let previousWorkoutInfo = '';
    if (lastGeneratedMainSportWorkoutDetails) {
      const lastWorkoutDate = new Date(lastGeneratedMainSportWorkoutDetails.timestamp).toLocaleDateString();
      const lastWorkoutSport = lastGeneratedMainSportWorkoutDetails.sport || lastGeneratedMainSportWorkoutDetails.preferences?.sportType || 'N/A';
      const lastWorkoutFocus = lastGeneratedMainSportWorkoutDetails.preferences?.workoutFocus || 'N/A';

      previousWorkoutInfo = `
    Previous Workout Context:
    - The last generated ${lastWorkoutSport} workout was on ${lastWorkoutDate}.
    - Its primary focus was "${lastWorkoutFocus}".
    IMPORTANT: Design the current workout to be complementary and avoid giving a workout of the exact same primary focus or intensity as the previous one, unless specifically requested in additional feedback. For example, if the last was "Speed", consider "Endurance" or "Threshold" for today.
    `;
    }

    return `
    As an expert AI ${sportType} coach, design a personalized ${sportType} workout plan for one session based on the following user profile and recent daily data.
    Consider the user's current fitness state, their overall goals, and the available equipment for this specific workout.
    ${previousWorkoutInfo}

    User Sport Profile (from Settings):
    - Primary Sport Focus: ${sportType}
    - Primary Sport Goal: ${sportGoal}
    - Sport Level: ${sportLevel}
    - Desired Workout Days Per Week for Main Sport: ${daysPerWeek}
    - Desired Workout Duration per session: ${workoutDuration} minutes
    - Available Equipment: ${availableEquipmentString}

    Recent Health and Performance Data (Day-to-Day Inputs):
    - Desired Workout Distance/Volume for THIS session: ${desiredWorkoutDistance}
    - Primary Workout Focus for THIS session: ${workoutFocus}
    - Recent Performance Metric: ${performanceMetric}
    - Resting Heart Rate: ${heartRateResting} bpm
    - Sleep Hours (last night): ${sleepHours} hours
    - Sleep Score (out of 100): ${sleepScore}
    - Energy Score (out of 100): ${energyScore}

    ${additionalFeedback ? `
    IMPORTANT: The user has provided additional feedback for this workout generation. Please incorporate the following:
    Feedback: "${additionalFeedback}"

    Please use this feedback to adjust, refine, or regenerate the workout plan accordingly. For example, if the feedback indicates low energy, suggest a lighter workout; if it asks for a specific drill, include it.
    ` : ''}

    Please provide a detailed ${sportType} workout plan. The plan should be challenging yet appropriate for the user's level and recent data.
    The workout should typically include:
    - A warm-up (5-10 minutes, e.g., dynamic stretches, light cardio specific to ${sportType})
    - 3-5 main sets (e.g., technique drills, endurance sets, speed/power work, strength training, flexibility exercises).
      For each set, specify recommended duration/repetitions/distance, appropriate intervals (if applicable), and the primary focus (e.g., "focus on form", "build stamina", "increase power").
      Clearly specify the exercises, techniques, or movements where applicable, specific to ${sportType}.
    - A cool-down (5-10 minutes, easy movements and stretching)
    ${liftingComplement}

    Structure the workout plan clearly using Markdown, with prominent headings for sections (e.g., "Warm-up", "Main Set", "Cool-down", "## Complimentary Lifting"). Use standard ${sportType} terminology.
    Ensure the total workout duration aligns closely with the user's desired workout duration, *including* the complimentary lifting if requested and included.
    `;
  }, [sportType, sportGoal, sportLevel, daysPerWeek, workoutDuration, liftingGoal, equipment,
      desiredWorkoutDistance, workoutFocus, performanceMetric, heartRateResting, sleepHours, sleepScore, energyScore,
      lastGeneratedMainSportWorkoutDetails]);

  const generateWorkout = useCallback(async () => {
    setLoading(true);
    setGeneratedWorkout('');
    setMessage({ text: '', type: '' });
    setAiAnswer('');
    setUserQuestion('');

    if (performanceMetric === '') {
        setMessage({ text: `Please select your recent performance metric for ${sportType}.`, type: 'error' });
        setLoading(false);
        return;
    }
    if (workoutFocus === '') {
        setMessage({ text: `Please select a primary workout focus.`, type: 'error' });
        setLoading(false);
        return;
    }


    const prompt = buildWorkoutPrompt();

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyDiruznaGvK2XD5E_th0d1IzKmWzAVN050";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedWorkout(text);
        setMessage({ text: 'Sport workout designed! Check the "Current Workout" tab.', type: 'success' });
      } else {
        setMessage({ text: 'Failed to design workout: AI response was empty or malformed.', type: 'error' });
        console.error('Unexpected API response structure:', result);
      }
    } catch (error) {
      setMessage({ text: `Error calling AI: ${error.message}. Please check network or API service status.`, type: 'error' });
      console.error('Error generating workout:', error);
    } finally {
      setLoading(false);
    }
  }, [buildWorkoutPrompt, performanceMetric, sportType, workoutFocus, setMessage]); // Dependencies look correct now

  const askAiAboutWorkout = useCallback(async () => {
    if (!userQuestion.trim()) {
      setMessage({ text: 'Please type your feedback or request for modification.', type: 'warning' });
      return;
    }

    setAiQALoading(true);
    setAiAnswer('');
    setMessage({ text: '', type: '' });

    const prompt = buildWorkoutPrompt(userQuestion);

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`AI regeneration call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        setGeneratedWorkout(result.candidates[0].content.parts[0].text);
        setAiAnswer("A new workout has been generated based on your feedback. Please review it above!");
        setMessage({ text: 'New workout generated with your feedback!', type: 'success' });
        setUserQuestion('');
      } else {
        setMessage({ text: 'AI could not regenerate workout. Try rephrasing your feedback.', type: 'warning' });
        setAiAnswer("Could not generate a new workout based on your feedback. Please try again or rephrase your request.");
      }
    } catch (error) {
      setMessage({ text: `Error regenerating workout: ${error.message}.`, type: 'error' });
      console.error('Error regenerating workout with feedback:', error);
      setAiAnswer(`Error: ${error.message}. Please try again.`);
    } finally {
      setAiQALoading(false);
    }
  }, [buildWorkoutPrompt, userQuestion, setMessage]);

  return {
    generatedWorkout,
    setGeneratedWorkout,
    loading,
    generateWorkout,
    userQuestion,
    setUserQuestion,
    aiAnswer,
    aiQALoading,
    askAiAboutWorkout,
    parseGeneratedWorkout
  };
};

export default useGeminiAI;