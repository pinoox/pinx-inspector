  <div id="detailDrawer" class="fixed inset-0 z-50 hidden bg-black/55 backdrop-blur-sm">
    <button onclick="closeDetailDrawer()" class="absolute inset-0 h-full w-full cursor-default" aria-label="Close details"></button>
    <aside class="absolute right-0 top-0 flex h-full w-[min(520px,100vw)] flex-col border-l border-white/10 bg-[#07111f] shadow-[0_28px_120px_rgba(0,0,0,.6)]">
      <div class="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <div id="detailDrawerEyebrow" class="text-xs font-bold uppercase tracking-wider text-violet-300">Inspector Details</div>
          <div id="detailDrawerTitle" class="mt-1 text-lg font-black text-white">Details</div>
        </div>
        <button onclick="closeDetailDrawer()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">x</button>
      </div>
      <div id="detailDrawerBody" class="min-h-0 flex-1 overflow-auto p-4"></div>
    </aside>
  </div>