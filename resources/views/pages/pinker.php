      <section id="pinkerView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Pinker / Cache</div>
                <h2 class="ux-page-title">Pinker</h2>
                <p class="ux-page-copy">Inspect Pinker cache health, cached routes, cached views, config metadata, and local cache files used by your single-app workflow.</p>
              </div>
              <div class="ux-actions"><button onclick="runPinkerAction('status')" class="ux-btn">Refresh Status</button></div>
            </div>
            <div id="pinkerTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div class="ux-card mb-4 p-4">
              <div class="flex flex-wrap gap-3">
                <button onclick="runPinkerAction('rebuild')" class="ux-btn ux-btn-primary">Rebuild Pinker</button>
                <button onclick="runPinkerAction('clear')" class="ux-btn">Clear Pinker Cache</button>
                <button onclick="runPinkerAction('status')" class="ux-btn">Refresh Status</button>
              </div>
            </div>
            <section class="ux-card p-4">
              <h3 class="mb-4 font-bold text-white">Pinker Overview</h3>
              <div id="pinkerOverview" class="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
            </section>
            <div class="mt-4 grid grid-cols-[1.1fr_.9fr] gap-4 max-xl:grid-cols-1">
              <section class="ux-card p-4">
                <h3 class="font-bold text-white">Cache Health</h3>
                <div id="pinkerBuildStatus" class="mt-4 grid grid-cols-[150px_1fr] gap-5 max-sm:grid-cols-1"></div>
              </section>
              <section class="ux-panel">
                <div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><h3 class="font-bold text-white">Recent Cache Files</h3><button onclick="runPinkerAction('status')" class="text-sm font-bold text-violet-300">Refresh</button></div>
                <div id="pinkerRecentBuilds" class="divide-y divide-white/10"></div>
              </section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="pinkerDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
