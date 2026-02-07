const apiKey = '26995f412ac11a5d6875392236cc93f7';
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');

async function getWeather(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await response.json();
    console.log(data);
    getTemperature(data);
    getDescription(data);
    getHourlyWeather(data);
    getDailyWeather(data);
    getAirHumidity(data);
    getWindSpeed(data);
    return data;
}

async function getCity() {
    const response = await fetch('https://api.openweathermap.org/geo/1.0/direct?q=oakville&limit=5&appid=' + apiKey);
    const data = await response.json();
    console.log(data);
    displayGeocoding(data);
    if (data && data.length > 0) {
        getWeather(data[0].lat, data[0].lon);
    }
    return data;
}

function displayGeocoding(data) {
    if (data && data.length > 0) {
        const city = data[0];
        document.getElementById('latitude').textContent = "Latitude: " + city.lat;
        document.getElementById('longitude').textContent = "Longitude: " + city.lon;
    }
}

getCity();


function getTemperature(data) {
    const tempValue = data.list[0].main.temp;
    temperature.textContent = Math.round(tempValue) + '°C';
}

function getDescription(data) {
    const descValue = data.list[0].weather[0].description;
    description.textContent = descValue;
}

function getHourlyWeather(data) {
    const list = data.list;
    const hoursRow = document.querySelector('.hours-row');
    hoursRow.innerHTML = '';

    for (let i = 0; i < 8 && i < list.length; i++) {
        const item = list[i];
        const date = new Date(item.dt * 1000);
        let hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = hours + ' ' + ampm;

        const hourItem = document.createElement('div');
        hourItem.classList.add('hour-item');

        const timeP = document.createElement('p');
        timeP.textContent = timeString;

        const tempP = document.createElement('p');
        tempP.textContent = Math.round(item.main.temp) + '°C';
        tempP.style.fontWeight = 'bold';
        tempP.style.fontSize = '1.2rem';

        hourItem.appendChild(timeP);
        hourItem.appendChild(tempP);
        hoursRow.appendChild(hourItem);
    }
}

function getDailyWeather(data) {
    const list = data.list;
    const dailyForecasts = [];

    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString();

        const existingDay = dailyForecasts.find(d => d.dateString === dateString);

        if (!existingDay) {
            dailyForecasts.push({
                dateString: dateString,
                date: date,
                maxTemp: item.main.temp_max || item.main.temp
            });
        } else {
            const currentMax = item.main.temp_max || item.main.temp;
            if (currentMax > existingDay.maxTemp) {
                existingDay.maxTemp = currentMax;
            }
        }
    });

    const todayString = new Date().toLocaleDateString();

    if (dailyForecasts.length > 0 && dailyForecasts[0].dateString === todayString) {

    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 5; i++) {
        const element = document.getElementById('day-' + (i + 1));
        if (element) {
            if (i < dailyForecasts.length) {
                const dayData = dailyForecasts[i];
                const dayName = daysOfWeek[dayData.date.getDay()];
                element.textContent = dayName + ": " + Math.round(dayData.maxTemp) + '°C';
            } else {
                element.textContent = "N/A";
            }
        }
    }
}

function getAirHumidity(data) {
    const airHumidity = data.list[0].main.humidity;
    document.getElementById('air-humidity').textContent = airHumidity + '%';
}

function getWindSpeed(data) {
    const windSpeed = data.list[0].wind.speed;
    document.getElementById('wind-speed').textContent = Math.round(windSpeed * 3.6) + 'km/h';
}
