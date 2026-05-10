<template>
  <div :class="{ 'component-error': error }">
    <div class="card" :class="item.class">
      <a
        :href="`https://openweathermap.org/city/${id}`"
        :target="item.target"
        rel="noreferrer"
      >
        <div class="card-content">
          <div class="media">
            <div v-if="icon" class="media-left" :class="item.background">
              <figure class="image is-48x48">
                <img
                  :src="`https://openweathermap.org/img/wn/${icon}@2x.png`"
                  :alt="conditions"
                  :title="conditions"
                />
              </figure>
            </div>
            <div class="media-content">
              <div>
                <p class="title is-4">{{ name }}</p>
                <p v-if="error" class="subtitle is-6">
                  Fail to load weather information
                </p>
                <p v-else class="subtitle is-6">
                  <span>
                    {{ temperature }}
                  </span>
                  <span class="location-time">
                    {{ locationTime }}
                  </span>
                </p>
              </div>
            </div>
            <div v-if="error" name="indicator" class="indicator">⚠️</div>
          </div>
          <div v-if="item.tag" class="tag" :class="item.tagstyle">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "OpenWeather",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const id = ref(null);
    const icon = ref(null);
    const name = ref(null);
    const temp = ref(null);
    const conditions = ref(null);
    const error = ref(false);
    const timezoneOffset = ref(0);

    const temperature = computed(() => {
      if (!temp.value) return "";

      let unit = "K";
      if (props.item.units === "metric") {
        unit = "°C";
      } else if (props.item.units === "imperial") {
        unit = "°F";
      }
      return `${temp.value} ${unit}`;
    });

    const locationTime = computed(() => {
      return calcTime(timezoneOffset.value);
    });

    const fetchWeather = async () => {
      let locationQuery;

      // Use location ID if specified, otherwise retrieve value from location (name).
      if (props.item.locationId) {
        locationQuery = `id=${props.item.locationId}`;
      } else {
        locationQuery = `q=${props.item.location}`;
      }

      const apiKey = props.item.apikey || props.item.apiKey;

      let url = `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${apiKey}&units=${props.item.units}`;
      if (props.item.endpoint) {
        url = props.item.endpoint;
      }
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const weather = await response.json();
        
        id.value = weather.id;
        name.value = weather.name;
        temp.value = parseInt(weather.main.temp).toFixed(1);
        icon.value = weather.weather[0].icon;
        conditions.value = weather.weather[0].description;
        timezoneOffset.value = weather.timezone;
      } catch (e) {
        console.log(e);
        name.value = props.item.name;
        error.value = true;
      }
    };

    const calcTime = (offset) => {
      const localTime = new Date();
      const utcTime =
        localTime.getTime() + localTime.getTimezoneOffset() * 60000;
      const calculatedTime = new Date(utcTime + 1000 * offset);
      return calculatedTime.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    fetchWeather();

    return {
      id,
      icon,
      name,
      temp,
      conditions,
      error,
      timezoneOffset,
      temperature,
      locationTime,
      fetchWeather,
      calcTime
    };
  },
};
</script>

<style scoped lang="scss">
// Add a border around the weather image.
// Otherwise the image is not always distinguishable.
.media-left {
  &.circle,
  &.square {
    background-color: #e4e4e4;
  }

  &.circle {
    border-radius: 90%;
  }

  img {
    max-height: 100%;
  }
}

.error {
  color: #de0000;
}

// Change background color in dark mode.
.is-dark {
  .media-left {
    &.circle,
    &.square {
      background-color: #909090;
    }
  }
}

//Location Time
.location-time {
  margin-left: 20px;
}
</style>
