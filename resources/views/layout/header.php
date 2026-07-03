      <header class="sticky top-4 z-30 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a1320]/92 px-4 py-3 shadow-glow backdrop-blur-xl max-md:static max-md:flex-col max-md:items-start">
        <div>
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <span class="flex items-center gap-2 text-slate-200"><span class="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.65)]"></span><span id="runtimeUrl">http://localhost:8000</span></span>
            <span class="h-5 w-px bg-white/10"></span>
            <span id="phpVersion" class="text-slate-400">PHP</span>
            <span class="h-5 w-px bg-white/10"></span>
            <span id="pincoreVersion" class="text-slate-400">Pincore</span>
          </div>
          <h1 id="viewTitle" class="sr-only">Dashboard</h1>
        </div>
        <div class="flex gap-2">
          <button id="refresh" title="Refresh" class="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"><?= inspector_icon('refresh-cw') ?></button>
          <button onclick="runInspectorAction('doctor')" title="Run Doctor" class="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"><?= inspector_icon('stethoscope') ?></button>
          <button id="exportBtn" title="Export JSON" class="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"><?= inspector_icon('download') ?></button>
        </div>
      </header>
