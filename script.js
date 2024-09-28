




document.addEventListener("DOMContentLoaded", function () {
    const searchbox = document.querySelector(".search-box");
    const historyList = document.querySelector(".search-history");
    const suggestionsContainer = document.querySelector(".suggestions");
    const errorMessage = document.querySelector(".error-message"); // For displaying error messages

    const api = {
        key: "c67365c0012d7ebfb46a5afcd5af38b6",
        base: "https://api.openweathermap.org/data/2.5/"
    };

    searchbox.addEventListener("keypress", setQuery);
    searchbox.addEventListener("input", showSuggestions);
    document.getElementById("location-button").addEventListener("click", getLocation);

    function setQuery(evt) {
        if (evt.keyCode === 13) { // Check for 'Enter' key
            const query = searchbox.value.trim(); // Get the input value and remove whitespace
            if (!query) {
                alert("Please enter a city name."); // Alert if search box is empty
                return; // Exit the function if no input
            }
            getResults(query);
            saveToHistory(query);
            suggestionsContainer.innerHTML = ""; // Clear suggestions after search
        }
    }
    

    function showSuggestions() {
        const query = searchbox.value;
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        
        const suggestions = history.filter(city => city.toLowerCase().startsWith(query.toLowerCase()));
        suggestionsContainer.innerHTML = ""; // Clear previous suggestions

        suggestions.forEach(city => {
            const suggestionItem = document.createElement("div");
            suggestionItem.textContent = city;
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.addEventListener("click", () => {
                searchbox.value = city; // Set input value to clicked suggestion
                getResults(city); // Fetch weather for clicked city
                suggestionsContainer.innerHTML = ""; // Clear suggestions
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    }

    function saveToHistory(query) {
        let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        if (!history.includes(query)) {
            history.push(query);
            localStorage.setItem("searchHistory", JSON.stringify(history));
            displayHistory();
        }
    }

    function displayHistory() {
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        historyList.innerHTML = ""; // Clear existing history
        history.forEach(city => {
            const listItem = document.createElement("li");
            listItem.textContent = city;
            listItem.addEventListener("click", () => {
                getResults(city); // Fetch weather for clicked city
            });
            historyList.appendChild(listItem);
        });
    }

    function getResults(query) {
        document.getElementById("loading").style.display = "block";
        fetch(`${api.base}forecast?q=${query}&units=metric&APPID=${api.key}`)
            .then(response => response.json())
            .then(weather => {
                document.getElementById("loading").style.display = "none";
                if (weather.cod === "200") {
                    displayResults(weather);
                    hideError(); // Hide error if request is successful
                } else {
                    showError("City not found. Please try again.");
                }
            })
            .catch(() => {
                document.getElementById("loading").style.display = "none";
                showError("Failed to fetch weather data. Please check your network.");
            });
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherDataByCoords(latitude, longitude);
            }, (error) => {
                console.error("Geolocation error:", error);
                showError("Unable to retrieve your location.");
            });
        } else {
            showError("Geolocation is not supported by this browser.");
        }
    }

    function fetchWeatherDataByCoords(lat, lon) {
        fetch(`${api.base}forecast?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`)
            .then(response => response.json())
            .then(weather => {
                if (weather.cod === "200") {
                    displayResults(weather);
                    hideError(); // Hide error if request is successful
                } else {
                    showError("Error fetching location data.");
                }
            })
            .catch(err => showError("Error fetching data. Please try again."));
    }

    function displayResults(weather) {
        const city = document.querySelector(".location .city");
        city.innerText = `${weather.city.name}, ${weather.city.country}`;

        const date = document.querySelector(".location .date");
        date.innerText = dateBuilder(new Date());

        const temp = document.querySelector(".current .temp");
        temp.innerHTML = `${Math.round(weather.list[0].main.temp)}<span>°C</span>`;

        const weather_el = document.querySelector(".current .weather");
        weather_el.innerText = weather.list[0].weather[0].main;

        const hilow = document.querySelector(".hi-low");
        hilow.innerText = `${weather.list[0].main.temp_min}°C / ${weather.list[0].main.temp_max}°C`;

        const humidity = document.querySelector(".current .humidity");
    humidity.innerText = `Humidity: ${weather.list[0].main.humidity}%`;

    // Add wind speed
    const windSpeed = document.querySelector(".current .wind-speed");
    windSpeed.innerText = `Wind Speed: ${Math.round(weather.list[0].wind.speed)} m/s`;


        const isDaytime = checkDaytime(weather.city.sunrise, weather.city.sunset);
        changeBackground(weather.list[0].weather[0].main, isDaytime);

        displayForecast(weather, isDaytime);
    }

    function showError(message) {
        errorMessage.innerText = message;
        errorMessage.style.display = "block"; // Show error message
    }

    function hideError() {
        errorMessage.style.display = "none"; // Hide error message
    }

    function checkDaytime(sunrise, sunset) {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= sunrise && currentTime < sunset;
    }

    function changeBackground(weatherCondition, isDaytime) {
        const body = document.body;
        let backgroundUrl = "";

        switch (weatherCondition.toLowerCase()) {
            case "clear":
                backgroundUrl = isDaytime
                    ? "url('https://img.freepik.com/premium-photo/sunset-mountains-with-sun-setting-mountains_1034303-464048.jpg')"
                    : "url('https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/c9895345-fb6c-4e07-95e3-0960ac173d1a/8b525f7d-eed6-434c-941f-507bbc2dd57f.png')";
                break;
            case "clouds":
                backgroundUrl = isDaytime
                    ? "url('https://c4.wallpaperflare.com/wallpaper/595/932/1002/clouds-sun-sunlight-sky-wallpaper-preview.jpg')"
                    : "url('https://c8.alamy.com/zooms/9/f0bcf56f41c94992844da269cb2637e4/r95rb1.jpg')";
                break;
            case "rain":
                backgroundUrl = isDaytime
                    ? "url('https://i.pinimg.com/474x/fa/a0/e9/faa0e93a60455e42d8d1e7765581f8be.jpg')"
                    : "url('https://media.istockphoto.com/id/520167608/photo/road-to-hell.jpg?s=612x612&w=0&k=20&c=p9g9NfHleDvKlPql6sfHcUzwPLsffY52dE091abgyVo=')";
                break;
            default:
                backgroundUrl = isDaytime
                    ? "url('https://media.istockphoto.com/id/1067832096/photo/winter-morning-with-snow-and-frost.jpg?s=170667a&w=0&k=20&c=fDio4vi6qwuBXCj52R8QsrfVneqZneViwaS-pVV3RDY=')"
                    : "url('https://as2.ftcdn.net/v2/jpg/01/43/64/97/1000_F_143649783_Zai4KcEvjK9g7tbTqJWyqhQDWuDKePS4.jpg')";
                break;
        }

        body.style.backgroundImage = backgroundUrl;
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        body.style.transition = "background 1s ease-in-out";
    }

    function displayForecast(weather, isDaytime) {
        const forecastElem = document.getElementById("forecast");
        forecastElem.innerHTML = ""; 
        
        for (let i = 0; i < 5; i++) {  // Show only 5 days of forecast
            const forecastDay = document.createElement("div");
            forecastDay.classList.add("forecast-day");
    
            const day = new Date(weather.list[i * 8].dt * 1000).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
    
            const temp = Math.round(weather.list[i * 8].main.temp);
            const icon = weather.list[i * 8].weather[0].icon;
            const weatherDesc = weather.list[i * 8].weather[0].description;
    
            forecastDay.innerHTML = `
                 <div class="forecast-date">${day}</div>
                 <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${weatherDesc}">
                 <div class="forecast-temp">${temp}°C</div>
                 <div class="forecast-desc">${weatherDesc}</div>
            `;
    
            forecastElem.appendChild(forecastDay);
        }
    }

    function dateBuilder(d) {
        const months = [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
        ];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const day = days[d.getDay()];
        const date = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();

        return `${day} ${date} ${month} ${year}`;
    }

    displayHistory(); // Display history on load
});
