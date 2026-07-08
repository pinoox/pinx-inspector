  <div id="langToolsModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onclick="if (event.target === this) closeLangToolModal()">
    <div class="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#08111f] shadow-[0_28px_90px_rgba(0,0,0,.55)]">
      <div class="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <div id="langToolsModalTitle" class="text-lg font-black text-white">Locale tools</div>
          <div id="langToolsModalSubtitle" class="mt-1 text-xs text-slate-500">Manage language packages across locales.</div>
        </div>
        <button type="button" onclick="closeLangToolModal()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-200 hover:bg-white/10">Close</button>
      </div>
      <div id="langCopyPanel" class="hidden space-y-4 p-5">
        <p class="text-sm leading-relaxed text-slate-400">Duplicate all language files from one locale into a new locale folder. Existing target files are skipped.</p>
        <label class="block text-xs text-slate-400">Copy from
          <select id="langCopySource" class="ux-filter mt-2 w-full"></select>
        </label>
        <label class="block text-xs text-slate-400">New locale
          <input id="langCopyTarget" class="ux-filter mt-2 w-full" placeholder="ar">
        </label>
        <div class="flex justify-end gap-2 border-t border-white/10 pt-4">
          <button type="button" onclick="closeLangToolModal()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
          <button type="button" onclick="copyLangLocale()" class="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white hover:bg-violet-400">Copy locale</button>
        </div>
      </div>
      <div id="langSyncPanel" class="hidden space-y-4 p-5">
        <p class="text-sm leading-relaxed text-slate-400">Add missing translation keys from a reference locale into all files of the target locale.</p>
        <label class="block text-xs text-slate-400">Sync reference
          <select id="langSyncReference" class="ux-filter mt-2 w-full"></select>
        </label>
        <label class="block text-xs text-slate-400">Target locale
          <select id="langSyncTarget" class="ux-filter mt-2 w-full"></select>
        </label>
        <div class="flex justify-end gap-2 border-t border-white/10 pt-4">
          <button type="button" onclick="closeLangToolModal()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
          <button type="button" onclick="syncLangLocale()" class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400">Sync missing keys</button>
        </div>
      </div>
    </div>
  </div>
