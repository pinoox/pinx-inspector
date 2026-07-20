  <div id="confirmModal" class="fixed inset-0 hidden items-center justify-center bg-black/70 p-4 backdrop-blur-sm" style="z-index:70">
    <div class="w-full max-w-md rounded-3xl border border-white/10 bg-[#08111f] p-5 shadow-[0_28px_90px_rgba(0,0,0,.55)]">
      <div id="confirmTitle" class="text-lg font-black text-white">Confirm action</div>
      <div id="confirmMessage" class="mt-2 text-sm leading-relaxed text-slate-400"></div>
      <div class="mt-5 flex justify-end gap-2">
        <button id="confirmCancel" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
        <button id="confirmOk" class="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-400">Confirm</button>
      </div>
    </div>
  </div>