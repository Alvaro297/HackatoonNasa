import * as THREE from 'three';

console.log("ThreeJS code")

function main()
{
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGL3DRenderTarget({canvas: document.querySelector('#globe')});
	renderer.setSize(window.innerWidth, window.innerHeight);


	const camera = new THREE.PerspectiveCamera(45, window.innerWidth/ window.innerHeight, 0,
		1, 1000)
	
	const render = () =>{
		renderer.render(scene, camera);
	}
	
}

window.onload = main;