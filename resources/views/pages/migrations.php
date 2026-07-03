      <section id="migrationsView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Database / Schema</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Migrations</h2><span id="migrationsTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Review migration status, preview schema changes, and run pending migrations from one focused workspace.</p>
              </div>
              <div class="ux-actions">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="migrationSearch" class="ux-filter w-full pl-9" placeholder="Search migrations...">
                </div>
                <button onclick="refreshMigrations()" class="ux-btn">Refresh</button>
                <button onclick="runInspectorAction('migrate')" class="ux-btn ux-btn-primary">Run Pending</button>
              </div>
            </div>
            <div id="migrationTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div id="migrationsActionResult" class="mb-4 hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
            <div class="ux-panel">
              <div id="migrationsContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="migrationDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
