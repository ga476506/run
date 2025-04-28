async function cargarViajes() {
    const res = await fetch('/viajes');
    const viajes = await res.json();
    const contenedor = document.getElementById('viajesContainer');

    viajes.forEach(v => {
        const div = document.createElement('div');
        div.className = 'viaje';
        div.innerHTML = `
        <div class="p-4 border rounded shadow-md my-4 bg-white">
        <h3 class="text-xl font-bold">${v.origen} ➡️ ${v.destino}</h3>
        <p><strong>Conductor:</strong> ${v.nombre_usuario}</p>
        <p><strong>Auto:</strong> ${v.modelo_auto} (${v.color_auto})</p>
        <p><strong>Fecha:</strong> ${v.fecha} | <strong>Hora:</strong> ${v.hora}</p>
        <p><strong>Asientos disponibles:</strong> ${v.numero_asientos}</p>
        <p><strong>Costo por asiento:</strong> $${v.costo_asiento}</p>
        <p><strong>Ruta:</strong> ${v.ruta || 'No especificada'}</p>
        </div>
        `;
        contenedor.appendChild(div);
    });
}

let todosLosViajes = [];

async function cargarViajes() {
    const res = await fetch('/viajes');
    todosLosViajes = await res.json();
    mostrarViajes(todosLosViajes);
}

function mostrarViajes(viajes) {
    const contenedor = document.getElementById('viajesContainer');
    contenedor.innerHTML = ''; // Limpiar antes de volver a renderizar
    viajes.forEach(v => {
        const div = document.createElement('div');
        div.className = 'viaje border border-gray-300 rounded p-4 m-2 shadow';
        div.innerHTML = `
        <h3 class="text-lg font-bold">${v.origen} ➡️ ${v.destino}</h3>
        <p><strong>Conductor:</strong> ${v.nombre_usuario}</p>
        <p><strong>Auto:</strong> ${v.modelo_auto} (${v.color_auto})</p>
        <p><strong>Fecha:</strong> ${v.fecha} | <strong>Hora:</strong> ${v.hora}</p>
        <p><strong>Asientos disponibles:</strong> ${v.numero_asientos}</p>
        <p><strong>Costo por asiento:</strong> $${v.costo_asiento}</p>
        <p><strong>Ruta:</strong> ${v.ruta || 'No especificada'}</p>
      `;
        contenedor.appendChild(div);
    });
}

document.getElementById('busquedaOrigen').addEventListener('input', filtrarViajes);
document.getElementById('busquedaDestino').addEventListener('input', filtrarViajes);

function filtrarViajes() {
    const origen = document.getElementById('busquedaOrigen').value.toLowerCase();
    const destino = document.getElementById('busquedaDestino').value.toLowerCase();

    const filtrados = todosLosViajes.filter(v =>
        v.origen.toLowerCase().includes(origen) &&
        v.destino.toLowerCase().includes(destino)
    );

    mostrarViajes(filtrados);
}
cargarViajes();