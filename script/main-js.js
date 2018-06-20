var app = new Vue({
    el: "#body",
    data: {
        city: "",
        data: {},
        list: [],
        mainInfo: {},
        next24Hours: [],
        everyDayObj: {},
        nextDays: [],
        background: "",
        currentPage: 0,

    },
    methods: {
        searchCity: function () {
            const input = document.getElementById("search-bar");
            const value = input.value;
            app.getCity(value);
        },
        getCity: function (city) {
            fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&APPID=013e94b7065991843e6435dd41005e59')
                .then(response => response.json())
                .then(json => {
                    app.data = json;
                    app.list = json.list;
                    if (app.list.length > 0) {
                        app.getEveryDay();
                        app.setBackground();
                        app.getMainData();
                        app.getNext24Hours();
                        app.getNextDaysAverage();
                    }
                })
                .catch(error => console.log("error", error))
        },
        getEveryDay: function () {
            const list = this.list;
            var everyDay = {};
            var days = [];
            for (let i = 0; i < list.length; i++) {
                var dates = new Date(list[i].dt_txt).toString();
                var day = dates.split(" ")[0];
                if (!everyDay[day]) {
                    everyDay[day] = []
                }
                if (Object.keys(everyDay).includes(day)) {
                    everyDay[day].push(list[i])
                }
            }
            app.everyDayObj = everyDay;
        },
        getMainData: function () {
            const mainInfoObject = this.mainInfo;
            const data = this.data;
            const list = this.list;
            var date = new Date(list[0].dt_txt).toString();
            var weekDay = this.setWeekDay(date.split(" ")[0]);
            var month = date.split(" ")[1] + " " + date.split(" ")[2]
            var year = date.split(" ")[3]
            var day = weekDay + " "+ month +" "+ year;
            mainInfoObject["cityName"] = data.city.name;
            mainInfoObject["temp"] = (list[0].main.temp - 273.15).toString().split(".")[0];
            mainInfoObject["maxTemp"] = (list[0].main.temp_max - 273.15).toString().split(".")[0];
            mainInfoObject["minTemp"] = (list[0].main.temp_min - 273.15).toString().split(".")[0];
            mainInfoObject["humidity"] = list[0].main.humidity;
            mainInfoObject["description"] = list[0].weather[0].description;
            mainInfoObject["date"] = day;
            mainInfoObject["wind"] = list[0].wind.speed;
            mainInfoObject["weather"] = this.setWeatherIcon(list[0].weather[0].main);
        },
        getNext24Hours: function () {
            const list = this.list;
            const next24HoursArray = [];
            for (let i = 0; i < 9; i++) {
                var dateObject = {};
                var weather = list[i].weather[0].main;
                dateObject["time"] = (list[i].dt_txt).split(" ")[1];
                dateObject["icon"] = this.setWeatherIcon(weather);
                dateObject["temp"] = (list[i].main.temp - 273.15).toString().split(".")[0];
                dateObject["maxTemp"] = (list[i].main.temp_max - 273.15).toString().split(".")[0];
                dateObject["minTemp"] = (list[i].main.temp_min - 273.15).toString().split(".")[0];
                dateObject["wind"] = list[i].wind.speed;
                next24HoursArray.push(dateObject);
            }
            app.next24Hours = next24HoursArray;
        },
        getNextDaysAverage: function () {
            const nextDaysObject = this.everyDayObj;
            const nextDays = [];
            for (key in nextDaysObject) {
                const eachDay = nextDaysObject[key];
                let day = this.setWeekDay(key);
                let weather = this.setWeatherIcon(eachDay[0].weather[0].main);
                let time = eachDay[0].dt_txt;
                let avgTemp = 0;
                let avgMaxTemp = 0;
                let avgMinTemp = 0;
                let avgHumidity = 0;
                let avgWind = 0;
                for (var i = 0; i < eachDay.length; i++) {
                    avgTemp += parseFloat(eachDay[i].main.temp - 273.15);
                    avgMaxTemp += parseFloat(eachDay[i].main.temp_max - 273.15);
                    avgMinTemp += parseFloat(eachDay[i].main.temp_min - 273.15);
                    avgHumidity += eachDay[i].main.humidity;
                    avgWind += eachDay[i].wind.speed;
                }
                let object = {
                    day: day,
                    time: time,
                    weather: weather,
                    avgTemp: (avgTemp / i).toString().split(".")[0],
                    avgMaxTemp: (avgMaxTemp / i).toString().split(".")[0],
                    avgMinTemp: (avgMinTemp / i).toString().split(".")[0],
                    avgHumidity: (avgHumidity / i).toString().split(".")[0],
                    avgWind: (avgHumidity / i).toString().split(".")[0]
                };
                nextDays.push(object);
                app.nextDays = nextDays;
            }
        },
        setBackground: function () {
            var list = this.list;
            var weather = list[0].weather[0].main;
            var imageUrl = "";
            if (weather == "Rain") {
                imageUrl = "rain.jpg";
            }
            if (weather == "Clouds") {
                imageUrl = "cloud.jpg"
            }
            if (weather == "Snow") {
                imageUrl = "snow.jpg";
            }
            if (weather == "Clear") {
                imageUrl = "sun.jpg";
            }
            document.getElementById('body').style.backgroundImage = 'url(/style/images/' + imageUrl + ')';
        },
        setWeatherIcon: function (weather) {
            var icon;
            if (weather == "Rain") {
                icon = "wi wi-rain"
            }
            if (weather == "Clouds") {
                icon = "wi wi-cloud"
            }
            if (weather == "Snow") {
                icon = "wi wi-snow"
            }
            if (weather == "Clear") {
                icon = "wi wi-day-sunny"
            }
            return icon;
        },
        setWeekDay: function (day) {
            let weekDay;
            if (day == "Mon") {
                weekDay = "Monday"
            } else if (day == "Tue") {
                weekDay = "Tuesday"
            } else if (day == "Wed") {
                weekDay = "Wednesday"
            } else if (day == "Thu") {
                weekDay = "Thursday"
            } else if (day == "Fri") {
                weekDay = "Friday"
            } else if (day == "Sat") {
                weekDay = "Saturday"
            } else {
                weekDay = "Sunday"
            }
            return weekDay;
        },
        moveToRight: function () {
            var currentPage = this.currentPage;
            if (currentPage == 1) {
                currentPage = -1;
            } else if (currentPage == 0) {
                currentPage = 1;
            } else {
                currentPage = 0;
            }
            app.currentPage = currentPage;
        },
        moveToLeft: function () {
            var currentPage = this.currentPage;
            if (currentPage == 1) {
                currentPage = 0;
            } else if (currentPage == 0) {
                currentPage = -1;
            } else {
                currentPage = 1;
            }
            app.currentPage = currentPage;
        }
    }
});
