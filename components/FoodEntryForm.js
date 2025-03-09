import { useState } from 'react';

export default function FoodEntryForm({ addMeal, isLoading, setIsLoading, selectedDate }) {
  const [foodDescription, setFoodDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foodDescription.trim()) {
      setError('Please enter a food description');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: foodDescription }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze food');
      }
      
      const data = await response.json();
      
      // Create a timestamp for the selected date
      const timestamp = new Date();
      if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        // Keep the current time but use the selected date
        timestamp.setFullYear(selectedDateObj.getFullYear());
        timestamp.setMonth(selectedDateObj.getMonth());
        timestamp.setDate(selectedDateObj.getDate());
      }
      
      // Add timestamp to the meal data
      const mealWithTimestamp = {
        ...data,
        description: foodDescription,
        timestamp: timestamp.toISOString(),
        date: selectedDate // Add the selected date explicitly
      };
      
      await addMeal(mealWithTimestamp);
      setFoodDescription('');
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError('Failed to analyze food. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Food</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="foodDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Food Description
          </label>
          <textarea
            id="foodDescription"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="Describe what you ate (e.g., '2 scrambled eggs with a slice of whole wheat toast and a small apple')"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Be as specific as possible with quantities and preparation methods.
          </p>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Add Food'}
        </button>
      </form>
    </div>
  );
} 