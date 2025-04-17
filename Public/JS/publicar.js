// Función para mostrar el formulario de conductor
document.getElementById('formConductor').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Inicia sesión primero');
        window.location.href = '/log';
        return;
    }

    const formData = new FormData(this);
    formData.append('id_usuario', usuario.id_usuario);

    fetch('/registrar-conductor', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('¡Registro exitoso!');
                window.location.href = '/publicarViaje';
            } else {
                alert('Error al registrar: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error de servidor');
        });
});
