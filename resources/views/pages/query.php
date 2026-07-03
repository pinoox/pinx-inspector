      <section id="queryView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Database / Query</div>
            <h2 class="ux-page-title">Query Builder</h2>
            <p class="ux-page-copy">Build a safe visual query, preview SQL, then run it against the active development connection.</p>
          </div>
          <div class="ux-actions">
            <button onclick="resetQueryBuilder()" class="ux-btn">New</button>
            <button onclick="saveVisualQuery()" class="ux-btn">Save</button>
            <button onclick="runVisualQuery()" class="ux-btn ux-btn-primary">Run Query</button>
          </div>
        </div>
        <div class="ux-toolbar">
          <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300"><span class="rounded-full bg-emerald-400/10 px-3 py-1 font-bold text-emerald-300">Connected</span><span id="queryConnection">Database</span><span class="text-slate-600">/</span><span id="queryDatabase">auto</span></div>
          <div class="text-sm text-slate-500">Results are limited for responsiveness. Use Tables for browsing large datasets.</div>
        </div>
        <div class="grid grid-cols-2 gap-4 max-2xl:grid-cols-1">
          <section class="ux-panel">
            <div id="queryBuilderTabs" class="flex gap-2 border-b border-white/10 px-4 py-3"></div>
            <div id="queryBuilderPanel" class="space-y-4 p-4">
              <div id="queryBuilderSummary" class="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
              <div class="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <div class="mb-3 flex items-center justify-between gap-3"><div><div class="text-sm font-black text-white">Source table</div><div class="mt-1 text-xs text-slate-500">Choose the table that Inspector should read from.</div></div></div>
                <select id="queryTable" class="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100 outline-none focus:border-violet-300"></select>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <div class="mb-3 flex items-center justify-between gap-3"><div><div class="text-sm font-black text-white">Columns</div><div class="mt-1 text-xs text-slate-500">Pick the fields you want in the SQL preview.</div></div></div>
                <div id="querySelectFields"></div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <div class="mb-3 flex items-center justify-between gap-3"><div><div class="text-sm font-black text-white">Filters</div><div class="mt-1 text-xs text-slate-500">Add simple AND conditions for the generated query.</div></div></div>
                <div id="queryConditions" class="grid gap-2"></div>
              </div>
              <details class="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <summary class="cursor-pointer select-none text-sm font-black text-white">Advanced options</summary>
                <div class="mt-4 grid gap-4">
                  <div><div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Join</div><div class="grid grid-cols-[120px_1fr_1.2fr] gap-2 max-xl:grid-cols-1"><select id="queryJoinType" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"><option>left join</option><option>inner join</option><option>right join</option></select><select id="queryJoinTable" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"></select><input id="queryJoinOn" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100" placeholder="users.id = orders.user_id"></div></div>
                  <div class="grid grid-cols-2 gap-3 max-xl:grid-cols-1"><div><div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Group by</div><select id="queryGroupBy" class="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"></select></div><div><div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Order by</div><div class="grid grid-cols-[1fr_120px] gap-2"><select id="queryOrderBy" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"></select><select id="queryOrderDir" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"><option value="desc">desc</option><option value="asc">asc</option></select></div></div></div>
                  <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1"><div><div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Limit</div><input id="queryLimit" class="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100" type="number" min="1" max="500" value="50"></div><div><div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Offset</div><input id="queryOffset" class="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100" type="number" min="0" value="0"></div></div>
                </div>
              </details>
            </div>
          </section>
          <section class="ux-panel">
            <div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><div id="queryResultTabs" class="flex flex-wrap gap-2"></div><div id="queryMeta" class="text-sm text-slate-400">Not executed</div></div>
            <div id="queryResults" class="max-h-[470px] overflow-auto"></div>
          </section>
        </div>
        <div class="mt-4 grid grid-cols-[1fr_1.6fr] gap-4 max-2xl:grid-cols-1">
          <section class="ux-panel"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><h3 class="font-bold text-white">Saved Queries</h3><button class="text-sm font-bold text-violet-300">View all</button></div><div id="savedQueries" class="divide-y divide-white/10"></div></section>
          <section class="ux-panel"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><h3 class="font-bold text-white">Database Schema</h3><button onclick="renderQuerySchema()" class="ux-btn px-3 py-2 text-xs">Refresh</button></div><div id="querySchema" class="grid grid-cols-[220px_1fr] max-xl:grid-cols-1"></div></section>
        </div>
      </section>
