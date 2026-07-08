      <section id="langView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Application / Localization</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Lang</h2><span id="langTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Browse and edit language packages for the app and active theme with scoped filters.</p>
              </div>
              <div class="ux-actions"><button onclick="loadLang()" class="ux-btn">Refresh</button></div>
            </div>
            <div id="langLocaleTabs" class="mb-3 flex flex-wrap gap-2"></div>
            <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div id="langScopeTabs" class="flex flex-wrap gap-2"></div>
              <div class="flex flex-wrap gap-2">
                <button type="button" onclick="openLangToolModal('copy')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Copy locale</button>
                <button type="button" onclick="openLangToolModal('sync')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Sync missing keys</button>
              </div>
            </div>
            <div class="ux-toolbar">
              <div class="relative min-w-72 max-lg:min-w-0">
                <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                <input id="langSearch" class="ux-filter w-full pl-9" placeholder="Search language files...">
              </div>
              <button onclick="renderLang()" class="ux-btn">Filter</button>
            </div>
            <div id="langSummary" class="mb-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
            <div class="grid grid-cols-[290px_1fr] gap-4 max-xl:grid-cols-1">
              <aside class="ux-panel">
                <div class="border-b border-white/10 px-4 py-4"><h3 class="font-bold text-white">Language Files</h3></div>
                <div id="langFiles" class="max-h-[690px] overflow-auto p-2"></div>
              </aside>
              <section class="ux-panel">
                <div id="langEditorHeader" class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 max-lg:flex-col max-lg:items-start"></div>
                <div id="langEditor" class="max-h-[720px] overflow-auto"></div>
                <div id="langEditorFooter" class="border-t border-white/10 px-4 py-3 text-sm text-slate-500"></div>
              </section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="langDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
