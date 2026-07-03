      <section id="flowView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Application / Middleware</div>
                <h2 class="ux-page-title">Flow</h2>
                <p class="ux-page-copy">Understand middleware groups, execution order, route usage, and the global stack without jumping into files.</p>
              </div>
              <div class="ux-actions"><button onclick="loadFlow()" class="ux-btn">Refresh</button></div>
            </div>
            <div id="flowTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div id="flowSummary" class="mb-4 grid grid-cols-5 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1"></div>
            <div class="grid grid-cols-[1fr_330px] gap-4 max-xl:grid-cols-1">
              <div>
                <div class="ux-toolbar grid grid-cols-[1fr_150px_150px] max-xl:grid-cols-1">
                  <div class="relative"><span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span><input id="flowSearch" class="ux-filter w-full pl-9" placeholder="Search middleware..."></div>
                  <select id="flowTypeFilter" class="ux-filter"><option value="all">All Types</option></select>
                  <select id="flowStatusFilter" class="ux-filter"><option value="all">All Status</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select>
                </div>
                <div class="ux-panel"><div id="flowContent" class="overflow-auto"></div></div>
              </div>
              <div class="space-y-4">
                <section class="ux-card p-4"><div class="mb-4 flex items-center justify-between"><h3 class="font-bold text-white">Pipeline</h3><select id="flowGroupFilter" class="ux-filter h-9"><option value="web">web</option><option value="api">api</option><option value="global">global</option></select></div><div id="flowPipeline" class="space-y-2"></div></section>
                <section class="ux-card p-4"><h3 class="font-bold text-white">Applied To</h3><div id="flowApplied" class="mt-4 text-sm text-slate-300"></div></section>
              </div>
            </div>
          </div>
          <aside class="ux-detail"><div id="flowDetails" class="space-y-4"></div></aside>
        </div>
      </section>
