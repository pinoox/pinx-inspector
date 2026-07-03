      <section id="connectionsView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Database / Connections</div>
            <h2 class="ux-page-title">Connections</h2>
            <p class="ux-page-copy">Check the active connection, DevDB storage, and required Pincore tables before running app workflows.</p>
          </div>
          <div class="ux-actions">
            <button onclick="loadDatabase()" class="ux-btn">Refresh</button>
            <button onclick="runInspectorAction('migrate')" class="ux-btn ux-btn-primary">Run Migrations</button>
          </div>
        </div>
        <div id="databaseOverview" class="mb-4 grid grid-cols-4 gap-4 max-2xl:grid-cols-2 max-md:grid-cols-1"></div>
        <div id="databaseWarnings" class="mb-4 grid grid-cols-2 gap-4 max-xl:grid-cols-1"></div>
        <div class="ux-two-pane">
          <div class="ux-panel min-h-[520px]">
            <div class="flex items-center justify-between gap-3 border-b border-white/10 p-4 max-lg:flex-col max-lg:items-stretch">
              <h3 class="font-bold text-white">Connections</h3>
              <div class="relative min-w-72 max-lg:min-w-0">
                <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                <input id="connectionSearch" class="ux-filter w-full pl-9" placeholder="Search connections...">
              </div>
            </div>
            <div id="connectionRows" class="overflow-auto"></div>
          </div>
          <aside class="ux-card min-h-[520px] p-4">
            <div id="connectionDetails"></div>
          </aside>
        </div>
        <div class="mt-4 grid grid-cols-[1.1fr_.9fr] gap-4 max-xl:grid-cols-1">
          <div class="ux-card p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div><h2 class="font-bold">DevDB Storage</h2><p class="mt-1 text-sm text-slate-400">Local files used by DevDB and migration metadata.</p></div>
              <span id="databaseStoragePath" class="max-w-full truncate rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-400"></span>
            </div>
            <div id="databaseStorage" class="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1"></div>
          </div>
          <div class="ux-card p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div><h2 class="font-bold">Core Tables</h2><p class="mt-1 text-sm text-slate-400">Pincore tables matched against this connection.</p></div>
              <span id="coreTablesSummary" class="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"></span>
            </div>
            <div id="coreTables" class="max-h-72 space-y-2 overflow-auto pr-1"></div>
          </div>
        </div>
      </section>
