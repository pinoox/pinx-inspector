      <section id="databaseView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Database / Tables <span id="tableBreadcrumb" class="hidden items-center gap-2 normal-case tracking-normal"><span>/</span><strong class="text-slate-100"></strong></span></div>
            <h2 class="ux-page-title">Tables</h2>
            <p class="ux-page-copy">Browse data, inspect schema, add development rows, and review relations from the active Pinoox connection.</p>
          </div>
          <div class="ux-actions">
            <button onclick="openSchemaBuilder('table')" class="ux-btn ux-btn-primary">Add Table</button>
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
              <button type="button" onclick="loadTables({ autoOpen: false })" title="Refresh tables" class="ux-btn grid w-11 place-items-center px-0"><?= inspector_icon('refresh-cw') ?></button>
            </div>
            <div class="mb-3 flex items-center justify-between px-1 text-xs text-slate-500">
              <label class="inline-flex items-center gap-2"><input id="tableListSelectAll" type="checkbox" class="h-3.5 w-3.5 rounded border-slate-600 bg-black/30 text-violet-500" onchange="toggleAllTableListSelection(this.checked)"><span>Tables</span></label>
              <span id="tableCountDb" class="rounded-full bg-white/10 px-2 py-0.5 text-slate-300"></span>
            </div>
            <div id="tableBulkActions" class="mb-3 flex gap-2">
              <button id="emptySelectedTablesBtn" onclick="emptySelectedTables()" disabled class="flex-1 rounded-xl border border-amber-300/25 bg-amber-500/10 px-2 py-1.5 text-xs font-bold text-amber-100 opacity-50 hover:bg-amber-500/20 disabled:cursor-not-allowed">Empty</button>
              <button id="dropSelectedTablesBtn" onclick="dropSelectedTables()" disabled class="flex-1 rounded-xl border border-rose-300/30 bg-rose-500/15 px-2 py-1.5 text-xs font-bold text-rose-100 opacity-50 hover:bg-rose-500/25 disabled:cursor-not-allowed">Drop</button>
            </div>
            <div id="tablesDb" class="max-h-[520px] space-y-1 overflow-auto pr-1"></div>
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
