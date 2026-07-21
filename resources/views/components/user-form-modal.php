  <div id="userFormModal" class="fixed inset-0 hidden items-center justify-center bg-black/70 p-4 backdrop-blur-sm" style="z-index:70">
    <div class="w-full max-w-lg rounded-3xl border border-white/10 bg-[#08111f] shadow-[0_28px_90px_rgba(0,0,0,.55)]">
      <div class="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <div id="userFormEyebrow" class="text-xs font-bold uppercase tracking-wider text-sky-300">Users</div>
          <div id="userFormTitle" class="mt-1 text-lg font-black text-white">New user</div>
          <div id="userFormCopy" class="mt-1 text-sm text-slate-400">Create a user in the active app transport scope.</div>
        </div>
        <button type="button" onclick="closeUserForm()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">x</button>
      </div>
      <form id="userForm" class="space-y-3 px-5 py-4" onsubmit="event.preventDefault(); submitUserForm();">
        <input type="hidden" id="userFormMode" value="create">
        <input type="hidden" id="userFormId" value="">
        <div id="userFormFields" class="grid gap-3"></div>
        <div id="userFormError" class="hidden rounded-2xl border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"></div>
      </form>
      <div class="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
        <button type="button" onclick="closeUserForm()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
        <button type="button" id="userFormSubmit" onclick="submitUserForm()" class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400">Save</button>
      </div>
    </div>
  </div>
