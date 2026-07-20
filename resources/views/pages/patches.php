      <section id="patchesView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Application / Data</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Patches</h2><span id="patchesTotalBadge" class="rounded-xl bg-teal-400/20 px-3 py-1 text-sm font-bold text-teal-200">0</span></div>
                <p class="ux-page-copy">Run, inspect, and roll back one-off data patches from a single workspace.</p>
              </div>
              <div class="ux-actions">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="patchSearch" class="ux-filter w-full pl-9" placeholder="Search patches...">
                </div>
                <button onclick="refreshPatches()" class="ux-btn">Refresh</button>
                <button onclick="runInspectorAction('patch_run')" class="ux-btn ux-btn-primary">Run Pending</button>
              </div>
            </div>
            <div id="patchTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div id="patchesActionResult" class="mb-4 hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
            <div class="ux-panel">
              <div id="patchesContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="patchDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
