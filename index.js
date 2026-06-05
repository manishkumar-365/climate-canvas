// weather app program

const weather = {
    dynamicCard: document.getElementById('dynamicCard'),
    input: document.getElementById('input'),
    locationButton: document.getElementById('locationButton'),
    search: document.getElementById('search'),

    loadingSpinner: document.getElementById('loadingSpinner'),

    errorMessage: document.getElementById('errorMessage'),
    locationIcon: document.querySelector('.locationIcon'),
    cityName: document.getElementById('cityName'),
    dayName: document.getElementById('dayName'),

    weatherAnimation: document.getElementById('weatherAnimation'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('description'),

    temperatureRange: document.getElementById('temperatureRange'),
    feelsLike: document.getElementById('feelsLike'),

    infoSection: document.getElementById('infoSection'),

    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),

    timeRange: document.getElementById('timeRange'),
    sunRise: document.getElementById('sunRise'),
    sunSet: document.getElementById('sunSet')
}



// listening event 

weather.input.addEventListener('keydown', e => {
    if (e.key === 'Enter') validateInput();
})
weather.search.addEventListener('click', validateInput);

weather.locationButton.addEventListener('click', getLocation);

// checking input 
function validateInput() {
    const newInput = weather.input.value.trim();
    if (newInput === '') weather.errorMessage.textContent = 'This field is required';
    else {
        weather.errorMessage.textContent = '';
        main(newInput);
        weather.input.value = '';
    }
}

function loadSpinner() {

    weather.loadingSpinner.innerHTML = '';
    weather.locationIcon.style.visibility='hidden';

    lottie.loadAnimation({
        container: weather.loadingSpinner,
        path: 'Animation/loadingspinner.json',
        renderer: "svg",
        loop: true,
        autoplay: true
    })

}

function hideSpinner() {
    weather.loadingSpinner.classList.add('hideSpinner');
    weather.locationIcon.style.visibility='visible';
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(

        position => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            mainBycoordinates(lat, lon);
        },
        error => {
            weather.errorMessage.textContent = 'Unable to access your location.';
        }

    );

}

function getNativeTime(data) {

    const weatherData = {
        date: data.dt,
        timezone: data.timezone,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
    }
    // unix timestamp to milliseconds
    const unixMilliseconds = weatherData.date * 1000;
    // add openweather timezone timestamp( in milliseconds )
    const timezoneMillisecs = weatherData.timezone * 1000;
    // This gives me the exact local clock time for that city ... simple mathematics
    const localMilliseconds = unixMilliseconds + timezoneMillisecs;

    const sunriseMilliseconds = timezoneMillisecs + (weatherData.sunrise * 1000);
    const sunsetMilliseconds = timezoneMillisecs + (weatherData.sunset * 1000);

    const localSunrise = new Date(timezoneMillisecs + (weatherData.sunrise * 1000));
    const localSunset = new Date(timezoneMillisecs + (weatherData.sunset * 1000));

    const localDate = new Date(localMilliseconds);

    const dayName = localDate.toLocaleDateString('en-US', { weekday: "short", timeZone: "UTC" });
    const currentTime = localDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    const sunRise = localSunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    const sunSet = localSunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

    return { dayName, currentTime, sunRise, sunSet, localMilliseconds, sunriseMilliseconds, sunsetMilliseconds };
}


let clockInterval;

function startLiveClock(localMilliseconds) {
    clearInterval(clockInterval);

    clockInterval = setInterval(() => {
        localMilliseconds += 1000;
        const updateClock = new Date(localMilliseconds);
        const day = updateClock.toLocaleDateString('en-US', { weekday: "short", timeZone: "UTC" });
        const time = updateClock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

        weather.dayName.textContent = `${day}, ${time}`;
    }, 1000);
}

function formatData(data) {

    const currentTimezone = getNativeTime(data);

    const processedData = {
        name: `${data.name}, ${data.sys.country}`,
        dayName: `${currentTimezone.dayName}, ${currentTimezone.currentTime}`,
        temperature: `${Math.floor(data.main.temp)}°C`,
        description: data.weather[0].description,
        tempRange: `${Math.floor(data.main.temp_max)}° / ${Math.floor(data.main.temp_min)}°`,
        feelsLike: `Feels like ${Math.floor(data.main.feels_like)}°`,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${data.wind.speed} Km/h`,
        pressure: `${data.main.pressure} mb`,
        visibility: `${Math.floor(data.visibility / 1000)} Km`,
        sunRise: currentTimezone.sunRise,
        sunSet: currentTimezone.sunSet,
        localtimeMillisecs: currentTimezone.localMilliseconds
    }

    return processedData;
}

function setTheme(data, localMilliseconds, sunriseMilliseconds, sunsetMilliseconds) {

    if (localMilliseconds < sunriseMilliseconds || localMilliseconds > sunsetMilliseconds) {
        weather.dynamicCard.classList.add('nightTheme');
        weather.search.classList.add('nightThemeBtn');
        weather.locationButton.classList.add('nightmodelocation');
        weather.infoSection.classList.add('nightBackground');
        weather.timeRange.classList.add('nightBackground');
        setNightAnimation(data);
    }
    else {
        weather.dynamicCard.classList.remove('nightTheme');
        weather.search.classList.remove('nightThemeBtn');
        weather.locationButton.classList.remove('nightmodelocation');
        weather.infoSection.classList.remove('nightBackground');
        weather.timeRange.classList.remove('nightBackground');
        renderAnimation(data);
    }

}

function setNightAnimation(data) {

    const weatherCondition = data.weather[0].main;
    const animation = {
        Rain: "rain-night.json",
        Haze: "mist.json",
        Clear: "clear-night.json",
        Clouds: "cloudy-night.json",
        Thunderstorm: "thunderstorm.json",
        Snow: "snow.json",
        Mist: "mist.json",
        'Partly Cloudy': "partlyclouds.json"
    }
    weather.weatherAnimation.innerHTML = '';

    lottie.loadAnimation({
        container: weather.weatherAnimation,
        path: `Animation/${animation[weatherCondition] || "clear-night.json"}`,
        renderer: "svg",
        loop: true,
        autoplay: true
    })
}

function renderData(processedData) {
    weather.errorMessage.style.display = 'none';
    weather.cityName.textContent = processedData.name;
    weather.dayName.textContent = processedData.dayName;
    weather.temperature.textContent = processedData.temperature;
    weather.description.textContent = processedData.description;
    weather.temperatureRange.textContent = processedData.tempRange;
    weather.feelsLike.textContent = processedData.feelsLike;
    weather.humidity.textContent = processedData.humidity;
    weather.windSpeed.textContent = processedData.windSpeed;
    weather.pressure.textContent = processedData.pressure;
    weather.visibility.textContent = processedData.visibility;
    weather.sunRise.textContent = processedData.sunRise;
    weather.sunSet.textContent = processedData.sunSet;

}

function saveRecentCity(cleanCityName) {
    localStorage.setItem("city_name", cleanCityName);
}

function renderAnimation(data) {
    const weatherCondition = data.weather[0].main;
    const animation = {
        Rain: "rain.json",
        Haze: "mist.json",
        Clear: "clear.json",
        Clouds: "cloudy.json",
        Thunderstorm: "thunderstorm.json",
        Snow: "snow.json",
        Mist: "mist.json",
        'Partly Cloudy': "partlyclouds.json"
    }
    weather.weatherAnimation.innerHTML = '';

    lottie.loadAnimation({
        container: weather.weatherAnimation,
        path: `Animation/${animation[weatherCondition] || "clear.json"}`,
        renderer: "svg",
        loop: true,
        autoplay: true
    })
}

// when use current location
async function mainBycoordinates(lat, lon) {

    try {
        loadSpinner();

        const apiID = 'f82ab38733999748b7b819e3a8a65494';
        const responsePromise = fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiID}&units=metric`);
        // this will cause refresh effect like loading spinner after refresh
        await Promise.all([
            responsePromise,
            new Promise((resolve) => setTimeout(resolve, 1000))
        ]);

        const response = await responsePromise;
        if (!response.ok) throw new Error('Unable to fetch weather data.');
        const data = await response.json();
        if (data.cod === 404) throw new Error('City not found.');
        hideSpinner();

        const newCity = data.name;
        saveRecentCity(newCity);

        const processedData = formatData(data);
        const timefunction = getNativeTime(data);
        setTheme(data,
            timefunction.localMilliseconds,
            timefunction.sunriseMilliseconds,
            timefunction.sunsetMilliseconds);
        renderData(processedData);
        startLiveClock(processedData.localtimeMillisecs);

    }
    catch (error) {
        hideSpinner();
        weather.errorMessage.style.display = 'block';
        weather.errorMessage.textContent = error.message;
    }

}

// use when search location
async function main(newInput) {

    try {

        loadSpinner();

        const apiID = 'f82ab38733999748b7b819e3a8a65494';
        const responsePromise = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${newInput}&appid=${apiID}&units=metric`);
        // this will cause refresh effect like loading spinner after refresh
        await Promise.all([
            responsePromise,
            new Promise((resolve) => setTimeout(resolve, 1000))
        ]);

        const response = await responsePromise;
        if (!response.ok) throw new Error('City not found.');
        const data = await response.json();
        hideSpinner();

        saveRecentCity(newInput);
        const processedData = formatData(data);
        const timefunction = getNativeTime(data);
        setTheme(data,
            timefunction.localMilliseconds,
            timefunction.sunriseMilliseconds,
            timefunction.sunsetMilliseconds);
        renderData(processedData);
        startLiveClock(processedData.localtimeMillisecs);

    }
    catch (error) {
        hideSpinner();
        weather.errorMessage.style.display = 'block';
        weather.errorMessage.textContent = error.message;
    }

}

function loadData() {
    const savedCity = localStorage.getItem("city_name")
    if (savedCity) main(savedCity);
    else {
        hideSpinner();
        weather.errorMessage.style.display = 'block';
        weather.errorMessage.textContent = 'No recent city found. Search for a city.';
    }
    }

    loadData();