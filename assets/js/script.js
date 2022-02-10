var cityEl = $("#city");
var tempEl = $("#temp");
var windEl = $("#wind");
var humidityEl = $("#humidity");
var UVIndexEl = $("#UVIndex");
var searchBtn = $("#searchBtn");
var searchInputEl = $("#search-input");
var searchedCitiesListEl = $("#searchedCitiesList");
var forecastListEl = $("#forecastList");

var searchedCities = [];
// Ask user for location access to populate current location weather
var userCoordinates = navigator.geolocation.getCurrentPosition(success, fail);

function success(position) {
    var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude +
        "&lon=" + position.coords.longitude + "&units=imperial&appid=75cb326e22036d2782293ee5a922582b";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            cityEl.text(data.name + '(' + moment().format("MM/DD/YYYY") + ')');
            $("#img").attr("src", " http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
            tempEl.text("Temp: " + data.main.temp + "°F");
            windEl.text("Wind: " + data.wind.speed + " MPH");
            humidityEl.text("Humidity: " + data.main.humidity + " %");
            UVIndexEl.text('-');
        });
}

function fail(fail) {
    console.log(fail);
}

//Get weather data when user searches with city name
function getWeatherData(city) {
    UVIndexEl.removeClass('bg-success');
    UVIndexEl.removeClass('bg-warning');
    UVIndexEl.removeClass('bg-danger');

    var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=75cb326e22036d2782293ee5a922582b";
    fetch(url)
        .then(function (response1) {
            return response1.json();
        })
        .then(function (data1) {
            if (data1 != null && data1.cod == 200) {
                var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data1.coord.lat +
                    "&lon=" + data1.coord.lon + "&units=imperial&exclude=minutely,hourly&appid=75cb326e22036d2782293ee5a922582b";
                fetch(url)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        cityEl.text(data1.name + '(' + moment().format("MM/DD/YYYY") + ')');
                        $("#img").attr("src", " http://openweathermap.org/img/wn/" + data1.weather[0].icon + ".png");
                        tempEl.text("Temp: " + data1.main.temp + "°F");
                        windEl.text("Wind: " + data1.wind.speed + " MPH");
                        humidityEl.text("Humidity: " + data1.main.humidity + " %");

                        if (data != null && data.current != undefined && data.daily != undefined) {
                            UVIndexEl.text(data.current.uvi);
                            UVIndexEl.addClass(getColorForIndex(data.current.uvi));
                            loadFivedayForecast(data.daily);
                        }
                        else {
                            showErrorMsg();
                        }

                        loadSavedCities();
                    })
                    .catch(function (error) {
                        showErrorMsg();
                    });

            }
            else {
                showErrorMsg();
            }
        });
};

function showErrorMsg() {
    console.log("Error from API.")
}

function getColorForIndex(index) {
    return index > 7 ? 'bg-danger' : index > 2 ? 'bg-warning' : 'bg-success';
}

function loadFivedayForecast(forecastList) {
    forecastListEl.empty();
    for (var i = 1; i <= 5; i++) {
        forecastListEl.append("<li class='col-2 mr-4 mb-2 py-2 pb-5'><h2>"
            + moment.unix(forecastList[i].dt).format("MM/DD/YYYY") + "</h2><div><img src='http://openweathermap.org/img/wn/"
            + forecastList[i].weather[0].icon + ".png'/></div><p>Temp:" + forecastList[i].temp.day + "°F</p><p>Wind: "
            + forecastList[i].wind_speed + "MPH</p><p >Humidity:" + forecastList[i].humidity + "%</p></li>")
    }
}

var onSearchClick = function (event) {
    $('.alert').alert('close');
    event.preventDefault();
    searchedCities = [];

    var savedCitylist = localStorage.getItem("cityList");
    if (savedCitylist != null && savedCitylist != "") {
        searchedCities = JSON.parse(savedCitylist);
    }

    if (!searchedCities.includes(searchInputEl.val())) {
        searchedCities.push(searchInputEl.val());
        localStorage.setItem("cityList", JSON.stringify(searchedCities));
    }

    getWeatherData(searchInputEl.val());
    searchInputEl.val('');
};

function onCityClick(event) {
    event.preventDefault();

    getWeatherData(this.textContent);
};

function loadSavedCities() {
    searchedCities = [];
    searchedCitiesListEl.empty();

    var savedCitylist = localStorage.getItem("cityList");
    if (savedCitylist != null && savedCitylist != "") {
        searchedCities = JSON.parse(savedCitylist);
        searchedCities.forEach(element => {
            var searchedCityBtn = $('<button class="btn w-100 my-3 searchedCity">' + element + '</button>')
            searchedCitiesListEl.append(searchedCityBtn);
        });
        var searchedCityBtnEl = $('.searchedCity');
        searchedCityBtnEl.on("click", onCityClick);
    }
};

loadSavedCities();
searchBtn.on("click", onSearchClick);

// Disable right click on the page.
document.addEventListener('contextmenu', event => event.preventDefault());