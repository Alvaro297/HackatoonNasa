// api.js - Conexión con el backend Flask
const API_URL = 'http://127.0.0.1:5001/api/data';
const NASA_API_KEY = 'p0ydAYmUZc3uKXRUAz381Ew2uzFbkdAECmOgX1ep';

// Obtener asteroides reales de la NASA por rango de fechas
async function getRealAsteroids(startDate, endDate = null) {
    const data = {
        start_date: startDate,
        end_date: endDate,
        api_key: NASA_API_KEY
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Datos de asteroides reales recibidos:', result);
        return result;
    } catch (error) {
        console.error('Error obteniendo asteroides reales:', error);
        return null;
    }
}

// Obtener datos generales de asteroides
async function getBrowseAsteroids() {
    const data = {
        api_key: NASA_API_KEY
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Datos browse de asteroides:', result);
        return result;
    } catch (error) {
        console.error('Error obteniendo datos browse:', error);
        return null;
    }
}

// Simular impacto con datos inventados (para testing)
async function simulateImpact(diameter, velocity, angle, latitude = 0.0, longitude = 0.0) {
    const data = {
        invented: true,
        diameter_m: diameter,
        velocity_kms: velocity,
        impact_angle_deg: angle,
        latitude: latitude,
        longitude: longitude,
        name: `Simulation_${Date.now()}`
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result.meteors[0];
    } catch (error) {
        console.error('Error en simulación:', error);
        return null;
    }
}

// Función para obtener fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Función para obtener fecha hace N días
function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}