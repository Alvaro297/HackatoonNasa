// formulario.js - Adaptado a tu formulario con inputs

const form = document.getElementById('miFormulario');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita recargar la página

    const velocity = parseFloat(document.getElementById('velocityInput').value) || 0;
    const diameter = parseFloat(document.getElementById('diameterInput').value) || 0;
    const angle = parseFloat(document.getElementById('angleInput').value) || 0;
    const latitude = parseFloat(document.getElementById('latitudeInput').value) || 0;
    const longitude = parseFloat(document.getElementById('longitudeInput').value) || 0;

    try {
        const response = await fetch('http://127.0.0.1:5001/api/data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                invented: true,
                diameter_m: diameter * 1000, // Convertir km a metros
                velocity_kms: velocity,
                impact_angle_deg: angle,
                latitude: latitude,
                longitude: longitude
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        const meteor = data.meteors[0];
        const energy = meteor.estimated_energy_megatons;
        
        alert(`✓ Simulación exitosa\nEnergía: ${energy.toFixed(1)} Megatones`);
        
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error: ${error.message}`);
    }
});