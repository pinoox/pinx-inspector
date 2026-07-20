    <aside class="sticky top-0 h-screen overflow-y-auto border-r border-white/10 bg-[#07101b]/92 p-4 shadow-[18px_0_70px_rgba(0,0,0,.28)] backdrop-blur-xl max-lg:static max-lg:h-auto max-lg:border-b max-lg:border-r-0">
      <div class="mb-6 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-500/15 text-violet-200 shadow-[0_0_34px_rgba(139,92,246,.22)]">
          <svg viewBox="0 0 48 48" class="h-7 w-7" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" d="M24 5 40 14v20l-16 9-16-9V14L24 5Z"/><path fill="none" stroke="currentColor" stroke-width="2.4" d="m8 14 16 9 16-9M24 23v20M16 18.5l16-9"/></svg>
        </div>
        <div>
          <div class="flex items-center gap-2"><div class="text-lg font-black tracking-tight">Pinx Inspector</div><span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">v1.7.3</span></div>
          <div class="text-xs text-slate-400">Runtime and database monitor</div>
        </div>
      </div>
      <div class="mobile-quick-nav mb-4 hidden gap-2 overflow-x-auto pb-1">
        <button data-view="dashboard" class="nav-btn rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Dashboard</button>
        <button data-view="database" class="nav-btn rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Tables</button>
        <button data-view="query" class="nav-btn rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Query</button>
        <button data-view="logs" class="nav-btn rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Logs</button>
        <button data-view="build" class="nav-btn rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Build</button>
      </div>
      <nav class="space-y-4">
        <div class="rounded-2xl border border-white/8 bg-white/[.035] p-3">
          <div class="text-xs text-slate-400">Application</div>
          <div id="sideAppName" class="mt-1 truncate text-sm font-bold">Loading</div>
          <div class="mt-2 flex items-center gap-2 text-xs text-emerald-300"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>Running</div>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Start</div>
          <button data-view="dashboard" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Dashboard</button>
          <button data-view="setup" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Setup</button>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Database</div>
          <button data-view="connections" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Connections</button>
          <button data-view="database" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Tables</button>
          <button data-view="query" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Query</button>
          <button data-view="migrations" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Migrations</button>
          <button data-view="patches" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Patches</button>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Application</div>
          <button data-view="routes" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Routes</button>
          <button data-view="users" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Users</button>
          <button data-view="views" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Views</button>
          <button data-view="lang" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Lang</button>
          <button data-view="flow" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Flow</button>
          <button data-view="health" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Health</button>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Runtime</div>
          <button data-view="schedule" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Schedule</button>
          <button data-view="logs" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Logs</button>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Package</div>
          <button data-view="themes" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Themes</button>
          <button data-view="pinker" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Pinker Cache</button>
        </div>
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Development</div>
          <button data-view="build" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Build & Release</button>
          <button data-view="env" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">.env</button>
          <button data-view="config" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Config</button>
          <button data-view="export" class="nav-btn w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10">Snapshots</button>
        </div>
      </nav>
      <div class="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-4">
        <div class="text-xs uppercase tracking-wider text-slate-500">Active app</div>
        <div id="appName" class="mt-1 font-semibold">Loading</div>
        <div id="package" class="mt-1 break-all text-xs text-slate-400"></div>
      </div>
      <div class="mt-3 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
        <div class="text-xs uppercase tracking-wider text-teal-200/80">Connection</div>
        <div id="engine" class="mt-1 text-sm font-semibold text-teal-200">Database</div>
      </div>
    </aside>
