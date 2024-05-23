import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './XWeather.css';

const SearchBar = ({ onSearch }) => {
    const [searchValue, setSearchValue] = useState("");
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        setDebounceTimeout(setTimeout(() => {
            onSearch(value);
        }, 500));
    };

    return (
        <div className='search-bar'>
            <input
                type='text'
                value={searchValue}
                placeholder='Enter city name'
                onChange={handleSearchChange}
            />
        </div>
    );
};

const WeatherCard = ({ title, value }) => (
    <div className='weather-card'>
        <h3>{title}</h3>
        <p>{value}</p>
    </div>
);

const ActivitySuggestions = ({ condition }) => {
    const getActivities = (condition) => {
        switch (condition) {
            case 'Sunny':
                return ['Hiking', 'Beach', 'Picnic'];
            case 'Rainy':
                return ['Museum', 'Movie', 'Reading'];
            case 'Snowy':
                return ['Skiing', 'Snowboarding', 'Hot Cocoa'];
            case 'Mist':
                return ['Photography', 'Nature Walk', 'Yoga'];
            case 'Partly cloudy':
                return ['Outdoor Sports', 'Cycling', 'Barbecue'];
            case 'Clear':
                return ['Star Gazing', 'Camping', 'Bonfire'];
            default:
                return ['Relaxing at home', 'Board games', 'Cooking'];
        }
    };

    return (
        <div className="activity-suggestions">
            <h3>Suggested Activities</h3>
            <ul>
                {getActivities(condition).map(activity => (
                    <li key={activity}>{activity}</li>
                ))}
            </ul>
        </div>
    );
};

const ForecastWeather = ({ forecastData }) => (
    <div className='forecast'>
        <h3>3-Day Forecast</h3>
        <div className='forecast-cards'>
            {forecastData.map((day, index) => (
                <div key={index} className='forecast-card'>
                    <h4>{new Date(day.date).toLocaleDateString()}</h4>
                    <p>Max Temp: {day.day.maxtemp_c}°C</p>
                    <p>Min Temp: {day.day.mintemp_c}°C</p>
                    <p>Condition: {day.day.condition.text}</p>
                </div>
            ))}
        </div>
    </div>
);

const WeatherDisplay = ({ city }) => {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAllCards, setShowAllCards] = useState(false);

    useEffect(() => {
        if (city) {
            setLoading(true);

            // Combining both API calls into a single promise
            Promise.all([
                axios.get("https://api.weatherapi.com/v1/current.json", {
                    params: {
                        key: "fbbbff56dd5b4bfdb1c153003242701",
                        q: city,
                    },
                }),
                axios.get("https://api.weatherapi.com/v1/forecast.json", {
                    params: {
                        key: "fbbbff56dd5b4bfdb1c153003242701",
                        q: city,
                        days: 3,
                    },
                })
            ])
            .then(([currentResponse, forecastResponse]) => {
                setWeatherData(currentResponse.data);
                setForecastData(forecastResponse.data.forecast.forecastday);
            })
            .catch((error) => {
                alert("Failed to fetch weather data");
            })
            .finally(() => {
                setLoading(false);
            });
        }
    }, [city]);

    const toggleShowAllCards = () => {
        setShowAllCards(!showAllCards);
    };

    return (
        <div className='weather-display'>
            {loading && <p>Loading data...</p>}
            {!loading && weatherData && (
                <>
                    <div className='location-info'>
                        <img src={weatherData.current.condition.icon} alt="weather icon" />
                        <h2>{weatherData.location.name}, {weatherData.location.region}, {weatherData.location.country}</h2>
                    </div>
                    <div className='weather-cards'>
                        <WeatherCard title="Temperature" value={`${weatherData.current.temp_c}°C`} />
                        <WeatherCard title="Humidity" value={`${weatherData.current.humidity}%`} />
                        <WeatherCard title="Condition" value={`${weatherData.current.condition.text}`} />
                        <WeatherCard title="Wind Speed" value={`${weatherData.current.wind_kph} kph`} />
                        {showAllCards && (
                            <>
                                <WeatherCard title="Feels Like" value={`${weatherData.current.feelslike_c}°C`} />
                                <WeatherCard title="UV Index" value={weatherData.current.uv} />
                                <WeatherCard title="Visibility" value={`${weatherData.current.vis_km} km`} />
                                <WeatherCard title="Precipitation" value={`${weatherData.current.precip_mm} mm`} />
                            </>
                        )}
                    </div>
                    <button className='button' onClick={toggleShowAllCards}>
                        {showAllCards ? "Show Less" : "Show More"}
                    </button>
                    <ActivitySuggestions condition={weatherData.current.condition.text} />
                    {forecastData && <ForecastWeather forecastData={forecastData} />}
                </>
            )}
        </div>
    );
};

export default function XWeather() {
    const [city, setCity] = useState("");

    const handleSearch = (searchCity) => {
        setCity(searchCity);
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                axios.get("https://api.weatherapi.com/v1/current.json", {
                    params: {
                        key: "fbbbff56dd5b4bfdb1c153003242701",
                        q: `${latitude},${longitude}`,
                    },
                }).then((response) => {
                    setCity(`${response.data.location.name}, ${response.data.location.region}, ${response.data.location.country}`);
                }).catch((error) => {
                    alert("Failed to fetch initial weather data based on location");
                });
            }, (error) => {
                alert("Geolocation is not enabled. Please enter your city manually.");
            });
        }
    }, []);

    return (
        <div className='App'>
            <h1>Weather Application</h1>
            <SearchBar onSearch={handleSearch} />
            <WeatherDisplay city={city} />
        </div>
    );
}
