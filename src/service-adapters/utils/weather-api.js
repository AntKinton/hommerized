// src/adapters/utils/weather-api.js
// Utility for Weather API normalization (OpenWeather)

export async function fetchOpenWeatherStatus(endpoint, apiKey, city, units, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    // Get current weather
    const currentRes = await apiCall(`data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
    const current = currentRes;
    
    // Get forecast (5 days)
    const forecastRes = await apiCall(`data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&cnt=5`);
    const forecast = forecastRes.list || [];
    
    // Get weather data for next 5 days
    const dailyForecast = forecast.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          conditions: item.weather[0].description,
          icon: item.weather[0].icon
        };
      }
      return acc;
    }, {});
    
    return {
      status: 'active',
      title: `${Math.round(current.main.temp)}°${units === 'metric' ? 'C' : 'F'}`,
      subtitle: current.weather[0].description,
      details: {
        location: current.name,
        country: current.sys.country,
        temperature: Math.round(current.main.temp),
        feels_like: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        conditions: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString(),
        units,
        forecast: Object.values(dailyForecast)
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Weather unavailable',
      subtitle: 'Failed to load weather data',
      details: {
        error: error.message,
        location: city,
        units
      }
    };
  }
}
