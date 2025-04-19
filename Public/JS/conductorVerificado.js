function verificarConductor(event) {
    event.preventDefault();

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
        alert('Debes iniciar sesión para publicar un viaje.');
        window.location.href = '/log';
        return;
    }

    const idUsuario = parseInt(usuario.id_usuario, 10);
    console.log('ID de usuario:', idUsuario);

    fetch(`/verificar-conductor?id_usuario=${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            console.log('Respuesta del backend:', data);
            if (data.esConductor) {
                window.location.href = '/publicarViaje';
            } else {
                window.location.href = '/registro-conductor';
            }
        })
        .catch(err => {
            console.error('Error al verificar conductor:', err);
            alert('Ocurrió un error. Intenta de nuevo.');
        });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btnPublicarViaje').addEventListener('click', verificarConductor);
});