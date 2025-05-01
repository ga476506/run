let todosLosViajes = [];

async function cargarViajes() {
    const res = await fetch('/viajes');
    todosLosViajes = await res.json();
    mostrarViajes(todosLosViajes);
}

function mostrarViajes(viajes) {
    const contenedor = document.getElementById('viajesContainer');
    contenedor.innerHTML = '';
    viajes.forEach(v => {
        // ① Partimos la cadena y nos quedamos con la fecha pura
        const soloFecha = v.fecha.split('T')[0];

        const div = document.createElement('div');
        div.className = 'viaje border border-gray-300 rounded p-4 m-2 shadow';
        div.innerHTML = `
            <h3 class="text-lg font-bold">${v.origen} ➡️ ${v.destino}</h3>
            <p><strong>Conductor:</strong> ${v.nombre_usuario}</p>
            <p><strong>Auto:</strong> ${v.modelo_auto} (${v.color_auto})</p>
            <p><strong>Fecha:</strong> ${soloFecha} | <strong>Hora:</strong> ${v.hora}</p>
            <p><strong>Asientos disponibles:</strong> ${v.numero_asientos}</p>
            <p><strong>Costo por asiento:</strong> $${v.costo_asiento}</p>
            <p><strong>Ruta:</strong> ${v.ruta || 'No especificada'}</p>
            <button class="btn-solicitar bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    data-viaje-id="${v.id_viaje_publicado}">
              Solicitar viaje
            </button>
        `;
        contenedor.appendChild(div);
    });

    agregarEventosSolicitar();
}


function agregarEventosSolicitar() {
    const botonesSolicitar = document.querySelectorAll('.btn-solicitar');

    botonesSolicitar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const viajeId = parseInt(btn.getAttribute('data-viaje-id'));
            console.log('Solicitando viaje con ID:', viajeId);

            if (isNaN(viajeId)) {
                alert('Error: ID del viaje no válido.');
                return;
            }

            try {
                const response = await fetch('/solicitar-viaje', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_viaje: viajeId })
                });

                const data = await response.json();
                if (response.ok) {
                    btn.textContent = 'Solicitud enviada ✅';
                    btn.disabled = true;
                    btn.classList.remove('bg-blue-500');
                    btn.classList.add('bg-green-500');
                } else {
                    alert(data.mensaje || 'Hubo un problema al solicitar el viaje');
                }
            } catch (error) {
                console.error(error);
                alert('Error en la solicitud');
            }
        });
    });
}


function filtrarViajes() {
    const origen = document.getElementById('busquedaOrigen').value.toLowerCase();
    const destino = document.getElementById('busquedaDestino').value.toLowerCase();

    const filtrados = todosLosViajes.filter(v =>
        v.origen.toLowerCase().includes(origen) &&
        v.destino.toLowerCase().includes(destino)
    );

    mostrarViajes(filtrados);
}

document.getElementById('busquedaOrigen').addEventListener('input', filtrarViajes);
document.getElementById('busquedaDestino').addEventListener('input', filtrarViajes);

cargarViajes();