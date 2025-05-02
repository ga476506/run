async function cargarSolicitudes() {
  const res = await fetch('/solicitudes-conductor');
  const solicitudes = await res.json();
  mostrarSolicitudes(solicitudes);
}

function mostrarSolicitudes(solicitudes) {
  const container = document.getElementById('solicitudesContainer');
  container.innerHTML = '';

  solicitudes.forEach(s => {
      const fechaLimpia = s.fecha.split('T')[0];

      const div = document.createElement('div');
      div.className = 'solicitud';
      div.innerHTML = `
          <p>
            <strong>${s.nombre_solicitante}</strong> solicitó un viaje de
            <strong>${s.origen}</strong> a <strong>${s.destino}</strong>
            (${fechaLimpia} ${s.hora})
          </p>
          <p class="estado">Estado: 
            <span class="${s.estado}">${s.estado}</span>
          </p>
          ${s.estado === 'pendiente' ? `
            <div class="botones">
              <button class="boton-accion boton-aceptar"
                      onclick="responderSolicitud(${s.id_solicitud}, 'aceptado')">
                Aceptar
              </button>
              <button class="boton-accion boton-rechazar"
                      onclick="responderSolicitud(${s.id_solicitud}, 'rechazado')">
                Rechazar
              </button>
            </div>
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
      const asientoSpans = document.querySelectorAll(`[data-viaje-id="${data.id_viaje_publicado}"] .asientos-restantes`);
      asientoSpans.forEach(span => {
          span.textContent = data.nuevosAsientos;
      });
  }

  cargarSolicitudes(); // recarga la lista actualizada
}

// Carga inicial
cargarSolicitudes();
