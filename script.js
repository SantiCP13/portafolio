/**
 * PORTAFOLIO MULTIMEDIA - SCRIPT AVANZADO
 * Funcionalidades: Scroll Reveal, Smooth Parallax, Nav Active State
 */

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
                // Removemos la clase activa de todos los links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Agregamos la clase activa al link que coincide con el ID de la sección
                const activeId = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.6 }); // Se activa cuando el 60% de la sección es visible

    sections.forEach(section => navObserver.observe(section));

    // 3. SMOOTH SCROLL
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });
// Efecto de Header compacto al hacer scroll
// Efecto de Header Dinámico (Transparente -> Glass)
const header = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    // Si el scroll es mayor a 50px, añade la clase 'scrolled'
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        // Si vuelve arriba, quita la clase y vuelve a ser transparente
        header.classList.remove('scrolled');
    }
});
    // 4. EFECTO PARALLAX LIGERO
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
            heroText.style.transform = `translateY(${scrolled * 0.2}px)`;
            heroText.style.opacity = 1 - (scrolled / 700);
        }
    });

// --- LOGICA CARRUSEL INFINITO + ZOOM ---
const track = document.querySelector('.carousel-track');


// 2. Auto-scroll más suave
let autoScroll = setInterval(() => {
    const cardWidth = 360; 
    
    // Si estamos cerca del final, volvemos al inicio (left: 0)
    // De lo contrario, avanzamos una tarjeta
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 50) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
}, 2000);

// 3. Zoom más amplio (IntersectionObserver)
const observerOptions = {
    root: track,
    rootMargin: '0px -30% 0px -30%', // Ajuste: zona de zoom más grande
    threshold: 0
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.carousel-track .card').forEach(c => c.classList.remove('active-card'));
            entry.target.classList.add('active-card');
        }
    });
}, observerOptions);

document.querySelectorAll('.carousel-track .card').forEach(card => cardObserver.observe(card));

// 4. Pausar y REINICIAR correctamente al arrastrar
track.addEventListener('mousedown', () => clearInterval(autoScroll));
track.addEventListener('mouseup', () => {
    clearInterval(autoScroll); // Limpiar antes de crear uno nuevo
    autoScroll = setInterval(() => {
        const cardWidth = 360;
        if (track.scrollLeft >= (track.scrollWidth / 3) * 2) {
            track.scrollTo({ left: 0, behavior: 'auto' });
        } else {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    }, 5000);
});
});