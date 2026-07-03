      <section id="envView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Development / Local Settings</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Environment</h2><span id="envTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
                <p class="ux-page-copy">Keep local settings short and explicit while Pinoox auto-detects sensible development defaults.</p>
              </div>
              <div class="ux-actions">
                <button onclick="loadEnv()" class="ux-btn">Refresh</button>
                <button onclick="saveEnvFile()" class="ux-btn ux-btn-primary">Save .env</button>
              </div>
            </div>
            <div id="envSummary" class="mb-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
            <div class="grid grid-cols-[320px_1fr] gap-4 max-xl:grid-cols-1">
              <aside class="ux-panel">
                <div class="border-b border-white/10 px-4 py-4"><h3 class="font-bold text-white">Detected Values</h3></div>
                <div id="envItems" class="max-h-[650px] overflow-auto p-3"></div>
              </aside>
              <section class="ux-panel">
                <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div><h3 class="font-bold text-white">.env Editor</h3><p class="mt-1 text-xs text-slate-500">Keep this file short; defaults are auto-detected by Pinoox.</p></div>
                  <button onclick="applyEnvPreset()" class="ux-btn ux-btn-success px-3 py-2 text-xs">Development Preset</button>
                </div>
                <textarea id="envEditor" spellcheck="false" class="min-h-[620px] w-full resize-y bg-[#06101c] p-5 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-violet-300/35"></textarea>
              </section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="envDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
