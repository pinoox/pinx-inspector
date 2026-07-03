      <section id="buildView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Release / Package</div>
                <h2 class="ux-page-title">Build & Release</h2>
                <p class="ux-page-copy">Validate readiness, build .pinx packages, and run signed release actions from a single guided page.</p>
              </div>
              <div class="ux-actions">
                <button onclick="runInspectorAction('build')" class="ux-btn ux-btn-primary">Build .pinx</button>
                <button onclick="runInspectorAction('build_sign')" class="ux-btn ux-btn-success">Build Signed</button>
                <button onclick="runInspectorAction('release_patch')" class="ux-btn">Release Patch</button>
              </div>
            </div>
            <div id="buildActionResult" class="mb-4 hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
            <div id="buildSummary" class="mb-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
            <div class="grid grid-cols-[1fr_.9fr] gap-4 max-xl:grid-cols-1">
              <section class="ux-card p-4">
                <div class="mb-4 flex items-center justify-between gap-3">
                  <h3 class="font-bold text-white">Release Readiness</h3>
                  <button onclick="loadBuild()" class="ux-btn px-3 py-2 text-xs">Refresh</button>
                </div>
                <div id="buildChecks" class="space-y-2"></div>
              </section>
              <section class="ux-panel">
                <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <h3 class="font-bold text-white">Export Files</h3>
                  <span id="buildExportPath" class="max-w-[220px] truncate text-xs text-slate-500"></span>
                </div>
                <div id="buildExports" class="divide-y divide-white/10"></div>
              </section>
            </div>
            <section class="ux-card mt-4 p-4">
              <h3 class="font-bold text-white">Workflow</h3>
              <div class="mt-4 grid grid-cols-3 gap-3 max-xl:grid-cols-1">
                <div class="rounded-2xl border border-white/10 bg-black/20 p-4"><div class="text-xs uppercase tracking-wide text-violet-300">1</div><div class="mt-1 font-bold text-white">Check manifest</div><p class="mt-1 text-sm text-slate-500">Reads package, version, minpin, and sign options from app.php.</p></div>
                <div class="rounded-2xl border border-white/10 bg-black/20 p-4"><div class="text-xs uppercase tracking-wide text-sky-300">2</div><div class="mt-1 font-bold text-white">Build package</div><p class="mt-1 text-sm text-slate-500">Runs the same Pinx build command used by the CLI.</p></div>
                <div class="rounded-2xl border border-white/10 bg-black/20 p-4"><div class="text-xs uppercase tracking-wide text-emerald-300">3</div><div class="mt-1 font-bold text-white">Release safely</div><p class="mt-1 text-sm text-slate-500">Release patch bumps version-code and builds the package.</p></div>
              </div>
            </section>
          </div>
          <aside class="ux-detail">
            <div id="buildDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
