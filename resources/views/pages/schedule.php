      <section id="scheduleView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Runtime / Scheduler</div>
                <h2 class="ux-page-title">Schedule</h2>
                <p class="ux-page-copy">Monitor scheduled jobs, see next run times, and trigger schedule commands from the Inspector.</p>
              </div>
              <div class="ux-actions"><button onclick="runScheduleAction('list')" class="ux-btn ux-btn-primary">Refresh Schedule</button></div>
            </div>
            <div id="scheduleActionResult" class="mb-4 hidden rounded-3xl border border-white/10 bg-white/[.04] p-4"></div>
            <div id="scheduleTabs" class="mb-4 flex flex-wrap gap-2"></div>
            <div class="ux-toolbar grid grid-cols-[1fr_180px_180px] max-xl:grid-cols-1">
              <div class="relative"><span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span><input id="scheduleSearch" class="ux-filter w-full pl-9" placeholder="Search scheduled jobs..."></div>
              <select id="scheduleGroup" class="ux-filter"><option value="all">All Groups</option></select>
              <select id="scheduleStatusFilter" class="ux-filter"><option value="all">All Statuses</option><option value="enabled">Enabled</option><option value="running">Running</option><option value="failed">Failed</option><option value="disabled">Disabled</option></select>
            </div>
            <div class="ux-panel">
              <div id="scheduleContent" class="overflow-auto"></div>
            </div>
            <div class="mt-4 grid grid-cols-[1fr_1fr] gap-4 max-xl:grid-cols-1">
              <section class="ux-card p-4"><h3 class="font-bold text-white">Schedule Summary</h3><div id="scheduleSummary" class="mt-4 grid grid-cols-3 gap-3 max-sm:grid-cols-1"></div></section>
              <section class="ux-panel"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><h3 class="font-bold text-white">Next Scheduled Runs</h3><button class="text-sm font-bold text-violet-300">View all</button></div><div id="scheduleNextRuns" class="divide-y divide-white/10"></div></section>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="scheduleDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
