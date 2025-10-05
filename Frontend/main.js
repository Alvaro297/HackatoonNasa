import * as THREE from 'three';

// --- Formulario: recoger y mostrar datos ---
document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('miFormulario');
	const nombreInput = document.getElementById('nombreInput');
	const diametroInput = document.getElementById('diametroInput');
	const categoriaInput = document.getElementById('categoriaInput');
	const lista = document.getElementById('asteroid-list');

	form.addEventListener('submit', function(event) {
		event.preventDefault();
		const nombre = nombreInput.value.trim();
		const diametro = diametroInput.value.trim();
		const categoria = categoriaInput.value.trim();
		if (!nombre && !diametro && !categoria) return;

		// Crear elemento visual
		const item = document.createElement('div');
		item.className = 'asteroid-item';
		item.innerHTML = `<h4>${nombre || 'Sin nombre'}</h4>
			<p><strong>Diámetro:</strong> ${diametro ? diametro + ' km' : 'N/A'}</p>
			<p><strong>Categoría:</strong> ${categoria || 'N/A'}</p>`;
		lista.appendChild(item);

		// Limpiar inputs
		nombreInput.value = '';
		diametroInput.value = '';
		categoriaInput.value = '';
	});
});
let targetRotationX = 0.002;
let targetRotationY = 0;
let mouseX = 0, mouseXOnMouseDown = 0, mouseY = 0, mouseYOnMouseDown = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
const dragFactor = 0.00002;
const slowingFactor = 0.98;


function onDocumentMouseDown( event )
{
	// No bloquear eventos si se hace clic en el formulario o sus inputs
	if (event.target.closest('.info-panel')) {
		return;
	}
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
	
	// Variable global para el meteorito actual
	let currentMeteorite = null;
	
	// Crear meteorito de ejemplo (puedes cambiar los parámetros)
	currentMeteorite = createMeteorite(
		0.05,  // tamaño del meteorito
		{ x: 3, y: 2, z: 2 },  // posición inicial
		{ x: 0, y: 0, z: 0 },  // objetivo (centro de la Tierra)
		0.01  // velocidad
	);

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
		
		// Mover meteorito solo si existe y no ha impactado
		if (currentMeteorite && !currentMeteorite.hasImpacted) {
			currentMeteorite.mesh.position.x += currentMeteorite.direction.x * currentMeteorite.speed;
			currentMeteorite.mesh.position.y += currentMeteorite.direction.y * currentMeteorite.speed;
			currentMeteorite.mesh.position.z += currentMeteorite.direction.z * currentMeteorite.speed;
			
			// Rotar meteorito mientras viaja
			currentMeteorite.mesh.rotation.x += 0.05;
			currentMeteorite.mesh.rotation.y += 0.03;
			
			// Detectar impacto (distancia al centro de la Tierra)
			const distanceToEarth = currentMeteorite.mesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
			if (distanceToEarth < 0.5) { // Radio de la Tierra
				currentMeteorite.hasImpacted = true;
				console.log("¡Impacto detectado! El meteorito ahora rota con la Tierra.");
				
				// Convertir posición global a posición local respecto a la Tierra
				const globalPosition = currentMeteorite.mesh.position.clone();
				scene.remove(currentMeteorite.mesh); // Remover del scene
				earthMesh.add(currentMeteorite.mesh); // Añadir como hijo de la Tierra
				currentMeteorite.mesh.position.copy(earthMesh.worldToLocal(globalPosition)); // Ajustar posición
			}
		}
		
		renderer.render(scene, camera);
	}

	const animate = () =>{
		requestAnimationFrame(animate);
		render();
	}

	animate();

	// Función global para actualizar la simulación del meteorito desde el formulario
	window.updateMeteorSimulation = function(meteorData) {
		console.log('Actualizando simulación con datos:', meteorData);
		
		// Remover meteorito anterior si existe
		if (currentMeteorite && currentMeteorite.mesh) {
			if (currentMeteorite.mesh.parent === scene) {
				scene.remove(currentMeteorite.mesh);
			} else if (currentMeteorite.mesh.parent === earthMesh) {
				earthMesh.remove(currentMeteorite.mesh);
			}
			console.log('Meteorito anterior eliminado');
		}
		
		// Convertir coordenadas geográficas a posición 3D
		const lat = meteorData.latitude * Math.PI / 180;  // Convertir a radianes
		const lon = meteorData.longitude * Math.PI / 180;
		const radius = 0.5; // Radio de la Tierra
		
		// Posición de impacto en la superficie de la Tierra
		const targetX = radius * Math.cos(lat) * Math.cos(lon);
		const targetY = radius * Math.sin(lat);
		const targetZ = radius * Math.cos(lat) * Math.sin(lon);
		
		// Calcular posición inicial (más lejos en la dirección opuesta)
		const distance = 2.0; // Distancia inicial
		const startX = targetX + (targetX * distance);
		const startY = targetY + (targetY * distance);
		const startZ = targetZ + (targetZ * distance);
		
		// Crear nuevo meteorito con datos del formulario
		const size = Math.max(0.01, meteorData.diameter_km * 0.001); // Escalar tamaño
		const speed = Math.max(0.005, meteorData.velocity_kms * 0.0001); // Escalar velocidad
		
		currentMeteorite = createMeteorite(
			size,
			new THREE.Vector3(startX, startY, startZ),
			new THREE.Vector3(targetX, targetY, targetZ),
			speed
		);
		
		console.log(`Nuevo meteorito creado: Tamaño=${size}, Velocidad=${speed}, Destino=(${targetX.toFixed(2)}, ${targetY.toFixed(2)}, ${targetZ.toFixed(2)})`);
	};

	document.addEventListener('mousedown', onDocumentMouseDown, false);
}

window.onload = main;