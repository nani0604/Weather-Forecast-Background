// Unsplash API for background images
const UNSPLASH_ACCESS_KEY = "4jMTLl9BaILd5gpFR4nA4lblWKoQgUODmKChc2OsuaE";

// OpenWeatherMap API Key
const OPENWEATHER_API_KEY = "efa106ce6c3303ff813035a6ead7b6ba";

async function fetchWeather() {
  const searchInput = document.getElementById("search").value.trim();
  const weatherDataSection = document.getElementById("weather-data");
  const backgroundOverlay = document.querySelector(".background-overlay");
  const locationDetails = document.getElementById("full-location");

  // Reset display
  weatherDataSection.innerHTML = `
        <div class="weather-loader">
            <div class="loader"></div>
        </div>
    `;
  locationDetails.textContent = "";
  backgroundOverlay.style.backgroundImage = "none";

  if (searchInput === "") {
    showError("Please enter a city name");
    return;
  }

  try {
    // Geocoding API to get coordinates and full location details
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

    // Fetch background image
    const backgroundImageURL = await fetchLocationImage(name, country);
    backgroundOverlay.style.backgroundImage = `url('${backgroundImageURL}')`;

    // Weather API to get current weather
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();

    // Update location details
    locationDetails.textContent = `${state ? state + ", " : ""}${country}`;

    // Display weather
    displayWeather(weatherData, name, country);
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
      `https://source.unsplash.com/500x500/?${city},${country},landmark`
    );
  } catch {
    return `https://source.unsplash.com/500x500/?${city},${country},landmark`;
  }
}

function displayWeather(data, cityName, countryCode) {
  const weatherDataSection = document.getElementById("weather-data");
  const mainWeather = data.weather[0].main.toLowerCase();

  weatherDataSection.innerHTML = `
        <div class="weather-icon ${mainWeather}">
            <img src="https://openweathermap.org/img/wn/${
              data.weather[0].icon
            }@2x.png" 
                 alt="${data.weather[0].description}">
        </div>
        <div class="weather-details">
            <h2>${cityName}</h2>
            <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
            <p><strong>Feels Like:</strong> ${Math.round(
              data.main.feels_like
            )}°C</p>
            <p><strong>Description:</strong> ${data.weather[0].description}</p>
        </div>
        <div class="additional-info">
            <div class="info-item">
                <strong>Humidity</strong>
                <p>${data.main.humidity}%</p>
            </div>
            <div class="info-item">
                <strong>Wind</strong>
                <p>${data.wind.speed} m/s</p>
            </div>
            <div class="info-item">
                <strong>Pressure</strong>
                <p>${data.main.pressure} hPa</p>
            </div>
        </div>
    `;
}

function showError(message) {
  const weatherDataSection = document.getElementById("weather-data");
  weatherDataSection.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Add event listener for Enter key
document
  .getElementById("search")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      fetchWeather();
    }
  });
