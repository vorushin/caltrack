import { useMemo } from 'react';

export default function DailyNutritionSummary({ meals, date }) {
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + (meal.nutrition?.calories || 0),
          protein: acc.protein + (meal.nutrition?.protein || 0),
          carbs: acc.carbs + (meal.nutrition?.carbs || 0),
          fat: acc.fat + (meal.nutrition?.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  const formatNumber = (num) => {
    return Math.round(num * 10) / 10;
  };

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise, format the date
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Nutrition Summary</h2>
      {date && <p className="text-sm text-gray-500 mb-4">{formatDate(date)}</p>}
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Calories</h3>
          <p className="text-3xl font-bold text-blue-900">{formatNumber(totals.calories)}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Protein</h3>
            <p className="text-xl font-bold text-green-900">{formatNumber(totals.protein)}g</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">Carbs</h3>
            <p className="text-xl font-bold text-yellow-900">{formatNumber(totals.carbs)}g</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Fat</h3>
            <p className="text-xl font-bold text-red-900">{formatNumber(totals.fat)}g</p>
          </div>
        </div>
        
        {meals.length === 0 && (
          <p className="text-gray-500 text-sm italic mt-4">
            No meals added for this day. Add your first meal to see nutrition totals.
          </p>
        )}
      </div>
    </div>
  );
} 