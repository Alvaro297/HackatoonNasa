// Script para recoger y mostrar datos del formulario

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('miFormulario');
    const velocityInput = document.getElementById('velocityInput');
    const diameterInput = document.getElementById('diameterInput');
    const angleInput = document.getElementById('angleInput');
    const latitudeInput = document.getElementById('latitudeInput');
    const longitudeInput = document.getElementById('longitudeInput');
    const lista = document.getElementById('asteroid-list');

    if (!form || !velocityInput || !diameterInput || !angleInput || !latitudeInput || !longitudeInput || !lista) {
        console.error('Algún elemento del formulario no se encontró.');
        return;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const velocity = parseFloat(velocityInput.value.trim());
        const diameter = parseFloat(diameterInput.value.trim());
        const angle = parseFloat(angleInput.value.trim());
        const latitude = parseFloat(latitudeInput.value.trim());
        const longitude = parseFloat(longitudeInput.value.trim());
        
        if (!velocity && !diameter && !angle && !latitude && !longitude) {
            alert('Por favor, introduce al menos un valor.');
            return;
        }

        // Crear elemento visual con los datos del meteorito
        const item = document.createElement('div');
        item.className = 'asteroid-item';
        item.innerHTML = `
            <h4>Meteor Impact Simulation</h4>
            <p><strong>Velocity:</strong> ${velocity ? velocity + ' km/s' : 'N/A'}</p>
            <p><strong>Diameter:</strong> ${diameter ? diameter + ' km' : 'N/A'}</p>
            <p><strong>Angle:</strong> ${angle ? angle + '°' : 'N/A'}</p>
            <p><strong>Latitude:</strong> ${latitude ? latitude + '°' : 'N/A'}</p>
            <p><strong>Longitude:</strong> ${longitude ? longitude + '°' : 'N/A'}</p>
            <p id="simulation-status"><strong>Status:</strong> Enviando datos...</p>
        `;
        lista.appendChild(item);

        // Enviar datos al backend
        try {
            document.getElementById('simulation-status').innerHTML = '<strong>Status:</strong> 🔄 Conectando con servidor...';
            
            const response = await fetch('http://localhost:5001/api/meteor-simulation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    velocity: velocity || 0,
                    diameter: diameter || 0,
                    angle: angle || 0,
                    latitude: latitude || 0,
                    longitude: longitude || 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Respuesta del backend:', result);
            
            if (result.success) {
                document.getElementById('simulation-status').innerHTML = '<strong>Status:</strong> ✅ Simulación procesada correctamente';
                
                // Actualizar la visualización 3D del meteorito
                if (window.updateMeteorSimulation) {
                    window.updateMeteorSimulation(result.meteor);
                } else {
                    console.warn('La función updateMeteorSimulation no está disponible');
                    document.getElementById('simulation-status').innerHTML = '<strong>Status:</strong> ⚠️ Función de simulación no encontrada';
                }
            } else {
                document.getElementById('simulation-status').innerHTML = '<strong>Status:</strong> ❌ Error en la simulación del servidor';
                console.error('Error del backend:', result);
            }
        } catch (error) {
            console.error('Error completo:', error);
            if (error.message.includes('Failed to fetch')) {
                document.getElementById('simulation-status').innerHTML = '<strong>Status:</strong> ❌ Servidor no disponible (¿está ejecutándose?)';
            } else {
                document.getElementById('simulation-status').innerHTML = `<strong>Status:</strong> ❌ Error: ${error.message}`;
            }
        }

        // Limpiar inputs después de un delay
        setTimeout(() => {
            velocityInput.value = '';
            diameterInput.value = '';
            angleInput.value = '';
            latitudeInput.value = '';
            longitudeInput.value = '';
        }, 1000);
    });
});
