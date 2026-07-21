      <section id="usersView" class="view hidden">
        <div class="ux-two-pane">
          <div class="min-w-0">
            <div class="ux-page-head">
              <div>
                <div class="ux-page-kicker">Access / Users</div>
                <div class="flex items-center gap-3"><h2 class="ux-page-title">Users</h2><span id="usersTotalBadge" class="rounded-xl bg-sky-400/20 px-3 py-1 text-sm font-bold text-sky-200">0</span></div>
                <p class="ux-page-copy">Browse, create, edit, and manage users in the active app transport scope.</p>
              </div>
              <div class="ux-actions">
                <button onclick="openUserForm('create')" class="ux-btn ux-btn-primary">New User</button>
                <button onclick="loadUsers()" class="ux-btn">Refresh</button>
              </div>
            </div>
            <div id="usersActionResult" class="mb-4 hidden"></div>
            <div class="ux-toolbar">
              <div class="flex flex-wrap gap-2">
                <div class="relative min-w-72 max-lg:min-w-0">
                  <span class="pointer-events-none absolute left-3 top-2.5 text-slate-500">?</span>
                  <input id="userSearch" class="ux-filter w-full pl-9" placeholder="Search users...">
                </div>
                <select id="userStatusFilter" class="ux-filter">
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspend">Suspend</option>
                  <option value="pending">Pending</option>
                </select>
                <button onclick="renderUsers()" class="ux-btn">Filter</button>
              </div>
            </div>
            <div id="usersSummary" class="mb-4 grid grid-cols-3 gap-3 max-lg:grid-cols-1"></div>
            <div class="ux-panel">
              <div id="usersContent" class="overflow-auto"></div>
            </div>
          </div>
          <aside class="ux-detail">
            <div id="userDetails" class="space-y-4"></div>
          </aside>
        </div>
      </section>
