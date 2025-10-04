// api.js - Conexión con el backend Flask
const API_URL = 'http://127.0.0.1:5001/api/data';

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

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    return result.meteors[0]; // Devuelve el primer meteoro del array
}