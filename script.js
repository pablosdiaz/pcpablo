let newsData = [];
let currentNewsIndex = 0;
let newsRotationInterval;

// Función para actualizar el reloj cada segundo
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Función para obtener el clima
function getWeather(lat, lon) {
    const weatherElement = document.getElementById('weather');
    if (weatherElement) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener la información del clima.');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.current && data.current.temperature_2m) {
                    const temp = data.current.temperature_2m;
                    weatherElement.textContent = `Temp: ${temp}°C`;
                } else {
                    weatherElement.textContent = 'Temp: N/A';
                }
            })
            .catch(error => {
                console.error('Error al obtener el clima:', error);
                weatherElement.textContent = 'Temp: N/A';
            });
    }
}

// Función para obtener el nombre de la localidad
function getLocality(lat, lon) {
    const locationElement = document.getElementById('location');
    if (locationElement) {
        // Mock locality for now or use reverse geocoding if API key is provided
        // Since we don't have a valid Geoapify key, we'll try a free alternative (Nominatim)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village || 'Ubicación Desconocida';
                    locationElement.textContent = city;
                } else {
                    locationElement.textContent = 'Ubicación N/A';
                }
            })
            .catch(error => {
                console.error('Error al obtener la localidad:', error);
                locationElement.textContent = 'Ubicación N/A';
            });
    }
}

// Función para obtener noticias del API
function fetchNews() {
    fetch('api.php')
        .then(response => response.json())
        .then(data => {
            newsData = data;
            if (newsData.length > 0) {
                updateTicker();
                rotateNews();
                // Rotate news every 10 seconds
                if (newsRotationInterval) clearInterval(newsRotationInterval);
                newsRotationInterval = setInterval(rotateNews, 10000);
            }
        })
        .catch(error => console.error('Error fetching news:', error));
}

// Actualizar el ticker de noticias
function updateTicker() {
    const tickerContent = document.getElementById('ticker-content');
    tickerContent.innerHTML = '';

    // Duplicate the news to make the scroll seamless
    const tickerItems = [...newsData, ...newsData];

    tickerItems.forEach(item => {
        const span = document.createElement('span');
        span.className = 'ticker__item';
        span.textContent = `${item.source_name}: ${item.title}`;
        tickerContent.appendChild(span);
    });
}

// Rotar la noticia principal
function rotateNews() {
    if (newsData.length === 0) return;

    const news = newsData[currentNewsIndex];

    document.getElementById('news-title').textContent = news.title;
    document.getElementById('news-description').textContent = news.description ? news.description.substring(0, 150) + '...' : '';
    document.getElementById('news-source').textContent = news.source_name;

    const date = new Date(news.pub_date);
    document.getElementById('news-date').textContent = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');

    const imageElement = document.getElementById('news-image');
    if (news.image_url) {
        imageElement.src = news.image_url;
        imageElement.style.display = 'block';
    } else {
        // Placeholder or hide image
        imageElement.src = 'https://via.placeholder.com/1920x1080/111111/FFFFFF?text=NEWS';
    }

    currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
}

// Función principal que se ejecuta al cargar la página
function main() {
    updateClock();
    setInterval(updateClock, 1000);

    fetchNews();
    // Refresh news list every 5 minutes
    setInterval(fetchNews, 300000);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeather(lat, lon);
                getLocality(lat, lon);
            },
            (error) => {
                console.error('Error al obtener la geolocalización:', error);
                document.getElementById('weather').textContent = 'Clima: N/A';
                document.getElementById('location').textContent = 'Ubicación: N/A';
            }
        );
    } else {
        document.getElementById('weather').textContent = 'Geolocalización no soportada';
    }
}

// Ejecutar la función principal al cargar el DOM
document.addEventListener('DOMContentLoaded', main);
