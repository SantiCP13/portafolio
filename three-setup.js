// --- LÓGICA DE ESCENA 3D INTERACTIVA (CON CARGA DE GLB) ---
const container = document.getElementById('canvas-container');

if (container) {
    // 1. Escena, Cámara y Renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.5); // Posición inicial de la cámara

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 2. Control de arrastre por el usuario
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Desactivado para permitir el scroll natural de la web

    // 3. Iluminación de Estudio Premium
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz general
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2); // Luz principal blanca
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 1.5); // Luz de contra morada
    rimLight.position.set(-5, -5, -3);
    scene.add(rimLight);

    // 4. Cargador del Modelo GLB
    const loader = new THREE.GLTFLoader();
    let model; // Guardará la referencia de tu modelo para poder rotarlo

    // Reemplaza 'models/mi_modelo.glb' por la ruta y nombre real de tu archivo
    loader.load('models/tank.glb', (gltf) => {
        model = gltf.scene;

        // Auto-escala y centrado automático del modelo
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Ajusta el valor "2.8" si quieres que el modelo se vea más grande o pequeño dentro del recuadro
        const scale = 2.8 / maxDim; 
        model.scale.set(scale, scale, scale);

        // Centra el punto de pivote en el medio geométrico del objeto
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);
    }, 
    (xhr) => {
        // Progreso de carga en la consola (opcional)
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    }, 
    (error) => {
        console.error('Ocurrió un error al cargar el GLB:', error);
    });

    // 5. Ajuste responsivo de pantalla
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // 6. Ciclo de Animación (Rotación automática e interacción)
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Si el modelo ya se cargó, rotarlo suavemente de forma automática
        if (model) {
            model.rotation.y += 0.006; // Ajusta este número para cambiar la velocidad de giro
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}