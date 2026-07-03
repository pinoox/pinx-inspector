      <section id="logsView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Runtime / Logs</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Logs</h2><span id="logsTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Read latest application events, search messages, inspect JSON context, and clean local log files when needed.</p>
              </div>
              <div class="ux-actions">
                <button onclick="toggleLogLive()" class="ux-btn ux-btn-success">Live</button>
                <button onclick="clearLogFilters()" class="ux-btn">Reset</button>
                <button onclick="clearLogs()" class="ux-btn ux-btn-danger">Clear Logs</button>
              </div>
            </div>
            <div class="ux-toolbar">
              <div id="logLevelTabs" class="flex flex-wrap gap-2"></div>
              <div class="flex flex-wrap gap-2">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="logSearch" class="ux-filter w-full pl-9" placeholder="Search logs...">
                </div>
                <button onclick="renderLogs()" class="ux-btn">Filter</button>
              </div>
            </div>
            <div class="ux-panel">
              <div id="logsContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="logDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
