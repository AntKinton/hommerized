<template>
  <div class="card">
    <div class="card-content">
      <div class="media is-align-items-center mb-3">
        <div class="media-left">
          <span class="icon is-large has-text-primary">
            <i class="fas fa-cloud-sun fa-2x"></i>
          </span>
        </div>
        <div class="media-content">
          <p class="title is-5 is-marginless">{{ item.name }}</p>
        </div>
      </div>

      <div class="weather-display mt-4">
        <div class="is-flex is-align-items-center is-justify-content-center mb-3">
          <div class="temperature-display">
            <span class="temperature is-size-2 has-text-weight-bold" :class="temperatureClass">
              {{ currentTemp }}°
            </span>
            <span class="weather-unit is-size-6 has-text-grey">{{ unit }}</span>
          </div>
        </div>

        <div class="weather-details">
          <div class="columns is-mobile">
            <div class="column">
              <p class="has-text-grey is-size-7 mb-1">Feels Like</p>
              <p class="has-text-weight-medium">{{ feelsLike }}°</p>
            </div>
            <div class="column">
              <p class="has-text-grey is-size-7 mb-1">Humidity</p>
              <p class="has-text-weight-medium">{{ humidity }}%</p>
            </div>
          </div>
          
          <div class="columns is-mobile">
            <div class="column">
              <p class="has-text-grey is-size-7 mb-1">Wind</p>
              <p class="has-text-weight-medium">{{ windSpeed }} {{ windUnit }}</p>
            </div>
            <div class="column">
              <p class="has-text-grey is-size-7 mb-1">Pressure</p>
              <p class="has-text-weight-medium">{{ pressure }} hPa</p>
            </div>
          </div>
        </div>

        <div v-if="forecast" class="forecast-container mt-4">
          <p class="has-text-weight-medium mb-2">Forecast</p>
          <div class="columns is-mobile">
            <div 
              v-for="(day, idx) in forecast" 
              :key="idx"
              class="column has-text-centered"
            >
              <p class="is-size-7 has-text-grey mb-1">{{ day.date }}</p>
              <span class="icon is-small mb-1" :class="day.iconClass">
                <i :class="day.icon"></i>
              </span>
              <p class="is-size-6">{{ day.high }}°/{{ day.low }}°</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'WeatherCard',
  props: { 
    item: Object,
    adapter: Object
  },
  setup(props) {
    const weather = ref(null);
    const isLoading = ref(false);

    const currentTemp = computed(() => weather.value?.current?.temp || '--');
    const feelsLike = computed(() => weather.value?.current?.feels_like || '--');
    const humidity = computed(() => weather.value?.current?.humidity || '--');
    const windSpeed = computed(() => weather.value?.current?.wind_speed || '--');
    const windUnit = computed(() => weather.value?.current?.wind_unit || 'km/h');
    const pressure = computed(() => weather.value?.current?.pressure || '--');
    const unit = computed(() => weather.value?.units?.temperature || 'C');

    const temperatureClass = computed(() => {
      const temp = parseFloat(currentTemp.value);
      if (temp >= 30) return 'has-text-danger';
      if (temp >= 20) return 'has-text-warning';
      if (temp >= 10) return 'has-text-primary';
      return 'has-text-info';
    });

    onMounted(async () => {
      if (props.adapter && props.adapter.fetchWeather) {
        isLoading.value = true;
        try {
          weather.value = await props.adapter.fetchWeather(props.item.url, props.item.apikey);
        } catch (e) {
          console.error("Weather fetch failed", e);
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { 
      weather, 
      isLoading,
      currentTemp,
      feelsLike,
      humidity,
      windSpeed,
      windUnit,
      pressure,
      unit,
      temperatureClass
    };
  }
}
</script>
