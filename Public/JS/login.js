function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function redirigirPerfil() {
    const nombreUsuario = document.getElementById('nombre-usuario').textContent;
    window.location.href = `/perfils?usuario=${encodeURIComponent(nombreUsuario)}`;
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '/'; 
}

document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario) {
        console.log('Usuario cargado:', usuario); // Depuración
        const rutaImagen = `/Images/avatares/${usuario.foto_perfil}`;
        const usuarioInfo = document.getElementById('usuario-info');
        const userMenu = document.getElementById('user-menu');

        usuarioInfo.style.display = 'flex';
        document.getElementById('foto-usuario').src = rutaImagen;
        document.getElementById('foto-usuario-menu').src = rutaImagen;
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        document.getElementById('nombre-usuario-menu').textContent = usuario.nombre;

        // Ocultar botón de login
        const loginLink = document.querySelector('a[href="/log"]');
        if (loginLink) loginLink.style.display = 'none';

        console.log('Elementos mostrados correctamente');
    } else {
        console.log('No hay usuario en localStorage'); // Depuración
    }

    // Lógica para login (solo si existe formulario en la página actual)
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

                const data = await resp.json();
                if (resp.ok && data.success) {
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    window.location.href = '/ingresar';
                } else {
                    alert(data.message || 'Credenciales inválidas');
                }
            } catch (err) {
                console.error('Error en login:', err);
                alert('No se pudo conectar con el servidor');
            }
        });
    }
});