const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    initCanvas();
    initParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.floor((width * height) / 15000);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(112, 0, 255, ${1 - distance / 150})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

initCanvas();
initParticles();
animate();
// Form interaction
const form = document.getElementById('registro-form');
const subtitle = document.querySelector('.subtitle');
const cursor = document.querySelector('.cursor');
const btn = document.getElementById('submit-btn');
const formMsg = document.getElementById('form-msg');

const messages = [
    "Validando credenciales...",
    "Procesando inscripción cuántica...",
    "Conectando a la base de datos Estudiantes_inscritos...",
    "¡Registro completado, bienvenido al futuro!"
];

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos que se recargue la página

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;

    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'none', 100);

    // Glitch effect on click
    document.querySelector('h1').classList.remove('glitch');
    void document.querySelector('h1').offsetWidth; // Trigger reflow
    document.querySelector('h1').classList.add('glitch');

    // Deshabilitar el botón y formulario temporalmente
    btn.disabled = true;
    btn.innerHTML = 'Procesando...';
    form.style.opacity = '0.7';

    // Animación de la barra de estado
    const statusFill = document.querySelector('.status-fill');
    statusFill.style.animation = 'none';
    void statusFill.offsetWidth;
    statusFill.style.animation = 'load 3s ease-out forwards';

    // Simular el inicio del proceso visual
    let msgIndex = 0;
    
    function typeWriter(text, callback) {
        subtitle.innerHTML = '';
        let charIndex = 0;
        function type() {
            if (charIndex < text.length) {
                subtitle.innerHTML += text.charAt(charIndex);
                charIndex++;
                setTimeout(type, 30);
            } else {
                subtitle.appendChild(cursor);
                if(callback) setTimeout(callback, 500);
            }
        }
        type();
    }

    typeWriter(messages[0], async () => {
        typeWriter(messages[1], async () => {
            try {
                // Enviar los datos al backend (guardar.php)
                const response = await fetch('http://localhost:8000/guardar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, correo, telefono })
                });

                const data = await response.json();

                if (response.ok) {
                    // Éxito
                    typeWriter(data.mensaje || messages[3]);
                    btn.innerHTML = '¡Inscrito!';
                    btn.style.background = 'rgba(0, 240, 255, 0.2)';
                    btn.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)';
                    formMsg.style.color = 'var(--primary-glow)';
                    formMsg.innerHTML = data.mensaje;
                    
                    setTimeout(() => {
                        form.reset();
                        resetFormUI();
                    }, 4000);
                } else {
                    // Error de validación o base de datos
                    typeWriter("Error en la transmisión de datos.");
                    btn.innerHTML = 'Reintentar';
                    formMsg.style.color = '#ff3366'; // Rojo de error
                    formMsg.innerHTML = data.mensaje || "Ocurrió un error al guardar los datos.";
                    resetFormUI(false);
                }
            } catch (error) {
                // Error de red (el servidor PHP no está corriendo, etc.)
                console.error('Error:', error);
                typeWriter("Error de conexión con el servidor backend.");
                btn.innerHTML = 'Reintentar';
                formMsg.style.color = '#ff3366'; // Rojo de error
                formMsg.innerHTML = "No se pudo conectar al servidor PHP. ¿Está iniciado Apache/XAMPP?";
                resetFormUI(false);
            }
        });
    });

    function resetFormUI(fullReset = true) {
        form.style.opacity = '1';
        btn.disabled = false;
        if(fullReset) {
            btn.innerHTML = 'Inscribirse';
            btn.style.background = 'transparent';
            btn.style.boxShadow = 'none';
            formMsg.innerHTML = "";
            subtitle.innerHTML = 'Formulario de Inscripción <span class="cursor">_</span>';
        }
    }
});
