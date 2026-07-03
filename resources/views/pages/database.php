      <section id="databaseView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Database / Tables <span id="tableBreadcrumb" class="hidden items-center gap-2 normal-case tracking-normal"><span>/</span><strong class="text-slate-100"></strong></span></div>
            <h2 class="ux-page-title">Tables</h2>
            <p class="ux-page-copy">Browse data, inspect schema, add development rows, and review relations from the active Pinoox connection.</p>
          </div>
          <div class="ux-actions">
            <button onclick="loadTables()" class="ux-btn">Refresh</button>
            <button onclick="runInspectorAction('migrate')" class="ux-btn ux-btn-success">Run Migrations</button>
          </div>
        </div>
        <div class="grid grid-cols-[280px_1fr] gap-4 max-xl:grid-cols-1">
          <aside class="ux-card min-h-[680px] p-3">
            <div class="mb-3 flex gap-2">
              <div class="relative min-w-0 flex-1">
                <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                <input id="tableFilter" class="ux-filter w-full pl-9" placeholder="Search tables...">
              </div>
              <button onclick="renderTableList($('tablesDb'))" title="Refresh tables" class="ux-btn grid w-11 place-items-center px-0"><?= inspector_icon('refresh-cw') ?></button>
            </div>
            <div class="mb-3 flex items-center justify-between px-1 text-xs text-slate-500">
              <span>Tables</span>
              <span id="tableCountDb" class="rounded-full bg-white/10 px-2 py-0.5 text-slate-300"></span>
            </div>
            <div id="tablesDb" class="max-h-[560px] space-y-1 overflow-auto pr-1"></div>
            <div class="ux-helper mt-4">Schema comes from migrations. Use this page for local inspection and development data, not production administration.</div>
          </aside>
          <div id="databaseContent" class="ux-panel min-h-[680px] text-slate-400">
            <div class="grid h-full min-h-[680px] place-items-center p-8 text-center">
              <div>
                <div class="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><?= inspector_icon('database', 'h-7 w-7') ?></div>
                <div class="mt-4 text-lg font-black text-white">Select a table</div>
                <div class="mt-1 text-sm text-slate-500">Choose a table from the left sidebar to browse rows and inspect structure.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
