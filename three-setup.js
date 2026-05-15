const container = document.getElementById('canvas-container');

// 1. Escena, Cámara y Renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // alpha: true quita el fondo

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 2. Iluminación "Perfecta" (Studio Lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 3. Cargar el OBJ
const loader = new THREE.OBJLoader();
let model;
loader.load('models/modelo.obj', (obj) => {
    model = obj;
    scene.add(model);
    model.position.y = -1;
});

camera.position.z = 5;

// 4. Animación y Rotación
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.01; // Rotación lenta automática
    }
    renderer.render(scene, camera);
}
animate();