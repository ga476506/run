function verificarConductor() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
        alert('Debes iniciar sesión para publicar un viaje.');
        window.location.href = '/log';
        return;
    }

    fetch(`/verificar-conductor?id_usuario=${usuario.id_usuario}`)
        .then(res => res.json())
        .then(data => {
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