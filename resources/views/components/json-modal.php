  <div id="jsonModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div class="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a1320] shadow-2xl">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div><strong>JSON Viewer</strong><div class="text-xs text-slate-500">Structured log context</div></div>
        <button onclick="closeJsonViewer()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-200">Close</button>
      </div>
      <pre id="jsonViewerContent" class="max-h-[70vh] overflow-auto p-4 text-xs leading-relaxed text-slate-200"></pre>
    </div>
  </div>