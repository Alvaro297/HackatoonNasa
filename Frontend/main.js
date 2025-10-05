import * as THREE from 'three';
let targetRotationX = 0.002;
let targetRotationY = 0;
let mouseX = 0, mouseXOnMouseDown = 0, mouseY = 0, mouseYOnMouseDown = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
const dragFactor = 0.00002;
const slowingFactor = 0.98;


function onDocumentMouseDown( event )
{
	event.preventDefault();
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	mouseXOnMouseDown = event.clientX - windowHalfX;
	mouseYOnMouseDown = event.clientY - windowHalfY;
}

function onDocumentMouseMove( event )
{
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
	targetRotationX = ( mouseX - mouseXOnMouseDown ) * dragFactor;
	targetRotationY = ( mouseY - mouseYOnMouseDown ) * dragFactor;
}

function onDocumentMouseUp( event )
{
	document.removeEventListener('mousemove', onDocumentMouseMove, false);
	document.removeEventListener('mouseup', onDocumentMouseUp, false);
	targetRotationX = 0.002; // Volver a rotación automática
	targetRotationY = 0;
}

function main()
{
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#globe')});
	renderer.setSize(window.innerWidth, window.innerHeight);

	const earthGeometry = new THREE.SphereGeometry(0.5,32,32);
	const earthMaterial = new THREE.MeshPhongMaterial({
		//wireframe: true,
		map: new THREE.TextureLoader().load('textures/earthmap.jpeg'),
		bumpMap: new THREE.TextureLoader().load('textures/earthbump.jpeg'),
		bumpScale: 0.01,
	});
	const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
	scene.add(earthMesh);



	// Luz ambiente más suave
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);
	
	// Luz direccional que simula el sol
	const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
	sunLight.position.set(5, 3, 5);
	scene.add(sunLight);

	// create cloudGeometry
	const cloudGeometry =  new THREE.SphereGeometry(0.52,32,32);
	const cloudMaterial = new THREE.MeshPhongMaterial({
		map: new THREE.TextureLoader().load('textures/earthCloud.png'),
		transparent: true
	});
	const cloudMesh = new THREE.Mesh(cloudGeometry,cloudMaterial);
	scene.add(cloudMesh);

	// create starGeometry
	const starGeometry =  new THREE.SphereGeometry(5,64,64);
	const starMaterial = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('textures/galaxy.png'),
		side: THREE.BackSide
	});

	const starMesh = new THREE.Mesh(starGeometry,starMaterial);
	scene.add(starMesh);

	// Función para crear efecto de impacto
	function createImpactEffect(position) {
		// Crear partículas de impacto
		const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
		const particleMaterial = new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load('textures/asteroid.webp'),
			transparent: true,
			opacity: 0.9
		});
		
		// Crear múltiples partículas
		for (let i = 0; i < 10; i++) {
			const particle = new THREE.Mesh(particleGeometry, particleMaterial);
			particle.position.copy(position);
			
			// Velocidad aleatoria para las partículas
			const velocity = new THREE.Vector3(
				(Math.random() - 0.5) * 0.1,
				(Math.random() - 0.5) * 0.1,
				(Math.random() - 0.5) * 0.1
			);
			
			scene.add(particle);
			
			// Animar partículas
			let opacity = 0.8;
			const animateParticle = () => {
				particle.position.add(velocity);
				opacity -= 0.02;
				particle.material.opacity = opacity;
				
				if (opacity > 0) {
					requestAnimationFrame(animateParticle);
				} else {
					scene.remove(particle);
				}
			};
			
			setTimeout(animateParticle, i * 100);
		}
	}

	// Función para crear meteorito
	function createMeteorite(size, startPosition, targetPosition, speed = 0.01) {
		const meteoriteGeometry = new THREE.SphereGeometry(size, 16, 16);
		const meteoriteMaterial = new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load('textures/asteroid.webp'),
		});
		const meteoriteMesh = new THREE.Mesh(meteoriteGeometry, meteoriteMaterial);
		
		// Posición inicial
		meteoriteMesh.position.set(startPosition.x, startPosition.y, startPosition.z);
		scene.add(meteoriteMesh);
		
		// Dirección hacia el objetivo
		const direction = new THREE.Vector3(
			targetPosition.x - startPosition.x,
			targetPosition.y - startPosition.y,
			targetPosition.z - startPosition.z
		).normalize();
		
		return {
			mesh: meteoriteMesh,
			direction: direction,
			speed: speed,
			hasImpacted: false
		};
	}
	
	// Array para almacenar múltiples meteoritos
	let meteorites = [];
	
	// Función para convertir coordenadas esféricas a cartesianas
	function sphericalToCartesian(distance, lat, lon) {
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lon + 180) * (Math.PI / 180);
		
		return {
			x: distance * Math.sin(phi) * Math.cos(theta),
			y: distance * Math.cos(phi),
			z: distance * Math.sin(phi) * Math.sin(theta)
		};
	}
	
	// Función para crear meteorito basado en datos reales
	function createRealMeteorite(asteroidData) {
		// Calcular tamaño basado en diámetro (convertir a escala de la simulación)
		const avgDiameter = (asteroidData.meters_min + asteroidData.meters_max) / 2;
		const meteoriteSize = Math.max(0.01, Math.min(0.1, avgDiameter / 5000)); // Escala apropiada
		
		// Posición inicial aleatoria en el espacio
		const distance = 4 + Math.random() * 2; // Entre 4 y 6 unidades de la Tierra
		const startPosition = sphericalToCartesian(
			distance,
			(Math.random() - 0.5) * 180, // Latitud aleatoria
			(Math.random() - 0.5) * 360  // Longitud aleatoria
		);
		
		// Velocidad basada en datos reales (si disponible)
		let speed = 0.008;
		if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
			const approach = asteroidData.close_approach_data[0];
			if (approach.relative_velocity) {
				// Convertir velocidad real a velocidad de simulación
				speed = Math.min(0.02, approach.relative_velocity.kilometers_per_second / 50000);
			}
		}
		
		const meteorite = createMeteorite(
			meteoriteSize,
			startPosition,
			{ x: 0, y: 0, z: 0 }, // Objetivo: centro de la Tierra
			speed
		);
		
		// Agregar información del asteroide
		meteorite.asteroidData = asteroidData;
		meteorite.name = asteroidData.name;
		meteorite.isPotentiallyHazardous = asteroidData.is_potentially_hazardous_asteroid;
		
		return meteorite;
	}
	
	// Función para actualizar la interfaz de usuario
	function updateAsteroidInfo(asteroidData) {
		const statsDiv = document.getElementById('asteroid-stats');
		const listDiv = document.getElementById('asteroid-list');
		
		if (asteroidData && asteroidData.meteors) {
			// Actualizar estadísticas
			statsDiv.innerHTML = `
				<p><strong>📊 Total de asteroides monitoreados:</strong> ${asteroidData.total_meteors}</p>
				<p><strong>⚠️ Potencialmente peligrosos:</strong> ${asteroidData.hazardous_count}</p>
				<p><strong>🎯 En simulación:</strong> ${Math.min(10, asteroidData.meteors.length)}</p>
				<p><strong>📅 Período:</strong> Últimos 7 días</p>
			`;
			
			// Mostrar lista de asteroides más relevantes
			listDiv.innerHTML = '<h4>🚀 Asteroides en Simulación:</h4>';
			
			const maxDisplay = Math.min(5, asteroidData.meteors.length);
			for (let i = 0; i < maxDisplay; i++) {
				const asteroid = asteroidData.meteors[i];
				const hazardClass = asteroid.is_potentially_hazardous_asteroid ? 'hazardous' : '';
				const hazardIcon = asteroid.is_potentially_hazardous_asteroid ? '🔴' : '🟡';
				
				const avgDiameter = ((asteroid.meters_min + asteroid.meters_max) / 2).toFixed(0);
				const energy = asteroid.estimated_energy_megatons || 'N/A';
				
				listDiv.innerHTML += `
					<div class="asteroid-item ${hazardClass}">
						<h4>${hazardIcon} ${asteroid.name.replace('(', '').replace(')', '')}</h4>
						<p><strong>Diámetro:</strong> ~${avgDiameter}m</p>
						<p><strong>Energía:</strong> ${energy} MT</p>
						<p><strong>Estado:</strong> ${asteroid.is_potentially_hazardous_asteroid ? 'PELIGROSO' : 'Seguro'}</p>
					</div>
				`;
			}
		} else {
			statsDiv.innerHTML = '<p class="loading">✅ Connected to Nasa</p>';
			listDiv.innerHTML = '<p>Using a generic simulation...</p>';
		}
	}
	//❌ Error while taking data from NASA
	// Cargar asteroides reales al inicio
	async function loadRealAsteroids() {
		console.log('Cargando asteroides reales de la NASA...');
		
		// Actualizar UI con estado de carga
		document.getElementById('asteroid-stats').innerHTML = '<p class="loading">🛰️ Conenting with NASA...</p>';
		
		try {
			// Obtener asteroides de los últimos 7 días
			const endDate = getCurrentDate();
			const startDate = getDateDaysAgo(7);
			
			const asteroidData = await getRealAsteroids(startDate, endDate);
			
			if (asteroidData && asteroidData.meteors && asteroidData.meteors.length > 0) {
				console.log(`Cargados ${asteroidData.meteors.length} asteroides reales`);
				
				// Actualizar interfaz
				updateAsteroidInfo(asteroidData);
				
				// Crear meteoritos basados en datos reales (máximo 10 para no saturar)
				const maxMeteors = Math.min(10, asteroidData.meteors.length);
				for (let i = 0; i < maxMeteors; i++) {
					const realMeteorite = createRealMeteorite(asteroidData.meteors[i]);
					meteorites.push(realMeteorite);
					
					// Agregar un retraso entre apariciones para efecto visual
					setTimeout(() => {
						console.log(`Asteroide ${realMeteorite.name} apareciendo...`);
					}, i * 2000);
				}
				
				// Mostrar información en consola
				console.log(`Total de asteroides: ${asteroidData.total_meteors}`);
				console.log(`Asteroides potencialmente peligrosos: ${asteroidData.hazardous_count}`);
			} else {
				console.log('No se pudieron cargar datos reales, usando datos de ejemplo...');
				updateAsteroidInfo(null);
				
				// Fallback: crear meteorito de ejemplo
				meteorites.push(createMeteorite(
					0.05,
					{ x: 3, y: 2, z: 2 },
					{ x: 0, y: 0, z: 0 },
					0.01
				));
			}
		} catch (error) {
			console.error('Error cargando asteroides:', error);
			updateAsteroidInfo(null);
			
			// Fallback: crear meteorito de ejemplo
			meteorites.push(createMeteorite(
				0.05,
				{ x: 3, y: 2, z: 2 },
				{ x: 0, y: 0, z: 0 },
				0.01
			));
		}
	}
	
	// Cargar asteroides al inicializar
	loadRealAsteroids();

	const camera = new THREE.PerspectiveCamera(45, window.innerWidth/ window.innerHeight,
		0.1, 1000);
	camera.position.z = 2.0;

	const render = () =>{
		earthMesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0), targetRotationX);
		earthMesh.rotateOnWorldAxis(new THREE.Vector3(1,0,0), targetRotationY);
		cloudMesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0), targetRotationX);
		cloudMesh.rotateOnWorldAxis(new THREE.Vector3(1,0,0), targetRotationY);
		
		targetRotationX *= slowingFactor;
		targetRotationY *= slowingFactor;
		
		// Mover todos los meteoritos
		meteorites.forEach((meteorite, index) => {
			if (!meteorite.hasImpacted) {
				// Mover meteorito
				meteorite.mesh.position.x += meteorite.direction.x * meteorite.speed;
				meteorite.mesh.position.y += meteorite.direction.y * meteorite.speed;
				meteorite.mesh.position.z += meteorite.direction.z * meteorite.speed;
				
				// Rotar meteorito mientras viaja
				meteorite.mesh.rotation.x += 0.05;
				meteorite.mesh.rotation.y += 0.03;
				
				// Efecto de cola/estela para asteroides peligrosos
				if (meteorite.isPotentiallyHazardous) {
					meteorite.mesh.material.emissive.setHex(0x440000); // Brillo rojizo
				}
				
				// Detectar impacto (distancia al centro de la Tierra)
				const distanceToEarth = meteorite.mesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
				if (distanceToEarth < 0.52) { // Radio de la Tierra + atmósfera
					meteorite.hasImpacted = true;
					
					const impactInfo = meteorite.name ? 
						`¡Impacto del asteroide ${meteorite.name}!` : 
						`¡Impacto detectado!`;
					
					if (meteorite.isPotentiallyHazardous) {
						console.log(`🔴 ${impactInfo} (POTENCIALMENTE PELIGROSO)`);
					} else {
						console.log(`🟡 ${impactInfo}`);
					}
					
					// Convertir posición global a posición local respecto a la Tierra
					const globalPosition = meteorite.mesh.position.clone();
					scene.remove(meteorite.mesh); // Remover del scene
					earthMesh.add(meteorite.mesh); // Añadir como hijo de la Tierra
					meteorite.mesh.position.copy(earthMesh.worldToLocal(globalPosition)); // Ajustar posición
					
					// Crear efecto de impacto
					createImpactEffect(globalPosition);
				}
			}
		});
		
		renderer.render(scene, camera);
	}

	const animate = () =>{
		requestAnimationFrame(animate);
		render();
	}

	animate();
	document.addEventListener('mousedown', onDocumentMouseDown, false);
}

window.onload = main;