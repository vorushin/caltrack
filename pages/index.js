import { useState } from 'react';
import Head from 'next/head';
import FoodEntryForm from '../components/FoodEntryForm';
import DailyNutritionSummary from '../components/DailyNutritionSummary';
import MealsList from '../components/MealsList';

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMeal = async (meal) => {
    setMeals([...meals, meal]);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <FoodEntryForm addMeal={addMeal} isLoading={isLoading} setIsLoading={setIsLoading} />
            <MealsList meals={meals} />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <DailyNutritionSummary meals={meals} />
          </div>
        </div>
      </main>
    </div>
  );
} 