// City Information Database
const cityInfo = {
    'Town Hall': {
        name: 'Ayuntamiento / Town Hall',
        description: 'El edificio principal de la ciudad donde se toman todas las decisiones importantes. Construido con materiales dorados para simbolizar su importancia.',
        emoji: '🏛️',
        stats: {
            'Año de construcción': '2024',
            'Capacidad': '200 personas',
            'Horario': '8:00 - 18:00'
        }
    },
    'House 1': {
        name: 'Casa Residencial 1',
        description: 'Una acogedora casa familiar con dos ventanas y una chimenea. Hogar de la familia González.',
        emoji: '🏠',
        stats: {
            'Habitantes': '4 personas',
            'Habitaciones': '3',
            'Jardín': 'Sí'
        }
    },
    'House 2': {
        name: 'Casa Residencial 2',
        description: 'Casa moderna con excelente iluminación natural. Hogar de la familia Martínez.',
        emoji: '🏠',
        stats: {
            'Habitantes': '3 personas',
            'Habitaciones': '2',
            'Garaje': 'Sí'
        }
    },
    'House 3': {
        name: 'Casa Residencial 3',
        description: 'Casa encantadora cerca del parque. Perfecta para amantes de la naturaleza. Hogar de la familia López.',
        emoji: '🏠',
        stats: {
            'Habitantes': '5 personas',
            'Habitaciones': '4',
            'Mascotas': '2 perros'
        }
    },
    'Central Park': {
        name: 'Parque Central',
        description: 'El parque más grande de la ciudad con hermosos árboles y bancos para descansar. Lugar perfecto para reuniones familiares.',
        emoji: '🌳',
        stats: {
            'Área': '500 m²',
            'Árboles': '2',
            'Bancos': '1'
        }
    },
    'Green Park': {
        name: 'Parque Verde',
        description: 'Un parque tranquilo con una hermosa fuente central. Ideal para relajarse y meditar.',
        emoji: '⛲',
        stats: {
            'Área': '350 m²',
            'Árboles': '1',
            'Fuente': 'Sí'
        }
    }
};

// Initialize the city when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏙️ Mini Ciudad cargada correctamente');
    initializeCity();
});

// Initialize city interactions
function initializeCity() {
    // Add click events to all buildings and parks
    const buildings = document.querySelectorAll('.building');
    const parks = document.querySelectorAll('.park');
    
    buildings.forEach(building => {
        building.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            displayInfo(name);
            highlightElement(this);
        });
    });
    
    parks.forEach(park => {
        park.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            displayInfo(name);
            highlightElement(this);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
    
    // Display welcome message
    displayWelcomeMessage();
}

// Display information about a city element
function displayInfo(elementName) {
    const info = cityInfo[elementName];
    const infoText = document.getElementById('info-text');
    
    if (info) {
        let html = `
            <div class="info-content">
                <h3>${info.emoji} ${info.name}</h3>
                <p>${info.description}</p>
                <div class="stats">
                    <h4>Características:</h4>
                    <ul>
        `;
        
        for (const [key, value] of Object.entries(info.stats)) {
            html += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        
        html += `
                    </ul>
                </div>
            </div>
        `;
        
        infoText.innerHTML = html;
        console.log(`ℹ️ Mostrando información de: ${info.name}`);
    }
}

// Highlight the selected element
function highlightElement(element) {
    // Remove previous highlights
    document.querySelectorAll('.building, .park').forEach(el => {
        el.style.filter = '';
    });
    
    // Add highlight to selected element
    element.style.filter = 'brightness(1.3) drop-shadow(0 0 10px gold)';
    
    // Animate the element
    element.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Display welcome message
function displayWelcomeMessage() {
    const infoText = document.getElementById('info-text');
    infoText.innerHTML = `
        <div class="welcome-message">
            <h3>🏙️ Bienvenido a Mini Ciudad NASA</h3>
            <p>Esta es una simulación interactiva de una ciudad pequeña.</p>
            <p><strong>Haz clic</strong> en cualquier edificio o parque para ver su información.</p>
            <p>La ciudad incluye:</p>
            <ul style="text-align: left; display: inline-block;">
                <li>🏛️ Un Ayuntamiento (Town Hall)</li>
                <li>🏠 Tres casas residenciales</li>
                <li>🌳 Dos parques con árboles</li>
                <li>🛣️ Calles que conectan toda la ciudad</li>
            </ul>
            <p style="margin-top: 15px;"><em>¡Explora y descubre más sobre cada lugar!</em></p>
        </div>
    `;
}

// Handle keyboard navigation
function handleKeyboard(event) {
    const allElements = [...document.querySelectorAll('.building, .park')];
    const currentHighlighted = document.querySelector('[style*="brightness(1.3)"]');
    
    if (event.key === 'Enter' && currentHighlighted) {
        currentHighlighted.click();
    }
    
    if (event.key === 'Escape') {
        // Remove highlights and show welcome message
        allElements.forEach(el => {
            el.style.filter = '';
        });
        displayWelcomeMessage();
    }
    
    // Arrow key navigation
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        
        const currentIndex = currentHighlighted 
            ? allElements.indexOf(currentHighlighted) 
            : -1;
        
        let nextIndex;
        
        switch(event.key) {
            case 'ArrowRight':
                nextIndex = (currentIndex + 1) % allElements.length;
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex <= 0 ? allElements.length - 1 : currentIndex - 1;
                break;
            case 'ArrowDown':
                nextIndex = (currentIndex + 3) % allElements.length;
                break;
            case 'ArrowUp':
                nextIndex = currentIndex - 3 < 0 ? allElements.length - 1 : currentIndex - 3;
                break;
        }
        
        if (nextIndex !== undefined && allElements[nextIndex]) {
            highlightElement(allElements[nextIndex]);
            const name = allElements[nextIndex].getAttribute('data-name');
            displayInfo(name);
            
            // Scroll into view if needed
            allElements[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Add bounce animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0) scale(1.1); }
        50% { transform: translateY(-20px) scale(1.15); }
    }
    
    .info-content {
        text-align: left;
        animation: fadeIn 0.5s ease;
    }
    
    .info-content h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 24px;
    }
    
    .info-content p {
        margin-bottom: 15px;
        line-height: 1.8;
    }
    
    .stats {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
    }
    
    .stats h4 {
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .stats ul {
        list-style: none;
        padding: 0;
    }
    
    .stats li {
        padding: 5px 0;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .stats li:last-child {
        border-bottom: none;
    }
    
    .welcome-message {
        animation: fadeIn 0.5s ease;
    }
    
    .welcome-message ul {
        list-style: none;
        padding: 0;
    }
    
    .welcome-message li {
        padding: 5px 0;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Add some fun console messages
console.log('%c🏙️ Mini Ciudad NASA', 'font-size: 20px; color: #3498db; font-weight: bold;');
console.log('%c¡Bienvenido al proyecto de la mini ciudad!', 'font-size: 14px; color: #2ecc71;');
console.log('%cUsa las teclas de flecha para navegar, Enter para seleccionar, y Escape para volver al inicio.', 'font-size: 12px; color: #95a5a6;');
