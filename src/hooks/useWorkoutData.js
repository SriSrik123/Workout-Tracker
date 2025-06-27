import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, getDocs, deleteDoc, doc, where, setDoc, limit } from 'firebase/firestore';
import { formatDateToYYYYMMDD } from '../utils/calendarUtils';

const useWorkoutData = (
  db, // Passed from App.js (from useFirebase)
  userId, // Passed from App.js (from useFirebase)
  isAuthReady,
  setMessage,
  currentSportType,
  currentDesiredWorkoutDistance, // Renamed from currentWorkoutIntensity for clarity
  currentWorkoutFocus, // Renamed from currentPerformanceMetric for clarity
  currentPerformanceMetric, // NEW: added back the original performanceMetric
  currentHeartRateResting,
  currentSleepHours,
  currentSleepScore,
  currentEnergyScore,
  preferencesFromApp,
  parseGeneratedWorkout
) => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [calendarWorkouts, setCalendarWorkouts] = useState({});
  const [dailyWorkouts, setDailyWorkouts] = useState([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastGeneratedMainSportWorkoutDetails, setLastGeneratedMainSportWorkoutDetails] = useState(null);

  // Define currentAppId here, accessible within the hook.
  // It's still derived from a global/env variable, but now consistently within this hook's scope.
  // eslint-disable-next-line no-undef
  const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'my-local-swim-app';


  const getWorkoutsCollectionRef = useCallback(() => {
    if (!db || !userId) return null;
    // Use the `currentAppId` defined within the hook
    return collection(db, `artifacts/${currentAppId}/users/${userId}/swimmingWorkouts`);
  }, [db, userId, currentAppId]); // db is a stable reference here, ESLint might warn but it's generally fine.


  // Fetch Workout History (generated workouts) from Firestore
  useEffect(() => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !isAuthReady) {
      console.log("Waiting for DB, userId, or auth to be ready for history fetch...");
      return;
    }

    setHistoryLoading(true);
    setMessage({ text: '' });

    const q = query(
        workoutsCollectionRef,
        where('type', 'in', ['generated_main_sport', 'generated_lifting']),
        orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workouts = [];
      snapshot.forEach((document) => {
        workouts.push({ id: document.id, ...document.data() });
      });
      setWorkoutHistory(workouts);
      setHistoryLoading(false);
    }, (error) => {
      console.error("Error fetching workout history:", error);
      setMessage({ text: `Error loading history: ${error.message}. Check Firebase rules and network.`, type: 'error' });
      setHistoryLoading(false);
    });

    return () => unsubscribe();
  }, [getWorkoutsCollectionRef, isAuthReady, setMessage]);

  // Fetch the last generated main sport workout for AI context
  useEffect(() => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !isAuthReady) {
      setLastGeneratedMainSportWorkoutDetails(null);
      return;
    }

    const q = query(
      workoutsCollectionRef,
      where('type', '==', 'generated_main_sport'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastGeneratedMainSportWorkoutDetails(snapshot.docs[0].data());
      } else {
        setLastGeneratedMainSportWorkoutDetails(null);
      }
    }, (error) => {
      console.error("Error fetching last generated workout:", error);
      setLastGeneratedMainSportWorkoutDetails(null);
    });

    return () => unsubscribe();
  }, [getWorkoutsCollectionRef, isAuthReady]);


  // Fetch Workout Tracker Data for selected date from Firestore
  useEffect(() => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !isAuthReady || !selectedDate) {
      return;
    }

    setTrackerLoading(true);
    setDailyWorkouts([]);
    setJournalEntry('');

    const qWorkouts = query(
      workoutsCollectionRef,
      where('type', 'in', ['trackedWorkout', 'generated_main_sport', 'generated_lifting']),
      where('date', '==', selectedDate),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      const workouts = [];
      snapshot.forEach((document) => {
        workouts.push({ id: document.id, ...document.data() });
      });
      setDailyWorkouts(workouts);
    }, (error) => {
      console.error("Error fetching daily workouts:", error);
      setMessage({ text: `Error loading daily workouts: ${error.message}.`, type: 'error' });
    });

    const qJournal = query(
      workoutsCollectionRef,
      where('type', '==', 'journalEntry'),
      where('date', '==', selectedDate)
    );

    const unsubscribeJournal = onSnapshot(qJournal, (snapshot) => {
      if (!snapshot.empty) {
        setJournalEntry(snapshot.docs[0].data().content);
      } else {
        setJournalEntry('');
      }
      setTrackerLoading(false);
    }, (error) => {
      console.error("Error fetching journal entry:", error);
      setMessage({ text: `Error loading journal entry: ${error.message}.`, type: 'error' });
      setTrackerLoading(false);
    });

    return () => {
      unsubscribeWorkouts();
      unsubscribeJournal();
    };
  }, [getWorkoutsCollectionRef, isAuthReady, selectedDate, setMessage]);

  // Fetch Calendar Data for the current month/year
  const fetchCalendarData = useCallback((currentMonth, currentYear) => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !isAuthReady) {
      return;
    }

    setTrackerLoading(true);

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const q = query(
        workoutsCollectionRef,
        where('date', '>=', formatDateToYYYYMMDD(startOfMonth)),
        where('date', '<=', formatDateToYYYYMMDD(endOfMonth)),
        where('type', 'in', ['generated_main_sport', 'generated_lifting', 'trackedWorkout', 'journalEntry'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const workoutsByDay = {};
        snapshot.forEach((document) => {
            const data = document.data();
            const date = data.date;
            if (!workoutsByDay[date]) {
                workoutsByDay[date] = [];
            }
            workoutsByDay[date].push({ id: document.id, ...data });
        });
        setCalendarWorkouts(workoutsByDay);
        setTrackerLoading(false);
    }, (error) => {
        console.error("Error fetching calendar workouts:", error);
        setMessage({ text: `Error loading calendar: ${error.message}.`, type: 'error' });
        setTrackerLoading(false);
    });

    return () => unsubscribe();
  }, [getWorkoutsCollectionRef, isAuthReady, setMessage]);


  // Save generated workout (main sport + optional lifting)
  const saveGeneratedWorkout = useCallback(async (generatedWorkoutContent) => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !generatedWorkoutContent) {
      setMessage({ text: 'Cannot save workout: Firebase not ready or no workout generated.', type: 'error' });
      return;
    }

    setTrackerLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const parsedWorkout = parseGeneratedWorkout(generatedWorkoutContent);
      const workoutBaseData = {
        userId: userId,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        healthData: {
            workoutIntensity: currentDesiredWorkoutDistance, // Use correct parameter name
            performanceMetric: currentPerformanceMetric, // Use correct parameter name
            heartRateResting: currentHeartRateResting,
            sleepHours: currentSleepHours,
            sleepScore: currentSleepScore,
            energyScore: currentEnergyScore
        },
        preferences: {
            sportType: preferencesFromApp.sportType,
            sportGoal: preferencesFromApp.sportGoal,
            sportLevel: preferencesFromApp.sportLevel,
            daysPerWeek: preferencesFromApp.daysPerWeek,
            workoutDuration: preferencesFromApp.workoutDuration,
            liftingGoal: preferencesFromApp.liftingGoal,
            equipment: preferencesFromApp.equipment,
            desiredWorkoutDistance: preferencesFromApp.desiredWorkoutDistance,
            workoutFocus: preferencesFromApp.workoutFocus
        }
      };

      await addDoc(workoutsCollectionRef, {
        ...workoutBaseData,
        type: 'generated_main_sport',
        workoutPlan: parsedWorkout.main,
        sport: preferencesFromApp.sportType,
      });

      if (parsedWorkout.lifting) {
        await addDoc(workoutsCollectionRef, {
          ...workoutBaseData,
          type: 'generated_lifting',
          workoutPlan: parsedWorkout.lifting,
          sport: 'Lifting',
        });
      }

      setMessage({ text: 'Workout successfully saved to history and calendar!', type: 'success' });
    } catch (firestoreError) {
      console.error("Error saving workout to Firestore:", firestoreError);
      setMessage({ text: `Failed to save workout: ${firestoreError.message}. Check Firebase rules.`, type: 'error' });
    } finally {
      setTrackerLoading(false);
    }
  }, [ // <= This is the dependency array
      getWorkoutsCollectionRef, userId, setMessage, parseGeneratedWorkout,
      currentDesiredWorkoutDistance, currentPerformanceMetric, currentHeartRateResting,
      currentSleepHours, currentSleepScore, currentEnergyScore, preferencesFromApp
  ]);

  // Add a manually tracked workout
  const addTrackedWorkout = useCallback(async (workoutData) => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef) {
      setMessage({ text: 'Cannot log workout: Firebase not ready.', type: 'error' });
      return;
    }

    setTrackerLoading(true);
    try {
      await addDoc(workoutsCollectionRef, {
        userId: userId,
        timestamp: Date.now(),
        type: 'trackedWorkout',
        ...workoutData
      });
      setMessage({ text: 'Workout logged successfully!', type: 'success' });
    } catch (error) {
      console.error("Error adding workout to tracker:", error);
      setMessage({ text: `Failed to log workout: ${error.message}.`, type: 'error' });
    } finally {
      setTrackerLoading(false);
    }
  }, [getWorkoutsCollectionRef, userId, setMessage]);

  // Save journal entry
  const saveJournalEntry = useCallback(async (content) => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef || !selectedDate) {
      setMessage({ text: 'Cannot save journal: Firebase not ready or no date selected.', type: 'error' });
      return;
    }

    setTrackerLoading(true);
    try {
      const q = query(workoutsCollectionRef, where('type', '==', 'journalEntry'), where('date', '==', selectedDate));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, workoutsCollectionRef.path, snapshot.docs[0].id);
        await setDoc(docRef, { content: content, timestamp: Date.now() }, { merge: true });
      } else {
        await addDoc(workoutsCollectionRef, {
          userId: userId,
          timestamp: Date.now(),
          date: selectedDate,
          type: 'journalEntry',
          content: content
        });
      }
      setMessage({ text: 'Journal entry saved!', type: 'success' });
    } catch (error) {
      console.error("Error saving journal entry:", error);
      setMessage({ text: `Failed to save journal: ${error.message}.`, type: 'error' });
    } finally {
      setTrackerLoading(false);
    }
  }, [getWorkoutsCollectionRef, db, userId, selectedDate, setMessage]);

  // Delete tracked/generated workout or journal entry
  const deleteWorkout = useCallback(async (workoutId) => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef) {
      setMessage({ text: 'Firebase not ready. Cannot delete.', type: 'error' });
      return;
    }

    setTrackerLoading(true);
    try {
        const workoutDocRef = doc(db, workoutsCollectionRef.path, workoutId);
        await deleteDoc(workoutDocRef);
        setMessage({ text: 'Entry deleted!', type: 'success' });
    } catch (error) {
        console.error("Error deleting workout/journal entry:", error);
        setMessage({ text: `Failed to delete entry: ${error.message}.`, type: 'error' });
    } finally {
        setTrackerLoading(false);
    }
  }, [getWorkoutsCollectionRef, db, setMessage]);

  const clearGeneratedHistory = useCallback(async () => {
    const workoutsCollectionRef = getWorkoutsCollectionRef();
    if (!workoutsCollectionRef) {
      setMessage({ text: 'Firebase not ready. Cannot clear history.', type: 'error' });
      return;
    }

    setHistoryLoading(true);
    setMessage({ text: 'Clearing generated workout history...', type: 'info' });

    try {
      const q = query(workoutsCollectionRef, where('type', 'in', ['generated_main_sport', 'generated_lifting']));
      const snapshot = await getDocs(q);

      const deletePromises = [];
      snapshot.forEach((documentSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, workoutsCollectionRef.path, documentSnapshot.id)));
      });

      await Promise.all(deletePromises);
      setMessage({ text: 'Generated workout history cleared successfully!', type: 'success' });
      setWorkoutHistory([]);
    } catch (error) {
      console.error("Error clearing workout history:", error);
      setMessage({ text: `Failed to clear history: ${error.message}. Check Firebase rules.`, type: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  }, [getWorkoutsCollectionRef, db, setMessage]);


  return {
    workoutHistory,
    historyLoading,
    calendarWorkouts,
    dailyWorkouts,
    journalEntry,
    setJournalEntry,
    trackerLoading,
    selectedDate,
    setSelectedDate,
    lastGeneratedMainSportWorkoutDetails,
    fetchCalendarData,
    saveGeneratedWorkout,
    addTrackedWorkout,
    saveJournalEntry,
    deleteWorkout,
    clearGeneratedHistory
  };
};

export default useWorkoutData;