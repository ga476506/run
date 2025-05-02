async function cargarSolicitudes() {
    const res = await fetch('/solicitudes-conductor');
    const solicitudes = await res.json();
    mostrarSolicitudes(solicitudes);
}

function mostrarSolicitudes(solicitudes) {
    const container = document.getElementById('solicitudesContainer');
    container.innerHTML = '';

    solicitudes.forEach(s => {
        // Extraemos sólo la fecha 'YYYY-MM-DD'
        const fechaLimpia = s.fecha.split('T')[0];

        const div = document.createElement('div');
        div.className = 'border p-4 m-2 shadow';
        div.innerHTML = `
            <p>
              <strong>${s.nombre_solicitante}</strong> solicitó un viaje de
              <strong>${s.origen}</strong> a <strong>${s.destino}</strong>
              (${fechaLimpia} ${s.hora})
            </p>
            <p>Estado: <span class="font-bold">${s.estado}</span></p>
            ${s.estado === 'pendiente' ? `
              <button class="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      onclick="responderSolicitud(${s.id_solicitud}, 'aceptado')">
                Aceptar
              </button>
              <button class="bg-red-500 text-white px-3 py-1 rounded"
                      onclick="responderSolicitud(${s.id_solicitud}, 'rechazado')">
                Rechazar
              </button>
            ` : ''}
        `;
        container.appendChild(div);
    });
}


async function responderSolicitud(id_solicitud, estado) {
  const res = await fetch('/respuesta-solicitud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_solicitud, estado })
  });
  const data = await res.json();
  alert(data.mensaje);

  if (data.nuevosAsientos !== null) {
    // Actualiza en pantalla el contador de asientos del viaje correspondiente
    const asientoSpans = document.querySelectorAll(`[data-viaje-id="${data.id_viaje_publicado}"] .asientos-restantes`);
    asientoSpans.forEach(span => { span.textContent = data.nuevosAsientos; });
  }
  cargarSolicitudes();
}


cargarSolicitudes();