// src/adapters/mealie.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('api/v1/meal-plan/today');
      const stats = await fetch('api/v1/statistics/recipes');
      
      return {
        status: 'active',
        title: response.length > 0 ? `Today: ${response[0].recipe.name}` : 'No meals planned',
        subtitle: `${stats.total} recipes total`,
        details: {
          todayMeal: response[0]?.recipe?.name || 'No meal planned',
          totalRecipes: stats.total,
          stats
        }
      };
    } catch (error) {
      return {
        status: 'error',
        title: 'Connection failed',
        subtitle: 'Mealie unavailable',
        details: {
          error: error.message,
          totalRecipes: 0
        }
      };
    }
  }
};
