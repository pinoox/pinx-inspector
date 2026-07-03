      <section id="healthView" class="view hidden space-y-4">
        <div class="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 max-md:flex-col max-md:items-start">
          <div><h2 class="font-bold">Health Center</h2><p class="mt-1 text-sm text-slate-400">Doctor checks are grouped into clear actions instead of terminal text.</p></div>
          <button onclick="runInspectorAction('doctor')" class="rounded-xl bg-teal-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-teal-200">Run Doctor</button>
        </div>
        <div id="healthActionResult" class="hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
        <div id="healthSummary" class="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
        <div id="healthContent" class="grid grid-cols-2 gap-4 max-xl:grid-cols-1"></div>
      </section>