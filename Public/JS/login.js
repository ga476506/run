document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay usuario en localStorage, mostramos el header
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        document.getElementById('usuario-info').style.display = 'flex';
        document.getElementById('user-menu').style.display = 'none';
        const rutaImagen = `/Images/avatares/${usuario.foto_perfil}`;
        document.getElementById('foto-usuario').src = rutaImagen;
        document.getElementById('foto-usuario-menu').src = rutaImagen;
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        document.getElementById('nombre-usuario-menu').textContent = usuario.nombre;
    }

    // Capturamos el submit del form si existe
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;

            try {
                const resp = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, contrasena })
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    console.error('Login falló:', text);
                    return alert('Error al iniciar sesión');
                }

                const data = await resp.json();
                if (data.success) {
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    window.location.href = '/ingresar'; // redirigir después del login
                } else {
                    alert(data.message || 'Credenciales inválidas');
                }
            } catch (err) {
                console.error('Error en el fetch:', err);
                alert('No se pudo conectar con el servidor');
            }
        });
    }
});