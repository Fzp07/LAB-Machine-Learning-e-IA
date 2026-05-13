// Neural background
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
function initCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
window.addEventListener('resize', () => { initCanvas(); initParticles(); });
class Particle {
    constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; this.radius = Math.random() * 2 + 1; }
    update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 240, 255, 0.5)'; ctx.fill(); }
}
function initParticles() { particles = []; const particleCount = Math.floor((width * height) / 15000); for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); } }
function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y; const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(112, 0, 255, ${1 - distance / 150})`; ctx.lineWidth = 1; ctx.stroke(); }
        }
    }
    requestAnimationFrame(animate);
}
initCanvas(); initParticles(); animate();

// Registro handling
const form = document.getElementById('registro-app-form');
const btn = document.getElementById('registro-btn');
const formMsg = document.getElementById('form-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('nuevo-usuario').value;
    const password = document.getElementById('nueva-password').value;

    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'none', 100);

    btn.disabled = true;
    btn.innerHTML = 'Creando...';
    formMsg.innerHTML = '';
    
    try {
        const response = await fetch('http://localhost:8000/crear_usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            btn.innerHTML = '¡Cuenta Creada!';
            btn.style.background = 'rgba(0, 240, 255, 0.2)';
            formMsg.style.color = 'var(--primary-glow)';
            formMsg.innerHTML = "Redirigiendo al Login...";
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            btn.disabled = false;
            btn.innerHTML = 'Registrarse';
            formMsg.style.color = '#ff3366';
            formMsg.innerHTML = data.mensaje;
        }
    } catch (error) {
        btn.disabled = false;
        btn.innerHTML = 'Registrarse';
        formMsg.style.color = '#ff3366';
        formMsg.innerHTML = "Error de conexión con el servidor.";
    }
});
