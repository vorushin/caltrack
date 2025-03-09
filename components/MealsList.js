export default function MealsList({ meals }) {
  if (meals.length === 0) {
    return null;
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Today's Meals</h2>
      
      <div className="space-y-4">
        {meals.map((meal, index) => (
          <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
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
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {Math.round(meal.nutrition?.calories || 0)} cal
              </span>
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