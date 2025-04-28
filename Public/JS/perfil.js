async function cargarPerfil() {
    try {
        const res = await fetch('/api/perfil');

        if (res.status === 401) {
            alert('Debes iniciar sesión para ver tu perfil.');
            window.location.href = '/log'; // o la ruta correcta al login
            return;
        }

        const data = await res.json();

        document.getElementById('nombre').value = data.nombre;
        document.getElementById('apellido_paterno').value = data.apellido_paterno;
        document.getElementById('apellido_materno').value = data.apellido_materno;
        document.getElementById('fecha_nacimiento').value = data.fecha_nacimiento.split('T')[0];
        document.getElementById('programa_educativo').value = data.programa_educativo;
        document.getElementById('telefono').value = data.telefono;
        document.getElementById('correo').value = data.correo;
        document.getElementById('genero').value = data.genero;

        if (data.foto_perfil) {
            document.getElementById('previewPerfil').src = `/Images/avatares/${data.foto_perfil}`;
        } else {
            document.getElementById('previewPerfil').src = `/Images/avatares/default.webp`;
        }

        if (data.conductor && data.automovil) {
            document.getElementById('infoConductor').style.display = 'block';
            document.getElementById('modelo').value = data.automovil.modelo;
            document.getElementById('ano').value = data.automovil.ano;
            document.getElementById('color').value = data.automovil.color;
            document.getElementById('numeroz_serie').value = data.automovil.numeroz_serie;
            document.getElementById('placas').value = data.automovil.placas;
        }
    } catch (err) {
        console.error('Error al cargar el perfil:', err);
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfil);

document.getElementById('formPerfil').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this); // Recoge todos los campos del formulario

    try {
        const res = await fetch('/api/perfil', {
            method: 'POST',
            body: formData
        });

        const respuesta = await res.json();
        alert(respuesta.mensaje);
        if (respuesta.foto_perfil) {
            document.getElementById('previewPerfil').src = `/Images/avatares/${respuesta.foto_perfil}`;
        }
    } catch (err) {
        console.error('Error al guardar:', err);
        alert('Hubo un error al guardar los cambios');
    }
});

document.getElementById('foto_perfil').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewPerfil').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
