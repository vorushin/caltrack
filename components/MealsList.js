export default function MealsList({ meals, onDelete, isLoading, title = "Today's Meals" }) {
  if (meals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        <p>No meals added for this day. Add your first meal above.</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                {meal.imagePreview && (
                  <div className="flex-shrink-0">
                    <img 
                      src={meal.imagePreview} 
                      alt="Food" 
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{meal.description}</p>
                  <p className="text-sm text-gray-500">{formatTime(meal.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {Math.round(meal.nutrition?.calories || 0)} cal
                </span>
                <button
                  onClick={() => onDelete(meal.id)}
                  disabled={isLoading}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  title="Delete meal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="text-xs">
                <span className="text-gray-500">Protein:</span>{' '}
                <span className="font-medium">{Math.round(meal.nutrition?.protein || 0)}g</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Carbs:</span>{' '}
                <span className="font-medium">{Math.round(meal.nutrition?.carbs || 0)}g</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Fat:</span>{' '}
                <span className="font-medium">{Math.round(meal.nutrition?.fat || 0)}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 