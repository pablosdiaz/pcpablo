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
                    weatherElement.textContent = `Temperatura: ${temp}°C`;
                } else {
                    weatherElement.textContent = 'No se pudo obtener la temperatura.';
                }
            })
            .catch(error => {
                console.error('Error al obtener el clima:', error);
                weatherElement.textContent = 'No se pudo obtener la temperatura.';
            });
    }
}

// Función para obtener el nombre de la localidad
function getLocality(lat, lon) {
    const locationElement = document.getElementById('location');
    if (locationElement) {
        // IMPORTANTE: Reemplaza 'YOUR_API_KEY' con tu propia clave de API de Geoapify.
        const apiKey = 'YOUR_API_KEY';
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener la información de la localidad.');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.features && data.features.length > 0) {
                    const properties = data.features[0].properties;
                    const city = properties.city || properties.town || properties.village || properties.municipality;
                    if (city) {
                        locationElement.textContent = `Localidad: ${city}`;
                    } else {
                        locationElement.textContent = 'No se pudo determinar la localidad.';
                    }
                } else {
                    locationElement.textContent = 'No se pudo obtener la localidad.';
                }
            })
            .catch(error => {
                console.error('Error al obtener la localidad:', error);
                locationElement.textContent = 'No se pudo obtener la localidad.';
            });
    }
}

// Función principal que se ejecuta al cargar la página
function main() {
    updateClock();
    setInterval(updateClock, 1000);

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
                const weatherElement = document.getElementById('weather');
                if (weatherElement) {
                    weatherElement.textContent = 'No se pudo obtener la ubicación.';
                }
            }
        );
    } else {
        const weatherElement = document.getElementById('weather');
        if (weatherElement) {
            weatherElement.textContent = 'La geolocalización no es soportada por este navegador.';
        }
    }
}

// Ejecutar la función principal al cargar el DOM
document.addEventListener('DOMContentLoaded', main);
