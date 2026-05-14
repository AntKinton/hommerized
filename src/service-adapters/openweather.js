// src/adapters/openweather.js
import { fetchOpenWeatherStatus } from './utils/weather-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'WeatherCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchOpenWeatherStatus(
      item.url, 
      item.apikey, 
      item.city || 'London', 
      item.units || 'metric', 
      fetch
    );
  }
};
