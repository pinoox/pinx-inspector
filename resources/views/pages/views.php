      <section id="viewsView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Application / Templates</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Views</h2><span id="viewsTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Browse, inspect, and edit app and theme view templates without leaving the development workspace.</p>
              </div>
              <div class="ux-actions">
                <button onclick="refreshViews()" class="ux-btn">Refresh</button>
              </div>
            </div>
            <div id="viewTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div class="ux-toolbar">
              <div class="relative min-w-72 max-lg:min-w-0">
                <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                <input id="viewSearch" class="ux-filter w-full pl-9" placeholder="Search views...">
              </div>
              <button onclick="applyViewFilter()" class="ux-btn">Filter</button>
            </div>
            <div class="grid grid-cols-[270px_1fr] gap-4 max-xl:grid-cols-1">
              <aside class="ux-panel">
                <div class="border-b border-white/10 px-4 py-4"><h3 class="font-bold text-white">View Files</h3></div>
                <div id="viewFiles" class="max-h-[690px] overflow-auto p-2"></div>
              </aside>
              <section class="ux-panel">
                <div id="viewEditorHeader" class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 max-lg:flex-col max-lg:items-start"></div>
                <div id="viewEditor" class="max-h-[720px] overflow-auto"></div>
                <div id="viewEditorFooter" class="border-t border-white/10 px-4 py-3 text-sm text-slate-500"></div>
              </section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="viewDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
