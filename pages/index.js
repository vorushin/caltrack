import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FoodEntryForm from '../components/FoodEntryForm';
import ImageUploadForm from '../components/ImageUploadForm';
import DailyNutritionSummary from '../components/DailyNutritionSummary';
import MealsList from '../components/MealsList';

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [debugLog, setDebugLog] = useState([]);
  const router = useRouter();

  // Helper function to add debug logs
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data) : null
    };
    console.log(`[${timestamp}] ${message}`, data || '');
    setDebugLog(prev => [logEntry, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  // Fetch meals for the current date when the component mounts or date changes
  useEffect(() => {
    fetchMeals();
  }, [currentDate]);

  // Fetch meals from the API
  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      addDebugLog(`Fetching meals for date: ${currentDate}`);
      
      const response = await fetch(`/api/meals?date=${currentDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      
      const data = await response.json();
      addDebugLog(`Fetched ${data.length} meals`, { count: data.length });
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
      addDebugLog(`Error fetching meals: ${error.message}`, { error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new meal
  const addMeal = async (meal) => {
    try {
      setIsLoading(true);
      
      // Use the selected date instead of the current date
      const selectedDate = new Date(currentDate);
      
      // Create a new timestamp that preserves the time from the original timestamp
      // but uses the date from the selected date
      const originalTime = new Date(meal.timestamp);
      selectedDate.setHours(originalTime.getHours());
      selectedDate.setMinutes(originalTime.getMinutes());
      selectedDate.setSeconds(originalTime.getSeconds());
      
      // Update the meal with the correct date
      const mealWithCorrectDate = {
        ...meal,
        timestamp: selectedDate.toISOString(),
        // Add a date field explicitly to ensure it's saved correctly
        date: currentDate
      };
      
      addDebugLog('Adding new meal with selected date', { 
        description: mealWithCorrectDate.description,
        hasNutrition: !!mealWithCorrectDate.nutrition,
        hasImagePreview: !!mealWithCorrectDate.imagePreview,
        timestamp: mealWithCorrectDate.timestamp,
        date: mealWithCorrectDate.date
      });
      
      // Save the meal to the database
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealWithCorrectDate),
      });
      
      addDebugLog(`Save meal API response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog(`Error saving meal: ${errorText}`);
        throw new Error('Failed to save meal');
      }
      
      const savedMeal = await response.json();
      addDebugLog('Meal saved successfully', { 
        id: savedMeal.id,
        date: savedMeal.date
      });
      
      // Refresh the meals list
      await fetchMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      addDebugLog(`Error adding meal: ${error.message}`, { error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a meal
  const deleteMeal = async (id) => {
    try {
      setIsLoading(true);
      addDebugLog(`Deleting meal with ID: ${id}`);
      
      const response = await fetch(`/api/meals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }
      
      addDebugLog('Meal deleted successfully');
      
      // Refresh the meals list
      await fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      addDebugLog(`Error deleting meal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  // Format the date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today's Meals";
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's Meals";
    }
    
    // Otherwise, format the date
    return new Date(dateString).toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + " Meals";
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Calorie Tracker</title>
        <meta name="description" content="Personal calorie tracking app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center">Calorie Tracker</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
        
        {/* Date Selector */}
        <div className="mb-6 flex justify-center">
          <div className="relative max-w-sm">
            <input
              type="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={currentDate}
              onChange={handleDateChange}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                  activeTab === 'text'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('text')}
                disabled={isLoading}
              >
                Text Description
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                  activeTab === 'image'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('image')}
                disabled={isLoading}
              >
                Food Image
              </button>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'text' ? (
              <FoodEntryForm 
                addMeal={addMeal} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
                selectedDate={currentDate}
              />
            ) : (
              <ImageUploadForm 
                addMeal={addMeal} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading}
                selectedDate={currentDate}
              />
            )}
            
            <MealsList 
              meals={meals} 
              onDelete={deleteMeal} 
              isLoading={isLoading} 
              title={formatDateForDisplay(currentDate)}
            />
            
            {/* Debug Log (only visible in development) */}
            {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <details>
                  <summary className="font-medium cursor-pointer">Debug Logs</summary>
                  <div className="mt-2 text-xs font-mono overflow-auto max-h-60">
                    {debugLog.map((log, index) => (
                      <div key={index} className="border-b border-gray-200 py-1">
                        <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                        {log.data && (
                          <pre className="ml-6 text-gray-600 whitespace-pre-wrap">{log.data}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <DailyNutritionSummary meals={meals} date={currentDate} />
          </div>
        </div>
      </main>
    </div>
  );
} 