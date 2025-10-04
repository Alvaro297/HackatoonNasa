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
	
	// Crear meteorito de ejemplo (puedes cambiar los parámetros)
	const meteorite = createMeteorite(
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
		
		// Mover meteorito solo si no ha impactado
		if (!meteorite.hasImpacted) {
			meteorite.mesh.position.x += meteorite.direction.x * meteorite.speed;
			meteorite.mesh.position.y += meteorite.direction.y * meteorite.speed;
			meteorite.mesh.position.z += meteorite.direction.z * meteorite.speed;
			
			// Rotar meteorito mientras viaja
			meteorite.mesh.rotation.x += 0.05;
			meteorite.mesh.rotation.y += 0.03;
			
			// Detectar impacto (distancia al centro de la Tierra)
			const distanceToEarth = meteorite.mesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
			if (distanceToEarth < 0.5) { // Radio de la Tierra
				meteorite.hasImpacted = true;
				console.log("¡Impacto detectado! El meteorito ahora rota con la Tierra.");
				
				// Convertir posición global a posición local respecto a la Tierra
				const globalPosition = meteorite.mesh.position.clone();
				scene.remove(meteorite.mesh); // Remover del scene
				earthMesh.add(meteorite.mesh); // Añadir como hijo de la Tierra
				meteorite.mesh.position.copy(earthMesh.worldToLocal(globalPosition)); // Ajustar posición
			}
		}
		
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