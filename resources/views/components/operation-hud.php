  <div id="operationHud" class="pointer-events-none fixed bottom-5 right-5 hidden w-[min(420px,calc(100vw-40px))] overflow-hidden rounded-3xl border border-white/10 bg-[#08111f]/95 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-xl" style="z-index:80">
    <div class="flex items-start gap-3 p-4">
      <div id="operationIcon" class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-200">
        <span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      </div>
      <div class="min-w-0 flex-1">
        <div id="operationTitle" class="font-bold text-white">Working</div>
        <div id="operationMessage" class="mt-1 text-sm leading-relaxed text-slate-400">Please wait...</div>
        <div id="operationProgress" class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-sky-300"></div>
        </div>
      </div>
    </div>
  </div>