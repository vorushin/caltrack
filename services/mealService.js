import supabase from '../utils/supabaseClient';

// Table name for meals
const MEALS_TABLE = 'meals';

/**
 * Save a meal to the database
 * @param {Object} meal - The meal object to save
 * @returns {Promise<Object>} - The saved meal with its ID
 */
export const saveMeal = async (meal) => {
  try {
    // Store the image preview as a separate column if it exists
    const { imagePreview, ...mealData } = meal;
    
    const { data, error } = await supabase
      .from(MEALS_TABLE)
      .insert([
        { 
          ...mealData,
          image_preview: imagePreview || null,
          // Ensure date is stored in a consistent format
          date: new Date(meal.timestamp).toISOString().split('T')[0]
        }
      ])
      .select();

    if (error) {
      console.error('Error saving meal:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Failed to save meal:', error);
    throw error;
  }
};

/**
 * Get all meals for a specific date
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of meals for the date
 */
export const getMealsByDate = async (date) => {
  try {
    const { data, error } = await supabase
      .from(MEALS_TABLE)
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }

    // Transform the data to match the expected format in the frontend
    return data.map(meal => ({
      id: meal.id,
      description: meal.description,
      nutrition: meal.nutrition,
      timestamp: meal.timestamp,
      imagePreview: meal.image_preview,
    }));
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    throw error;
  }
};

/**
 * Delete a meal by ID
 * @param {number} id - The meal ID to delete
 * @returns {Promise<void>}
 */
export const deleteMeal = async (id) => {
  try {
    const { error } = await supabase
      .from(MEALS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete meal:', error);
    throw error;
  }
}; 