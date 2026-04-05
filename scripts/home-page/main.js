const WEATHER_API_BASE = 'https://weather-api.andrii-prykhodko.com';

let lat;
let lon;
let lastCity;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        }, () => {});
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
}

function getSelectedUnit() {
    const unitSelect = document.getElementById('unitSelect');
    return unitSelect.checked ? "imperial" : 'metric';
}

async function getWeatherByCoords(lat, lon) {
    const unit = getSelectedUnit();
    const params = new URLSearchParams({ units: unit, lat: String(lat), lon: String(lon) });
    const qs = params.toString();
    const weatherUrl = `${WEATHER_API_BASE}/weather?${qs}`;
    const forecastUrl = `${WEATHER_API_BASE}/forecast?${qs}`;

    await fetchData(weatherUrl, forecastUrl, unit);
}

async function getWeather() {
    let city = document.getElementById('cityInput').value;
    if (!city) {
        if (lastCity) {
            city = lastCity;
        } else if (lat && lon) {
            return getWeatherByCoords(lat, lon);
        }
    }

    lastCity = city;
    const unit = getSelectedUnit();
    const params = new URLSearchParams({ units: unit, q: city });
    const qs = params.toString();
    const weatherUrl = `${WEATHER_API_BASE}/weather?${qs}`;
    const forecastUrl = `${WEATHER_API_BASE}/forecast?${qs}`;

    await fetchData(weatherUrl, forecastUrl, unit);
}

async function fetchData(weatherUrl, forecastUrl, unit) {
    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('Unable to retrieve weather data');
        }
        const weatherData = await weatherResponse.json();

        document.getElementById('cityName').innerText = weatherData.name;
        document.getElementById('weatherResult').style.display = 'block';
        document.getElementById('weatherIcon').src = `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
        document.getElementById('temperature').innerText = `${weatherData.main.temp}°${unit === 'metric' ? 'C' : 'F'}`;
        document.getElementById('weatherDescription').innerText = weatherData.weather[0].description;
        document.getElementById('humidity').innerText = `Humidity: ${weatherData.main.humidity}%`;
        document.getElementById('windSpeed').innerText = `Wind Speed: ${weatherData.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
        document.getElementById('pressure').innerText = `Pressure: ${weatherData.main.pressure} hPa`;
        document.getElementById('visibility').innerText = `Visibility: ${weatherData.visibility / 1000} km`;
        document.getElementById('feelsLike').innerText = `Feels Like: ${weatherData.main.feels_like}°${unit === 'metric' ? 'C' : 'F'}`;

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        document.getElementById('forecast').style.display = 'block';
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        for (let i = 0; i < forecastData.list.length; i += 8) {
            const forecastItem = forecastData.list[i];
            const date = new Date(forecastItem.dt_txt).toDateString();
            const icon = forecastItem.weather[0].icon;
            const temp = forecastItem.main.temp;

            forecastContainer.innerHTML += `
                <div class="forecast-day">
                    <span>${date}</span>
                    <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
                    <span>${temp}°${unit === 'metric' ? 'C' : 'F'}</span>
                    <span>Feels Like: ${forecastItem.main.feels_like}°${unit === 'metric' ? 'C' : 'F'}</span>
                    <span>Humidity: ${forecastItem.main.humidity}%</span>
                    <span>Wind: ${forecastItem.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</span>
                    <span>Pressure: ${forecastItem.main.pressure} hPa</span>
                    <span>Visibility: ${forecastItem.visibility / 1000} km</span>
                </div>
            `;
        }

        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];

        const hourlyForecast = forecastData.list.filter(item => item.dt_txt.startsWith(nextDayString));
        const hourlyEl = document.getElementById('hourlyForecast');
        const hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
        if (hourlyForecast.length > 0) {
            hourlyEl.style.display = 'block';
            hourlyForecastContainer.innerHTML = '';
            hourlyForecast.forEach(forecastItem => {
                const time = new Date(forecastItem.dt_txt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                const icon = forecastItem.weather[0].icon;
                const temp = forecastItem.main.temp;

                hourlyForecastContainer.innerHTML += `
                    <div class="forecast-hour">
                        <span>${time}</span>
                        <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
                        <span>${temp}°${unit === 'metric' ? 'C' : 'F'}</span>
                        <span>Feels Like: ${forecastItem.main.feels_like}°${unit === 'metric' ? 'C' : 'F'}</span>
                        <span>Humidity: ${forecastItem.main.humidity}%</span>
                        <span>Wind: ${forecastItem.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</span>
                        <span>Pressure: ${forecastItem.main.pressure} hPa</span>
                        <span>Visibility: ${forecastItem.visibility / 1000} km</span>
                    </div>
                `;
            });
        } else {
            hourlyEl.style.display = 'none';
            hourlyForecastContainer.innerHTML = '';
        }

        requestAnimationFrame(() => {
            document.querySelectorAll('.horizontal-forecast').forEach(updateCarouselNavState);
        });

    } catch (error) {
        alert(error.message);
    }
}

function getScrollStep(container) {
    const card = container.querySelector('.forecast-day, .forecast-hour');
    if (!card) return 260;
    const gap = parseFloat(getComputedStyle(container).gap) || 10;
    return card.offsetWidth + gap;
}

function updateCarouselNavState(container) {
    const carousel = container.closest('.forecast-carousel');
    if (!carousel) return;
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    if (!prev || !next) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const eps = 2;
    const overflows = maxScroll > eps;
    carousel.classList.toggle('has-overflow', overflows);
    prev.disabled = !overflows || container.scrollLeft <= eps;
    next.disabled = !overflows || container.scrollLeft >= maxScroll - eps;
}

function initForecastCarousels() {
    document.querySelectorAll('.horizontal-forecast').forEach((container) => {
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDown = true;
            container.classList.add('active');
            startX = e.pageX;
            scrollLeft = container.scrollLeft;
        });
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('active');
        });
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('active');
        });
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const walk = (e.pageX - startX) * 1.25;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('scroll', () => updateCarouselNavState(container), { passive: true });

        container.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            const delta = e.key === 'ArrowRight' ? getScrollStep(container) : -getScrollStep(container);
            container.scrollBy({ left: delta, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.forecast-carousel').forEach((carousel) => {
        const track = carousel.querySelector('.horizontal-forecast');
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        if (!track || !prev || !next) return;

        prev.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollStep(track), behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            track.scrollBy({ left: getScrollStep(track), behavior: 'smooth' });
        });
    });

    window.addEventListener('resize', () => {
        document.querySelectorAll('.horizontal-forecast').forEach(updateCarouselNavState);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initForecastCarousels();
    getLocation();
});
