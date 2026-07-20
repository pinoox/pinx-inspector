      <section id="setupView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Project / Bootstrap</div>
            <div class="flex items-center gap-3"><h2 class="ux-page-title">Setup</h2><span id="setupReadyBadge" class="rounded-xl bg-emerald-400/20 px-3 py-1 text-sm font-bold text-emerald-200">Ready</span></div>
            <p class="ux-page-copy">One click to install dependencies, run migrations, seed data, and apply patches.</p>
          </div>
          <div class="ux-actions">
            <button onclick="refreshSetup()" class="ux-btn">Refresh</button>
            <button onclick="runProjectSetup()" class="ux-btn ux-btn-primary">Run Full Setup</button>
          </div>
        </div>

        <div id="setupActionResult" class="mb-4 hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>

        <div class="grid grid-cols-[1.2fr_.8fr] gap-4 max-xl:grid-cols-1">
          <div class="space-y-4">
            <div class="ux-panel p-5">
              <h3 class="text-lg font-black text-white">What will run</h3>
              <p class="mt-1 text-sm text-slate-400">Toggle the steps you need, then run setup once.</p>
              <div id="setupStepOptions" class="mt-4 grid gap-3"></div>
            </div>
            <div class="ux-panel p-5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <h3 class="text-lg font-black text-white">Progress</h3>
                <span id="setupProgressLabel" class="text-xs font-bold uppercase tracking-wide text-slate-400">Idle</span>
              </div>
              <div id="setupProgressList" class="space-y-3"></div>
            </div>
          </div>
          <aside class="space-y-4">
            <div class="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-5 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
              <div class="text-xs font-bold uppercase tracking-wide text-emerald-200/80">Recommended</div>
              <div class="mt-2 text-xl font-black text-white">Full local setup</div>
              <p class="mt-2 text-sm leading-relaxed text-emerald-50/80">Installs Composer/npm packages, builds schema, seeds data, and runs patches for the active app.</p>
              <button onclick="runProjectSetup()" class="mt-4 w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-emerald-200">Run Full Setup</button>
            </div>
            <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-5">
              <h3 class="font-bold text-white">Current status</h3>
              <div id="setupStatusCards" class="mt-4 grid gap-3"></div>
            </div>
            <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-5">
              <h3 class="font-bold text-white">Quick paths</h3>
              <div class="mt-4 grid gap-2">
                <button onclick="switchView('migrations')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Open Migrations</button>
                <button onclick="switchView('patches')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Open Patches</button>
                <button onclick="runInspectorAction('doctor')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Run Doctor</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
