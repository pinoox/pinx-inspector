      <section id="exportView" class="view hidden">
        <div class="mb-5 flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <div class="text-sm text-slate-500">Development</div>
            <h2 class="mt-1 text-2xl font-black text-white">Snapshots</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Capture a local JSON snapshot of the current Inspector state, including database metadata, routes, migrations, logs, configuration, and app details.</p>
          </div>
          <button type="button" onclick="exportSnapshot()" class="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 hover:bg-violet-400">Take Snapshot</button>
        </div>

        <div id="snapshotEmpty" class="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-white/15 bg-[#091320]/80 p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,.28)]">
          <div class="max-w-lg">
            <div class="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-violet-300/20 bg-violet-500/15 text-violet-100"><?= inspector_icon('download', 'h-7 w-7') ?></div>
            <h3 class="mt-5 text-xl font-black text-white">No snapshot yet</h3>
            <p class="mt-2 text-sm leading-6 text-slate-400">There is no exported snapshot in this Inspector session. Take one now to review or download the current development state.</p>
            <button type="button" onclick="exportSnapshot()" class="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 hover:bg-violet-400">Take Snapshot</button>
          </div>
        </div>

        <div id="snapshotResult" class="hidden overflow-hidden rounded-3xl border border-white/10 bg-[#091320]/90 shadow-[0_24px_90px_rgba(0,0,0,.28)]">
          <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 max-md:flex-col max-md:items-stretch">
            <div>
              <div class="font-bold text-white">Snapshot JSON</div>
              <div id="snapshotMeta" class="mt-1 text-xs text-slate-500">Ready</div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="copyText(document.getElementById('exportOutput')?.textContent || '')" class="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Copy</button>
              <button type="button" onclick="exportSnapshot()" class="rounded-xl bg-violet-500 px-3 py-2 text-sm font-bold text-white hover:bg-violet-400">Take Again</button>
            </div>
          </div>
          <pre id="exportOutput" class="max-h-[68vh] min-h-96 overflow-auto bg-black/35 p-4 text-xs leading-relaxed text-slate-200"></pre>
        </div>
      </section>
