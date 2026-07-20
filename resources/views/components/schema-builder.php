  <div id="schemaBuilderModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#08111f] shadow-[0_28px_90px_rgba(0,0,0,.55)]">
      <div class="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <div id="schemaBuilderEyebrow" class="text-xs font-bold uppercase tracking-wider text-violet-300">Schema Builder</div>
          <div id="schemaBuilderTitle" class="mt-1 text-lg font-black text-white">Create table</div>
          <div id="schemaBuilderCopy" class="mt-1 text-sm text-slate-400">Design columns, then create the table and/or migration file.</div>
        </div>
        <button type="button" onclick="closeSchemaBuilder()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">x</button>
      </div>
      <div id="schemaBuilderBody" class="min-h-0 flex-1 overflow-auto p-5"></div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
        <div id="schemaBuilderHint" class="text-xs text-slate-500">Migration code uses $this-&gt;table() so package prefixes stay correct.</div>
        <div class="flex flex-wrap gap-2">
          <button type="button" onclick="closeSchemaBuilder()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
          <button type="button" onclick="previewSchemaBuilder()" class="rounded-xl border border-violet-300/25 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-100 hover:bg-violet-500/20">Preview Code</button>
          <button type="button" id="schemaBuilderSubmit" onclick="submitSchemaBuilder()" class="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white hover:bg-violet-400">Create</button>
        </div>
      </div>
    </div>
  </div>
