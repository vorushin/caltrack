import { deleteMeal } from '../../../services/mealService';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Meal ID is required' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'DELETE':
      return handleDeleteMeal(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle DELETE request to remove a meal
 */
async function handleDeleteMeal(req, res, id) {
  try {
    await deleteMeal(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return res.status(500).json({ error: 'Failed to delete meal' });
  }
} 