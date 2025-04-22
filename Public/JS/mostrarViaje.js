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
cargarViajes();