document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMACIÓN DE ENTRADA CON INTERSECTION OBSERVER (UNIFICADO)
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('section, .card, .skill-item').forEach(el => {
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
    }, { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" });

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

    // 4. SCROLL EVENTS REGLADOS POR REQUESTANIMATIONFRAME (Optimización de FPS)
    const header = document.querySelector('.navbar');
    const heroText = document.querySelector('.hero-text'); 
    let scrollTicking = false;

    window.addEventListener('scroll', () => { 
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;

                // Navbar class change
                if (scrolled > 50) { 
                    header.classList.add('scrolled');
                } else { 
                    header.classList.remove('scrolled'); 
                } 

                // Parallax control
                if (heroText && scrolled < 800) {
                    heroText.style.transform = `translateY(${scrolled * 0.15}px)`;
                    heroText.style.opacity = Math.max(0, 1 - (scrolled / 600)); 
                }

                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // 5. LÓGICA DE CARRUSEL CON RENDIMIENTO ASÍNCRONO
    const track = document.querySelector('.carousel-track');
    if (track) {
        let isDown = false;
        let startX;
        let scrollLeftVal;
        let wasDragged = false;
        let isScrollingToTarget = false;
        let carouselTicking = false;

        // Limita cálculos costosos de layout con requestAnimationFrame
        function requestActiveCardUpdate() {
            if (!carouselTicking) {
                window.requestAnimationFrame(() => {
                    updateActiveCard();
                    carouselTicking = false;
                });
                carouselTicking = true;
            }
        }

        function updateActiveCard() {
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

            allCards.forEach(card => card.classList.remove('active-card', 'prev-card', 'next-card'));
            
            if (closestCard) {
                closestCard.classList.add('active-card');
                const prev = closestCard.previousElementSibling;
                if (prev) prev.classList.add('prev-card');
                
                const next = closestCard.nextElementSibling;
                if (next) next.classList.add('next-card');
            }
        }

        // Eventos controlados sin sobrecargar la CPU
        track.addEventListener('scroll', requestActiveCardUpdate, { passive: true });

        track.addEventListener('scrollend', () => {
            isScrollingToTarget = false;
            requestActiveCardUpdate();
        });

        // Eventos táctiles y de ratón optimizados
        const setupCardClicks = () => {
            const allCards = track.querySelectorAll('.card');
            allCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (wasDragged) {
                        e.preventDefault();
                        return;
                    }
                    if (e.target.classList.contains('btn-project') || e.target.closest('.btn-project') || window.innerWidth >= 1160) {
                        return;
                    }
                    e.preventDefault();

                    const trackRect = track.getBoundingClientRect();
                    const trackCenter = trackRect.left + trackRect.width / 2;
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    
                    const distanceToScroll = cardCenter - trackCenter;

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

                    isScrollingToTarget = true;
                    track.scrollTo({ left: track.scrollLeft + distanceToScroll, behavior: 'smooth' });
                });
            });
        };

        setupCardClicks();

        track.addEventListener('mousedown', (e) => {
            if (window.innerWidth >= 1160) return;
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
                setTimeout(() => { wasDragged = false; }, 50);
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

        track.addEventListener('touchstart', () => {
            isScrollingToTarget = false;
            track.style.scrollBehavior = 'auto';
        }, { passive: true });

        track.addEventListener('touchend', () => {
            track.style.scrollBehavior = 'smooth';
        });

        window.addEventListener('resize', requestActiveCardUpdate, { passive: true });
        setTimeout(requestActiveCardUpdate, 150);
    }

    // Funciones adicionales de utilidad
    const emailBtn = document.getElementById('btn-copy-email');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('santiago.castillo.parra@gmail.com');
            alert('¡Correo copiado al portapapeles!');
        });
    }

    // Inicializar escena 3D
    init3D();
});

// 6. INICIALIZACIÓN DE ESCENA 3D (OPTIMIZADA)
function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    let is3DVisible = true; // Control de renderizado inteligente

    // Observador para detener el renderizado si la sección no es visible
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            is3DVisible = entry.isIntersecting;
        });
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0, 5.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Optimizamos el pixelRatio máximo a 1.5 en lugar de 2.0 para conservar recursos de GPU
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0x312e81, 0x0c0a0f, 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    const movingLightViolet = new THREE.DirectionalLight(0x6366f1, 4.0);
    movingLightViolet.position.set(-6, 3, -4);
    scene.add(movingLightViolet);

    const movingLightCyan = new THREE.DirectionalLight(0x38bdf8, 2.5);
    movingLightCyan.position.set(-5, 2, 5);
    scene.add(movingLightCyan);

    // Sistema de Partículas Ambientales de Alto Rendimiento (Instanciadas)
    const particleCount = 250; // Reducido para optimizar memoria sin perder la atmósfera estética
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorViolet = new THREE.Color(0x6366f1);
    const colorCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;     
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * 12; 

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
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending 
    });

    const particleSystem = new THREE.Points(particleGeo, pMaterial);
    scene.add(particleSystem);

    const loader = new THREE.GLTFLoader();
    let model;
    let modelGroup;

    loader.load('models/tank.glb', (gltf) => {
        model = gltf.scene;

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = false;
                if (node.material) {
                    node.material.roughness = 0.15; 
                    node.material.metalness = 0.9;  
                }
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        model.position.sub(center);

        modelGroup = new THREE.Group();
        modelGroup.add(model);
        
        const scale = 2.25 / maxDim; 
        modelGroup.scale.set(scale, scale, scale);
        
        modelGroup.rotation.y = 0.6; 
        modelGroup.rotation.x = 0.15;

        scene.add(modelGroup);
        adjustLayout();
    }, undefined, (error) => {
        console.error('Error al cargar el tanque:', error);
    });

    function adjustLayout() {
        if (!modelGroup) return;
        const isMobile = window.innerWidth <= 1159;
        const modelX = isMobile ? 0 : 1.3; 
        const modelY = isMobile ? -0.5 : -0.15;
        modelGroup.position.set(modelX, modelY, 0);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            adjustLayout();
        }, 150);
    }, { passive: true });

    // INTERACCIONES TÁCTILES Y RATÓN
    const onStart = (clientX, clientY) => {
        isDragging = true;
        previousMousePosition = { x: clientX, y: clientY };
    };

    const onMove = (clientX, clientY) => {
        if (!isDragging || !modelGroup) return;

        const deltaMove = {
            x: clientX - previousMousePosition.x,
            y: clientY - previousMousePosition.y
        };

        modelGroup.rotation.y += deltaMove.x * 0.005;
        modelGroup.rotation.x = Math.max(-0.4, Math.min(0.4, modelGroup.rotation.x + deltaMove.y * 0.005));
        previousMousePosition = { x: clientX, y: clientY };
    };

    container.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    container.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    container.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });

    const clock = new THREE.Clock();

    // Loop de animación con control de visibilidad
    function animate() {
        requestAnimationFrame(animate);

        // Si la sección no es visible para el usuario, se omite el renderizado de Three.js
        if (!is3DVisible) return;

        const elapsedTime = clock.getElapsedTime();

        if (modelGroup && !isDragging) {
            modelGroup.rotation.y += 0.0025; 
        }

        movingLightViolet.position.x = Math.sin(elapsedTime * 0.3) * 6;
        movingLightViolet.position.z = Math.cos(elapsedTime * 0.3) * 6;

        movingLightCyan.position.x = -Math.sin(elapsedTime * 0.4) * 5;
        movingLightCyan.position.z = -Math.cos(elapsedTime * 0.4) * 5;

        if (particleSystem) {
            particleSystem.rotation.y = elapsedTime * 0.01;
            particleSystem.rotation.x = elapsedTime * 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();
}