const apiKey = "376fe6e0dfc6b8af469128aa12f22653";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const recentCities = document.getElementById("recentCities");
const weatherData = document.getElementById("weatherData");
const forecastData = document.getElementById("forecastData");

let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

// Fetch weather data by city name
async function fetchWeatherByCity(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    updateWeather(data);
    updateRecentSearches(city);
  } catch (error) {
    alert(error.message);
  }
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    updateWeather(data);
    updateRecentSearches(data.name);
  } catch (error) {
    alert(error.message);
  }
}

// Fetch 5-day forecast
async function fetchForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    alert(error.message);
  }
}

// Update current weather display
function updateWeather(data) {
  const { name, main, weather, wind } = data;
  weatherData.innerHTML = `
    <p><strong>City:</strong> ${name}</p>
    <p><strong>Temperature:</strong> ${main.temp}°C</p>
    <p><strong>Humidity:</strong> ${main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
    <p><strong>Condition:</strong> ${weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
  `;
  fetchForecast(data.coord.lat, data.coord.lon);
}

// Display 5-day forecast
function displayForecast(data) {
  const forecasts = data.list.filter((item, index) => index % 8 === 0); // Get one forecast per day
  forecastData.innerHTML = forecasts
    .map((forecast) => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      return `
        <div class="bg-gray-50 p-4 rounded-lg">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Temp:</strong> ${forecast.main.temp}°C</p>
          <p><strong>Wind:</strong> ${forecast.wind.speed} m/s</p>
          <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
          <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
        </div>
      `;
    })
    .join("");
}

// Update recent searches
function updateRecentSearches(city) {
  if (!recentSearches.includes(city)) {
    recentSearches.push(city);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    updateRecentCitiesDropdown();
  }
}

// Update dropdown with recent cities
function updateRecentCitiesDropdown() {
  recentCities.innerHTML = `
    <option value="">Recently Searched Cities</option>
    ${recentSearches
      .map((city) => `<option value="${city}">${city}</option>`)
      .join("")}
  `;
  recentCities.hidden = recentSearches.length === 0;
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

currentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        alert("Unable to retrieve your location");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
});

recentCities.addEventListener("change", (e) => {
  const city = e.target.value;
  if (city) fetchWeatherByCity(city);
});

// Initialize recent cities dropdown
updateRecentCitiesDropdown();
