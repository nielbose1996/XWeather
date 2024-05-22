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

const WeatherDisplay = ({ city }) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (city) {
            setLoading(true);
            axios.get("https://api.weatherapi.com/v1/current.json", {
                params: {
                    key: "fbbbff56dd5b4bfdb1c153003242701",
                    q: city,
                },
            }).then((response) => {
                setWeatherData(response.data);
            }).catch((error) => {
                alert("Failed to fetch weather data");
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [city]);

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
                    </div>
                    <ActivitySuggestions condition={weatherData.current.condition.text} />
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

    return (
        <div className='App'>
            <h1>Weather Application</h1>
            <SearchBar onSearch={handleSearch} />
            <WeatherDisplay city={city} />
        </div>
    );
}
