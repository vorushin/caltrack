import { saveMeal, getMealsByDate } from '../../../services/mealService';

export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetMeals(req, res);
    case 'POST':
      return handleCreateMeal(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle GET request to fetch meals by date
 */
async function handleGetMeals(req, res) {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const meals = await getMealsByDate(date);
    return res.status(200).json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return res.status(500).json({ error: 'Failed to fetch meals' });
  }
}

/**
 * Handle POST request to create a new meal
 */
async function handleCreateMeal(req, res) {
  try {
    const meal = req.body;
    
    if (!meal) {
      return res.status(400).json({ error: 'Meal data is required' });
    }
    
    const savedMeal = await saveMeal(meal);
    return res.status(201).json(savedMeal);
  } catch (error) {
    console.error('Error creating meal:', error);
    return res.status(500).json({ error: 'Failed to create meal' });
  }
} 