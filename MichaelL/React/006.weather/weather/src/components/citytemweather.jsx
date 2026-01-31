import React, { useEffect, useState } from 'react'
import './citytemweather.css'

function Citycard() {
    //     //初始数据，不要写成这样：

    // function Citycard() {

    // const [weatherData, setWeatherData] = useState(null);

    // setWeatherData({

    // humidity: "--",

    // windSpeed: "--",

    // temperature: "--",

    // maxTemp: "--",

    // minTemp: "--",

    // sunrise: "--",

    // sunset: "--"

    // }


    const [weatherData, setWeatherData] = useState({
        humidity: '--',
        windSpeed: '--',
        temperature: '--',
        maxTemp: '--',
        minTemp: '--',
        sunrise: '--',
        sunset: '--'
    });

    const [message, setMessage] = useState('获取中>__<');

    const search = async () => {
        try {
            //不是openweather
            const url = `https://api.open-meteo.com/v1/forecast?latitude=51.10570&longitude=-114.13631&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setWeatherData({
                humidity: data.current.relative_humidity_2m,
                windSpeed: data.current.wind_speed_10m,
                temperature: Math.round(data.current.temperature_2m),
                maxTemp: Math.round(data.daily.temperature_2m_max[0]),
                minTemp: Math.round(data.daily.temperature_2m_min[0]),
                sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            })
            setMessage('成功了！！！');
        } catch (error) {
            console.error('获取天气数据失败：', error);
            setMessage('数据加载失败');
        }
    }
    // Fetch weather data once when the component mounts
    useEffect(() => { search() }, [])



    return (
        <div className='weather-container'>
            <div className='weather-card'>
                <div className='weather-header'>
                    <div className='location'>
                        <span className='location-icon'>📍</span>
                        <div>
                            <h2 className='city-name'>Calgary</h2>
                            <p className='status-message'>
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='temperature-section'>
                    <div className='temp-display'>
                        <span className='temp-value'>{weatherData.temperature}</span>
                        <span className='temp-unit'>°C</span>
                    </div>

                    <div className='temp-range'>
                        <span className='temp-high'>High {weatherData.maxTemp}°</span>
                        <span className='temp-divider'>|</span>
                        <span className='temp-low'>Low {weatherData.minTemp}°</span>
                    </div>
                </div>

                <div className='weather-details'>
                    <div className='detail-item'>
                        <span className='detail-icon'>💧</span>
                        <div className='detail-info'>
                            <span className='detail-label'>Humidity</span>
                            <span className='detail-value'>{weatherData.humidity}%</span>
                        </div>
                    </div>

                    <div className='detail-item'>
                        <span className='detail-icon'>💨</span>
                        <div className='detail-info'>
                            <span className='detail-label'>Wind Speed</span>
                            <span className='detail-value'>{weatherData.windSpeed} km/h</span>
                        </div>
                    </div>

                    <div className='detail-item'>
                        <span className='detail-icon'>🌅</span>
                        <div className='detail-info'>
                            <span className='detail-label'>Sunrise</span>
                            <span className='detail-value'>{weatherData.sunrise}</span>
                        </div>
                    </div>

                    <div className='detail-item'>
                        <span className='detail-icon'>🌇</span>
                        <div className='detail-info'>
                            <span className='detail-label'>Sunset</span>
                            <span className='detail-value'>{weatherData.sunset}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Citycard;