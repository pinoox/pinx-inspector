      <section id="dashboardView" class="view space-y-6">
        <div id="overview" class="grid grid-cols-5 gap-3 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
        <div id="appProfile" class="rounded-3xl border border-white/10 bg-[#091320]/90 p-5 shadow-[0_18px_70px_rgba(0,0,0,.22)]"></div>
        <div class="grid grid-cols-2 gap-3 max-xl:grid-cols-1">
          <section class="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1320]/80">
            <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 class="font-bold">Recent Requests</h2>
              <button onclick="switchView('routes')" class="text-sm font-semibold text-violet-300">View all</button>
            </div>
            <div id="recentRequests" class="divide-y divide-white/10"></div>
          </section>
          <section class="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1320]/80">
            <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 class="font-bold">Recent Logs</h2>
              <button onclick="switchView('logs')" class="text-sm font-semibold text-violet-300">View all</button>
            </div>
            <div id="recentLogs" class="divide-y divide-white/10"></div>
          </section>
        </div>
        <div class="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
          <button onclick="runInspectorAction('doctor')" class="group relative overflow-hidden rounded-2xl border border-emerald-300/25 bg-[#0a1720]/95 p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-emerald-300/55 hover:bg-[#0d2130] focus:outline-none focus:ring-2 focus:ring-emerald-300/50">
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"></div>
            <div class="flex items-center gap-4">
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-emerald-300"><svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-5"/><path d="M12 3a9 9 0 1 0 9 9"/></svg></span>
              <span class="min-w-0 flex-1"><span class="block text-[11px] font-bold uppercase tracking-wide text-emerald-300/80">Smart check</span><span class="mt-1 block text-lg font-black text-white">Run Doctor</span><span class="mt-1 block text-sm text-slate-400">Health checks rendered as Inspector cards.</span></span>
              <span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-emerald-200 transition group-hover:bg-emerald-300 group-hover:text-slate-950">Run</span>
            </div>
          </button>
          <button onclick="runInspectorAction('migrate')" class="group relative overflow-hidden rounded-2xl border border-sky-300/25 bg-[#0b1628]/95 p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-sky-300/55 hover:bg-[#0d1d35] focus:outline-none focus:ring-2 focus:ring-sky-300/50">
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"></div>
            <div class="flex items-center gap-4">
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/12 text-sky-300"><svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7c0 2 4 3 8 3s8-1 8-3-4-3-8-3-8 1-8 3Z"/><path d="M4 7v10c0 2 4 3 8 3s8-1 8-3V7"/><path d="M4 12c0 2 4 3 8 3s8-1 8-3"/></svg></span>
              <span class="min-w-0 flex-1"><span class="block text-[11px] font-bold uppercase tracking-wide text-sky-300/80">Schema workflow</span><span class="mt-1 block text-lg font-black text-white">Run Migrations</span><span class="mt-1 block text-sm text-slate-400">Build or refresh database structure.</span></span>
              <span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-sky-200 transition group-hover:bg-sky-300 group-hover:text-slate-950">Run</span>
            </div>
          </button>
          <button onclick="switchView('routes')" class="group relative overflow-hidden rounded-2xl border border-violet-300/25 bg-[#111226]/95 p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-violet-300/55 hover:bg-[#171536] focus:outline-none focus:ring-2 focus:ring-violet-300/50">
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent"></div>
            <div class="flex items-center gap-4">
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/12 text-violet-300"><svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h12"/><path d="M6 12h12"/><path d="M6 17h12"/><path d="M3 7h.01M3 12h.01M3 17h.01"/></svg></span>
              <span class="min-w-0 flex-1"><span class="block text-[11px] font-bold uppercase tracking-wide text-violet-300/80">App map</span><span class="mt-1 block text-lg font-black text-white">Inspect Routes</span><span class="mt-1 block text-sm text-slate-400">Open route files, methods, and actions.</span></span>
              <span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-violet-200 transition group-hover:bg-violet-300 group-hover:text-slate-950">Open</span>
            </div>
          </button>
        </div>
        <div id="actionResult" class="hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
        <div id="recommendations" class="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1"></div>
        <div class="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
          <button onclick="switchView('connections')" class="rounded-2xl border border-white/10 bg-[#0a1320]/80 p-5 text-left transition hover:border-violet-300/35 hover:bg-[#101b2e]">
            <div class="text-xs font-bold uppercase tracking-wider text-violet-300">Database</div>
            <div class="mt-2 text-lg font-black text-white">Connections</div>
            <div class="mt-1 text-sm text-slate-400">Review connection, DevDB storage, and core table readiness.</div>
          </button>
          <button onclick="switchView('database')" class="rounded-2xl border border-white/10 bg-[#0a1320]/80 p-5 text-left transition hover:border-violet-300/35 hover:bg-[#101b2e]">
            <div class="text-xs font-bold uppercase tracking-wider text-violet-300">Tables</div>
            <div class="mt-2 text-lg font-black text-white">Open Table Explorer</div>
            <div class="mt-1 text-sm text-slate-400">Browse tables, inspect columns, search rows, and paginate data.</div>
          </button>
        </div>
      </section>