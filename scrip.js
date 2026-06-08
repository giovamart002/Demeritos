// ============================================
// SISTEMA DE CONTROL DE DEMÉRITOS
// JavaScript Completo
// ============================================

// Datos en localStorage
const DB = {
    centros: 'demeritos_centros',
    estudiantes: 'demeritos_estudiantes',
    tarjetas: 'demeritos_tarjetas'
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initData();
    loadCentros();
    loadSelectCentros();
    loadEstudiantes();
    loadSelectEstudiantes();
    updateDashboard();
    setupEventListeners();
});

// Inicializar datos
function initData() {
    if (!localStorage.getItem(DB.centros)) {
        localStorage.setItem(DB.centros, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB.estudiantes)) {
        localStorage.setItem(DB.estudiantes, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB.tarjetas)) {
        localStorage.setItem(DB.tarjetas, JSON.stringify([]));
    }
}

// Obtener datos
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Guardar datos
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notif = document.getElementById('notificacion');
    notif.textContent = message;
    notif.className = `notificacion show ${type}`;
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}

// Setup de eventos
function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Formularios
    document.getElementById('formCentroEducativo').addEventListener('submit', handleSaveCentro);
    document.getElementById('formEstudiante').addEventListener('submit', handleSaveEstudiante);
    document.getElementById('formTarjeta').addEventListener('submit', handleSaveTarjeta);

    // Búsqueda
    document.getElementById('searchEstudiante').addEventListener('keyup', handleSearchEstudiante);

    // Filtros
    document.getElementById('btnLimpiarFiltros').addEventListener('click', handleLimpiarFiltros);

    // Reportes
    document.getElementById('btnReporteDemeritosAltos').addEventListener('click', generateReporteDemeritosAltos);
    document.getElementById('btnReporteHistorialCompleto').addEventListener('click', generateReporteHistorial);
    document.getElementById('btnReportePorCentro').addEventListener('click', generateReportePorCentro);
    document.getElementById('btnReportePorFecha').addEventListener('click', generateReportePorFecha);

    // Reset
    document.getElementById('btnReset').addEventListener('click', handleReset);

    // Modal
    document.getElementById('btnCancelar').addEventListener('click', closeModal);
}

// Manejo de navegación
function handleNavigation(e) {
    e.preventDefault();
    
    const module = this.dataset.module;
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    
    this.classList.add('active');
    document.getElementById(module).classList.add('active');
    
    const titles = {
        'dashboard': { title: '📊 Dashboard', subtitle: 'Estadísticas generales del sistema' },
        'centro-educativo': { title: '🏫 Centro Educativo', subtitle: 'Registra los datos del centro educativo' },
        'estudiantes': { title: '👥 Gestión de Estudiantes', subtitle: 'Administra el registro de estudiantes' },
        'registrar-tarjeta': { title: '📝 Registrar Tarjeta', subtitle: 'Completa los datos de la tarjeta del estudiante' },
        'historial': { title: '📜 Historial de Tarjetas', subtitle: 'Visualiza todos los registros de tarjetas' },
        'reportes': { title: '📈 Reportes', subtitle: 'Genera reportes del sistema' }
    };
    
    if (titles[module]) {
        document.getElementById('pageTitle').textContent = titles[module].title;
        document.getElementById('pageSubtitle').textContent = titles[module].subtitle;
    }
    
    if (module === 'dashboard') {
        updateDashboard();
    } else if (module === 'estudiantes') {
        loadEstudiantes();
    } else if (module === 'registrar-tarjeta') {
        loadSelectEstudiantes();
    } else if (module === 'historial') {
        loadHistorial();
    }
}

// ============================================
// CENTRO EDUCATIVO
// ============================================
function handleSaveCentro(e) {
    e.preventDefault();
    
    const centro = {
        id: Date.now(),
        nombre: document.getElementById('nombreCentro').value,
        codigo: document.getElementById('codigoCentro').value,
        departamento: document.getElementById('departamento').value,
        municipio: document.getElementById('municipio').value,
        distrito: document.getElementById('distrito').value
    };
    
    const centros = getData(DB.centros);
    
    if (centros.some(c => c.codigo === centro.codigo)) {
        showNotification('El código del centro ya existe', 'error');
        return;
    }
    
    centros.push(centro);
    saveData(DB.centros, centros);
    
    document.getElementById('formCentroEducativo').reset();
    loadCentros();
    loadSelectCentros();
    updateDashboard();
    
    showNotification('✅ Centro educativo guardado exitosamente', 'success');
}

function loadCentros() {
    const centros = getData(DB.centros);
    const tbody = document.getElementById('tableCentros');
    
    if (centros.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay centros educativos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = centros.map(centro => `
        <tr>
            <td><strong>${centro.nombre}</strong></td>
            <td>${centro.codigo}</td>
            <td>${centro.departamento}</td>
            <td>${centro.municipio}</td>
            <td>${centro.distrito}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-danger" onclick="deleteCentro(${centro.id})">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadSelectCentros() {
    const centros = getData(DB.centros);
    const select = document.getElementById('centroEstudiante');
    
    select.innerHTML = '<option value="">Seleccionar centro</option>' + 
        centros.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function deleteCentro(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este centro?')) {
        let centros = getData(DB.centros);
        centros = centros.filter(c => c.id !== id);
        saveData(DB.centros, centros);
        loadCentros();
        loadSelectCentros();
        updateDashboard();
        showNotification('✅ Centro eliminado exitosamente', 'success');
    }
}

// ============================================
// ESTUDIANTES
// ============================================
function handleSaveEstudiante(e) {
    e.preventDefault();
    
    const estudiante = {
        id: Date.now(),
        idCentro: document.getElementById('centroEstudiante').value,
        nie: document.getElementById('nie').value,
        nombre: document.getElementById('nombreEstudiante').value,
        sexo: document.getElementById('sexoEstudiante').value,
        grado: document.getElementById('gradoEstudiante').value,
        seccion: document.getElementById('seccionEstudiante').value,
        turno: document.getElementById('turnoEstudiante').value
    };
    
    const estudiantes = getData(DB.estudiantes);
    
    if (estudiantes.some(e => e.nie === estudiante.nie)) {
        showNotification('El NIE del estudiante ya existe', 'error');
        return;
    }
    
    estudiantes.push(estudiante);
    saveData(DB.estudiantes, estudiantes);
    
    document.getElementById('formEstudiante').reset();
    loadEstudiantes();
    loadSelectEstudiantes();
    updateDashboard();
    
    showNotification('✅ Estudiante guardado exitosamente', 'success');
}

function loadEstudiantes() {
    const estudiantes = getData(DB.estudiantes);
    const tbody = document.getElementById('tableEstudiantes');
    
    if (estudiantes.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No hay estudiantes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = estudiantes.map(est => `
        <tr>
            <td>${est.nie}</td>
            <td><strong>${est.nombre}</strong></td>
            <td>${est.sexo}</td>
            <td>${est.grado}°</td>
            <td>${est.seccion}</td>
            <td>${est.turno}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-danger" onclick="deleteEstudiante(${est.id})">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadSelectEstudiantes() {
    const estudiantes = getData(DB.estudiantes);
    const select = document.getElementById('tarjetaEstudiante');
    
    select.innerHTML = '<option value="">Seleccionar estudiante</option>' + 
        estudiantes.map(e => `<option value="${e.id}">${e.nombre} (${e.nie})</option>`).join('');
}

function deleteEstudiante(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
        let estudiantes = getData(DB.estudiantes);
        estudiantes = estudiantes.filter(e => e.id !== id);
        saveData(DB.estudiantes, estudiantes);
        loadEstudiantes();
        loadSelectEstudiantes();
        updateDashboard();
        showNotification('✅ Estudiante eliminado exitosamente', 'success');
    }
}

function handleSearchEstudiante(e) {
    const search = e.target.value.toLowerCase();
    const estudiantes = getData(DB.estudiantes);
    const tbody = document.getElementById('tableEstudiantes');
    
    const filtered = estudiantes.filter(est => 
        est.nombre.toLowerCase().includes(search) || 
        est.nie.toLowerCase().includes(search)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No se encontraron resultados</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(est => `
        <tr>
            <td>${est.nie}</td>
            <td><strong>${est.nombre}</strong></td>
            <td>${est.sexo}</td>
            <td>${est.grado}°</td>
            <td>${est.seccion}</td>
            <td>${est.turno}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-danger" onclick="deleteEstudiante(${est.id})">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// TARJETA DE DEMÉRITOS
// ============================================
function handleSaveTarjeta(e) {
    e.preventDefault();
    
    const tarjeta = {
        id: Date.now(),
        idEstudiante: document.getElementById('tarjetaEstudiante').value,
        fecha: document.getElementById('fechaTarjeta').value,
        demerito: document.getElementById('demerito').value || null,
        redencion: document.getElementById('redencion').value || null,
        reconocimiento: document.getElementById('reconocimiento').value || null,
        nombreRegistra: document.getElementById('nombreRegistra').value,
        firmaRegistra: document.getElementById('firmaRegistra').value,
        nombreResponsable: document.getElementById('nombreResponsable').value,
        firmaResponsable: document.getElementById('firmaResponsable').value,
        firmaEstudiante: document.getElementById('firmaEstudiante').value
    };
    
    const tarjetas = getData(DB.tarjetas);
    tarjetas.push(tarjeta);
    saveData(DB.tarjetas, tarjetas);
    
    document.getElementById('formTarjeta').reset();
    updateDashboard();
    loadHistorial();
    
    showNotification('✅ Tarjeta de deméritos registrada exitosamente', 'success');
}

// ============================================
// HISTORIAL
// ============================================
function loadHistorial() {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    const tbody = document.getElementById('tableHistorial');
    
    if (tarjetas.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No hay tarjetas registradas</td></tr>';
        return;
    }
    
    const demeritosDesc = {
        'A': 'No saludar',
        'B': 'Omitir "Por favor"',
        'C': 'Omitir "Gracias"',
        'D': 'Tono grosero'
    };
    
    const redencioDesc = {
        'A': 'Cortesía ejemplar',
        'B': 'Limpieza y orden',
        'C': 'Campañas valores'
    };
    
    const reconocDesc = {
        'A': 'Diploma',
        'B': 'Mención mural'
    };
    
    tbody.innerHTML = tarjetas.map(tarjeta => {
        const estudiante = estudiantes.find(e => e.id == tarjeta.idEstudiante);
        
        return `
            <tr>
                <td>${tarjeta.fecha}</td>
                <td><strong>${estudiante ? estudiante.nombre : 'N/A'}</strong></td>
                <td>${tarjeta.demerito ? demeritosDesc[tarjeta.demerito] : '-'}</td>
                <td>${tarjeta.redencion ? redencioDesc[tarjeta.redencion] : '-'}</td>
                <td>${tarjeta.reconocimiento ? reconocDesc[tarjeta.reconocimiento] : '-'}</td>
                <td>${tarjeta.nombreRegistra}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="printTarjeta(${tarjeta.id})">🖨️ Imprimir</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTarjeta(${tarjeta.id})">🗑️ Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteTarjeta(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
        let tarjetas = getData(DB.tarjetas);
        tarjetas = tarjetas.filter(t => t.id !== id);
        saveData(DB.tarjetas, tarjetas);
        loadHistorial();
        updateDashboard();
        showNotification('✅ Tarjeta eliminada exitosamente', 'success');
    }
}

function printTarjeta(id) {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    const tarjeta = tarjetas.find(t => t.id === id);
    const estudiante = estudiantes.find(e => e.id == tarjeta.idEstudiante);
    
    if (!tarjeta || !estudiante) {
        showNotification('Tarjeta no encontrada', 'error');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Tarjeta de Deméritos</title>
            <style>
                body { font-family: Arial; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2d5016; padding-bottom: 20px; }
                .section { margin: 20px 0; }
                .section-title { background: #2d5016; color: white; padding: 10px; margin: 10px 0; }
                .field { display: flex; margin: 10px 0; }
                .label { width: 200px; font-weight: bold; }
                .value { flex: 1; border-bottom: 1px solid #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #333; padding: 10px; text-align: left; }
                th { background: #f0f0f0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Tarjeta de Deméritos del Estudiante</h1>
                <p>Instrumento No. 001</p>
            </div>
            
            <div class="section">
                <div class="section-title">DATOS DEL ESTUDIANTE</div>
                <div class="field">
                    <div class="label">Nombre:</div>
                    <div class="value">${estudiante.nombre}</div>
                </div>
                <div class="field">
                    <div class="label">NIE:</div>
                    <div class="value">${estudiante.nie}</div>
                </div>
                <div class="field">
                    <div class="label">Grado/Sección:</div>
                    <div class="value">${estudiante.grado}° "${estudiante.seccion}"</div>
                </div>
                <div class="field">
                    <div class="label">Turno:</div>
                    <div class="value">${estudiante.turno}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">REGISTRO</div>
                <div class="field">
                    <div class="label">Fecha:</div>
                    <div class="value">${tarjeta.fecha}</div>
                </div>
                <div class="field">
                    <div class="label">Demérito:</div>
                    <div class="value">${tarjeta.demerito || 'N/A'}</div>
                </div>
                <div class="field">
                    <div class="label">Redención:</div>
                    <div class="value">${tarjeta.redencion || 'N/A'}</div>
                </div>
                <div class="field">
                    <div class="label">Reconocimiento:</div>
                    <div class="value">${tarjeta.reconocimiento || 'N/A'}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">FIRMAS</div>
                <div class="field">
                    <div class="label">Registrado por:</div>
                    <div class="value">${tarjeta.nombreRegistra}</div>
                </div>
                <div class="field">
                    <div class="label">Responsable Redención:</div>
                    <div class="value">${tarjeta.nombreResponsable}</div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function handleLimpiarFiltros() {
    document.getElementById('filterEstudiante').value = '';
    document.getElementById('filterFecha').value = '';
    loadHistorial();
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
    const centros = getData(DB.centros);
    const estudiantes = getData(DB.estudiantes);
    const tarjetas = getData(DB.tarjetas);
    const demeritos = tarjetas.filter(t => t.demerito !== null).length;
    
    document.getElementById('totalCentros').textContent = centros.length;
    document.getElementById('totalEstudiantes').textContent = estudiantes.length;
    document.getElementById('totalTarjetas').textContent = tarjetas.length;
    document.getElementById('totalDemeritos').textContent = demeritos;
}

// ============================================
// REPORTES
// ============================================
function generateReporteDemeritosAltos() {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    
    const conteo = {};
    tarjetas.forEach(t => {
        if (t.demerito) {
            conteo[t.idEstudiante] = (conteo[t.idEstudiante] || 0) + 1;
        }
    });
    
    const sorted = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    let html = '<h3>Top 10 Estudiantes con Más Deméritos</h3><table class="table"><thead><tr><th>Estudiante</th><th>Deméritos</th></tr></thead><tbody>';
    
    sorted.forEach(([idEst, count]) => {
        const est = estudiantes.find(e => e.id == idEst);
        html += `<tr><td>${est ? est.nombre : 'N/A'}</td><td>${count}</td></tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('reporteContenido').innerHTML = html;
    showNotification('✅ Reporte generado exitosamente', 'success');
}

function generateReporteHistorial() {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    
    let html = '<h3>Historial Completo de Tarjetas</h3><table class="table"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Demérito</th><th>Redención</th><th>Reconocimiento</th></tr></thead><tbody>';
    
    tarjetas.forEach(t => {
        const est = estudiantes.find(e => e.id == t.idEstudiante);
        html += `<tr><td>${t.fecha}</td><td>${est ? est.nombre : 'N/A'}</td><td>${t.demerito || '-'}</td><td>${t.redencion || '-'}</td><td>${t.reconocimiento || '-'}</td></tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('reporteContenido').innerHTML = html;
    showNotification('✅ Reporte generado exitosamente', 'success');
}

function generateReportePorCentro() {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    const centros = getData(DB.centros);
    
    let html = '<h3>Reporte por Centro Educativo</h3>';
    
    centros.forEach(centro => {
        const estDelCentro = estudiantes.filter(e => e.idCentro == centro.id);
        const tarjetasDelCentro = tarjetas.filter(t => estDelCentro.some(e => e.id == t.idEstudiante));
        
        html += `<h4>${centro.nombre}</h4>
                <p>Estudiantes: ${estDelCentro.length} | Tarjetas: ${tarjetasDelCentro.length}</p>`;
    });
    
    document.getElementById('reporteContenido').innerHTML = html;
    showNotification('✅ Reporte generado exitosamente', 'success');
}

function generateReportePorFecha() {
    const tarjetas = getData(DB.tarjetas);
    const estudiantes = getData(DB.estudiantes);
    
    const porFecha = {};
    tarjetas.forEach(t => {
        porFecha[t.fecha] = (porFecha[t.fecha] || 0) + 1;
    });
    
    let html = '<h3>Reporte por Fecha</h3><table class="table"><thead><tr><th>Fecha</th><th>Cantidad de Tarjetas</th></tr></thead><tbody>';
    
    Object.entries(porFecha).sort().forEach(([fecha, count]) => {
        html += `<tr><td>${fecha}</td><td>${count}</td></tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('reporteContenido').innerHTML = html;
    showNotification('✅ Reporte generado exitosamente', 'success');
}

// ============================================
// RESET
// ============================================
function handleReset() {
    if (confirm('⚠️ ¿Estás seguro? Esto eliminará TODOS los datos del sistema.')) {
        localStorage.clear();
        initData();
        location.reload();
    }
}

function closeModal() {
    document.getElementById('modalConfirmacion').classList.remove('active');
} 