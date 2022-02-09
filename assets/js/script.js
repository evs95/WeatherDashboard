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
var userCoordinates = navigator.geolocation.getCurrentPosition(success, fail);

function success (position){
    var url = "https://api.openweathermap.org/data/2.5/weather?lat="+position.coords.latitude+
                "&lon="+position.coords.longitude+"&units=imperial&exclude=minutely,hourly&appid=75cb326e22036d2782293ee5a922582b";
    fetch(url)
        .then(function (response) {
        return response.json();
    })
    .then(function(data){
        console.log(data);
        cityEl.text(data.name+'('+moment().format("MM/DD/YYYY")+')');
        $("#img").attr("src"," http://openweathermap.org/img/wn/"+data.weather[0].icon+".png");
        tempEl.text("Temp: "+data.main.temp+"°F");
        windEl.text("Wind: "+data.wind.speed+" MPH");
        humidityEl.text("Humidity: "+data.main.humidity+" %");
        UVIndexEl.text("UV Index: 0");
  });
}

function fail (fail){
    console.log(fail);
}

function getWeatherData(city){
    var url = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid=75cb326e22036d2782293ee5a922582b";
    fetch(url)
        .then(function (response1) {
        return response1.json();
    })
    .then(function(data1){
        console.log(data1);
        var url = "https://api.openweathermap.org/data/2.5/onecall?lat="+data1.coord.lat+
                "&lon="+data1.coord.lon+"&units=imperial&exclude=minutely,hourly&appid=75cb326e22036d2782293ee5a922582b";
    fetch(url)
        .then(function (response) {
        return response.json();
    })
    .then(function(data){
        console.log(data);
        cityEl.text(data1.name+(moment().format("MM/DD/YYYY")));
        $("#img").attr("src"," http://openweathermap.org/img/wn/"+data1.weather[0].icon+".png");
        tempEl.text("Temp: "+data1.main.temp+"°F");
        windEl.text("Wind: "+data1.wind.speed+" MPH");
        humidityEl.text("Humidity: "+data1.main.humidity+" %");
        UVIndexEl.text("UV Index: "+data.current.uvi);
        loadFivedayForecast(data.daily);
        loadSavedCities();
    });
  });
};

function loadFivedayForecast(forecastList){
    console.log(forecastList);
    forecastList.forEach(element => {
        console.log(element.dt +"-"+moment.unix(element.dt).format("MM/DD/YYYY"))
    });
    for(var i=0;i<5;i++){
        forecastListEl.append("<li class='col-2 m-2 py-1 bg-dark'><h2>"
            +moment.unix(forecastList[i].dt).format("MM/DD/YYYY")+"</h2><div><img src='http://openweathermap.org/img/wn/"
            +forecastList[i].weather[0].icon+".png'/></div><p>Temp:"+forecastList[i].temp.day+"°F</p><p>Wind: "
            +forecastList[i].wind_speed +"MPH</p><p >Humidity:"+forecastList[i].humidity +"%</p></li>")
    }
}

var onSearchClick = function (event) {
    event.preventDefault();
    searchedCities=[];

    var savedCitylist = localStorage.getItem("cityList");
    if(savedCitylist != null && savedCitylist != ""){
        searchedCities = JSON.parse(savedCitylist);
    }

    searchedCities.push(searchInputEl.val());
    localStorage.setItem("cityList",JSON.stringify(searchedCities));

    getWeatherData(searchInputEl.val());

};

function onCityClick(event){
    event.preventDefault();
    
    getWeatherData(this.textContent);
};

function loadSavedCities(){
    searchedCities=[];
    searchedCitiesListEl.empty();

    var savedCitylist = localStorage.getItem("cityList");
    if(savedCitylist != null && savedCitylist != ""){
        searchedCities = JSON.parse(savedCitylist);
        searchedCities.forEach(element => {
            var searchedCityBtn = $('<button class="btn w-100 btn-secondary my-3 searchedCity">'+element+'</button>')
            searchedCitiesListEl.append(searchedCityBtn);
        });
        var searchedCityBtnEl = $('.searchedCity');
        searchedCityBtnEl.on("click", onCityClick);
    }
};

loadSavedCities();
searchBtn.on("click", onSearchClick);

