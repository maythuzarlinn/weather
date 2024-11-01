document.addEventListener('DOMContentLoaded', async function () {

    const csvData = `latitude,longitude,city,country
21.913,95.956,Yangon,Myanmar
13.756,100.501,Bangkok,Thailand
52.367,4.904,Amsterdam,Netherlands
39.933,32.859,Ankara,Turkey
56.134,12.945,Åstorp,Sweden
37.983,23.727,Athens,Greece
54.597,-5.930,Belfast,Northern Ireland
41.387,2.168,Barcelona,Spain
52.520,13.405,Berlin,Germany
46.948,7.447,Bern,Switzerland
43.263,-2.935,Bilbao,Spain
50.847,4.357,Brussels,Belgium
47.497,19.040,Bucharest,Romania
59.329,18.068,Budapest,Hungary
51.483,-3.168,Cardiff,Wales
50.937,6.96,Cologne,Germany
55.676,12.568,Copenhagen,Denmark
51.898,-8.475,Cork,Ireland
53.349,-6.260,Dublin,Ireland
55.953,-3.188,Edinburgh,Scotland
43.7696,11.255,Florence,Italy
50.110,8.682,Frankfurt,Germany        
43.254,6.637,French Riviera,France
32.650,-16.908,Funchal,Portugual
36.140,-5.353,Gibraltar
57.708,11.974,Gothenburg,Sweden     
53.548,9.987,Hamburg,Germany
60.169,24.938,Helsinki,Finland
39.020,1.482,Ibiza,Spain
50.450,30.523,Kyiv,Ukraine
61.115,10.466,Lillehammer,Norway
38.722,-9.139,Lisbon,Portugual
51.507,-0.127,London,England      
40.416,-3.703,Madrid,Spain
39.695,3.017,Mallorca,Spain
53.480,-2.242,Manchester,England       
43.296,5.369,Marseille,France
27.760,-15.586,Maspalomas,Spain
45.464,9.190,Milan,Italy
48.135,11.582,Munich,Germany
40.851,14.268,Naples,Italy
43.034,-2.417,Oñati,Spain
59.913,10.752,Oslo,Norway
48.856,2.352,Paris,France
50.075,14.437,Prague,Czech Republic
64.146,-21.942,Reykjavík,Iceland
56.879,24.603,Riga,Latvia
41.902,12.496,Rome,Italy
39.453,-31.127,Santa Cruz das Flores,Portugual
28.463,-16.251,Santa Cruz de Tenerife,Spain
57.273,-6.215,Skye,Scotland
42.697,23.321,Sofia,Bulgaria
59.329,18.068,Stockholm,Sweden
59.437,24.753,Tallinn,Estonia
18.208,16.373,Vienna,Austria
52.229,21.012,Warsaw,Poland
53.961,-1.07,York,England
47.376,8.541,Zurich,Switzerland`.trim();

    if (csvData) {
        const locations = parseCSV(csvData);
        populateDropdown(locations);
    } else {
        console.error('CSV data could not be fetched or parsed.');
    }

    // Function to parse CSV data into an array of objects
    function parseCSV(csv) {
        const [headers, ...rows] = csv.split('\n').map(row => row.split(','));
        return rows.map(row => {
            return headers.reduce((object, header, index) => {
                object[header] = row[index];
                return object;
            }, {});
        });
    }

    // Populate the dropdown based on CSV data
    function populateDropdown(data) {
        const selectElement = document.getElementById('locationSelectId');

        data.forEach(location => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ lat: location.latitude, lon: location.longitude });
            option.textContent = `${location.city}, ${location.country}`;
            selectElement.appendChild(option);
        });
    }

    let dropdown = document.getElementById('locationSelectId');
    dropdown.addEventListener('change', async function () {
        let selected_value = dropdown.value;
        if (selected_value) {
            let location = JSON.parse(selected_value);
            let lat = location.lat, lon = location.lon;
            await fetchWeather(lat, lon);
        }
    });

    async function fetchWeather(lat, lon) {
        // Show loading indicator
        document.getElementById('loading').style.display = 'block';

        try {
            const response = await fetch(`https://www.7timer.info/bin/civillight.php?lon=${lon}&lat=${lat}&product=civillight&output=json`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            displayWeather(data.dataseries);

        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
        }
    }


    function displayWeather(weather_data) {
        let weather_container = document.getElementById('showWeather');
        // Clear existing weather data
        weather_container.innerHTML = '';

        weather_data.slice(0, 7).forEach(day => {
            const dayName = formatDate(day.date);
            const weather_img = getWeatherImage(day.weather);
            const max_temp = day.temp2m.max;
            const min_temp = day.temp2m.min;

            const weather_day = document.createElement('div');
            weather_day.classList.add('weather-day');

            weather_day.innerHTML = `
                <h3 class="day-color">${dayName}</h3>
                <img src="${weather_img}" alt="${day.weather}" />
                <p class="temp">High: ${max_temp}°C</p>
                <p class="temp">Low: ${min_temp}°C</p>
            `;

            weather_container.appendChild(weather_day);
        });
    }

    function formatDate(dateString) {
        const dateData = String(dateString);
        const year = dateData.substring(0, 4);
        const month = dateData.substring(4, 6) - 1; // Months are 0-indexed in JavaScript
        const day = dateData.substring(6, 8);

        const date = new Date(year, month, day);

        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        return formatter.format(date);
    }

    function getWeatherImage(weather) {
        const icons = {
            clear: 'images/clear.png',
            cloudy: 'images/cloudy.png',
            fog: 'images/fog.png',
            humid: 'images/humid.png',
            ishower: 'images/ishower.png',
            lightrain: 'images/lightrain.png',
            lightsnow: 'images/lightsnow.png',
            mcloudy: 'images/mcloudy.png',
            oshower: 'images/oshower.png',
            pcloudy: 'images/pcloudy.png',
            rain: 'images/rain.png',
            rainsnow: 'images/rainsnow.png',
            snow: 'images/snow.png',
            tsrain: 'images/train.png',
            tstorm: 'images/tstorm.png'
        };
        return icons[weather] || 'images/clear.png';
    }
});
