// API Keys
const UNSPLASH_ACCESS_KEY = "4jMTLl9BaILd5gpFR4nA4lblWKoQgUODmKChc2OsuaE";
const OPENWEATHER_API_KEY = "efa106ce6c3303ff813035a6ead7b6ba";

async function fetchWeather() {
  const searchInput = document.getElementById("search").value.trim();
  const weatherDataSection = document.getElementById("weather-data");
  const backgroundLayer = document.querySelector(".background-layer");
  const cityNameElement = document.getElementById("city-name");
  const locationDetailsElement = document.getElementById("location-details");
  const latitudeElement = document.getElementById("latitude");
  const longitudeElement = document.getElementById("longitude");
  const currentTimeElement = document.getElementById("current-time");
  const dateElement = document.getElementById("date");

  // Reset UI
  weatherDataSection.innerHTML = `
        <div class="weather-loader">
            <div class="loader"></div>
        </div>
    `;
  backgroundLayer.style.backgroundImage = "none";
  cityNameElement.textContent = "WeatherSphere";
  locationDetailsElement.textContent = "";
  latitudeElement.textContent = "";
  longitudeElement.textContent = "";

  if (searchInput === "") {
    showError("Please enter a city name");
    return;
  }

  try {
    // Geocoding to get coordinates
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      searchInput
    )}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geocodeResponse = await fetch(geocodeURL);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.length === 0) {
      showError(`City not found: "${searchInput}"`);
      return;
    }

    const { lat, lon, name, state, country } = geocodeData[0];

    // Fetch background image (without blur)
    const backgroundImageURL = await fetchLocationImage(name, country);
    backgroundLayer.style.backgroundImage = `url('${backgroundImageURL}')`;
    backgroundLayer.style.opacity = "0.3";

    // Weather data
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();

    // Additional data display
    cityNameElement.textContent = name;
    locationDetailsElement.textContent = `${
      state ? state + ", " : ""
    }${country}`;
    latitudeElement.textContent = `Latitude: ${lat.toFixed(4)}°`;
    longitudeElement.textContent = `Longitude: ${lon.toFixed(4)}°`;

    // Update time and date
    updateTimeAndDate();

    // Display weather
    displayWeather(weatherData);
  } catch (error) {
    showError("An error occurred. Please try again.");
    console.error(error);
  }
}

async function fetchLocationImage(city, country) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${city} landmark&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
    );
    const data = await response.json();

    return (
      data.results[0]?.urls?.regular ||
      `https://source.unsplash.com/1600x900/?${city},${country},landmark`
    );
  } catch {
    return `https://source.unsplash.com/1600x900/?${city},${country},landmark`;
  }
}

function displayWeather(data) {
  const weatherDataSection = document.getElementById("weather-data");
  const mainWeather = data.weather[0].main.toLowerCase();

  weatherDataSection.innerHTML = `
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${
              data.weather[0].icon
            }@4x.png" 
                 alt="${data.weather[0].description}">
        </div>
        <div class="weather-details">
            <div>
                <h3>Temperature</h3>
                <p>${Math.round(data.main.temp)}°C</p>
                <small>Feels Like: ${Math.round(data.main.feels_like)}°C</small>
            </div>
            <div>
                <h3>Weather</h3>
                <p>${data.weather[0].description}</p>
                <small>Humidity: ${data.main.humidity}%</small>
            </div>
            <div>
                <h3>Wind</h3>
                <p>${data.wind.speed} m/s</p>
                <small>Direction: ${getWindDirection(data.wind.deg)}</small>
            </div>
            <div>
                <h3>Pressure</h3>
                <p>${data.main.pressure} hPa</p>
                <small>Sea Level</small>
            </div>
        </div>
    `;
}

function getWindDirection(degrees) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function updateTimeAndDate() {
  const now = new Date();
  const currentTimeElement = document.getElementById("current-time");
  const dateElement = document.getElementById("date");

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  currentTimeElement.textContent = now.toLocaleTimeString(
    undefined,
    timeOptions
  );
  dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
}

function showError(message) {
  const weatherDataSection = document.getElementById("weather-data");
  weatherDataSection.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Event Listeners
document
  .getElementById("search")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      fetchWeather();
    }
  });

// Initial time update and periodic updates
updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);
