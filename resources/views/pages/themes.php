      <section id="themesView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Appearance / Themes</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Themes</h2><span id="themesTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Inspect installed themes, active theme metadata, paths, and compatibility information.</p>
              </div>
              <div class="ux-actions"><button onclick="loadThemes()" class="ux-btn">Refresh</button></div>
            </div>
            <div class="ux-toolbar">
              <div class="flex flex-wrap gap-2">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="themeSearch" class="ux-filter w-full pl-9" placeholder="Search themes...">
                </div>
                <button onclick="renderThemes()" class="ux-btn">Filter</button>
              </div>
            </div>
            <div id="themesSummary" class="mb-4 grid grid-cols-3 gap-3 max-lg:grid-cols-1"></div>
            <div class="ux-panel">
              <div id="themesContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="themeDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
