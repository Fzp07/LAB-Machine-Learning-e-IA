import json
import os
import smtplib
from email.message import EmailMessage
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
FILE_NAME = 'estudiantes.json'
USERS_FILE = 'usuarios.json'

# ==========================================
# CREDENCIALES PARA ENVIAR CORREO REAL
# ==========================================
# IMPORTANTE: PASSWORD_ADMIN debe ser una "Contraseña de Aplicación" de Google
# (NO es tu contraseña normal de Gmail)
# Cómo obtenerla:
#   1. Ve a myaccount.google.com → Seguridad → Verificación en 2 pasos (actívala)
#   2. Ve a myaccount.google.com/apppasswords
#   3. Selecciona "Correo" y "Windows", haz clic en "Generar"
#   4. Copia los 16 caracteres (sin espacios) y pégalos abajo
CORREO_ADMIN = "systemenginneer77@gmail.com"
PASSWORD_ADMIN = "czjhcmlshlzcfjth"
# ==========================================

PORT = 8000
FILE_NAME = 'estudiantes.json'
USERS_FILE = 'usuarios.json'

class JSONRequestHandler(SimpleHTTPRequestHandler):
    # Habilitar CORS para que el HTML pueda comunicarse con este servidor
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_GET(self):
        if self.path == '/estudiantes':
            # Devolver la lista de estudiantes
            if os.path.exists(FILE_NAME):
                with open(FILE_NAME, 'r', encoding='utf-8') as f:
                    try:
                        estudiantes = json.load(f)
                    except json.JSONDecodeError:
                        estudiantes = []
            else:
                estudiantes = []
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(estudiantes).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            if self.path == '/crear_usuario':
                # Guardar nuevo usuario
                if os.path.exists(USERS_FILE):
                    with open(USERS_FILE, 'r', encoding='utf-8') as f:
                        try:
                            usuarios = json.load(f)
                        except json.JSONDecodeError:
                            usuarios = []
                else:
                    usuarios = []
                    
                # Verificar si ya existe
                existe = False
                for u in usuarios:
                    if u['usuario'] == data.get('usuario'):
                        existe = True
                        break
                        
                if existe:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "El usuario ya existe"}).encode('utf-8'))
                else:
                    usuarios.append({"usuario": data.get('usuario'), "password": data.get('password'), "rol": "user"})
                    with open(USERS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(usuarios, f, indent=4)
                        
                    self.send_response(201)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "Usuario creado"}).encode('utf-8'))
            
            elif self.path == '/login':
                usuario = data.get('usuario')
                password = data.get('password')
                
                rol_encontrado = None
                
                # Administrador quemado siempre disponible
                if usuario == 'admin' and password == 'admin123':
                    rol_encontrado = 'admin'
                else:
                    # Buscar en archivo
                    if os.path.exists(USERS_FILE):
                        with open(USERS_FILE, 'r', encoding='utf-8') as f:
                            try:
                                usuarios = json.load(f)
                                for u in usuarios:
                                    if u['usuario'] == usuario and u['password'] == password:
                                        rol_encontrado = u.get('rol', 'user')
                                        break
                            except:
                                pass
                                
                if rol_encontrado:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "Éxito", "rol": rol_encontrado}).encode('utf-8'))
                else:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "Usuario o contraseña incorrectos"}).encode('utf-8'))
                    
            elif self.path == '/guardar':
                if os.path.exists(FILE_NAME):
                    with open(FILE_NAME, 'r', encoding='utf-8') as f:
                        try:
                            estudiantes = json.load(f)
                        except json.JSONDecodeError:
                            estudiantes = []
                else:
                    estudiantes = []
                
                # Por defecto el estado es Pendiente
                data['estado'] = 'Pendiente'
                estudiantes.append(data)
                
                with open(FILE_NAME, 'w', encoding='utf-8') as f:
                    json.dump(estudiantes, f, indent=4, ensure_ascii=False)
                
                self.send_response(201)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"mensaje": "¡Inscripción guardada en estudiantes.json con éxito!"}).encode('utf-8'))
                
            elif self.path == '/aceptar':
                correo = data.get('correo')
                if os.path.exists(FILE_NAME):
                    with open(FILE_NAME, 'r', encoding='utf-8') as f:
                        try:
                            estudiantes = json.load(f)
                        except:
                            estudiantes = []
                    
                    encontrado = False
                    for est in estudiantes:
                        if est.get('correo') == correo:
                            est['estado'] = 'Aceptado'
                            encontrado = True
                            break
                            
                    if encontrado:
                        with open(FILE_NAME, 'w', encoding='utf-8') as f:
                            json.dump(estudiantes, f, indent=4, ensure_ascii=False)
                        
                        # ENVÍO DE CORREO REAL
                        try:
                            msg = EmailMessage()
                            msg['Subject'] = '¡Aceptado en el Curso de Inteligencia Artificial!'
                            msg['From'] = CORREO_ADMIN
                            msg['To'] = correo
                            msg.set_content(
                                f"Hola,\n\n"
                                f"¡Felicidades! Nos complace informarte que has sido aceptado oficialmente "
                                f"en el Curso de Inteligencia Artificial.\n\n"
                                f"Prepárate para aprender y construir el futuro.\n\n"
                                f"Saludos,\nEl Administrador"
                            )

                            print(f"\n📧 Intentando enviar correo a: {correo}")
                            print(f"   Desde: {CORREO_ADMIN}")
                            server_smtp = smtplib.SMTP('smtp.gmail.com', 587)
                            server_smtp.set_debuglevel(0)  # Cambia a 1 para ver detalles SMTP
                            server_smtp.ehlo()
                            server_smtp.starttls()
                            server_smtp.ehlo()
                            server_smtp.login(CORREO_ADMIN, PASSWORD_ADMIN)
                            server_smtp.send_message(msg)
                            server_smtp.quit()
                            
                            print(f"✅ CORREO ENVIADO EXITOSAMENTE a {correo}\n")
                        except smtplib.SMTPAuthenticationError as e:
                            print(f"\n❌ ERROR DE AUTENTICACIÓN: Gmail rechazó las credenciales.")
                            print(f"   → Asegúrate de usar una 'Contraseña de Aplicación' (no tu contraseña normal).")
                            print(f"   → Genera una en: myaccount.google.com/apppasswords")
                            print(f"   Detalle del error: {e}\n")
                        except smtplib.SMTPException as e:
                            print(f"\n❌ ERROR SMTP al enviar a {correo}: {e}\n")
                        except Exception as e:
                            print(f"\n❌ ERROR INESPERADO al enviar correo a {correo}: {type(e).__name__}: {e}\n")
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({"mensaje": "Aceptado y correo enviado"}).encode('utf-8'))
                    else:
                        self.send_response(404)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({"mensaje": "Estudiante no encontrado"}).encode('utf-8'))
                        
            elif self.path == '/eliminar':
                correo = data.get('correo')
                if os.path.exists(FILE_NAME):
                    with open(FILE_NAME, 'r', encoding='utf-8') as f:
                        try:
                            estudiantes = json.load(f)
                        except:
                            estudiantes = []
                    
                    nuevos_estudiantes = [est for est in estudiantes if est.get('correo') != correo]
                    
                    with open(FILE_NAME, 'w', encoding='utf-8') as f:
                        json.dump(nuevos_estudiantes, f, indent=4, ensure_ascii=False)
                        
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "Eliminado correctamente"}).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"mensaje": "Archivo no encontrado"}).encode('utf-8'))
            else:
                self.send_error(404, "Ruta no encontrada")
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"mensaje": f"Error del servidor: {str(e)}"}).encode('utf-8'))

if __name__ == '__main__':
    print("="*50)
    print("Iniciando servidor backend en Python...")
    print(f"URL del servidor: http://localhost:{PORT}/login.html")
    print("Todos los registros se guardarán en 'estudiantes.json'")
    print("Presiona Ctrl+C para detener el servidor")
    print("="*50)
    
    server = HTTPServer(('localhost', PORT), JSONRequestHandler)
    server.serve_forever()
