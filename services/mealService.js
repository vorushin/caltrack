import supabase from '../utils/supabaseClient';

// Table name for meals
const MEALS_TABLE = 'meals';

/**
 * Save a meal to the database
 * @param {Object} meal - The meal object to save
 * @returns {Promise<Object>} - The saved meal with its ID
 */
export const saveMeal = async (meal) => {
  console.log('saveMeal called with:', {
    description: meal.description,
    hasNutrition: !!meal.nutrition,
    hasImagePreview: !!meal.imagePreview,
    timestamp: meal.timestamp
  });
  
  try {
    // Store the image preview as a separate column if it exists
    const { imagePreview, ...mealData } = meal;
    
    const date = new Date(meal.timestamp).toISOString().split('T')[0];
    console.log(`Calculated date from timestamp: ${date}`);
    
    // Check if the image preview is too large
    let processedImagePreview = imagePreview;
    if (imagePreview) {
      const sizeInKB = Math.round(imagePreview.length / 1024);
      console.log(`Image preview size: ~${sizeInKB}KB`);
      
      // If still too large, don't store the image preview
      if (sizeInKB > 500) { // 500KB limit as a safety measure
        console.log('Image preview too large for database storage, removing it');
        processedImagePreview = null;
      }
    }
    
    const insertData = { 
      ...mealData,
      image_preview: processedImagePreview,
      // Ensure date is stored in a consistent format
      date: date
    };
    
    console.log('Inserting meal into database with data:', {
      description: insertData.description,
      hasNutrition: !!insertData.nutrition,
      hasImagePreview: !!insertData.image_preview,
      date: insertData.date,
      approximateDataSize: JSON.stringify(insertData).length / 1024 + 'KB'
    });
    
    const { data, error } = await supabase
      .from(MEALS_TABLE)
      .insert([insertData])
      .select();

    if (error) {
      console.error('Error saving meal to Supabase:', error);
      throw error;
    }

    console.log('Meal saved successfully:', {
      id: data[0].id,
      description: data[0].description
    });
    
    return data[0];
  } catch (error) {
    console.error('Failed to save meal:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

/**
 * Get all meals for a specific date
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of meals for the date
 */
export const getMealsByDate = async (date) => {
  console.log(`getMealsByDate called for date: ${date}`);
  
  try {
    console.log(`Querying Supabase for meals on date: ${date}`);
    const { data, error } = await supabase
      .from(MEALS_TABLE)
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching meals from Supabase:', error);
      throw error;
    }

    console.log(`Retrieved ${data.length} meals for date ${date}`);
    
    // Transform the data to match the expected format in the frontend
    const transformedData = data.map(meal => ({
      id: meal.id,
      description: meal.description,
      nutrition: meal.nutrition,
      timestamp: meal.timestamp,
      imagePreview: meal.image_preview,
    }));
    
    console.log('Transformed meal data for frontend');
    
    return transformedData;
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

/**
 * Delete a meal by ID
 * @param {number} id - The meal ID to delete
 * @returns {Promise<void>}
 */
export const deleteMeal = async (id) => {
  console.log(`deleteMeal called for id: ${id}`);
  
  try {
    console.log(`Deleting meal with id ${id} from Supabase`);
    const { error } = await supabase
      .from(MEALS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal from Supabase:', error);
      throw error;
    }
    
    console.log(`Meal with id ${id} deleted successfully`);
  } catch (error) {
    console.error('Failed to delete meal:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
}; 