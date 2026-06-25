<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Panel de Estadísticas Personales</title>
  <meta name="description" content="Registra tus hábitos diarios — sueño, hidratación, ejercicio, ánimo y calorías — y visualiza estadísticas en tiempo real." />
  
  <!-- Tailwind CSS v4 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  
  <!-- Google Fonts - Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      /* Fondo vivo claro con destellos pastel muy suaves en las esquinas */
      background-image:
        radial-gradient(ellipse 80% 60% at -5% -5%,  rgba(139,92,246,0.12) 0%, transparent 55%),
        radial-gradient(ellipse 70% 55% at 110% 110%, rgba(14,165,233,0.12) 0%, transparent 55%),
        radial-gradient(ellipse 55% 45% at 105% -5%,  rgba(244,63,94,0.08) 0%, transparent 52%),
        radial-gradient(ellipse 50% 40% at -5% 110%,  rgba(16,185,129,0.08) 0%, transparent 52%),
        radial-gradient(ellipse 40% 30% at 50% 50%,   rgba(99,102,241,0.05) 0%, transparent 65%);
      animation: bgBreath 12s ease-in-out infinite alternate;
    }
    @keyframes bgBreath {
      from {
        background-image:
          radial-gradient(ellipse 80% 60% at -5% -5%,  rgba(139,92,246,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 70% 55% at 110% 110%, rgba(14,165,233,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 105% -5%,  rgba(244,63,94,0.08) 0%, transparent 52%),
          radial-gradient(ellipse 50% 40% at -5% 110%,  rgba(16,185,129,0.08) 0%, transparent 52%),
          radial-gradient(ellipse 40% 30% at 50% 50%,   rgba(99,102,241,0.05) 0%, transparent 65%);
      }
      to {
        background-image:
          radial-gradient(ellipse 90% 70% at -5% -5%,  rgba(139,92,246,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 80% 65% at 110% 110%, rgba(14,165,233,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 65% 55% at 105% -5%,  rgba(244,63,94,0.06) 0%, transparent 58%),
          radial-gradient(ellipse 60% 50% at -5% 110%,  rgba(16,185,129,0.06) 0%, transparent 58%),
          radial-gradient(ellipse 50% 40% at 50% 50%,   rgba(99,102,241,0.03) 0%, transparent 70%);
      }
    }
    /* Ocultar las flechas de los inputs numéricos */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
    /* Estilos personalizados para el scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(99,102,241,0.25);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(99,102,241,0.45);
    }
    
    /* Tooltip del crosshair del sparkline */
    #sparkline-dot-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      transform: translateX(-50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease, left 0.05s ease;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Plus Jakarta Sans', ui-monospace, monospace;
      padding: 5px 10px;
      border-radius: 9px;
      border: 1.5px solid;
      background: #fff;
      line-height: 1.6;
      box-shadow: 0 4px 14px rgba(0,0,0,0.10);
      z-index: 20;
      text-align: center;
    }
    #sparkline-dot-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: inherit;
      margin-top: -1px;
    }
    #sparkline-dot-tooltip.visible {
      opacity: 1;
    }
    /* === GRÁFICO DE BARRAS === */
    #chart-wrapper {
      width: 100%;
      overflow: visible;
    }
    #chart-bars {
      display: none;          /* JS lo activa */
      width: 100%;
      /* La altura INCLUYE el espacio para las etiquetas de fecha debajo */
      height: 256px;          /* 224px de barras + 32px para etiquetas */
      box-sizing: border-box;
      overflow-x: auto;       /* scroll horizontal si hay muchos datos */
      overflow-y: visible;
      padding-bottom: 32px;   /* espacio para las etiquetas de fecha */
      border-bottom: 1px solid #e2e8f0;
      align-items: flex-end;
    }
    #chart-bars::-webkit-scrollbar {
      height: 4px;
    }
    #chart-bars::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    #chart-bars::-webkit-scrollbar-thumb {
      background: rgba(99,102,241,0.3);
      border-radius: 4px;
    }
  </style>
</head>
<body class="h-full text-slate-800 antialiased selection:bg-teal-100 selection:text-slate-900">

  <!-- Contenedor de Toasts -->
  <div id="toast-container" class="fixed top-6 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none"></div>

  <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
    
    <!-- Hero Header / Dashboard Banner -->
    <header id="hero-header" class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-8 sm:p-12 shadow-lg transition-all duration-700 ease-in-out backdrop-blur-md">
      <!-- Luces de fondo más suaves y adaptadas a tema claro -->
      <div class="absolute -right-16 -top-16 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/10 to-teal-500/10 blur-3xl"></div>
      <div class="absolute -left-16 -bottom-16 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"></div>
      <div class="absolute left-1/3 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 blur-3xl"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 border border-slate-200 text-slate-600 mb-6 shadow-sm">
            <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            PHP 8.3 · MySQL · Tailwind v4
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Panel de <span id="hero-title-accent" class="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600 transition-all duration-700">Estadísticas Personales</span>
          </h1>
          <p class="text-slate-600 max-w-2xl text-base sm:text-lg font-light leading-relaxed">
            Registra tus hábitos diarios y observa cómo las estadísticas se actualizan automáticamente en tiempo real. Datos guardados en base de datos.
          </p>
        </div>
        <div class="flex-shrink-0 bg-white/85 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md self-start md:self-auto shadow-sm">
          <div class="h-10 w-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-xl shrink-0">💡</div>
          <div class="text-xs">
            <p class="font-semibold text-slate-800">¡Controla tu vida!</p>
            <p class="text-slate-500">Completa tus hábitos a diario.</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Selector de Métricas -->
    <section>
      <div class="flex flex-wrap gap-2.5 bg-slate-150/40 p-2.5 rounded-2xl border border-slate-200/80 backdrop-blur-sm shadow-sm" id="metric-selector">
        <button class="metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm" data-metrica="sueno">🌙 Horas de sueño</button>
        <button class="metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm" data-metrica="agua">💧 Vasos de agua</button>
        <button class="metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm" data-metrica="ejercicio">🏃 Ejercicio</button>
        <button class="metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm" data-metrica="animo">😊 Ánimo</button>
        <button class="metric-btn px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white/85 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm" data-metrica="calorias">🍎 Calorías</button>
      </div>
    </section>

    <!-- Main Grid: Formulario + Estadísticas y Resultados -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Columna Izquierda: Formulario de Registro -->
      <section class="lg:col-span-1">
        <form id="form-registro" class="lg:sticky lg:top-8 bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-lg backdrop-blur-md flex flex-col gap-6 transition-all duration-500">
          <div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            </span> Nuevo registro
            </h2>
            <p class="form-hint text-xs text-slate-500 mt-1.5" id="form-hint">Cargando...</p>
          </div>

          <!-- Inputs -->
          <div id="grupo-valor-simple" class="flex flex-col gap-2">
            <label for="input-valor" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</label>
            <input type="number" id="input-valor" step="any" placeholder="Ej. 6" class="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 transition-all duration-350 shadow-sm" />
          </div>
          
          <div id="grupo-valor-tiempo" class="flex gap-4" hidden>
            <div class="flex-1 flex flex-col gap-2">
              <label for="input-horas" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Horas</label>
              <input type="number" id="input-horas" min="0" max="24" step="1" placeholder="7" class="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 transition-all duration-350 shadow-sm" />
            </div>
            <div class="flex-1 flex flex-col gap-2">
              <label for="input-minutos" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Minutos</label>
              <input type="number" id="input-minutos" min="0" max="59" step="1" placeholder="30" class="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 transition-all duration-350 shadow-sm" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="input-fecha" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</label>
            <input type="date" id="input-fecha" required class="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 transition-all duration-350 shadow-sm" />
          </div>

          <!-- Mensaje de Error -->
          <p class="text-xs text-rose-600 font-semibold min-h-[16px] -mt-2 leading-snug" id="form-error"></p>

          <button type="submit" id="btn-submit" class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300 shadow-md active:scale-[0.98] cursor-pointer">
            Registrar dato
          </button>
        </form>
      </section>

      <!-- Columna Derecha: Dashboard (Estadísticas, Gráficos, Ranking e Historial) -->
      <section class="lg:col-span-2 flex flex-col gap-8">
        
        <!-- Grid de Tarjetas de Estadísticas -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div class="bg-white/70 border border-slate-200/80 rounded-2xl p-5 shadow-md backdrop-blur-md flex flex-col justify-between min-h-[110px] hover:border-slate-350 hover:bg-white/85 transition-all duration-350">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio</p>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 tracking-tight font-mono transition-colors duration-500" id="stat-promedio">0.0</p>
          </div>
          
          <div class="bg-white/70 border border-slate-200/80 rounded-2xl p-5 shadow-md backdrop-blur-md flex flex-col justify-between min-h-[110px] hover:border-slate-350 hover:bg-white/85 transition-all duration-350">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Máximo</p>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 tracking-tight font-mono transition-colors duration-500" id="stat-maximo">0.0</p>
          </div>
          
          <div class="bg-white/70 border border-slate-200/80 rounded-2xl p-5 shadow-md backdrop-blur-md flex flex-col justify-between min-h-[110px] hover:border-slate-350 hover:bg-white/85 transition-all duration-350">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Mínimo</p>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 tracking-tight font-mono transition-colors duration-500" id="stat-minimo">0.0</p>
          </div>
          
          <div class="bg-white/70 border border-slate-200/80 rounded-2xl p-5 shadow-md backdrop-blur-md flex flex-col justify-between min-h-[110px] hover:border-slate-350 hover:bg-white/85 transition-all duration-350">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Registros</p>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 tracking-tight font-mono" id="stat-conteo">0</p>
          </div>

          <!-- Tarjeta de Tendencia -->
          <div class="col-span-2 sm:col-span-4 bg-white/70 border border-slate-200/80 rounded-2xl px-5 py-4 shadow-md flex items-center gap-4 transition-all duration-500 backdrop-blur-md" id="trend-card" style="min-height:95px;">
            <!-- Icono izquierdo -->
            <div class="h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-500" id="trend-icon"></div>

            <!-- Columna central: label | gráfico | descripción -->
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tendencia</span>
                <span id="trend-pinned-indicator" class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full flex items-center gap-1 hidden">
                  📌 <span id="trend-pinned-date">--/--</span>
                  <button type="button" id="btn-reset-trend" class="text-indigo-400 hover:text-indigo-650 font-bold ml-1 cursor-pointer focus:outline-none">×</button>
                </span>
              </div>
              <!-- Sparkline a todo lo ancho -->
              <div style="position:relative;width:100%;">
                <div id="trend-sparkline-wrap" style="width:100%;height:50px;border-radius:8px;overflow:hidden;background:transparent;border:none;">
                  <canvas id="trend-sparkline" height="50" style="display:block;width:100%;height:50px;"></canvas>
                </div>
                <!-- Tooltip del punto final -->
                <div id="sparkline-dot-tooltip"></div>
              </div>
              <span class="text-xs font-normal leading-relaxed text-slate-500 mt-1" id="trend-desc">Cargando tendencia...</span>
            </div>

            <!-- Badge derecho -->
            <div class="shrink-0">
              <span class="text-lg sm:text-xl font-bold font-mono px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 transition-colors duration-500 shadow-sm" id="stat-tendencia">■ 0.0%</span>
            </div>
          </div>
        </div>

        <!-- Filtros de Fecha -->
        <section class="bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-md backdrop-blur-md">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div class="flex flex-wrap items-end gap-4 flex-1">
              <div class="flex flex-col gap-2 flex-1 min-w-[140px]">
                <label for="filtro-desde" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde</label>
                <input type="date" id="filtro-desde" class="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-750 outline-none focus:border-slate-400 transition-all duration-300 shadow-sm" />
              </div>
              <div class="flex flex-col gap-2 flex-1 min-w-[140px]">
                <label for="filtro-hasta" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasta</label>
                <input type="date" id="filtro-hasta" class="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-750 outline-none focus:border-slate-400 transition-all duration-300 shadow-sm" />
              </div>
              <button type="button" id="btn-limpiar-filtros" class="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all duration-350 cursor-pointer shadow-sm shrink-0" hidden>
                Limpiar
              </button>
            </div>
            <div class="shrink-0 text-right sm:text-right">
              <p class="text-xs font-bold text-slate-550 uppercase tracking-wider">Registros Filtrados</p>
              <p class="text-sm font-semibold text-slate-700 mt-1.5" id="filters-summary">Mostrando 0 registros</p>
            </div>
          </div>
        </section>

        <!-- Gráfica de Evolución -->
        <section id="chart-wrapper-section" class="bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-md" style="overflow: visible;">
          <div class="flex justify-between items-start gap-4 mb-6">
            <div>
              <h2 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>📈</span> Evolución temporal
              </h2>
              <p class="text-xs text-slate-500 mt-1">Comparación visual de tus datos en orden cronológico.</p>
            </div>
          </div>
          
          <div id="chart-wrapper">
            <p class="text-sm text-slate-500 py-16 text-center font-light" id="chart-empty">No hay registros para mostrar en el período seleccionado.</p>
            <div id="chart-bars">
              <!-- Barras generadas por JS -->
            </div>
            <div id="chart-labels" style="display:none;"></div>
          </div>
        </section>

        <!-- Ranking Mensual -->
        <section class="bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-md backdrop-blur-md hover:border-slate-350 hover:bg-white/80 transition-all duration-300">
          <div class="mb-5">
            <h2 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏆</span> Ranking mensual
            </h2>
            <p class="text-xs text-slate-500 mt-1">Promedio por mes, ordenado de mejor a menor rendimiento.</p>
          </div>
          
          <div class="flex flex-col gap-3" id="ranking-mensual-list">
            <!-- Items de ranking por JS -->
          </div>
          <p class="text-sm text-slate-500 py-8 text-center font-light" id="ranking-mensual-empty">No hay suficientes registros para calcular un ranking.</p>
        </section>

        <!-- Historial de Registros -->
        <section class="bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-md backdrop-blur-md hover:border-slate-350 hover:bg-white/80 transition-all duration-300">
          <div class="mb-5">
            <h2 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📋</span> Historial completo
            </h2>
            <p class="text-xs text-slate-500 mt-1">Listado detallado de todas tus entradas registradas.</p>
          </div>
          
          <div class="divide-y divide-slate-200/60 max-h-96 overflow-y-auto pr-1" id="history-list">
            <p class="text-sm text-slate-500 py-10 text-center font-light animate-pulse" id="history-empty">Cargando historial...</p>
          </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-xs text-slate-500 mt-4 border-t border-slate-200 pt-6">
          <p>© 2026 Panel de Estadísticas Personales. Todos los derechos reservados.</p>
        </footer>

      </section>
      
    </div>
  </div>

  <script src="assets/js/app.js?v=1.1.6"></script>
</body>
</html>