document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMACIÓN DE ENTRADA (FADE IN)
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .card, .skill-item, .box-placeholder').forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // 2. NAVEGACIÓN ACTIVA (SCROLLSPY)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeId = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.6 });

    sections.forEach(section => navObserver.observe(section));

    // 3. SMOOTH SCROLL
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 4. HEADER DINÁMICO (Transparente -> Glass)
    const header = document.querySelector('.navbar');
    window.addEventListener('scroll', () => { 
        if (window.scrollY > 50) { 
            header.classList.add('scrolled');
        } else { 
            header.classList.remove('scrolled'); 
        } 
    });

    // 5. EFECTO PARALLAX LIGERO EN EL HERO
    window.addEventListener('scroll', () => { 
        const scrolled = window.scrollY; 
        const heroText = document.querySelector('.hero-text'); 
        if (heroText) {
            heroText.style.transform = `translateY(${scrolled * 0.2}px)`;
            heroText.style.opacity = 1 - (scrolled / 700); 
        } 
    });

    // 6. LÓGICA CARRUSEL INFINITO + ZOOM
   // =======================================================
    // 6. LÓGICA DE CATÁLOGO LINEAL CON DESPLAZAMIENTO ADAPTATIVO
    // =======================================================
    const track = document.querySelector('.carousel-track');
    if (track) {
        let isDown = false;
        let startX;
        let scrollLeftVal;
        let wasDragged = false;
        let isScrollingToTarget = false;

        // Centrar y activar la primera tarjeta al cargar la página (solo en pantallas táctiles/medianas)
        setTimeout(() => {
            updateActiveCard();
        }, 100);

        // Identifica cuál tarjeta está en el centro y gestiona los desplazamientos de las vecinas
        function updateActiveCard() {
            // Si estamos en pantalla de escritorio amplia, desactivamos el cálculo dinámico
            if (window.innerWidth >= 1160) {
                const allCards = track.querySelectorAll('.card');
                allCards.forEach(card => card.classList.remove('active-card', 'prev-card', 'next-card'));
                return;
            }

            if (isScrollingToTarget) return;

            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            const allCards = track.querySelectorAll('.card');
            
            let closestCard = null;
            let closestDist = Infinity;

            allCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const dist = Math.abs(trackCenter - cardCenter);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestCard = card;
                }
            });

            // Limpiamos las clases en todas las tarjetas
            allCards.forEach(card => card.classList.remove('active-card', 'prev-card', 'next-card'));
            
            if (closestCard) {
                closestCard.classList.add('active-card');
                
                // Desplazar la tarjeta anterior hacia la izquierda
                const prev = closestCard.previousElementSibling;
                if (prev) {
                    prev.classList.add('prev-card');
                }
                
                // Desplazar la tarjeta posterior hacia la derecha
                const next = closestCard.nextElementSibling;
                if (next) {
                    next.classList.add('next-card');
                }
            }
        }

        // Detectar scroll para actualizar las clases cinemáticas
        track.addEventListener('scroll', () => {
            updateActiveCard();
        });

        // Evento scrollend
        track.addEventListener('scrollend', () => {
            isScrollingToTarget = false;
            updateActiveCard();
        });

        // Configuración de clics en las tarjetas con cálculo de posición relativo en pantalla
        const setupCardClicks = () => {
            const allCards = track.querySelectorAll('.card');
            allCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (wasDragged) {
                        e.preventDefault();
                        return;
                    }

                    // Permitir el clic en el botón "Ver detalle"
                    if (e.target.classList.contains('btn-project') || e.target.closest('.btn-project')) {
                        return;
                    }

                    // Si la pantalla es grande y caben todas, desactivamos el comportamiento de centrado por clic
                    if (window.innerWidth >= 1160) {
                        return; 
                    }

                    e.preventDefault();

                    // Cálculo relativo del centro en pantalla
                    const trackRect = track.getBoundingClientRect();
                    const trackCenter = trackRect.left + trackRect.width / 2;
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    
                    const distanceToScroll = cardCenter - trackCenter;

                    // Aplicamos inmediatamente las clases para una respuesta visual instantánea al clic
                    allCards.forEach(c => c.classList.remove('active-card', 'prev-card', 'next-card'));
                    card.classList.add('active-card');
                    
                    const prev = card.previousElementSibling;
                    if (prev) prev.classList.add('prev-card');
                    
                    const next = card.nextElementSibling;
                    if (next) next.classList.add('next-card');

                    if (Math.abs(distanceToScroll) < 3) {
                        isScrollingToTarget = false;
                        return;
                    }

                    const targetLeft = track.scrollLeft + distanceToScroll;

                    isScrollingToTarget = true;
                    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
                });
            });
        };

        setupCardClicks();

        // Arrastre manual fluido con el ratón
        track.addEventListener('mousedown', (e) => {
            if (window.innerWidth >= 1160) return; // Desactivar arrastre si ya caben en pantalla
            isDown = true;
            isScrollingToTarget = false;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeftVal = track.scrollLeft;
            wasDragged = false;
            track.style.scrollBehavior = 'auto'; 
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                track.style.cursor = 'grab';
                track.style.scrollBehavior = 'smooth';
                setTimeout(() => {
                    wasDragged = false;
                }, 50);
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            if (Math.abs(walk) > 5) {
                wasDragged = true;
            }
            track.scrollLeft = scrollLeftVal - walk;
        });

        // Eventos táctiles
        track.addEventListener('touchstart', () => {
            isScrollingToTarget = false;
            track.style.scrollBehavior = 'auto';
        }, { passive: true });

        track.addEventListener('touchend', () => {
            track.style.scrollBehavior = 'smooth';
        });

        // Escuchar cambios de resolución para resetear estados
        window.addEventListener('resize', () => {
            updateActiveCard();
        });
    }

    // 7. INICIALIZACIÓN DE ESCENA 3D (Carga de tank.glb con arrastre de objeto)
    init3D();
});

function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Variables de control para arrastrar el modelo con ratón o táctil
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // 1. Escena, Cámara Estática y Renderizador
    const scene = new THREE.Scene();
    
    // Cámara fija centrada para que el fondo de partículas sea estable
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;
    
    container.appendChild(renderer.domElement);

    // 2. Iluminación Premium
    const hemiLight = new THREE.HemisphereLight(0x312e81, 0x0c0a0f, 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    // Luces orbitales de destello continuo en el metal
    const movingLightViolet = new THREE.DirectionalLight(0x6366f1, 4.0);
    movingLightViolet.position.set(-6, 3, -4);
    scene.add(movingLightViolet);

    const movingLightCyan = new THREE.DirectionalLight(0x38bdf8, 2.5);
    movingLightCyan.position.set(-5, 2, 5);
    scene.add(movingLightCyan);

    // 3. Sistema de Partículas Ambientales 360 (Fondo Estable)
    const particleCount = 500; 
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorViolet = new THREE.Color(0x6366f1);
    const colorCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 24;     
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * 16; 

        const mixedColor = colorViolet.clone().lerp(colorCyan, Math.random());
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending 
    });

    const particleSystem = new THREE.Points(particleGeo, pMaterial);
    scene.add(particleSystem);

    // 4. Cargador del Modelo GLB
    const loader = new THREE.GLTFLoader();
    let model;
    let modelGroup; // Grupo contenedor principal

    loader.load('models/tank.glb', (gltf) => {
        model = gltf.scene;

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = false;
                
                if (node.material) {
                    node.material.roughness = 0.12; 
                    node.material.metalness = 1.0;  
                }
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Centrar localmente el tanque respecto a su grupo virtual
        model.position.sub(center);

        modelGroup = new THREE.Group();
        modelGroup.add(model);
        
        // Escala refinada para encajar estéticamente
        const scale = 2.25 / maxDim; 
        modelGroup.scale.set(scale, scale, scale);
        
        // Ángulo de inclinación 3D inicial para una perspectiva atractiva de tres cuartos
        modelGroup.rotation.y = 0.6; 
        modelGroup.rotation.x = 0.15;

        scene.add(modelGroup);

        // Ubicar dinámicamente según resolución
        adjustLayout();
    }, 
    undefined, 
    (error) => {
        console.error('Error al cargar el tanque:', error);
    });

    // Función responsiva de posición física del grupo
    function adjustLayout() {
        if (!modelGroup) return;
        const isMobile = window.innerWidth <= 768;
        
        // El tanque se coloca al extremo derecho (X = 1.9)
        const modelX = isMobile ? 0 : 1.5; 
        const modelY = isMobile ? -0.85 : -0.15;

        modelGroup.position.set(modelX, modelY, 0);
    }

    // 5. Ajuste responsivo automático
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        adjustLayout();
    });

    // ==========================================
    // SISTEMA INTERACTIVO DE ARRASTRE DIRECTO
    // ==========================================

    // Soporte para Mouse
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging || !modelGroup) return;

        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        // Modificamos directamente la rotación del grupo del tanque en lugar de la cámara
        modelGroup.rotation.y += deltaMove.x * 0.007; // Rotación en el eje Y
        modelGroup.rotation.x += deltaMove.y * 0.007; // Rotación en el eje X

        // Restricción vertical para evitar que el tanque se voltee completamente de cabeza
        modelGroup.rotation.x = Math.max(-0.4, Math.min(0.4, modelGroup.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Soporte para pantallas Táctiles (Móvil)
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !modelGroup) return;

        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };

        modelGroup.rotation.y += deltaMove.x * 0.007;
        modelGroup.rotation.x = Math.max(-0.4, Math.min(0.4, modelGroup.rotation.x + deltaMove.y * 0.007));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // 6. Ciclo de Animación Dinámica
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Autogiro lento únicamente cuando el usuario no lo esté arrastrando
        if (modelGroup && !isDragging) {
            modelGroup.rotation.y += 0.003; 
        }

        // Órbita de las luces laterales para destellos dinámicos continuos
        movingLightViolet.position.x = Math.sin(elapsedTime * 0.35) * 6;
        movingLightViolet.position.z = Math.cos(elapsedTime * 0.35) * 6;

        movingLightCyan.position.x = -Math.sin(elapsedTime * 0.45) * 5;
        movingLightCyan.position.z = -Math.cos(elapsedTime * 0.45) * 5;

        // Rotación continua de la galaxia de partículas de fondo (estable e independiente)
        if (particleSystem) {
            particleSystem.rotation.y = elapsedTime * 0.015;
            particleSystem.rotation.x = elapsedTime * 0.008;
            particleSystem.rotation.z = elapsedTime * 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();
}