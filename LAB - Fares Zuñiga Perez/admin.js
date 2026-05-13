// Neural background (same as others)
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

// Load students
async function cargarEstudiantes() {
    const container = document.getElementById('table-container');

    try {
        const response = await fetch('http://localhost:8000/estudiantes');
        if (!response.ok) throw new Error("Error en servidor");

        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">No hay estudiantes registrados aún.</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((est, index) => {
            const estado = est.estado || 'Pendiente';
            const estadoColor = estado === 'Aceptado' ? 'var(--primary-glow)' : 'var(--text-muted)';

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${est.nombre || 'N/A'}</td>
                    <td>${est.correo || 'N/A'}</td>
                    <td>${est.telefono || 'N/A'}</td>
                    <td style="color: ${estadoColor}; font-weight: 500;">${estado}</td>
                    <td>
                        <button onclick="aceptarEstudiante('${est.correo}')" style="background:transparent; border:1px solid var(--primary-glow); color:var(--primary-glow); border-radius:5px; padding:5px 10px; cursor:pointer; margin-right:5px; font-family: inherit;">Aceptar</button>
                        <button onclick="eliminarEstudiante('${est.correo}')" style="background:transparent; border:1px solid #ff3366; color:#ff3366; border-radius:5px; padding:5px 10px; cursor:pointer; font-family: inherit;">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p style="color: #ff3366;">Error al cargar los registros.</p>';
    }
}

async function aceptarEstudiante(correo) {
    if (!confirm('¿Estás seguro de aceptar a este estudiante? Se enviará un correo.')) return;
    try {
        const response = await fetch('http://localhost:8000/aceptar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });
        if (response.ok) {
            alert('Estudiante aceptado. El correo de aceptación fue enviado.');
            cargarEstudiantes();
        } else {
            alert('Error al aceptar al estudiante.');
        }
    } catch (e) { console.error(e); alert('Error de conexión con el servidor.'); }
}

async function eliminarEstudiante(correo) {
    if (!confirm('¿Estás seguro de eliminar a este estudiante? Esta acción no se puede deshacer.')) return;
    try {
        const response = await fetch('http://localhost:8000/eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });
        if (response.ok) {
            alert('Estudiante eliminado correctamente.');
            cargarEstudiantes();
        } else {
            alert('Error al eliminar al estudiante.');
        }
    } catch (e) { console.error(e); alert('Error de conexión con el servidor.'); }
}

// Inicializar
cargarEstudiantes();
