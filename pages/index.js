import { useState, useEffect } from 'react';
import Head from 'next/head';
import FoodEntryForm from '../components/FoodEntryForm';
import ImageUploadForm from '../components/ImageUploadForm';
import DailyNutritionSummary from '../components/DailyNutritionSummary';
import MealsList from '../components/MealsList';

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format

  // Fetch meals for the current date when the component mounts or date changes
  useEffect(() => {
    fetchMeals();
  }, [currentDate]);

  // Fetch meals from the API
  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/meals?date=${currentDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new meal
  const addMeal = async (meal) => {
    try {
      setIsLoading(true);
      
      // Save the meal to the database
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meal),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save meal');
      }
      
      // Refresh the meals list
      await fetchMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a meal
  const deleteMeal = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/meals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }
      
      // Refresh the meals list
      await fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Calorie Tracker</title>
        <meta name="description" content="Personal calorie tracking app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-8 text-center">Calorie Tracker</h1>
        
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
              <FoodEntryForm addMeal={addMeal} isLoading={isLoading} setIsLoading={setIsLoading} />
            ) : (
              <ImageUploadForm addMeal={addMeal} isLoading={isLoading} setIsLoading={setIsLoading} />
            )}
            
            <MealsList meals={meals} onDelete={deleteMeal} isLoading={isLoading} />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <DailyNutritionSummary meals={meals} />
          </div>
        </div>
      </main>
    </div>
  );
} 