const METRICAS = {
    sueno: { label: "Horas de sueño", unidad: "h", icon: "🌙", min: 0, max: 24 },
    agua: { label: "Vasos de agua", unidad: "vasos", icon: "💧", min: 0, max: 30 },
    ejercicio: { label: "Ejercicio", unidad: "min", icon: "🏃", min: 0, max: 600 },
    animo: { label: "Ánimo", unidad: "/10", icon: "😊", min: 1, max: 10 },
    calorias: { label: "Calorías", unidad: "kcal", icon: "🍎", min: 0, max: 10000 },
};

// Temas dinámicos de Tailwind para cada métrica — paleta viva
const METRICA_THEMES = {
    sueno: {
        glow: "shadow-[0_8px_30px_rgba(139,92,246,0.15)]",
        border: "border-violet-200",
        text: "text-violet-600",
        accentGradient: "from-violet-600 to-indigo-600",
        chartFrom: "from-violet-400",
        chartTo: "to-indigo-500",
        btnActive: "bg-violet-600 border-violet-600 hover:bg-violet-700 hover:border-violet-700 shadow-md shadow-violet-100 text-white",
    },
    agua: {
        glow: "shadow-[0_8px_30px_rgba(14,165,233,0.15)]",
        border: "border-sky-200",
        text: "text-sky-600",
        accentGradient: "from-sky-600 to-blue-600",
        chartFrom: "from-sky-400",
        chartTo: "to-blue-500",
        btnActive: "bg-sky-500 border-sky-500 hover:bg-sky-600 hover:border-sky-600 shadow-md shadow-sky-100 text-white",
    },
    ejercicio: {
        glow: "shadow-[0_8px_30px_rgba(16,185,129,0.15)]",
        border: "border-emerald-200",
        text: "text-emerald-600",
        accentGradient: "from-emerald-600 to-teal-600",
        chartFrom: "from-emerald-400",
        chartTo: "to-teal-500",
        btnActive: "bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-md shadow-emerald-100 text-white",
    },
    animo: {
        glow: "shadow-[0_8px_30px_rgba(245,158,11,0.15)]",
        border: "border-amber-200",
        text: "text-amber-600",
        accentGradient: "from-amber-600 to-orange-600",
        chartFrom: "from-amber-400",
        chartTo: "to-orange-500",
        btnActive: "bg-amber-500 border-amber-500 hover:bg-amber-600 hover:border-amber-600 shadow-md shadow-amber-100 text-white",
    },
    calorias: {
        glow: "shadow-[0_8px_30px_rgba(244,63,94,0.15)]",
        border: "border-rose-200",
        text: "text-rose-600",
        accentGradient: "from-rose-600 to-red-600",
        chartFrom: "from-rose-400",
        chartTo: "to-red-500",
        btnActive: "bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 shadow-md shadow-rose-100 text-white",
    }
};

// ---------- Sistema de Toasts Elegantes ----------
function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgClass = type === 'success' ? 'bg-white border-slate-200 shadow-lg' : 'bg-rose-50 border-rose-200 shadow-md';
    const borderAccent = type === 'success' ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-rose-500';
    const textColor = type === 'success' ? 'text-slate-800' : 'text-rose-900';
    const icon = type === 'success' ? '⚡' : '⚠️';

    toast.className = `flex items-center gap-3 px-4.5 py-3.5 rounded-xl border backdrop-blur-md transition-all duration-350 transform translate-y-2 opacity-0 pointer-events-auto ${bgClass} ${borderAccent}`;
    toast.innerHTML = `
            <span class="text-lg shrink-0">${icon}</span>
            <p class="text-xs font-semibold ${textColor} flex-1 leading-normal pr-2">${message}</p>
            <button class="text-slate-400 hover:text-slate-655 text-sm font-bold focus:outline-none cursor-pointer">×</button>
        `;

    toast.querySelector("button").addEventListener("click", () => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 350);
    });

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.remove("opacity-0", "translate-y-2");
    });

    // Remoción automática a los 4 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add("opacity-0", "translate-y-2");
            setTimeout(() => toast.remove(), 350);
        }
    }, 4000);
}

// ---------- Funciones puras de estadística ----------
const promedio = (xs) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);
const maximo = (xs) => (xs.length === 0 ? 0 : Math.max(...xs));
const minimo = (xs) => (xs.length === 0 ? 0 : Math.min(...xs));

// Convierte un valor decimal a texto legible. Para "sueno" lo
// muestra como horas y minutos (ej. 7.98 -> "7h 59min"), nunca
// con 60 minutos (si el redondeo llega a 60, se suma 1 hora).
// Para el resto de métricas usa el decimal normal con su unidad.
function formatearValor(valor, metrica) {
    if (metrica === "sueno") {
        let horas = Math.floor(valor);
        let minutos = Math.round((valor - horas) * 60);
        if (minutos === 60) {
            minutos = 0;
            horas += 1;
        }
        return `${horas}h ${minutos}min`;
    }
    return `${valor.toFixed(1)} ${METRICAS[metrica].unidad}`;
}

// Agrupa una lista de registros por mes ("YYYY-MM") y calcula el
// promedio y la cantidad de cada grupo.
function agruparPorMes(registros) {
    const grupos = {};
    registros.forEach((r) => {
        const mes = r.fecha.slice(0, 7);
        if (!grupos[mes]) grupos[mes] = [];
        grupos[mes].push(r.valor);
    });
    return Object.entries(grupos).map(([mes, valores]) => ({
        mes,
        promedio: promedio(valores),
        cantidad: valores.length,
    }));
}

const NOMBRES_MES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function nombreMes(yyyyMm) {
    const [anio, mes] = yyyyMm.split("-");
    return `${NOMBRES_MES[parseInt(mes, 10) - 1]} ${anio}`;
}

// ---------- Patrón Observer ----------
// EventBus para emitir cambios en el estado
const EventBus = {
    observadores: {},
    suscribir(evento, callback) {
        if (!this.observadores[evento]) this.observadores[evento] = [];
        this.observadores[evento].push(callback);
    },
    publicar(evento, datos) {
        (this.observadores[evento] || []).forEach((callback) => callback(datos));
    },
};

// ---------- Estado ----------
let metricaActual = "sueno";
let desde = "";
let hasta = "";
let filtrados = [];
let pinnedIdx = null;

// ---------- Helpers de API ----------
async function apiGet(url) {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al consultar la API");
    return data;
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al enviar datos");
    return data;
}

// ---------- Carga de datos ----------
async function cargarFiltrados() {
    pinnedIdx = null;
    const params = new URLSearchParams({ metrica: metricaActual });
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    filtrados = await apiGet(`api/listar.php?${params.toString()}`);
    EventBus.publicar("filtrados:actualizado", filtrados);
}

async function cargarHistorial() {
    const historial = await apiGet("api/historial.php");
    EventBus.publicar("historial:actualizado", historial);
}

async function refrescarTodo() {
    await Promise.all([cargarFiltrados(), cargarHistorial()]);
}

// ---------- Render: selector de métrica ----------
function renderSelectorMetrica() {
    const theme = METRICA_THEMES[metricaActual];

    // Actualizar botones del selector
    document.querySelectorAll(".metric-btn").forEach((btn) => {
        const isActivo = btn.dataset.metrica === metricaActual;

        // Remover clases previas activas de todos los temas
        Object.values(METRICA_THEMES).forEach(t => {
            btn.classList.remove(...t.btnActive.split(' '));
        });

        if (isActivo) {
            btn.classList.add(...theme.btnActive.split(' '));
            btn.classList.remove("text-slate-500", "bg-white/85", "border-slate-200");
        } else {
            btn.className = "metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm";
        }
    });

    // Actualizar Glow y Borde del Hero Header
    const header = document.getElementById("hero-header");
    if (header) {
        Object.values(METRICA_THEMES).forEach(t => {
            header.classList.remove(t.glow, t.border);
        });
        header.classList.remove("border-slate-200", "shadow-lg");
        header.classList.add(theme.glow, theme.border);
    }

    // Actualizar acento de degradado en el título
    const titleAccent = document.getElementById("hero-title-accent");
    if (titleAccent) {
        Object.values(METRICA_THEMES).forEach(t => {
            titleAccent.classList.remove(...t.accentGradient.split(' '));
        });
        titleAccent.classList.remove("from-teal-600", "to-indigo-600");
        titleAccent.classList.add(...theme.accentGradient.split(' '));
    }

    // Actualizar color del botón submit del formulario
    const btnSubmit = document.getElementById("btn-submit");
    if (btnSubmit) {
        Object.values(METRICA_THEMES).forEach(t => {
            btnSubmit.classList.remove(...t.btnActive.split(' '));
        });
        btnSubmit.classList.remove("bg-slate-800", "hover:bg-slate-700", "border-slate-700");
        btnSubmit.classList.add(...theme.btnActive.split(' '));
    }

    // Actualizar color de los valores en las tarjetas estadísticas principales
    const statsToColor = ["stat-promedio", "stat-maximo", "stat-minimo"];
    statsToColor.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            Object.values(METRICA_THEMES).forEach(t => el.classList.remove(t.text));
            el.classList.remove("text-slate-900");
            el.classList.add(theme.text);
        }
    });

    const m = METRICAS[metricaActual];
    document.getElementById("form-hint").textContent =
        `${m.label} (${m.min}–${m.max} ${m.unidad})`;

    const esSueno = metricaActual === "sueno";
    document.getElementById("grupo-valor-simple").hidden = esSueno;
    document.getElementById("grupo-valor-tiempo").hidden = !esSueno;

    const input = document.getElementById("input-valor");
    input.min = m.min;
    input.max = m.max;
    input.placeholder = `Ej. ${Math.round((m.min + m.max) / 4)}`;
}

// --// ---------- Helper: Renderiza el icono de tendencia dinámico en SVG ----------
function renderTrendIcon(direccion) {
    const iconContainer = document.getElementById("trend-icon");
    if (!iconContainer) return;

    let lineColor, gridColor, bgClass, borderClass, pathD;

    if (direccion === "up") {
        lineColor = "#6366f1"; // Púrpura/indigo elegante como en la imagen
        gridColor = "#cffafe"; // Cyan muy suave
        bgClass = "bg-[#ecfeff]/50"; // Fondo cyan muy claro
        borderClass = "border-[#cffafe]";
        pathD = "M 5 19 C 9 15, 11 17, 19 5"; // Curva ascendente
    } else if (direccion === "down") {
        lineColor = "#f43f5e"; // Rose-500
        gridColor = "#fecdd3"; // Rose suave
        bgClass = "bg-[#fff1f2]/50"; // Fondo rose muy claro
        borderClass = "border-[#fecdd3]";
        pathD = "M 5 5 C 9 9, 11 7, 19 19"; // Curva descendente
    } else {
        lineColor = "#94a3b8"; // Slate-400
        gridColor = "#e2e8f0"; // Slate suave
        bgClass = "bg-[#f8fafc]/50"; // Fondo slate muy claro
        borderClass = "border-slate-200/60";
        pathD = "M 5 12 L 19 12"; // Línea plana
    }

    iconContainer.className = `h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-500 ${bgClass} ${borderClass}`;
    iconContainer.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Líneas de cuadrícula (Grid) -->
                <line x1="6" y1="0" x2="6" y2="24" stroke="${gridColor}" stroke-width="0.75"/>
                <line x1="12" y1="0" x2="12" y2="24" stroke="${gridColor}" stroke-width="0.75"/>
                <line x1="18" y1="0" x2="18" y2="24" stroke="${gridColor}" stroke-width="0.75"/>
                <line x1="0" y1="6" x2="24" y2="6" stroke="${gridColor}" stroke-width="0.75"/>
                <line x1="0" y1="12" x2="24" y2="12" stroke="${gridColor}" stroke-width="0.75"/>
                <line x1="0" y1="18" x2="24" y2="18" stroke="${gridColor}" stroke-width="0.75"/>
                <!-- Línea de tendencia principal -->
                <path d="${pathD}" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
}

// ---------- Render: estadísticas ----------
function updateTrendCard(index) {
    const valores = filtrados.map((r) => r.valor);
    const avg = promedio(valores);

    const idx = (index !== null && index >= 0 && index < valores.length) ? index : (pinnedIdx !== null ? pinnedIdx : valores.length - 1);
    const val = valores[idx] ?? 0;
    const rec = filtrados[idx];
    const tendencia = valores.length < 2 ? 0 : ((val - avg) / (avg || 1)) * 100;

    const tendenciaCard = document.getElementById("trend-card");
    const tendenciaDesc = document.getElementById("trend-desc");
    const tendenciaEl = document.getElementById("stat-tendencia");
    const pinnedIndicator = document.getElementById("trend-pinned-indicator");
    const pinnedDate = document.getElementById("trend-pinned-date");

    if (!tendenciaCard || !tendenciaDesc || !tendenciaEl) return;

    const direccion = tendencia > 0 ? "up" : tendencia < 0 ? "down" : "flat";
    const flecha = direccion === "up" ? "▲" : direccion === "down" ? "▼" : "■";

    // Remover clases previas de color del trend card
    tendenciaCard.classList.remove("bg-[#f0fdfa]/40", "border-[#ccfbf1]", "bg-[#fff1f2]/40", "border-[#fecdd3]", "bg-white/60", "border-slate-200/80");
    // Remover clases previas de color del badge
    tendenciaEl.classList.remove("bg-white", "border-[#ccfbf1]", "text-teal-600", "border-[#fecdd3]", "text-rose-600", "border-slate-200", "text-slate-500");

    if (direccion === "up") {
        tendenciaCard.classList.add("bg-[#f0fdfa]/40", "border-[#ccfbf1]");
        tendenciaEl.classList.add("bg-white", "border-[#ccfbf1]", "text-teal-600");
    } else if (direccion === "down") {
        tendenciaCard.classList.add("bg-[#fff1f2]/40", "border-[#fecdd3]");
        tendenciaEl.classList.add("bg-white", "border-[#fecdd3]", "text-rose-600");
    } else {
        tendenciaCard.classList.add("bg-white/60", "border-slate-200/80");
        tendenciaEl.classList.add("bg-white", "border-slate-200", "text-slate-500");
    }

    renderTrendIcon(direccion);

    tendenciaEl.textContent = `${flecha} ${Math.abs(tendencia).toFixed(1)}%`;

    const esUltimo = idx === valores.length - 1;
    const prefijoFecha = !esUltimo && rec ? `El ${rec.fecha.slice(5).replace('-', '/')}: ` : "";

    tendenciaDesc.textContent =
        valores.length < 2
            ? "Necesitas al menos 2 registros para calcular una tendencia"
            : `${prefijoFecha}Tu registro de ${formatearValor(val, metricaActual)} está ${direccion === "flat" ? "igual que" : direccion === "up" ? "por encima de" : "por debajo de"} tu promedio (${formatearValor(avg, metricaActual)})`;

    // Actualizar indicador de pin basado en el estado GLOBAL pinnedIdx
    if (pinnedIndicator && pinnedDate) {
        if (pinnedIdx !== null && pinnedIdx >= 0 && pinnedIdx < valores.length && pinnedIdx !== valores.length - 1) {
            const pRec = filtrados[pinnedIdx];
            pinnedDate.textContent = pRec ? pRec.fecha.slice(5).replace('-', '/') : "--/--";
            pinnedIndicator.classList.remove("hidden");
            pinnedIndicator.classList.add("flex");
        } else {
            pinnedIndicator.classList.add("hidden");
            pinnedIndicator.classList.remove("flex");
        }
    }
}

function renderStats() {
    const valores = filtrados.map((r) => r.valor);
    const avg = promedio(valores);
    const max = maximo(valores);
    const min = minimo(valores);

    document.getElementById("stat-promedio").innerHTML = formatearValor(avg, metricaActual);
    document.getElementById("stat-maximo").innerHTML = formatearValor(max, metricaActual);
    document.getElementById("stat-minimo").innerHTML = formatearValor(min, metricaActual);
    document.getElementById("stat-conteo").textContent = filtrados.length;

    // Calcular la dirección basada en la tendencia general (para el color del sparkline inicial)
    const ultimo = valores[valores.length - 1] ?? 0;
    const tendencia = valores.length < 2 ? 0 : ((ultimo - avg) / (avg || 1)) * 100;
    const direccion = tendencia > 0 ? "up" : tendencia < 0 ? "down" : "flat";

    updateTrendCard(pinnedIdx);
    renderSparkline(valores, direccion);
}

// ---------- Render: sparkline de tendencia (crosshair interactivo) ----------

// Estado persistente del sparkline para el mousemove handler
let _sparkState = null;

// Dibuja el sparkline completo con un punto indicador en el índice dado (-1 = punto final u origen anclado)
function _drawSparkFrame(ctx, state, hoverIdx) {
    const { W, H, pts, records, padX, padY, xStep, yFor, c, avg } = state;

    ctx.clearRect(0, 0, W, H);

    // --- Relleno con gradiente bajo la curva ---
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, c.fill0);
    grad.addColorStop(1, c.fill1);

    ctx.beginPath();
    ctx.moveTo(padX, yFor(pts[0]));
    for (let i = 1; i < pts.length; i++) {
        const x0 = padX + (i - 1) * xStep;
        const x1 = padX + i * xStep;
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, yFor(pts[i - 1]), cpx, yFor(pts[i]), x1, yFor(pts[i]));
    }
    ctx.lineTo(padX + (pts.length - 1) * xStep, H);
    ctx.lineTo(padX, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // --- Curva principal suavizada ---
    ctx.beginPath();
    ctx.moveTo(padX, yFor(pts[0]));
    for (let i = 1; i < pts.length; i++) {
        const x0 = padX + (i - 1) * xStep;
        const x1 = padX + i * xStep;
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, yFor(pts[i - 1]), cpx, yFor(pts[i]), x1, yFor(pts[i]));
    }
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // --- Línea de promedio (referencia) ---
    const avgY = yFor(avg);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padX, avgY);
    ctx.lineTo(W - padX, avgY);
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Convert global pinnedIdx to index in records
    const sparkPinnedIdx = (pinnedIdx !== null && pinnedIdx >= 0) ? records.indexOf(filtrados[pinnedIdx]) : -1;

    // --- Determinar índice y posición del punto activo ---
    const dotIdx = (hoverIdx >= 0 && hoverIdx < pts.length) ? hoverIdx : (sparkPinnedIdx >= 0 ? sparkPinnedIdx : pts.length - 1);
    const dx = padX + dotIdx * xStep;
    const dy = yFor(pts[dotIdx]);
    const isHovering = hoverIdx >= 0;

    // --- Línea vertical del crosshair (solo al hacer hover o al estar anclado cuando no hacemos hover) ---
    if (isHovering) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(dx, padY);
        ctx.lineTo(dx, H - padY);
        ctx.strokeStyle = c.dashColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    } else if (sparkPinnedIdx >= 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(dx, padY);
        ctx.lineTo(dx, H - padY);
        ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
        ctx.lineWidth = 1.25;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // --- Dibujar marcador de anclaje (si está anclado y no es el dot activo) ---
    if (sparkPinnedIdx >= 0 && sparkPinnedIdx !== dotIdx) {
        const px = padX + sparkPinnedIdx * xStep;
        const py = yFor(pts[sparkPinnedIdx]);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = c.dot;
        ctx.fill();
        ctx.restore();
    }

    // --- Punto: halo + anillo blanco + núcleo ---
    // Halo exterior
    ctx.beginPath();
    ctx.arc(dx, dy, isHovering ? 9 : 7.5, 0, Math.PI * 2);
    ctx.fillStyle = c.fill0;
    ctx.fill();

    // Anillo blanco
    ctx.beginPath();
    ctx.arc(dx, dy, isHovering ? 6 : 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Núcleo de color
    ctx.beginPath();
    ctx.arc(dx, dy, isHovering ? 4 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = c.dot;
    ctx.fill();
}

function renderSparkline(valores, direccion) {
    const canvas = document.getElementById("trend-sparkline");
    const wrap = document.getElementById("trend-sparkline-wrap");
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const W = Math.max(Math.floor(rect.width), 200);
    const H = Math.max(Math.floor(rect.height), 50);
    canvas.width = W;
    canvas.height = H;

    // Tomar los últimos 35 registros (con sus fechas si están disponibles)
    const records = filtrados.slice(-35);
    const pts = records.map(r => r.valor);

    if (pts.length < 2) return;

    const avg = promedio(pts);
    const minV = Math.min(...pts);
    const maxV = Math.max(...pts);
    const rng = maxV - minV || 1;

    const colorMap = {
        up: { line: "#0d9488", fill0: "rgba(13,148,136,0.14)", fill1: "rgba(13,148,136,0.0)", dot: "#0d9488", border: "#99f6e4", text: "#0d9488", dashColor: "rgba(13,148,136,0.35)" },
        down: { line: "#f43f5e", fill0: "rgba(244,63,94,0.12)", fill1: "rgba(244,63,94,0.0)", dot: "#f43f5e", border: "#fecdd3", text: "#f43f5e", dashColor: "rgba(244,63,94,0.35)" },
        flat: { line: "#94a3b8", fill0: "rgba(148,163,184,0.08)", fill1: "rgba(148,163,184,0.0)", dot: "#94a3b8", border: "#e2e8f0", text: "#64748b", dashColor: "rgba(148,163,184,0.35)" },
    };
    const c = colorMap[direccion] || colorMap.flat;

    const padX = 6;
    const padY = 8;
    const xStep = (W - padX * 2) / (pts.length - 1);
    const yFor = (v) => padY + ((maxV - v) / rng) * (H - padY * 2);

    // Guardar estado para el handler
    _sparkState = { W, H, pts, records, padX, padY, xStep, yFor, c, avg };

    const ctx = canvas.getContext("2d");
    _drawSparkFrame(ctx, _sparkState, -1); // -1 = sin hover, muestra punto final

    // --- Registrar eventos una sola vez ---
    if (!canvas._tooltipBound) {
        canvas._tooltipBound = true;
        canvas.style.cursor = "crosshair";

        canvas.addEventListener("mousemove", (e) => {
            const tooltip = document.getElementById("sparkline-dot-tooltip");
            if (!tooltip || !_sparkState) return;

            const { W: cW, pts: cPts, padX: cPadX, xStep: cXStep, records: cRec, c: cC, avg: cAvg } = _sparkState;

            const cr = canvas.getBoundingClientRect();
            const scaleX = canvas.width / cr.width;
            const mx = (e.clientX - cr.left) * scaleX;

            // Encontrar el índice más cercano al cursor
            const rawIdx = (mx - cPadX) / cXStep;
            const idx = Math.max(0, Math.min(cPts.length - 1, Math.round(rawIdx)));

            // Redibujar con el crosshair en ese índice
            _drawSparkFrame(canvas.getContext("2d"), _sparkState, idx);

            // Contenido del tooltip
            const val = cPts[idx];
            const rec = cRec[idx];
            const fecha = rec ? rec.fecha.slice(5).replace('-', '/') : ''; // "MM/DD"
            const pctVsAvg = cAvg > 0 ? ((val - cAvg) / cAvg * 100) : 0;
            const flecha = pctVsAvg > 0.1 ? "▲" : pctVsAvg < -0.1 ? "▼" : "■";
            const pctColor = pctVsAvg > 0.1 ? "#0d9488" : pctVsAvg < -0.1 ? "#f43f5e" : "#94a3b8";

            tooltip.innerHTML =
                `<span style="font-size:10px;font-weight:600;color:#94a3b8;display:block">${fecha}</span>` +
                `<span style="color:${pctColor}">${flecha} ${Math.abs(pctVsAvg).toFixed(1)}%</span>`;
            tooltip.style.borderColor = cC.border;

            // Posición horizontal: centrada sobre el punto, con clamp para no salirse
            const dotXPx = (cPadX + idx * cXStep) / cW * 100;
            const clamped = Math.max(5, Math.min(95, dotXPx));
            tooltip.style.left = `${clamped}%`;
            tooltip.style.right = 'auto';

            tooltip.classList.add("visible");

            const filtradosIdx = filtrados.indexOf(rec);
            updateTrendCard(filtradosIdx);
        });

        canvas.addEventListener("mouseleave", () => {
            const tooltip = document.getElementById("sparkline-dot-tooltip");
            if (tooltip) tooltip.classList.remove("visible");
            if (_sparkState) {
                _drawSparkFrame(canvas.getContext("2d"), _sparkState, -1);
            }
            updateTrendCard(pinnedIdx);
        });

        canvas.addEventListener("click", (e) => {
            if (!_sparkState) return;
            const { pts: cPts, padX: cPadX, xStep: cXStep, records: cRec } = _sparkState;

            const cr = canvas.getBoundingClientRect();
            const scaleX = canvas.width / cr.width;
            const mx = (e.clientX - cr.left) * scaleX;

            // Encontrar el índice más cercano al cursor
            const rawIdx = (mx - cPadX) / cXStep;
            const idx = Math.max(0, Math.min(cPts.length - 1, Math.round(rawIdx)));

            const rec = cRec[idx];
            const filtradosIdx = filtrados.indexOf(rec);

            // Pin / Unpin
            if (pinnedIdx === filtradosIdx) {
                pinnedIdx = null; // Unpin si hace clic de nuevo
            } else {
                pinnedIdx = filtradosIdx;
            }

            _drawSparkFrame(canvas.getContext("2d"), _sparkState, -1);
            updateTrendCard(pinnedIdx);
        });
    }
}

function renderFiltersSummary() {
    const summaryEl = document.getElementById("filters-summary");
    const btnLimpiar = document.getElementById("btn-limpiar-filtros");
    if (!summaryEl) return;

    const total = filtrados.length;
    summaryEl.textContent = `Mostrando ${total} registro${total === 1 ? "" : "s"}`;

    if (btnLimpiar) {
        btnLimpiar.hidden = !(desde || hasta);
    }
}

function getChartTooltipOverlay() {
    const wrapper = document.getElementById("chart-wrapper");
    let overlay = document.getElementById("chart-tooltip-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "chart-tooltip-overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.pointerEvents = "none";
        overlay.style.overflow = "visible";
        overlay.style.zIndex = "30";
        wrapper.style.position = "relative";
        wrapper.appendChild(overlay);
    }
    overlay.innerHTML = ""; // limpiar tooltips viejos en cada render
    return overlay;
}

// ---------- Render: gráfica de barras ----------
function renderChart() {
    const chartWrapper = document.getElementById("chart-wrapper");
    const chartBars = document.getElementById("chart-bars");
    const chartLabels = document.getElementById("chart-labels");
    const chartEmpty = document.getElementById("chart-empty");
    const theme = METRICA_THEMES[metricaActual];
    const max = maximo(filtrados.map((r) => r.valor));

    chartBars.innerHTML = "";
    const oldOverlay = document.getElementById("chart-tooltip-overlay");
    if (oldOverlay) oldOverlay.innerHTML = "";
    if (chartLabels) chartLabels.style.display = "none";

    if (filtrados.length === 0) {
        chartEmpty.style.display = "block";
        chartBars.style.display = "none";
        return;
    }

    chartEmpty.style.display = "none";
    chartBars.style.display = "flex"; // activa el flex (CSS ya define el resto)

    // ── Layout ──────────────────────────────────────────────────────────────
    const total = filtrados.length;
    const GAP = 4;   // px entre barras
    const BAR_MIN_W = 48;  // px mínimos por barra — "01/24" = ~30px a 10px font

    // clientWidth del chart-bars (ahora es el scroll container)
    const containerW = chartBars.clientWidth || chartWrapper.clientWidth || 600;
    const needsScroll = total * (BAR_MIN_W + GAP) > containerW;
    const colW = needsScroll
        ? BAR_MIN_W
        : Math.max(BAR_MIN_W, Math.floor((containerW - GAP * (total - 1)) / total));

    chartBars.style.gap = GAP + "px";

    // Altura disponible para las barras = altura total del contenedor - padding-bottom para labels
    // CSS define height: 256px con padding-bottom: 32px → barHeight = 256 - 32 = 224px
    const BAR_AREA_H = 224; // px de área de barras (por encima del padding de labels)
    const overlay = getChartTooltipOverlay();
    filtrados.forEach((r, i) => {
        const alturaPx = max > 0 ? Math.max(4, (r.valor / max) * BAR_AREA_H) : 4;
        const texto = formatearValor(r.valor, metricaActual);
        const esFirst = i === 0;
        const esLast = i === total - 1;

        // ── Columna contenedora (barra + etiqueta) ──────────────────────────
        const col = document.createElement("div");
        col.style.position = "relative";
        col.style.flexShrink = "0";
        col.style.width = colW + "px";
        col.style.height = alturaPx + "px";
        col.style.alignSelf = "flex-end";

        // Barra visual
        const barEl = document.createElement("div");
        barEl.className = `rounded-t-lg bg-gradient-to-t ${theme.chartFrom} ${theme.chartTo} transition-all duration-500 ease-out hover:brightness-110 cursor-pointer`;
        barEl.style.width = "100%";
        barEl.style.height = "100%";
        barEl.style.position = "relative";
        col.appendChild(barEl);

        // Tooltip hover — vive en una capa flotante FUERA de #chart-bars
        // (necesario porque overflow-x:auto fuerza overflow-y a auto y corta
        // cualquier tooltip que se dibuje dentro del contenedor con scroll)
        const tooltip = document.createElement("div");
        tooltip.className = "absolute bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-xl opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30";
        tooltip.innerHTML = `<span class="text-slate-500 font-normal">${r.fecha}:</span> ${texto}`;
        overlay.appendChild(tooltip);

        barEl.addEventListener("mouseenter", () => {
            const barRect = barEl.getBoundingClientRect();
            const overlayRect = overlay.getBoundingClientRect();
            tooltip.style.display = "block";
            const tw = tooltip.offsetWidth;

            // Centrado sobre la barra, limitado para no salirse del overlay
            let left = (barRect.left - overlayRect.left) + barRect.width / 2 - tw / 2;
            left = Math.max(4, Math.min(left, overlayRect.width - tw - 4));
            tooltip.style.left = left + "px";
            tooltip.style.top = (barRect.top - overlayRect.top - tooltip.offsetHeight - 8) + "px";
            tooltip.style.opacity = "1";
        });
        barEl.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
        });

        // ── Etiqueta de fecha ─────────────────────────────────────────────
        // Posicionada dentro del padding-bottom del contenedor padre (32px).
        // Como el col tiene alignSelf:flex-end, su bottom coincide con el límite
        // del área de barras (tope del padding-bottom). La etiqueta a +8px queda
        // dentro del padding → visible sin overflow.
        const label = document.createElement("span");
        label.textContent = r.fecha.slice(5).replace('-', '/'); // "MM/DD"
        label.style.position = "absolute";
        label.style.top = "100%";      // justo debajo de la barra
        label.style.marginTop = "8px";       // separación del borde inferior
        label.style.left = "50%";
        label.style.transform = "translateX(-50%)";
        label.style.fontSize = "10px";
        label.style.fontWeight = "600";
        label.style.color = "#64748b";
        label.style.whiteSpace = "nowrap";
        label.style.lineHeight = "1";
        label.style.pointerEvents = "none";
        col.appendChild(label);

        chartBars.appendChild(col);
    });
}

// ---------- Render: ranking mensual ----------
function renderRankingMensual() {
    const meses = agruparPorMes(filtrados).sort((a, b) => b.promedio - a.promedio);
    const lista = document.getElementById("ranking-mensual-list");
    const vacio = document.getElementById("ranking-mensual-empty");
    const theme = METRICA_THEMES[metricaActual];
    lista.innerHTML = "";

    if (meses.length === 0) {
        vacio.style.display = "block";
        return;
    }
    vacio.style.display = "none";

    const medallas = ["🥇", "🥈", "🥉"];

    meses.forEach((item, i) => {
        const fila = document.createElement("div");
        fila.className = "flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-350 transition-colors duration-300";
        fila.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-sm w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center font-bold text-slate-700 shadow-inner shrink-0">${medallas[i] || `${i + 1}º`}</span>
                    <span class="font-bold text-slate-800 capitalize text-sm truncate max-w-[120px] sm:max-w-[200px]">${nombreMes(item.mes)}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs text-slate-550 font-semibold">${item.cantidad} registro${item.cantidad === 1 ? "" : "s"}</span>
                    <span class="font-bold text-sm ${theme.text} font-mono">${formatearValor(item.promedio, metricaActual)}</span>
                </div>
            `;
        lista.appendChild(fila);
    });
}

// ---------- Render: historial ----------
function renderHistorial(historial) {
    const list = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");

    list.innerHTML = "";

    if (historial.length === 0) {
        list.appendChild(empty);
        empty.innerHTML = "Aún no has registrado nada. ¡Comienza con tu primer dato!";
        empty.className = "text-sm text-slate-450 py-10 text-center font-light";
        return;
    }

    historial.forEach((r) => {
        const info = METRICAS[r.metrica];
        const item = document.createElement("div");
        item.className = "flex items-center justify-between py-4 border-b border-slate-200/60 group/item transition-colors duration-200";

        item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover/item:border-slate-350 transition-colors duration-300 shadow-sm">
                        ${info.icon}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-800 leading-normal">${info.label}</p>
                        <p class="text-xs text-slate-500 font-semibold mt-0.5">${r.fecha}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-slate-800 font-mono">${formatearValor(r.valor, r.metrica)}</span>
                    <button class="btn-delete p-2 rounded-lg border border-slate-200 hover:border-rose-350 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all duration-200 cursor-pointer" data-id="${r.id}" title="Eliminar registro">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;

        list.appendChild(item);
    });
}

// ---------- Eventos ----------
function configurarEventos() {
    // Selector de métrica en delegación de clics
    document.getElementById("metric-selector").addEventListener("click", async (e) => {
        const btn = e.target.closest(".metric-btn");
        if (!btn) return;
        metricaActual = btn.dataset.metrica;
        renderSelectorMetrica();
        await cargarFiltrados();
    });

    // Formulario de registro
    document.getElementById("form-registro").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById("form-error");
        errorEl.textContent = "";

        const fecha = document.getElementById("input-fecha").value;
        let valor;

        if (metricaActual === "sueno") {
            const horas = Number(document.getElementById("input-horas").value || 0);
            const minutos = Number(document.getElementById("input-minutos").value || 0);
            valor = horas + minutos / 60;
        } else {
            valor = Number(document.getElementById("input-valor").value);
        }

        if (fecha === "" || Number.isNaN(valor)) {
            errorEl.textContent = "Completa todos los campos obligatorios.";
            return;
        }

        try {
            await apiPost("api/agregar.php", { metrica: metricaActual, fecha, valor });
            document.getElementById("input-valor").value = "";
            document.getElementById("input-horas").value = "";
            document.getElementById("input-minutos").value = "";
            await refrescarTodo();
            showToast("¡Registro agregado con éxito!");
        } catch (err) {
            errorEl.textContent = err.message;
            showToast(err.message, "error");
        }
    });

    // Historial (eliminar registros)
    document.getElementById("history-list").addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-delete");
        if (!btn) return;

        try {
            await apiPost("api/eliminar.php", { id: Number(btn.dataset.id) });
            await refrescarTodo();
            showToast("Registro eliminado con éxito.");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Filtros
    document.getElementById("filtro-desde").addEventListener("change", async (e) => {
        desde = e.target.value;
        await cargarFiltrados();
    });

    document.getElementById("filtro-hasta").addEventListener("change", async (e) => {
        hasta = e.target.value;
        await cargarFiltrados();
    });

    document.getElementById("btn-limpiar-filtros").addEventListener("click", async () => {
        desde = "";
        hasta = "";
        document.getElementById("filtro-desde").value = "";
        document.getElementById("filtro-hasta").value = "";
        await cargarFiltrados();
        showToast("Filtros limpiados.");
    });

    // Restablecer tendencia (desanclar punto)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#btn-reset-trend");
        if (btn) {
            pinnedIdx = null;
            const canvas = document.getElementById("trend-sparkline");
            if (canvas && _sparkState) {
                _drawSparkFrame(canvas.getContext("2d"), _sparkState, -1);
            }
            updateTrendCard(null);
        }
    });
}

// ---------- Observadores ----------
function configurarObservadores() {
    EventBus.suscribir("filtrados:actualizado", () => {
        renderStats();
        renderChart();
        renderFiltersSummary();
        renderRankingMensual();
    });
    EventBus.suscribir("historial:actualizado", renderHistorial);
}

// ---------- Inicio ----------
function init() {
    document.getElementById("input-fecha").value = new Date().toISOString().slice(0, 10);
    renderSelectorMetrica();
    configurarObservadores();
    configurarEventos();
    refrescarTodo().catch((err) => {
        console.error(err);
        document.getElementById("form-error").textContent = err.message;
    });
}

document.addEventListener("DOMContentLoaded", init);