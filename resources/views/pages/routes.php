      <section id="routesView" class="view hidden">
        <div class="ux-page-head">
          <div>
            <div class="ux-page-kicker">Application / Router</div>
            <div class="flex items-center gap-3"><h2 class="ux-page-title">Routes</h2><span id="routesTotalBadge" class="rounded-xl bg-violet-400/20 px-3 py-1 text-sm font-bold text-violet-200">0</span></div>
            <p class="ux-page-copy">Find routes by method, URI, name, middleware, or action and inspect the resolved controller/action details.</p>
          </div>
        </div>
        <div class="ux-two-pane">
          <div>
            <div class="ux-toolbar">
              <div id="routeTabs" class="flex flex-wrap gap-2"></div>
              <div class="flex flex-wrap gap-2">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="routeSearch" class="ux-filter w-full pl-9" placeholder="Search routes...">
                </div>
                <button onclick="renderRoutes()" class="ux-btn">Filter</button>
              </div>
            </div>
            <div class="ux-panel">
              <div id="routesContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-card min-h-[680px] p-4">
            <div id="routeDetails"></div>
          </aside>
        </div>
      </section>
