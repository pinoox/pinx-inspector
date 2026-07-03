      <section id="configView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Development / Configuration</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Config</h2><span id="configTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Review and edit app, theme, and frontend config files with a safer file-focused workflow.</p>
              </div>
              <div class="ux-actions">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="configSearch" class="ux-filter w-full pl-9" placeholder="Search config...">
                </div>
                <button onclick="exportSnapshot()" class="ux-btn">Export</button>
              </div>
            </div>
            <div id="configTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div class="grid grid-cols-[250px_1fr] gap-4 max-xl:grid-cols-1">
              <aside class="ux-panel">
                <div class="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <h3 class="font-bold text-white">Configuration Files</h3>
                  <span id="configWritableBadge" class="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">0 writable</span>
                </div>
                <div id="configFiles" class="max-h-[690px] overflow-auto p-2"></div>
              </aside>
              <section class="ux-panel">
                <div id="configEditorHeader" class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 max-lg:flex-col max-lg:items-start"></div>
                <div id="configEditor" class="max-h-[720px] overflow-auto"></div>
              </section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="configDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
