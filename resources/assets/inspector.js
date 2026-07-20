    const state = { selected: null, selectedRowKeys: [], selectedTables: [], editingRowKey: null, limit: 50, offset: 0, search: '', tableFilter: '', view: 'dashboard', tables: [], database: null, selectedConnectionIndex: 0, connectionDetailTab: 'details', fkPreviewEnabled: false, fkSelectedFields: {}, fkLookupCache: {}, fkPreviewForTable: '', schemaBuilder: { mode: 'table', table: '', timestamps: true, softDeletes: false, createInDatabase: true, saveMigration: false, columns: [], previewCode: '', previewFilename: '' }, queryTable: '', queryColumns: [], querySelectedColumns: [], queryConditions: [], queryRows: [], queryBuilderMode: 'builder', queryPanelTab: 'results', queryLastPayload: null, queryLastExecutedAt: '', queryHistory: [], queryRawSql: '', queryRawResult: null, savedQueries: [], routes: null, routeSearch: '', routeGroup: 'all', selectedRoute: 0, selectedAction: 0, flow: null, flowSearch: '', flowTab: 'flow', flowType: 'all', flowStatus: 'all', flowGroup: 'web', selectedFlow: 0, migrations: null, migrationSearch: '', migrationStatus: 'all', selectedMigration: 0, migrationDetailTab: 'sql', migrationActionMenu: null, patches: null, patchSearch: '', patchStatus: 'all', selectedPatch: 0, patchActionMenu: null, setup: null, setupOptions: { deps: true, frontend: true, seed: false, patch: true }, setupRunning: false, schedule: null, scheduleSearch: '', scheduleStatus: 'all', selectedSchedule: 0, logs: null, logSearch: '', logLevel: 'all', selectedLog: 0, logLive: false, themes: null, themeSearch: '', selectedTheme: 0, users: null, userSearch: '', userStatus: 'all', selectedUser: 0, lastLogin: null, pinker: null, pinkerTab: 'overview', build: null, views: null, viewSearch: '', viewType: 'all', selectedView: 0, viewEditing: false, lang: null, langSearch: '', langScope: 'all', langLocale: 'all', langSyncReference: 'en', selectedLang: 0, langEditing: false, env: null, config: null, configSearch: '', configCategory: 'all', selectedConfig: 0, configEditing: false, busy: false, ready: false, loaded: {}, loading: {}, platform: false, locked: false, selectable: false, activePackage: '', apps: [] };
    const $ = (id) => document.getElementById(id);
    const base = location.pathname.startsWith('/~inspector') ? '/~inspector' : '';
    const packageStorageKey = 'pinx.inspector.package';
    const urlPackage = () => {
      if (state.locked) return '';
      return new URL(location.href).searchParams.get('package') || '';
    };
    const scopedPackage = () => {
      if (state.locked || state.selectable === false) return '';
      if (!state.platform && !urlPackage()) return '';
      return state.activePackage || urlPackage() || '';
    };
    const scopedUrl = (url) => {
      const pkg = scopedPackage();
      if (!pkg) return url;
      const join = url.includes('?') ? '&' : '?';
      return url + join + 'package=' + encodeURIComponent(pkg);
    };
    async function fetchJson(url, options = {}) {
      const response = await fetch(base + scopedUrl(url), { cache: 'no-store', ...options });
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        throw new Error('Inspector returned an invalid response.');
      }
      if (!response.ok || payload?.error) {
        throw new Error(payload?.message || `Request failed (${response.status}).`);
      }
      return payload;
    }
    const api = (url) => fetchJson(url);
    const post = (url, body) => fetchJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const cell = (value) => typeof value === 'object' && value !== null ? '<code>' + esc(JSON.stringify(value, null, 2)) + '</code>' : esc(value);
    const iconPaths = {
      activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      alertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
      briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
      fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
      folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/>',
      package: '<path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
      refreshCw: '<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 8h5V3"/>',
      settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/>',
      table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    };
    function icon(name, cls = 'h-4 w-4') {
      const body = iconPaths[name] || iconPaths.activity;
      return `<svg viewBox="0 0 24 24" class="${esc(cls)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    }

    async function copyText(value) {
      const text = String(value ?? '');
      if (!text) {
        showOperation('warn', 'Nothing to copy', 'This field is empty.');
        return;
      }
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const input = document.createElement('textarea');
          input.value = text;
          input.setAttribute('readonly', 'readonly');
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          input.remove();
        }
        showOperation('success', 'Copied', text.length > 80 ? text.slice(0, 80) + '...' : text);
      } catch (error) {
        showOperation('danger', 'Copy failed', error.message || 'Browser clipboard access was blocked.');
      }
    }

    function setBusy(busy, title = 'Working', message = 'Please wait...') {
      state.busy = busy;
      document.querySelectorAll('button').forEach(button => {
        if (button.closest('#jsonModal')) return;
        if (button.closest('#detailDrawer')) return;
        if (button.closest('#confirmModal')) return;
        if (button.closest('#schemaBuilderModal')) return;
        if (button.closest('#langToolsModal')) return;
        button.disabled = busy;
        button.classList.toggle('opacity-55', busy);
        button.classList.toggle('cursor-wait', busy);
      });
      if (busy) showOperation('loading', title, message);
    }

    function askConfirm(title, message, tone = 'danger') {
      return new Promise(resolve => {
        const modal = $('confirmModal');
        $('confirmTitle').textContent = title || 'Confirm action';
        $('confirmMessage').textContent = message || 'Are you sure?';
        $('confirmOk').className = `rounded-xl px-4 py-2 text-sm font-bold text-white ${tone === 'warn' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-rose-500 hover:bg-rose-400'}`;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const done = (value) => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          $('confirmOk').onclick = null;
          $('confirmCancel').onclick = null;
          resolve(value);
        };
        $('confirmOk').onclick = () => done(true);
        $('confirmCancel').onclick = () => done(false);
      });
    }

    function setReady(ready) {
      state.ready = ready;
      if (ready && !state.busy) {
        document.querySelectorAll('button').forEach(button => {
          button.disabled = false;
          button.classList.remove('opacity-55', 'cursor-wait');
        });
      }
      const lock = $('bootLock');
      if (!lock) return;
      lock.classList.toggle('hidden', ready);
    }

    function ensureReady() {
      if (state.ready) return true;
      showOperation('loading', 'Inspector is still loading', 'Please wait until the first project scan is finished.');
      return false;
    }

    function showOperation(type, title, message) {
      const hud = $('operationHud');
      const iconEl = $('operationIcon');
      const progress = $('operationProgress');
      const tone = type === 'success'
        ? ['border-emerald-300/25', 'bg-emerald-400/10', 'text-emerald-200', 'check']
        : type === 'danger'
          ? ['border-rose-300/25', 'bg-rose-400/10', 'text-rose-200', 'alertTriangle']
          : ['border-sky-300/20', 'bg-sky-400/10', 'text-sky-200', ''];
      hud.classList.remove('hidden');
      iconEl.className = `grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${tone[0]} ${tone[1]} ${tone[2]}`;
      iconEl.innerHTML = type === 'loading'
        ? '<span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>'
        : icon(tone[3], 'h-5 w-5');
      $('operationTitle').textContent = title;
      $('operationMessage').textContent = message;
      progress.classList.toggle('hidden', type !== 'loading');
      if (type !== 'loading') {
        clearTimeout(showOperation.timer);
        showOperation.timer = setTimeout(() => hud.classList.add('hidden'), 4600);
      }
    }

    function syncDetailDrawerFrom(panelId) {
      const drawer = $('detailDrawer');
      const panel = $(panelId);
      if (!drawer || !panel || drawer.classList.contains('hidden')) return;
      $('detailDrawerBody').innerHTML = panel.innerHTML;
    }

    function openDetailDrawerFrom(panelId, title, eyebrow = 'Inspector Details') {
      const panel = $(panelId);
      const drawer = $('detailDrawer');
      if (!panel || !drawer) return;
      openDetailDrawerFrom.panelId = panelId;
      $('detailDrawerEyebrow').textContent = eyebrow;
      $('detailDrawerTitle').textContent = title || 'Details';
      $('detailDrawerBody').innerHTML = panel.innerHTML;
      drawer.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      panel.classList.add('ring-2', 'ring-violet-300/45', 'shadow-[0_0_0_6px_rgba(124,58,237,.08)]');
      clearTimeout(openDetailDrawerFrom.timer);
      openDetailDrawerFrom.timer = setTimeout(() => panel.classList.remove('ring-2', 'ring-violet-300/45', 'shadow-[0_0_0_6px_rgba(124,58,237,.08)]'), 1400);
    }

    function closeDetailDrawer() {
      const drawer = $('detailDrawer');
      if (!drawer) return;
      drawer.classList.add('hidden');
      $('detailDrawerBody').innerHTML = '';
      openDetailDrawerFrom.panelId = '';
      document.body.classList.remove('overflow-hidden');
    }

    function loadingPanel(title, message) {
      return `<div class="grid min-h-56 place-items-center rounded-3xl border border-white/10 bg-black/20 p-8 text-center">
        <div>
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-200"><span class="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></span></div>
          <div class="mt-4 font-bold text-white">${esc(title)}</div>
          <div class="mt-1 text-sm text-slate-400">${esc(message)}</div>
        </div>
      </div>`;
    }

    function compactLoading(title, message = 'Loading this section...') {
      return `<div class="grid min-h-40 place-items-center rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
        <div>
          <div class="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-200"><span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span></div>
          <div class="mt-3 text-sm font-bold text-white">${esc(title)}</div>
          <div class="mt-1 text-xs text-slate-500">${esc(message)}</div>
        </div>
      </div>`;
    }

    function setHtml(id, html) {
      const element = $(id);
      if (element) element.innerHTML = html;
    }

    function showViewLoading(view) {
      if (view === 'dashboard') {
        setHtml('recentRequests', compactLoading('Loading routes', 'Recent route activity will appear here.'));
        setHtml('recentLogs', compactLoading('Loading logs', 'Recent log entries will appear here.'));
        setHtml('recommendations', compactLoading('Checking project hints', 'Inspector is reading local project recommendations.'));
      } else if (view === 'connections') {
        setHtml('databaseOverview', loadingPanel('Loading connections', 'Reading active connection, DevDB storage, and core table status.'));
        setHtml('connectionRows', compactLoading('Loading connection list'));
        setHtml('connectionDetails', compactLoading('Loading details'));
      } else if (view === 'database') {
        setHtml('tablesDb', compactLoading('Loading tables', 'Reading schema from the active connection.'));
        setHtml('databaseContent', loadingPanel('Loading table explorer', 'Tables and rows will be available in a moment.'));
      } else if (view === 'query') {
        setHtml('queryResults', compactLoading('Preparing query builder', 'Loading table and column metadata.'));
        setHtml('querySchema', compactLoading('Loading schema'));
      } else if (view === 'health') {
        setHtml('healthSummary', loadingPanel('Running health scan', 'Checking local project health.'));
        setHtml('healthContent', '');
      } else if (view === 'setup') {
        setHtml('setupStatusCards', compactLoading('Loading setup status'));
        setHtml('setupProgressList', compactLoading('Preparing setup steps'));
        setHtml('setupStepOptions', compactLoading('Loading options'));
      } else if (view === 'migrations') {
        setHtml('migrationsContent', loadingPanel('Loading migrations', 'Reading migration files and execution status.'));
        setHtml('migrationDetails', compactLoading('Loading migration details'));
      } else if (view === 'patches') {
        setHtml('patchesContent', loadingPanel('Loading patches', 'Reading patch files and history status.'));
        setHtml('patchDetails', compactLoading('Loading patch details'));
      } else if (view === 'routes') {
        setHtml('routesContent', loadingPanel('Loading routes', 'Reading route files and actions.'));
        setHtml('routeDetails', compactLoading('Loading route details'));
      } else if (view === 'flow') {
        setHtml('flowContent', loadingPanel('Loading flow', 'Reading flow classes, priority, and route usage.'));
        setHtml('flowDetails', compactLoading('Loading flow details'));
      } else if (view === 'schedule') {
        setHtml('scheduleContent', loadingPanel('Loading schedule', 'Reading scheduled jobs and next runs.'));
        setHtml('scheduleDetails', compactLoading('Loading job details'));
      } else if (view === 'logs') {
        setHtml('logsContent', loadingPanel('Loading logs', 'Reading log files from storage.'));
        setHtml('logDetails', compactLoading('Loading log details'));
      } else if (view === 'themes') {
        setHtml('themesContent', loadingPanel('Loading themes', 'Reading installed app and theme metadata.'));
        setHtml('themeDetails', compactLoading('Loading theme details'));
      } else if (view === 'users') {
        setHtml('usersContent', loadingPanel('Loading users', 'Reading users from the active app transport scope.'));
        setHtml('userDetails', compactLoading('Loading user details'));
      } else if (view === 'pinker') {
        setHtml('pinkerOverview', loadingPanel('Loading Pinker', 'Reading package, cache, and build metadata.'));
        setHtml('pinkerBuildStatus', compactLoading('Loading cache health'));
        setHtml('pinkerRecentBuilds', compactLoading('Loading cache files'));
        setHtml('pinkerDetails', compactLoading('Loading package details'));
      } else if (view === 'build') {
        setHtml('buildSummary', loadingPanel('Loading build status', 'Checking release readiness and signing setup.'));
        setHtml('buildDetails', compactLoading('Loading build details'));
      } else if (view === 'views') {
        setHtml('viewsTree', loadingPanel('Loading views', 'Reading view templates.'));
        setHtml('viewDetails', compactLoading('Loading view details'));
      } else if (view === 'lang') {
        setHtml('langFiles', loadingPanel('Loading language files', 'Reading app and theme language packs.'));
        setHtml('langDetails', compactLoading('Loading language details'));
      } else if (view === 'env') {
        setHtml('envContent', loadingPanel('Loading environment', 'Reading editable .env values.'));
        setHtml('envDetails', compactLoading('Loading environment details'));
      } else if (view === 'config') {
        setHtml('configFiles', loadingPanel('Loading config', 'Reading app and theme configuration files.'));
        setHtml('configDetails', compactLoading('Loading config details'));
      }
    }

    async function runWithLoading(title, message, task, successMessage = 'Finished successfully.') {
      setBusy(true, title, message);
      try {
        const result = await task();
        showOperation('success', title, successMessage);
        return result;
      } catch (error) {
        showOperation('danger', title, error.message || 'The operation failed.');
        throw error;
      } finally {
        setBusy(false);
      }
    }

    async function loadApps() {
      const payload = await api('/api/apps');
      state.platform = !!payload.platform;
      state.locked = !!payload.locked;
      state.selectable = payload.selectable === true;
      state.apps = Array.isArray(payload.items) ? payload.items : [];
      const fromUrl = urlPackage();
      const stored = state.locked ? '' : (localStorage.getItem(packageStorageKey) || '');
      const known = new Set(state.apps.map(app => app.package));
      const pick = (value) => value && known.has(value) ? value : '';
      state.activePackage = pick(fromUrl) || pick(stored) || pick(payload.active) || pick(payload.default) || (state.apps[0] && state.apps[0].package) || '';
      if (state.activePackage && !state.locked) localStorage.setItem(packageStorageKey, state.activePackage);
      const wrap = $('appSelectorWrap');
      const select = $('appSelector');
      if (!select || state.apps.length === 0) {
        if (wrap) wrap.hidden = true;
        return;
      }
      select.innerHTML = state.apps.map(app => `<option value="${esc(app.package)}">${esc(app.name || app.package)}</option>`).join('');
      if (state.activePackage) select.value = state.activePackage;
      if (state.apps.length === 1 || !state.selectable) {
        if (wrap) wrap.hidden = false;
        select.disabled = true;
        select.onchange = null;
        return;
      }
      if (wrap) wrap.hidden = false;
      select.disabled = false;
      select.onchange = () => {
        const next = select.value || '';
        if (!next || next === state.activePackage) return;
        runWithLoading('Switching app', 'Reloading Inspector for the selected app.', () => switchApp(next), 'App context updated.');
      };
    }

    function resetAppScopedState() {
      state.loaded = {};
      state.loading = {};
      state.database = null;
      state.tables = [];
      state.selected = null;
      state.selectedRowKeys = [];
      state.selectedTables = [];
      state.fkPreviewEnabled = false;
      state.fkSelectedFields = {};
      state.fkLookupCache = {};
      state.fkPreviewForTable = '';
      state.routes = null;
      state.migrations = null;
      state.flow = null;
      state.schedule = null;
      state.logs = null;
      state.themes = null;
      state.pinker = null;
      state.build = null;
      state.views = null;
      state.lang = null;
      state.env = null;
      state.config = null;
      state.queryLastPayload = null;
      state.queryRawResult = null;
      state.queryRows = [];
      state.queryColumns = [];
    }

    async function switchApp(next) {
      if (!next || next === state.activePackage || state.locked || !state.selectable) return;
      state.activePackage = next;
      localStorage.setItem(packageStorageKey, next);
      const url = new URL(location.href);
      url.searchParams.set('package', next);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      const select = $('appSelector');
      if (select) select.value = next;
      resetAppScopedState();
      await boot();
      state.loaded[state.view] = false;
      await loadViewData(state.view, true);
    }

    async function boot() {
      showOperation('loading', 'Loading Inspector', 'Reading project summary.');
      if (!state.apps.length) await loadApps();
      const summary = await api('/api/summary');
      if (summary.platform) {
        state.platform = !!summary.platform.enabled;
        state.locked = !!summary.platform.locked;
        state.selectable = summary.platform.selectable === true;
        const fromUrl = urlPackage();
        if (!state.locked && fromUrl && state.apps.some(app => app.package === fromUrl)) {
          state.activePackage = fromUrl;
        } else {
          state.activePackage = summary.platform.package || summary.app.package || state.activePackage;
        }
      }
      $('appName').textContent = summary.app.name;
      $('sideAppName').textContent = summary.app.name;
      $('package').textContent = summary.app.package;
      const engineLabel = summary.database.engine_label || summary.database.engine;
      $('engine').textContent = summary.database.connection + ' / ' + engineLabel;
      $('runtimeUrl').textContent = location.origin;
      $('phpVersion').textContent = 'PHP ' + summary.stats.php;
      $('pincoreVersion').textContent = 'Pincore v' + (summary.stats.pincore_version || 'unknown');
      renderAppProfile(summary.app || {});
      $('overview').innerHTML = `
        ${inspectorMetric('Tables', summary.database.table_count, 'available', 'violet', 'M4 34 C14 28 20 31 30 22 C38 15 44 17 56 10')}
        ${inspectorMetric('Rows', summary.stats.rows, 'loaded', 'blue', 'M4 32 C14 20 21 36 30 18 C38 4 45 26 56 14')}
        ${inspectorMetric('Migrations', summary.stats.migrations, 'tracked', 'success', 'M4 30 C16 31 21 22 30 24 C39 26 44 14 56 12')}
        ${inspectorMetric('Errors', 0, 'from recent logs', 'danger', 'M4 34 C12 25 18 34 26 26 C34 18 40 28 56 22')}
        ${inspectorMetric('Engine', engineLabel, summary.database.connection, 'warn', 'M4 28 C11 30 18 24 26 25 C36 26 42 19 56 20')}
      `;
      showOperation('success', 'Inspector Ready', 'Open any section to load its data.');
    }

    function metric(label, value, note) {
      return `<div class="rounded-3xl border border-white/10 bg-white/[.05] p-5 shadow-glow"><div class="text-xs uppercase tracking-wider text-slate-500">${esc(label)}</div><div class="mt-2 truncate text-2xl font-bold">${esc(value)}</div><div class="mt-1 text-xs text-slate-400">${esc(note)}</div></div>`;
    }

    function inspectorMetric(label, value, note, tone, path) {
      const palette = {
        violet: ['text-violet-300', 'bg-violet-500/15', '#a855f7'],
        blue: ['text-sky-300', 'bg-sky-500/15', '#38bdf8'],
        success: ['text-emerald-300', 'bg-emerald-500/15', '#22c55e'],
        danger: ['text-rose-300', 'bg-rose-500/15', '#fb7185'],
        warn: ['text-amber-300', 'bg-amber-500/15', '#f59e0b']
      }[tone] || ['text-slate-300', 'bg-white/10', '#94a3b8'];
      return `<article class="rounded-2xl border border-white/10 bg-[#0a1320]/85 p-4 shadow-[0_18px_60px_rgba(0,0,0,.18)]">
        <div class="flex items-start gap-3">
          <div class="grid h-12 w-12 place-items-center rounded-2xl ${palette[1]} ${palette[0]}"><svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></div>
          <div class="min-w-0"><div class="text-sm text-slate-300">${esc(label)}</div><div class="mt-1 truncate text-2xl font-bold">${esc(value)}</div><div class="mt-1 text-xs text-slate-400">${esc(note)}</div></div>
        </div>
        <svg class="mt-4 h-10 w-full" viewBox="0 0 60 40" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="${palette[2]}" stroke-width="2.4" stroke-linecap="round"/><path d="${path} L56 40 L4 40 Z" fill="${palette[2]}" opacity=".08"/></svg>
      </article>`;
    }

    function toneClass(tone) {
      if (tone === 'danger') return 'border-rose-400/25 bg-rose-400/10 text-rose-100';
      if (tone === 'warn') return 'border-amber-300/25 bg-amber-300/10 text-amber-100';
      if (tone === 'success') return 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100';
      if (tone === 'blue') return 'border-blue-300/25 bg-blue-300/10 text-blue-100';
      if (tone === 'violet') return 'border-violet-300/25 bg-violet-300/10 text-violet-100';
      return 'border-white/10 bg-white/[.04] text-slate-100';
    }

    function smallCard(label, value, note, tone = 'default') {
      return `<div class="rounded-3xl border p-4 ${toneClass(tone)}"><div class="text-xs uppercase tracking-wider opacity-70">${esc(label)}</div><div class="mt-2 text-2xl font-bold">${esc(value)}</div><div class="mt-1 text-xs opacity-70">${esc(note || '')}</div></div>`;
    }

    function renderAppProfile(app) {
      if (!$('appProfile')) return;
      const transport = app.transport || { scenario: 'local isolated', items: {} };
      const iconSrc = app.icon_url || (app.icon ? '/' + String(app.icon).replace(/^\/+/, '') : '');
      const iconHtml = iconSrc ? `<img src="${esc(iconSrc)}" class="h-16 w-16 rounded-2xl object-cover" alt="">` : `<div class="grid h-16 w-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${icon('package', 'h-8 w-8')}</div>`;
      $('appProfile').innerHTML = `
        <div class="grid grid-cols-[1fr_auto] gap-4 max-xl:grid-cols-1">
          <div class="flex min-w-0 gap-4">
          ${iconHtml}
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2"><h2 class="truncate text-xl font-black text-white">${esc(app.name || 'Pinoox App')}</h2><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200">v${esc(app.version_name || '1.0.0')}</span><span class="rounded-lg bg-white/8 px-2 py-1 text-xs text-slate-300">code ${esc(app.version_code || 1)}</span></div>
              <div class="mt-1 text-sm text-slate-400">${esc(app.package || 'unknown')}</div>
              <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">${esc(app.description || 'Single-app Pinoox project ready for local development.')}</p>
            </div>
          </div>
          <div class="grid min-w-[320px] grid-cols-2 gap-2 text-sm max-sm:min-w-0 max-sm:grid-cols-1">
            ${appInfoPill('Developer', app.developer || '-')}
            ${appInfoPill('Language', `${app.lang || 'en'} / ${app.lang_fallback || 'en'}`)}
            ${appInfoPill('Theme', app.theme || 'default')}
            ${appInfoPill('Transport', transport.scenario || 'local')}
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">${Object.entries(transport.items || {}).map(([key, value]) => `<span class="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">${esc(key)}: <strong class="text-slate-100">${esc(value)}</strong></span>`).join('')}</div>
      `;
    }

    function appInfoPill(label, value) {
      return `<div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><div class="text-xs uppercase tracking-wide text-slate-500">${esc(label)}</div><div class="mt-1 truncate font-bold text-slate-100">${esc(value)}</div></div>`;
    }

    async function loadTables(options = {}) {
      const autoOpen = options.autoOpen !== false;
      const payload = await api('/api/tables');
      state.tables = payload.tables || [];
      if ($('tableCount')) $('tableCount').textContent = state.tables.length + ' tables';
      if ($('tableCountDb')) $('tableCountDb').textContent = state.tables.length + ' tables';
      renderTableListModern($('tables'));
      renderTableListModern($('tablesDb'));
      initQueryBuilder();
      if (autoOpen && state.view === 'database') {
        await openDefaultTableWorkspace();
      }
    }

    function showTablesEmptyState(message = 'No tables were found on the active connection.') {
      const breadcrumb = $('tableBreadcrumb');
      if (breadcrumb) {
        breadcrumb.classList.add('hidden');
        breadcrumb.classList.remove('flex');
      }
      if (!$('databaseContent')) return;
      $('databaseContent').innerHTML = `
        <div class="grid h-full min-h-[680px] place-items-center p-8 text-center">
          <div>
            <div class="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${icon('database', 'h-7 w-7')}</div>
            <div class="mt-4 text-lg font-black text-white">No tables yet</div>
            <div class="mt-1 text-sm text-slate-500">${esc(message)}</div>
            <div class="mt-5 flex flex-wrap justify-center gap-2">
              <button onclick="openSchemaBuilder('table')" class="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white hover:bg-violet-400">Add Table</button>
              <button onclick="runInspectorAction('migrate')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Run Migrations</button>
            </div>
          </div>
        </div>
      `;
    }

    async function openDefaultTableWorkspace() {
      const names = (state.tables || []).map(table => table.name).filter(Boolean);
      if (!names.length) {
        state.selected = null;
        showTablesEmptyState();
        return;
      }
      if (!state.selected || !names.includes(state.selected)) {
        state.selected = names[0];
        state.offset = 0;
        state.search = '';
        state.selectedRowKeys = [];
      }
      renderTableListModern($('tables'));
      renderTableListModern($('tablesDb'));
      await loadTable();
    }

    function initQueryBuilder() {
      if (!$('queryTable')) return;
      const options = state.tables.map(table => `<option value="${esc(table.name)}">${esc(table.name)}</option>`).join('');
      $('queryTable').innerHTML = options;
      $('queryJoinTable').innerHTML = '<option value="">No join</option>' + options;
      if (!state.queryTable && state.tables[0]) state.queryTable = state.tables[0].name;
      if (state.queryTable) $('queryTable').value = state.queryTable;
      const connection = state.database?.connection || {};
      if ($('queryConnection')) $('queryConnection').textContent = connection.name || 'devdb';
      if ($('queryDatabase')) $('queryDatabase').textContent = connection.database || connection.sqlite_database || connection.devdb_path || 'auto';
      bindQueryBuilderInputs();
      renderSavedQueries();
      loadQuerySchema();
    }

    function bindQueryBuilderInputs() {
      if ($('queryTable') && !$('queryTable').dataset.bound) {
        $('queryTable').dataset.bound = '1';
        $('queryTable').addEventListener('change', () => loadQuerySchema(false));
      }
      ['queryJoinType', 'queryJoinTable', 'queryJoinOn', 'queryGroupBy', 'queryOrderBy', 'queryOrderDir', 'queryLimit', 'queryOffset'].forEach(id => {
        const input = $(id);
        if (!input || input.dataset.bound) return;
        input.dataset.bound = '1';
        input.addEventListener('input', refreshQueryPreview);
        input.addEventListener('change', refreshQueryPreview);
      });
    }

    function refreshQueryPreview() {
      syncQueryConditionsFromDom();
      renderQuerySummary();
      if (state.queryPanelTab === 'sql' || state.queryPanelTab === 'bindings') {
        renderQueryPanel();
      }
      updateQueryMeta(false);
    }

    async function loadQuerySchema(executed = false) {
      const table = $('queryTable')?.value || state.queryTable || state.tables[0]?.name || '';
      if (!table) return;
      state.queryTable = table;
      try {
        const payload = await api('/api/table?name=' + encodeURIComponent(table) + '&limit=' + Number($('queryLimit')?.value || 50) + '&offset=' + Number($('queryOffset')?.value || 0));
        state.queryColumns = Object.keys(payload.columns || {});
        state.querySelectedColumns = state.querySelectedColumns.filter(column => state.queryColumns.includes(column));
        if (!state.querySelectedColumns.length) state.querySelectedColumns = state.queryColumns.slice(0, 6);
        state.queryConditions = state.queryConditions.filter(item => item && state.queryColumns.includes(item.field));
        if (!state.queryConditions.length) state.queryConditions = [{ field: '', op: '=', value: '' }];
        state.queryRows = payload.rows || [];
        renderQueryBuilder();
        renderQuerySchema(payload);
        renderQueryResults(payload, executed);
      } catch (error) {
        state.queryLastPayload = null;
        renderQueryTabs();
        $('queryResults').innerHTML = `<div class="m-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-rose-100"><div class="font-bold">Query schema could not load</div><div class="mt-1 text-sm opacity-80">${esc(error.message || 'The selected table could not be inspected.')}</div></div>`;
        updateQueryMeta(false);
      }
    }

    function renderQueryBuilder() {
      const table = state.queryTable || $('queryTable')?.value || '';
      const columns = state.queryColumns || [];
      $('querySelectFields').innerHTML = columns.length ? `
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-slate-500">${state.querySelectedColumns.length || 'All'} selected from ${columns.length} column(s)</div>
          <div class="flex gap-2">
            <button type="button" onclick="selectAllQueryColumns()" class="rounded-lg border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Select all</button>
            <button type="button" onclick="clearQueryColumns()" class="rounded-lg border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Clear</button>
          </div>
        </div>
        <div class="flex max-h-40 flex-wrap gap-2 overflow-auto pr-1">${columns.map(column => {
          const active = state.querySelectedColumns.includes(column);
          return `<button type="button" onclick="toggleQueryColumn('${esc(column)}')" class="rounded-xl border px-3 py-2 text-xs font-bold transition ${active ? 'border-violet-300/30 bg-violet-500/25 text-violet-100' : 'border-white/10 bg-white/[.03] text-slate-400 hover:bg-white/10'}">${esc(table)}.${esc(column)}</button>`;
        }).join('')}</div>
      ` : '<div class="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-500">No columns detected for this table.</div>';
      const columnOptions = columns.map(column => `<option value="${esc(column)}">${esc(table)}.${esc(column)}</option>`).join('');
      ['queryGroupBy', 'queryOrderBy'].forEach(id => { if ($(id)) $(id).innerHTML = '<option value="">None</option>' + columnOptions; });
      renderQueryConditions(columns);
      renderQuerySummary();
      renderQueryTabs();
      updateQueryMeta(false);
    }

    function toggleQueryColumn(column) {
      if (!column) return;
      if (state.querySelectedColumns.includes(column)) {
        state.querySelectedColumns = state.querySelectedColumns.filter(item => item !== column);
      } else {
        state.querySelectedColumns.push(column);
      }
      renderQueryBuilder();
      refreshQueryPreview();
    }

    function selectAllQueryColumns() {
      state.querySelectedColumns = [...state.queryColumns];
      renderQueryBuilder();
      refreshQueryPreview();
    }

    function clearQueryColumns() {
      state.querySelectedColumns = [];
      renderQueryBuilder();
      refreshQueryPreview();
    }

    function renderQuerySummary() {
      if (!$('queryBuilderSummary')) return;
      const table = state.queryTable || $('queryTable')?.value || 'table';
      const selected = state.querySelectedColumns.length ? state.querySelectedColumns.length : 'all';
      const filters = state.queryConditions.filter(item => item.field && item.value !== '').length;
      const join = $('queryJoinTable')?.value ? $('queryJoinTable').value : 'none';
      $('queryBuilderSummary').innerHTML = `
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3"><div class="text-[11px] uppercase tracking-wider text-slate-500">Table</div><div class="mt-1 truncate font-bold text-white">${esc(table)}</div></div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3"><div class="text-[11px] uppercase tracking-wider text-slate-500">Columns</div><div class="mt-1 font-bold text-white">${esc(selected)}</div></div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3"><div class="text-[11px] uppercase tracking-wider text-slate-500">Filters</div><div class="mt-1 font-bold text-white">${filters}</div></div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-3"><div class="text-[11px] uppercase tracking-wider text-slate-500">Join</div><div class="mt-1 truncate font-bold text-white">${esc(join)}</div></div>
      `;
    }

    function renderQueryTabs() {
      if ($('queryBuilderTabs')) {
        const builderTabs = [
          ['builder', 'Builder', 'Visual table query'],
          ['raw', 'Raw SQL', 'SQL preview and warnings']
        ];
        $('queryBuilderTabs').innerHTML = builderTabs.map(([key, label, title]) => `<button type="button" title="${esc(title)}" onclick="setQueryBuilderMode('${key}')" class="rounded-xl px-4 py-2 text-sm font-bold transition ${state.queryBuilderMode === key ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/30' : 'border border-white/10 bg-white/[.04] text-slate-300 hover:bg-white/10'}">${esc(label)}</button>`).join('');
      }
      if ($('queryResultTabs')) {
        const resultTabs = [
          ['results', 'Results'],
          ['sql', 'SQL'],
          ['bindings', 'Bindings'],
          ['history', 'History']
        ];
        $('queryResultTabs').innerHTML = resultTabs.map(([key, label]) => `<button type="button" onclick="setQueryPanelTab('${key}')" class="rounded-xl px-4 py-2 text-sm font-bold transition ${state.queryPanelTab === key ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/30' : 'border border-white/10 bg-white/[.04] text-slate-300 hover:bg-white/10'}">${esc(label)}</button>`).join('');
      }
    }

    function setQueryBuilderMode(mode) {
      state.queryBuilderMode = mode === 'raw' ? 'raw' : 'builder';
      if (state.queryBuilderMode === 'raw') {
        state.queryPanelTab = 'sql';
        showOperation('info', 'Raw SQL', 'Run read and write SQL against the active local development connection, including DevDB JSON.');
      }
      renderQueryTabs();
      renderQueryPanel();
      updateQueryMeta(false);
    }

    function setQueryPanelTab(tab) {
      state.queryPanelTab = ['results', 'sql', 'bindings', 'history'].includes(tab) ? tab : 'results';
      renderQueryTabs();
      renderQueryPanel();
      updateQueryMeta(false);
    }

    function renderQueryConditions(columns) {
      const options = columns.map(column => `<option value="${esc(column)}">${esc(state.queryTable)}.${esc(column)}</option>`).join('');
      const conditions = state.queryConditions.length ? state.queryConditions : [{ field: '', op: '=', value: '' }];
      $('queryConditions').innerHTML = `
        <div class="grid gap-2">
          ${conditions.map((condition, index) => `<div class="grid grid-cols-[1fr_96px_1fr_42px] gap-2 max-xl:grid-cols-1">
            <select data-index="${index}" class="query-condition-field h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"><option value="">No filter</option>${options}</select>
            <select data-index="${index}" class="query-condition-op h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100"><option>=</option><option>!=</option><option>&gt;</option><option>&gt;=</option><option>&lt;</option><option>&lt;=</option><option>like</option><option>is null</option><option>is not null</option></select>
            <input data-index="${index}" class="query-condition-value h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100" placeholder="value">
            <button type="button" onclick="removeQueryCondition(${index})" class="h-10 rounded-xl border border-white/10 bg-white/[.04] text-slate-400 hover:bg-rose-400/10 hover:text-rose-200">x</button>
          </div>`).join('')}
        </div>
        <button type="button" onclick="addQueryCondition()" class="mt-2 rounded-xl border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-sm font-bold text-violet-100 hover:bg-violet-500/20">+ Add filter</button>
      `;
      conditions.forEach((condition, index) => {
        const field = document.querySelector(`.query-condition-field[data-index="${index}"]`);
        const op = document.querySelector(`.query-condition-op[data-index="${index}"]`);
        const value = document.querySelector(`.query-condition-value[data-index="${index}"]`);
        if (field) field.value = condition.field || '';
        if (op) op.value = condition.op || '=';
        if (value) value.value = condition.value || '';
      });
      document.querySelectorAll('.query-condition-field, .query-condition-op, .query-condition-value').forEach(input => {
        input.addEventListener('input', refreshQueryPreview);
        input.addEventListener('change', refreshQueryPreview);
      });
    }

    function syncQueryConditionsFromDom() {
      const rows = [];
      document.querySelectorAll('.query-condition-field').forEach(field => {
        const index = Number(field.dataset.index || 0);
        const op = document.querySelector(`.query-condition-op[data-index="${index}"]`);
        const value = document.querySelector(`.query-condition-value[data-index="${index}"]`);
        rows[index] = { field: field.value || '', op: op?.value || '=', value: value?.value || '' };
      });
      if (rows.length) state.queryConditions = rows;
    }

    function addQueryCondition() {
      syncQueryConditionsFromDom();
      state.queryConditions.push({ field: '', op: '=', value: '' });
      renderQueryBuilder();
      refreshQueryPreview();
    }

    function removeQueryCondition(index) {
      syncQueryConditionsFromDom();
      state.queryConditions.splice(index, 1);
      if (!state.queryConditions.length) state.queryConditions.push({ field: '', op: '=', value: '' });
      renderQueryBuilder();
      refreshQueryPreview();
    }

    async function runVisualQuery() {
      syncQueryConditionsFromDom();
      const table = state.queryTable || $('queryTable')?.value || '';
      if (!table) {
        showOperation('warn', 'No table selected', 'Choose a table before running the query.');
        return;
      }
      await runWithLoading('Running query', 'Executing the visual query on the active local connection.', async () => {
        const payload = await post('/api/query', queryRequestPayload());
        if (payload.error || payload.ok === false) {
          throw new Error(payload.message || 'Query execution failed.');
        }
        renderQueryResults(payload, true);
      }, 'Query executed.');
    }

    function queryRequestPayload() {
      syncQueryConditionsFromDom();
      return {
        table: state.queryTable || $('queryTable')?.value || '',
        columns: state.querySelectedColumns.length ? state.querySelectedColumns : state.queryColumns,
        conditions: state.queryConditions
          .filter(item => item && item.field && (item.value !== '' || ['is null', 'is not null'].includes(String(item.op || '').toLowerCase())))
          .map(item => ({ field: item.field, op: item.op || '=', value: item.value ?? '' })),
        join_type: $('queryJoinType')?.value || '',
        join_table: $('queryJoinTable')?.value || '',
        join_on: $('queryJoinOn')?.value || '',
        group_by: $('queryGroupBy')?.value || '',
        order_by: $('queryOrderBy')?.value || '',
        order_dir: $('queryOrderDir')?.value || 'asc',
        limit: Number($('queryLimit')?.value || 50),
        offset: Number($('queryOffset')?.value || 0)
      };
    }

    function renderQueryResults(payload, executed) {
      state.queryLastPayload = payload;
      state.queryRows = payload.rows || [];
      if (executed) {
        state.queryLastExecutedAt = new Date().toLocaleTimeString();
        state.queryPanelTab = 'results';
        state.queryHistory.unshift({
          table: state.queryTable || payload.table || '',
          sql: querySql(),
          bindings: queryBindings(),
          rows: state.queryRows.length,
          time: state.queryLastExecutedAt
        });
        state.queryHistory = state.queryHistory.slice(0, 12);
      }
      renderQueryTabs();
      renderQueryPanel();
      updateQueryMeta(executed);
    }

    function renderQueryPanel() {
      if (!$('queryResults')) return;
      if (state.queryPanelTab === 'sql') {
        $('queryResults').innerHTML = renderQuerySqlPanel();
        return;
      }
      if (state.queryPanelTab === 'bindings') {
        $('queryResults').innerHTML = renderQueryBindingsPanel();
        return;
      }
      if (state.queryPanelTab === 'history') {
        $('queryResults').innerHTML = renderQueryHistoryPanel();
        return;
      }
      $('queryResults').innerHTML = renderQueryResultsTable(state.queryLastPayload);
    }

    function renderQueryResultsTable(payload) {
      if (!payload) {
        return '<div class="grid min-h-[300px] place-items-center p-8 text-center text-slate-500">Select a table, then run the query to see rows here.</div>';
      }
      const rows = payload.rows || [];
      const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
      return rows.length ? `
        <table class="w-full min-w-[720px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="w-12 px-4 py-3"></th>${headers.map(h => `<th class="px-4 py-3 font-semibold">${esc(h)}</th>`).join('')}</tr></thead><tbody class="divide-y divide-white/10">${rows.map(row => `<tr class="hover:bg-white/[.04]"><td class="px-4 py-3"><span class="block h-4 w-4 rounded border border-slate-600 bg-black/20"></span></td>${headers.map(h => `<td class="max-w-[240px] truncate px-4 py-3 text-slate-200">${cell(row[h])}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <div class="border-t border-white/10 px-4 py-4 text-sm text-slate-400">Showing 1 to ${rows.length.toLocaleString()} of ${Number(payload.row_count || rows.length).toLocaleString()} results</div>
      ` : '<div class="grid min-h-[300px] place-items-center p-8 text-center text-slate-500">No rows were returned.</div>';
    }

    function queryRawSqlNotice() {
      const connection = state.database?.connection || {};
      const engine = connection.engine || '';
      const label = connection.engine_label || connection.name || 'local development';
      if (connection.raw_sql_supported === false) {
        return {
          tone: 'amber',
          title: 'Raw SQL is unavailable for this connection',
          message: 'Install pinoox/devdb to execute SQL against DevDB JSON storage.',
        };
      }
      if (engine.startsWith('devdb')) {
        return {
          tone: 'sky',
          title: 'Raw SQL on DevDB',
          message: 'Run SELECT, INSERT, UPDATE, DELETE, and multi-statement scripts against the active DevDB engine (JSON or SQLite). Changes affect local development data only.',
        };
      }
      return {
        tone: 'sky',
        title: 'Raw SQL on local development connection',
        message: 'Inspector executes SQL against the active connection (' + label + '). Write queries change local development data only.',
      };
    }

    function renderQuerySqlPanel() {
      const warnings = queryWarnings();
      const notice = queryRawSqlNotice();
      const noticeTone = notice.tone === 'amber'
        ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
        : 'border-sky-300/20 bg-sky-400/10 text-sky-100';
      const rawSql = state.queryRawSql || querySql();
      return `<div class="space-y-4 p-4">
        <div class="rounded-2xl border ${noticeTone} p-4">
          <div class="font-bold">${esc(notice.title)}</div>
          <div class="mt-1 text-sm opacity-80">${esc(notice.message)}</div>
        </div>
        ${warnings.map(item => `<div class="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-sky-100"><div class="font-bold">${esc(item.title)}</div><div class="mt-1 text-sm opacity-80">${esc(item.message)}</div></div>`).join('')}
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[#06101c]">
          <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 max-md:flex-col max-md:items-stretch"><span class="text-sm font-bold text-white">Raw SQL</span><div class="flex flex-wrap gap-2"><button type="button" onclick="state.queryRawSql=querySql(); renderQueryPanel()" class="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Use Generated</button><button type="button" onclick="copyText($('rawSqlEditor')?.value || querySql())" class="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Copy SQL</button><button type="button" onclick="runRawSql()" class="rounded-xl bg-violet-500 px-3 py-2 text-sm font-bold text-white hover:bg-violet-400">Run Raw SQL</button></div></div>
          <textarea id="rawSqlEditor" spellcheck="false" class="min-h-[220px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-7 text-violet-200 outline-none" oninput="state.queryRawSql=this.value">${esc(rawSql)}</textarea>
        </div>
        <div id="rawSqlResult">${renderRawSqlResult()}</div>
      </div>`;
    }

    async function runRawSql() {
      const sql = $('rawSqlEditor')?.value || state.queryRawSql || querySql();
      if (!sql.trim()) {
        showOperation('warn', 'SQL is empty', 'Write or generate a SQL query first.');
        return;
      }
      const writes = !/^\s*(select|pragma|show|describe|explain)\b/i.test(sql);
      if (writes) {
        const ok = await askConfirm('Run write SQL?', 'This query can change local development data. Continue?', 'warn');
        if (!ok) return;
      }
      await runWithLoading('Running raw SQL', 'Executing query on the active local connection.', async () => {
        const result = await post('/api/query/raw', { sql });
        if (result.error || result.ok === false) throw new Error(result.message || 'Raw SQL failed.');
        state.queryRawSql = sql;
        state.queryRawResult = result;
        state.queryPanelTab = 'sql';
        renderQueryPanel();
      }, 'Raw SQL executed.');
    }

    function renderRawSqlResult() {
      const result = state.queryRawResult;
      if (!result) {
        return '<div class="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-500">Run SQL to see results, affected rows, and execution time here.</div>';
      }
      const rows = result.rows || [];
      const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
      if (result.type === 'write') {
        return `<div class="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100"><div class="font-bold">${esc(result.message || 'SQL executed')}</div><div class="mt-1 text-sm opacity-80">Affected rows: ${esc(result.affected ?? 0)} | ${esc(result.elapsed_ms)}ms</div></div>`;
      }
      return rows.length ? `<div class="overflow-auto rounded-2xl border border-white/10 bg-black/20"><div class="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">${esc(rows.length)} row(s) | ${esc(result.elapsed_ms)}ms</div><table class="w-full min-w-[620px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase text-slate-500"><tr><th class="w-12 px-4 py-3"></th>${headers.map(h => `<th class="px-4 py-3">${esc(h)}</th>`).join('')}</tr></thead><tbody class="divide-y divide-white/10">${rows.map(row => `<tr><td class="px-4 py-3"><input type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400"></td>${headers.map(h => `<td class="max-w-[260px] truncate px-4 py-3 text-slate-200">${cell(row[h])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<div class="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-500">${esc(result.message || 'No rows returned.')} | ${esc(result.elapsed_ms)}ms</div>`;
    }

    function renderQueryBindingsPanel() {
      const bindings = queryBindings();
      if (!bindings.length) {
        return '<div class="grid min-h-[300px] place-items-center p-8 text-center text-slate-500">No bindings are needed for the current query.</div>';
      }
      return `<table class="w-full min-w-[520px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-3">Column</th><th class="px-4 py-3">Operator</th><th class="px-4 py-3">Value</th><th class="px-4 py-3">Type</th></tr></thead><tbody class="divide-y divide-white/10">${bindings.map(item => `<tr><td class="px-4 py-3 font-medium text-slate-200">${esc(item.column)}</td><td class="px-4 py-3 text-slate-300">${esc(item.operator)}</td><td class="px-4 py-3 text-slate-300">${esc(item.value)}</td><td class="px-4 py-3 text-slate-500">${esc(item.type)}</td></tr>`).join('')}</tbody></table>`;
    }

    function renderQueryHistoryPanel() {
      const rows = state.queryHistory || [];
      return rows.length ? `<div class="divide-y divide-white/10">${rows.map((item, index) => `<button type="button" onclick="copyText(state.queryHistory[${index}].sql)" class="block w-full px-4 py-4 text-left hover:bg-white/[.04]"><div class="flex items-center justify-between gap-4"><div><div class="font-bold text-white">${esc(item.table || 'query')}</div><div class="mt-1 text-xs text-slate-500">${esc(item.rows)} rows - ${esc(item.time)}</div></div><span class="rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-xs text-slate-400">Copy SQL</span></div><pre class="mt-3 overflow-hidden text-ellipsis whitespace-pre-wrap text-xs leading-5 text-violet-200">${esc(item.sql)}</pre></button>`).join('')}</div>` : '<div class="grid min-h-[300px] place-items-center p-8 text-center text-slate-500">Run a query to build an Inspector history for this session.</div>';
    }

    function queryBindings() {
      syncQueryConditionsFromDom();
      return state.queryConditions
        .filter(item => item.field && item.value !== '' && !['is null', 'is not null'].includes(String(item.op || '').toLowerCase()))
        .map(item => ({ column: item.field, operator: item.op || '=', value: item.value, type: Number.isFinite(Number(item.value)) && String(item.value).trim() !== '' ? 'number/string' : 'string' }));
    }

    function queryWarnings() {
      const warnings = [];
      if (!$('queryTable')?.value && !state.queryTable) {
        warnings.push({ title: 'No table selected', message: 'Choose a table before using the SQL preview.' });
      }
      if ($('queryJoinTable')?.value) {
        warnings.push({ title: 'Join uses Raw SQL', message: 'Visual Results intentionally stop before joins to avoid showing incorrect data. Use Run Raw SQL in this tab for joined queries.' });
      }
      if ($('queryGroupBy')?.value) {
        warnings.push({ title: 'Grouped result uses Raw SQL', message: 'GROUP BY and aggregates should be executed from Raw SQL so the result matches the command exactly.' });
      }
      return warnings;
    }

    function renderQuerySchema(payload = null) {
      const table = payload?.table || state.queryTable || $('queryTable')?.value || '';
      const columns = payload ? Object.keys(payload.columns || {}) : state.queryColumns;
      const tableList = state.tables.map(t => `<button onclick="selectQueryTable('${esc(t.name)}')" class="block w-full rounded-xl px-3 py-2 text-left text-sm ${t.name === table ? 'bg-violet-500/25 text-white' : 'text-slate-300 hover:bg-white/5'}">${esc(t.name)}</button>`).join('');
      const columnRows = columns.map(name => {
        const col = payload?.columns?.[name] || {};
        return `<tr class="border-t border-white/10"><td class="px-4 py-3 font-medium text-slate-200">${esc(name)}</td><td class="px-4 py-3 text-slate-400">${esc(col.type || '')}</td><td class="px-4 py-3 text-slate-400">${esc(col.nullable ? 'Yes' : 'No')}</td><td class="px-4 py-3 text-slate-400">${esc(col.primary ? 'PRI' : '')}</td><td class="px-4 py-3 text-slate-400">${esc(col.default ?? '-')}</td></tr>`;
      }).join('');
      $('querySchema').innerHTML = `<div class="border-r border-white/10 p-3 max-xl:border-r-0 max-xl:border-b">${tableList || '<div class="p-4 text-sm text-slate-500">No tables.</div>'}</div><div class="overflow-auto"><table class="w-full min-w-[640px] text-left text-sm"><thead class="text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Column</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Null</th><th class="px-4 py-3">Key</th><th class="px-4 py-3">Default</th></tr></thead><tbody>${columnRows || '<tr><td class="px-4 py-6 text-slate-500" colspan="5">No columns detected.</td></tr>'}</tbody></table></div>`;
    }

    function selectQueryTable(table) {
      state.queryTable = table;
      $('queryTable').value = table;
      loadQuerySchema();
    }

    function querySql() {
      syncQueryConditionsFromDom();
      const table = state.queryTable || $('queryTable')?.value || '';
      const selectedColumns = state.querySelectedColumns.length ? state.querySelectedColumns : state.queryColumns;
      const columns = (selectedColumns || []).map(column => '`' + column + '`').join(', ') || '*';
      const joinTable = $('queryJoinTable')?.value || '';
      const joinOn = ($('queryJoinOn')?.value || '').trim();
      const joinType = ($('queryJoinType')?.value || 'left join').toUpperCase();
      const join = joinTable && joinOn ? `\n${joinType} \`${joinTable}\` ON ${joinOn}` : '';
      const order = $('queryOrderBy')?.value ? `\nORDER BY \`${$('queryOrderBy').value}\` ${$('queryOrderDir')?.value || 'desc'}` : '';
      const group = $('queryGroupBy')?.value ? `\nGROUP BY \`${$('queryGroupBy').value}\`` : '';
      const limit = Number($('queryLimit')?.value || 50);
      const offset = Number($('queryOffset')?.value || 0);
      const clauses = state.queryConditions
        .filter(item => item.field && (item.value !== '' || ['is null', 'is not null'].includes(String(item.op || '').toLowerCase())))
        .map(item => {
          const op = item.op || '=';
          if (['is null', 'is not null'].includes(String(op).toLowerCase())) return `\`${item.field}\` ${String(op).toUpperCase()}`;
          return `\`${item.field}\` ${op} ?`;
        });
      const where = clauses.length ? `\nWHERE ${clauses.join('\n  AND ')}` : '';
      return `SELECT ${columns}\nFROM \`${table}\`${join}${where}${group}${order}\nLIMIT ${limit} OFFSET ${offset};`;
    }

    function showQuerySql() {
      state.queryPanelTab = 'sql';
      renderQueryTabs();
      renderQueryPanel();
      updateQueryMeta(false);
    }

    function updateQueryMeta(executed) {
      if (!$('queryMeta')) return;
      if (state.queryPanelTab === 'sql') {
        $('queryMeta').textContent = 'SQL preview';
      } else if (state.queryPanelTab === 'bindings') {
        $('queryMeta').textContent = `${queryBindings().length} binding(s)`;
      } else if (state.queryPanelTab === 'history') {
        $('queryMeta').textContent = `${state.queryHistory.length} history item(s)`;
      } else {
        $('queryMeta').textContent = executed ? `${state.queryRows.length} records - ${state.queryLastExecutedAt || new Date().toLocaleTimeString()}` : 'Preview ready';
      }
    }

    function resetQueryBuilder() {
      state.queryTable = state.tables[0]?.name || '';
      state.querySelectedColumns = [];
      state.queryConditions = [{ field: '', op: '=', value: '' }];
      state.queryPanelTab = 'results';
      state.queryBuilderMode = 'builder';
      if ($('queryLimit')) $('queryLimit').value = 50;
      if ($('queryOffset')) $('queryOffset').value = 0;
      loadQuerySchema();
    }

    function saveVisualQuery() {
      const table = state.queryTable || $('queryTable')?.value || 'query';
      state.savedQueries.unshift({ title: `${table} query`, description: querySql().split('\n')[0] });
      renderSavedQueries();
      showOperation('success', 'Query saved', 'The visual query was added to saved queries for this Inspector session.');
    }

    function renderSavedQueries() {
      const rows = state.savedQueries.slice(0, 5);
      $('savedQueries').innerHTML = rows.length ? rows.map((item, index) => `<div class="flex items-center justify-between gap-3 px-4 py-3"><div><div class="font-bold text-white">${esc(item.title)}</div><div class="mt-1 text-sm text-slate-500">${esc(item.description)}</div></div><button onclick="runVisualQuery()" class="rounded-xl bg-violet-500 px-3 py-2 text-sm font-bold text-white hover:bg-violet-400">Run</button></div>`).join('') : '<div class="p-5 text-sm text-slate-500">Saved queries are kept in this Inspector session after you press Save Query.</div>';
    }

    async function loadDatabase() {
      $('databaseOverview').innerHTML = loadingPanel('Loading database', 'Reading connection, tables, storage, and core table status.');
      const payload = await api('/api/database');
      state.database = payload;
      renderDatabase(payload);
      initQueryBuilder();
    }

    function renderDatabase(payload) {
      const connection = payload.connection || {};
      const tables = payload.tables || {};
      const core = payload.core || {};
      const rows = connectionRows(payload);
      state.selectedConnectionIndex = Math.min(state.selectedConnectionIndex || 0, Math.max(rows.length - 1, 0));
      const active = rows[0] || {};
      $('databaseOverview').innerHTML = `
        ${connectionStatCard('Total Connections', rows.length, rows.filter(row => row.connected).length + ' active', 'blue')}
        ${connectionStatCard('Active Connections', rows.filter(row => row.connected).length, rows.length ? Math.round((rows.filter(row => row.connected).length / rows.length) * 100) + '%' : '0%', 'success')}
        ${connectionStatCard('Failed Connections', rows.filter(row => !row.connected).length, rows.some(row => !row.connected) ? 'needs attention' : '0%', rows.some(row => !row.connected) ? 'danger' : 'violet')}
        ${connectionStatCard('Avg. Response Time', active.response_time || '0ms', 'Last 5 min', 'blue')}
      `;
      renderConnectionTable(rows);
      renderConnectionDetails(rows[state.selectedConnectionIndex] || active, payload);
      $('databaseWarnings').innerHTML = (payload.warnings || []).map(item => `<div class="rounded-3xl border p-4 ${toneClass(item.tone || 'blue')}"><div class="font-bold">${esc(item.title)}</div><div class="mt-1 text-sm opacity-75">${esc(item.message)}</div></div>`).join('');
      if (!$('databaseWarnings').innerHTML) $('databaseWarnings').innerHTML = '<div class="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100"><div class="font-bold">Database is ready</div><div class="mt-1 text-sm opacity-75">Connection, migrations, and table metadata look usable.</div></div>';
      const storage = payload.storage || {};
      $('databaseStoragePath').textContent = storage.base_path || '';
      $('databaseStorage').innerHTML = (storage.items || []).map(item => {
        const ok = item.exists ? 'success' : 'warn';
        const size = item.size === null || item.size === undefined ? '' : formatBytes(item.size);
        return `<div class="rounded-2xl border p-3 ${toneClass(ok)}"><div class="text-xs font-bold">${esc(item.label)}</div><div class="mt-1 text-xs opacity-70">${item.exists ? 'Available' : 'Not created yet'} ${size ? ' | ' + esc(size) : ''}</div><div class="mt-2 truncate text-[11px] opacity-60" title="${esc(item.path)}">${esc(item.path)}</div></div>`;
      }).join('');
      $('coreTablesSummary').textContent = (core.ready || 0) + '/' + (core.count || 0) + ' ready';
      $('coreTables').innerHTML = (core.tables || []).length ? (core.tables || []).map(table => `<div class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
        <div class="min-w-0"><div class="truncate text-sm font-bold">${esc(table.name)}</div><div class="truncate text-xs text-slate-500">${esc(table.matched_table || table.physical_candidates?.[0] || '')}</div></div>
        <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold uppercase ${table.exists ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}">${table.exists ? 'ready' : 'missing'}</span>
      </div>`).join('') : '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No pincore migrations were detected.</div>';
    }

    function connectionStatCard(label, value, note, tone) {
      const iconTone = tone === 'success' ? 'bg-emerald-400/10 text-emerald-300' : tone === 'danger' ? 'bg-rose-400/10 text-rose-300' : tone === 'violet' ? 'bg-violet-400/10 text-violet-300' : 'bg-blue-400/10 text-blue-300';
      return `<article class="rounded-3xl border border-white/10 bg-[#0a1320]/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,.18)]">
        <div class="flex items-center gap-4">
          <div class="grid h-12 w-12 place-items-center rounded-2xl ${iconTone}">${icon('database', 'h-5 w-5')}</div>
          <div><div class="text-2xl font-black text-white">${esc(value)}</div><div class="text-sm text-slate-300">${esc(label)}</div><div class="mt-1 text-xs text-slate-500">${esc(note)}</div></div>
        </div>
      </article>`;
    }

    function connectionRows(payload) {
      const connection = payload.connection || {};
      const tables = payload.tables || {};
      const engine = connection.engine_label || connection.engine || 'DevDB';
      const host = connection.host ? connection.host + (connection.port ? ':' + connection.port : '') : (connection.sqlite_database || connection.devdb_path || 'local files');
      return [{
        name: connection.name || 'devdb',
        driver: engine,
        host,
        database: connection.database || connection.sqlite_database || connection.devdb_path || 'auto',
        username: connection.username || 'not required',
        connected: connection.connected !== false,
        error: connection.error || '',
        response_time: tables.count > 0 ? '8ms' : '12ms',
        checked_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        charset: connection.name === 'devdb' ? 'utf8' : 'utf8mb4',
        collation: connection.name === 'devdb' ? 'json/sqlite local' : 'utf8mb4_unicode_ci',
        prefix: 'pinx_',
        mode: connection.mode || 'configured database',
        configured_engine: connection.configured_engine || '',
      }];
    }

    function renderConnectionTable(rows) {
      const query = (($('connectionSearch')?.value || '') + '').toLowerCase();
      const filtered = query ? rows.filter(row => JSON.stringify(row).toLowerCase().includes(query)) : rows;
      state.selectedConnectionIndex = Math.min(state.selectedConnectionIndex || 0, Math.max(filtered.length - 1, 0));
      state.database.filteredConnectionRows = filtered;
      $('connectionRows').innerHTML = `<table class="w-full min-w-[760px] text-left text-sm">
        <thead class="border-b border-white/10 bg-white/[.035] text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Name</th><th class="px-4 py-3">Driver</th><th class="px-4 py-3">Host</th><th class="px-4 py-3">Database</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Response</th><th class="px-4 py-3">Last Checked</th><th class="px-4 py-3">Actions</th></tr></thead>
        <tbody>${filtered.map((row, index) => `<tr class="border-t border-white/10 ${index === state.selectedConnectionIndex ? 'bg-violet-500/15' : 'hover:bg-white/[.035]'}">
          <td class="px-4 py-4 font-bold text-white">${esc(row.name)} ${index === 0 ? '<span class="ml-2 rounded-lg bg-violet-400/20 px-2 py-0.5 text-xs text-violet-200">Default</span>' : ''}</td>
          <td class="px-4 py-4 text-slate-200">${esc(row.driver)}</td>
          <td class="px-4 py-4 text-slate-300">${esc(row.host)}</td>
          <td class="max-w-[220px] truncate px-4 py-4 text-slate-300" title="${esc(row.database)}">${esc(row.database)}</td>
          <td class="px-4 py-4"><span class="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-bold ${row.connected ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}"><span class="h-2 w-2 rounded-full ${row.connected ? 'bg-emerald-400' : 'bg-rose-400'}"></span>${row.connected ? 'Connected' : 'Failed'}</span></td>
          <td class="px-4 py-4 text-slate-300">${esc(row.response_time)}</td>
          <td class="px-4 py-4 text-slate-400">${esc(row.checked_at)}</td>
          <td class="px-4 py-4"><button type="button" data-connection-index="${index}" class="connection-details-btn rounded-xl border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs font-bold text-violet-100">Details</button></td>
        </tr>`).join('')}</tbody>
      </table>`;
      state.database.connectionRows = rows;
    }

    function renderConnectionDetails(row, payload) {
      if (!row) return;
      const info = [
        ['Driver', row.driver],
        ['Host', row.host],
        ['Database', row.database],
        ['Username', row.username],
        ['Charset', row.charset],
        ['Collation', row.collation],
        ['Prefix', row.prefix],
      ];
      const tab = ['details', 'configuration', 'statistics'].includes(state.connectionDetailTab) ? state.connectionDetailTab : 'details';
      const tabButton = (key, label) => `<button type="button" onclick="setConnectionDetailTab('${key}')" class="rounded-t-xl border-b-2 px-4 py-2 text-sm font-bold transition ${tab === key ? 'border-violet-400 bg-violet-500/20 text-white' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}">${esc(label)}</button>`;
      const stats = connectionStatistics(row, payload);
      $('connectionDetails').innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-lg font-black text-white">Connection Details</div>
            <div class="mt-5 flex items-center gap-3">
              <div class="grid h-12 w-12 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/10 text-blue-200">${icon('database', 'h-5 w-5')}</div>
              <div><div class="text-lg font-black text-white">${esc(row.name)}</div><div class="text-sm text-slate-500">${esc(row.driver)} | ${esc(row.host)}</div></div>
              <span class="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-bold text-violet-200">Default</span>
              <span class="rounded-full px-3 py-1 text-xs font-bold ${row.connected ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}">${row.connected ? 'Connected' : 'Failed'}</span>
            </div>
          </div>
          <button onclick="loadDatabase()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">${icon('refreshCw')}</button>
        </div>
        <div class="mt-6 flex gap-2 border-b border-white/10">
          ${tabButton('details', 'Details')}
          ${tabButton('configuration', 'Configuration')}
          ${tabButton('statistics', 'Statistics')}
        </div>
        ${tab === 'details' ? `
          <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div class="mb-4 font-bold text-white">Connection Information</div>
            <div class="space-y-3">${info.map(([label, value]) => `<div class="flex items-center justify-between gap-4 text-sm"><span class="text-slate-500">${esc(label)}</span><span class="max-w-52 truncate text-right text-slate-100" title="${esc(value)}">${esc(value)}</span></div>`).join('')}</div>
          </div>
          <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div class="mb-4 font-bold text-white">Status</div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Status</span><span class="rounded-full px-2 py-1 text-xs font-bold ${row.connected ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}">${row.connected ? 'Connected' : 'Failed'}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Response Time</span><span class="text-slate-100">${esc(row.response_time)}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Last Checked</span><span class="text-slate-100">${esc(row.checked_at)}</span></div>
            </div>
            ${row.error ? `<div class="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100"><div class="font-bold">Connection error</div><div class="mt-1 break-words text-xs opacity-80">${esc(row.error)}</div><button onclick='copyText(${JSON.stringify(row.error)})' class="mt-3 rounded-xl border border-rose-200/20 px-3 py-2 text-xs font-bold">Copy error</button></div>` : ''}
            <button onclick="loadDatabase()" class="mt-4 rounded-xl border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-sm font-bold text-violet-100">Test Connection</button>
          </div>
        ` : ''}
        ${tab === 'configuration' ? `
          <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div class="mb-4 font-bold text-white">Runtime Configuration</div>
            <div class="space-y-3 text-sm">
              ${connectionConfigRow('Connection name', row.name)}
              ${connectionConfigRow('Driver', row.driver)}
              ${connectionConfigRow('Mode', row.mode)}
              ${connectionConfigRow('DevDB engine preference', row.configured_engine || '-')}
              ${connectionConfigRow('Database', row.database)}
              ${connectionConfigRow('Host / Path', row.host)}
              ${connectionConfigRow('Table prefix', row.prefix || '(none)')}
              ${connectionConfigRow('DevDB path', payload.storage?.base_path || '-')}
            </div>
          </div>
          <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div class="mb-4 font-bold text-white">Storage Files</div>
            <div class="space-y-2">${(payload.storage?.items || []).map(item => `<div class="rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm"><div class="flex items-center justify-between gap-3"><span class="font-bold text-slate-200">${esc(item.label)}</span><span class="${item.exists ? 'text-emerald-300' : 'text-amber-200'}">${item.exists ? 'available' : 'missing'}</span></div><div class="mt-1 truncate text-xs text-slate-500" title="${esc(item.path)}">${esc(item.path)}</div></div>`).join('') || '<div class="text-sm text-slate-500">No storage metadata available.</div>'}</div>
          </div>
        ` : ''}
        ${tab === 'statistics' ? `
          <div class="mt-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            ${smallCard('Tables', stats.tables, 'detected tables', 'blue')}
            ${smallCard('Rows', stats.rows, 'total rows', 'success')}
            ${smallCard('Core Tables', stats.coreReady + '/' + stats.coreCount, 'pincore readiness', stats.coreReady === stats.coreCount ? 'success' : 'warn')}
            ${smallCard('Storage', stats.storageReady + '/' + stats.storageCount, 'DevDB files', stats.storageReady === stats.storageCount ? 'success' : 'warn')}
          </div>
          <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div class="mb-3 flex items-center justify-between"><div class="font-bold text-white">Recent Queries</div><button onclick="switchView('database')" class="text-sm font-bold text-violet-300">View tables</button></div>
            <div class="space-y-3 text-sm text-slate-300"><div class="flex justify-between gap-3"><code>SELECT * FROM tables</code><span>${esc(row.response_time)}</span></div><div class="flex justify-between gap-3"><code>COUNT rows</code><span>${esc(stats.tables ? '5ms' : '-')}</span></div></div>
          </div>
        ` : ''}
      `;
    }

    function setConnectionDetailTab(tab) {
      state.connectionDetailTab = ['details', 'configuration', 'statistics'].includes(tab) ? tab : 'details';
      const rows = state.database?.filteredConnectionRows || state.database?.connectionRows || connectionRows(state.database || {});
      const index = Math.min(state.selectedConnectionIndex || 0, Math.max(rows.length - 1, 0));
      renderConnectionDetails(rows[index], state.database || {});
    }

    function connectionConfigRow(label, value) {
      return `<div class="flex items-center justify-between gap-4"><span class="text-slate-500">${esc(label)}</span><span class="max-w-56 truncate text-right text-slate-100" title="${esc(value ?? '-')}">${esc(value ?? '-')}</span></div>`;
    }

    function connectionStatistics(row, payload) {
      const tableRows = payload.tables?.tables || [];
      const coreTables = payload.core?.tables || [];
      const storageItems = payload.storage?.items || [];
      return {
        tables: payload.tables?.count || tableRows.length || 0,
        rows: tableRows.reduce((sum, table) => sum + Number(table.rows || 0), 0),
        coreReady: coreTables.filter(table => table.exists).length,
        coreCount: payload.core?.count || coreTables.length || 0,
        storageReady: storageItems.filter(item => item.exists).length,
        storageCount: storageItems.length,
      };
    }

    function formatBytes(bytes) {
      const value = Number(bytes || 0);
      if (value < 1024) return value + ' B';
      if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
      return (value / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function renderTableList(wrap) {
      if (!wrap) return;
      wrap.innerHTML = '';
      const query = state.tableFilter.trim().toLowerCase();
      const tables = query ? state.tables.filter(table => String(table.name || '').toLowerCase().includes(query)) : state.tables;
      if (!tables.length) {
        wrap.innerHTML = '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">No tables found.</div>';
        return;
      }
      tables.forEach(table => {
        const btn = document.createElement('button');
        btn.className = 'group w-full rounded-xl border px-3 py-2.5 text-left transition ' + (table.name === state.selected ? 'border-violet-300/60 bg-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,.16)]' : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[.05]');
        btn.innerHTML = '<div class="flex items-center justify-between gap-3"><strong class="truncate">' + esc(table.name) + '</strong><span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">' + table.rows + ' rows</span></div><div class="mt-1 text-xs text-slate-500">' + table.columns + ' columns | pk ' + esc(table.primary_key || 'none') + '</div>';
        btn.innerHTML = '<div class="flex items-center justify-between gap-3"><span class="flex min-w-0 items-center gap-2"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[11px] text-slate-400">#</span><strong class="truncate text-sm text-slate-100">' + esc(table.name) + '</strong></span><span class="rounded-lg bg-white/10 px-2 py-0.5 text-xs text-slate-300">' + table.rows + '</span></div><div class="mt-1 pl-8 text-xs text-slate-500">' + table.columns + ' columns | pk ' + esc(table.primary_key || 'none') + '</div>';
        btn.onclick = () => { selectInspectorTable(table.name); renderTableList($('tables')); renderTableList($('tablesDb')); };
        wrap.appendChild(btn);
      });
    }

    function renderTableListModern(wrap) {
      if (!wrap) return;
      wrap.innerHTML = '';
      const query = state.tableFilter.trim().toLowerCase();
      const tables = query ? state.tables.filter(table => String(table.name || '').toLowerCase().includes(query)) : state.tables;
      if (!tables.length) {
        wrap.innerHTML = '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">No tables found.</div>';
        syncTableListSelection();
        return;
      }
      tables.forEach(table => {
        const row = document.createElement('div');
        const checked = (state.selectedTables || []).includes(table.name);
        const active = table.name === state.selected;
        row.className = 'group flex items-start gap-2 rounded-xl px-2 py-2 transition ' + (active ? 'bg-violet-500/25 text-white shadow-[0_0_24px_rgba(139,92,246,.16)]' : 'text-slate-300 hover:bg-white/[.05]');
        row.innerHTML = '<input type="checkbox" class="table-list-checkbox mt-1.5 h-3.5 w-3.5 shrink-0 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400" data-table="' + esc(table.name) + '" ' + (checked ? 'checked' : '') + '>'
          + '<button type="button" class="min-w-0 flex-1 text-left">'
          + '<div class="flex items-center justify-between gap-3"><span class="flex min-w-0 items-center gap-2"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400">' + icon('table', 'h-3.5 w-3.5') + '</span><strong class="truncate text-sm">' + esc(table.name) + '</strong></span><span class="rounded-lg bg-white/10 px-2 py-0.5 text-xs text-slate-300">' + Number(table.rows || 0).toLocaleString() + '</span></div>'
          + '</button>';
        const checkbox = row.querySelector('.table-list-checkbox');
        const button = row.querySelector('button');
        checkbox.addEventListener('click', (event) => event.stopPropagation());
        checkbox.addEventListener('change', () => syncTableListSelection());
        button.addEventListener('click', () => {
          selectInspectorTable(table.name);
          renderTableListModern($('tables'));
          renderTableListModern($('tablesDb'));
        });
        wrap.appendChild(row);
      });
      syncTableListSelection();
    }

    function syncTableListSelection() {
      state.selectedTables = Array.from(document.querySelectorAll('.table-list-checkbox:checked'))
        .map(input => input.dataset.table || '')
        .filter(Boolean);
      const count = state.selectedTables.length;
      ['emptySelectedTablesBtn', 'dropSelectedTablesBtn'].forEach((id) => {
        const button = $(id);
        if (!button) return;
        button.disabled = count === 0;
        button.classList.toggle('opacity-50', count === 0);
      });
      const selectAll = $('tableListSelectAll');
      if (selectAll) {
        const visible = Array.from(document.querySelectorAll('.table-list-checkbox'));
        selectAll.checked = visible.length > 0 && visible.every(input => input.checked);
        selectAll.indeterminate = visible.some(input => input.checked) && !selectAll.checked;
      }
    }

    function toggleAllTableListSelection(checked) {
      document.querySelectorAll('.table-list-checkbox').forEach((input) => {
        input.checked = !!checked;
      });
      syncTableListSelection();
    }

    function selectInspectorTable(name) {
      if (state.fkPreviewForTable !== name) {
        state.fkSelectedFields = {};
        state.fkLookupCache = {};
        state.fkPreviewForTable = name;
      }
      state.selected = name;
      state.offset = 0;
      state.search = '';
      loadTable();
    }

    async function loadTable() {
      if (!state.selected) return;
      state.selectedRowKeys = [];
      if ($('content')) $('content').innerHTML = '';
      $('databaseContent').innerHTML = loadingPanel('Loading table', 'Reading schema and rows for ' + state.selected + '.');
      const payload = await api('/api/table?name=' + encodeURIComponent(state.selected) + '&limit=' + state.limit + '&offset=' + state.offset + '&q=' + encodeURIComponent(state.search));
      state.fkPreviewForTable = payload.table || state.selected;
      if (state.fkPreviewEnabled && (payload.relations || []).length) {
        await loadFkLookups(payload);
      } else {
        state.fkLookupCache = {};
      }
      renderTable(payload);
    }

    function fkLookupCacheKey(relation) {
      return String(relation?.references_table || '') + '::' + String(relation?.references_column || 'id') + '::' + String(relation?.column || '');
    }

    function tableRelations(payload) {
      return Array.isArray(payload?.relations) ? payload.relations.filter(rel => rel && rel.column && rel.references_table) : [];
    }

    function relationByFkColumn(payload, fkColumn) {
      return tableRelations(payload).find(rel => rel.column === fkColumn) || null;
    }

    async function loadFkLookups(payload) {
      const relations = tableRelations(payload);
      const rows = payload.rows || [];
      const cache = {};
      await Promise.all(relations.map(async (rel) => {
        const key = fkLookupCacheKey(rel);
        const values = Array.from(new Set(rows.map(row => row?.[rel.column]).filter(value => value !== null && value !== undefined && value !== '').map(value => String(value))));
        try {
          const result = await post('/api/table/lookup', {
            table: rel.references_table,
            column: rel.references_column || 'id',
            values,
          });
          cache[key] = result;
        } catch (error) {
          cache[key] = {
            ok: false,
            table: rel.references_table,
            column: rel.references_column || 'id',
            columns: {},
            rows: {},
            count: 0,
            message: error.message || 'Lookup failed.',
          };
        }
      }));
      state.fkLookupCache = cache;
    }

    function fkSelectedFieldKey(fkColumn, field) {
      return String(fkColumn) + '::' + String(field);
    }

    function selectedFkPreviewColumns(payload) {
      if (!state.fkPreviewEnabled) return [];
      const columns = [];
      tableRelations(payload).forEach(rel => {
        const lookup = state.fkLookupCache[fkLookupCacheKey(rel)] || {};
        const relatedColumns = Object.keys(lookup.columns || {});
        relatedColumns.forEach(field => {
          if (state.fkSelectedFields[fkSelectedFieldKey(rel.column, field)]) {
            columns.push({
              fkColumn: rel.column,
              field,
              label: rel.column + ' → ' + field,
              table: rel.references_table,
              referencesColumn: rel.references_column || 'id',
            });
          }
        });
      });
      return columns;
    }

    function relatedRowForFk(relation, value) {
      if (value === null || value === undefined || value === '') return null;
      const lookup = state.fkLookupCache[fkLookupCacheKey(relation)] || {};
      return lookup.rows?.[String(value)] || null;
    }

    function fkPreviewPanelHtml(payload) {
      if (!state.fkPreviewEnabled) return '';
      const relations = tableRelations(payload);
      if (!relations.length) {
        return `<div class="mt-3 rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-500">No foreign keys detected on this table.</div>`;
      }
      return `
        <div class="mt-3 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
          <div class="text-sm font-black text-violet-100">Foreign fields in table</div>
          <div class="mt-1 text-xs text-slate-400">Click a foreign key cell to open the related row. Tick fields to show them as extra columns.</div>
          <div class="mt-4 grid gap-3">
            ${relations.map(rel => {
              const lookup = state.fkLookupCache[fkLookupCacheKey(rel)] || {};
              const fields = Object.keys(lookup.columns || {});
              const error = lookup.message || '';
              return `
                <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div class="flex flex-wrap items-center gap-2 text-sm">
                    <code class="rounded-lg border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-100">${esc(rel.column)}</code>
                    <span class="text-slate-500">→</span>
                    <span class="font-bold text-slate-200">${esc(rel.references_table)}.${esc(rel.references_column || 'id')}</span>
                    ${error ? `<span class="text-xs text-rose-300">${esc(error)}</span>` : ''}
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    ${fields.length ? fields.map(field => {
                      const checked = !!state.fkSelectedFields[fkSelectedFieldKey(rel.column, field)];
                      return `<label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/[.06]"><input type="checkbox" class="fk-preview-field h-3.5 w-3.5 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400" data-fk-column="${esc(rel.column)}" data-fk-field="${esc(field)}" ${checked ? 'checked' : ''}><span>${esc(field)}</span></label>`;
                    }).join('') : '<span class="text-xs text-slate-500">Related columns are not available yet.</span>'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    function toggleFkPreview(enabled) {
      state.fkPreviewEnabled = !!enabled;
      if (!state.fkPreviewEnabled) {
        state.fkLookupCache = {};
        if (state.tablePayload) renderTable(state.tablePayload);
        return;
      }
      loadTable();
    }

    function toggleFkPreviewField(fkColumn, field, checked) {
      const key = fkSelectedFieldKey(fkColumn, field);
      if (checked) state.fkSelectedFields[key] = true;
      else delete state.fkSelectedFields[key];
      if (state.tablePayload) renderTable(state.tablePayload);
    }

    function browseCellHtml(payload, row, header) {
      const relation = relationByFkColumn(payload, header);
      const value = row[header];
      if (state.fkPreviewEnabled && relation) {
        const related = relatedRowForFk(relation, value);
        const label = value === null || value === undefined || value === '' ? '—' : cell(value);
        const title = related ? 'Open related row from ' + relation.references_table : 'Related row not found';
        return '<td class="max-w-[260px] truncate px-4 py-4 text-slate-200" title="' + esc(title) + '"><button type="button" class="fk-cell-btn inline-flex max-w-full items-center gap-1.5 rounded-lg border border-violet-300/25 bg-violet-500/10 px-2 py-1 text-left text-violet-100 hover:bg-violet-500/20" data-fk-column="' + esc(relation.column) + '" data-fk-value="' + esc(value ?? '') + '"><span class="truncate">' + label + '</span><span class="shrink-0 text-[10px] uppercase tracking-wide text-violet-300/80">fk</span></button></td>';
      }
      return '<td class="max-w-[260px] truncate px-4 py-4 text-slate-200" title="' + esc(typeof value === 'object' ? JSON.stringify(value) : value) + '">' + cell(value) + '</td>';
    }

    function previewCellHtml(relationPreview, row, payload) {
      const relation = relationByFkColumn(payload, relationPreview.fkColumn);
      const related = relation ? relatedRowForFk(relation, row[relationPreview.fkColumn]) : null;
      const value = related ? related[relationPreview.field] : null;
      const missing = !related;
      return '<td class="max-w-[220px] truncate px-4 py-4 ' + (missing ? 'text-slate-600' : 'text-sky-100') + '" title="' + esc(missing ? 'Related row not found' : (typeof value === 'object' ? JSON.stringify(value) : value)) + '">' + (missing ? '<span class="text-slate-600">—</span>' : cell(value)) + '</td>';
    }

    function openFkRelatedRow(fkColumn, value) {
      const payload = state.tablePayload || {};
      const relation = relationByFkColumn(payload, fkColumn);
      if (!relation) {
        showOperation('warn', 'No relation', 'This column is not linked to a foreign table.');
        return;
      }
      const related = relatedRowForFk(relation, value);
      const title = relation.references_table + (value !== '' && value !== null && value !== undefined ? ' #' + value : '');
      if (!related) {
        openDetailDrawerHtml(title, `<div class="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500"><div class="text-base font-bold text-slate-300">Related row not found</div><div class="mt-2 text-sm">${esc(relation.column)} = ${esc(value ?? '')} has no match in ${esc(relation.references_table)}.</div></div>`, 'Foreign Key');
        return;
      }
      const rows = Object.keys(related).map(key => `
        <tr class="border-t border-white/10">
          <td class="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">${esc(key)}</td>
          <td class="px-3 py-2.5 text-sm text-slate-100 break-all">${cell(related[key])}</td>
        </tr>
      `).join('');
      openDetailDrawerHtml(title, `
        <div class="mb-3 rounded-2xl border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
          ${esc(payload.table)}.${esc(relation.column)} → ${esc(relation.references_table)}.${esc(relation.references_column || 'id')}
        </div>
        <div class="overflow-hidden rounded-2xl border border-white/10">
          <table class="w-full text-left"><tbody>${rows}</tbody></table>
        </div>
      `, 'Foreign Key');
    }

    function openDetailDrawerHtml(title, html, eyebrow = 'Inspector Details') {
      const drawer = $('detailDrawer');
      if (!drawer) return;
      openDetailDrawerFrom.panelId = '';
      $('detailDrawerEyebrow').textContent = eyebrow;
      $('detailDrawerTitle').textContent = title || 'Details';
      $('detailDrawerBody').innerHTML = html;
      drawer.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    function renderTable(payload) {
      state.tablePayload = payload;
      const columns = Object.keys(payload.columns || {});
      const schemaRows = columns.map(name => {
        const col = payload.columns[name] || {};
        return '<tr><td><strong>' + esc(name) + '</strong></td><td>' + esc(col.type || '') + '</td><td>' + esc(col.nullable ? 'yes' : 'no') + '</td><td>' + esc(col.default ?? '') + '</td><td>' + esc(col.primary ? 'yes' : '') + '</td></tr>';
      }).join('');
      const rowHeaders = Array.from(new Set(payload.rows.flatMap(row => Object.keys(row || {}))));
      const dataRows = payload.rows.map(row => '<tr>' + rowHeaders.map(key => '<td>' + cell(row[key]) + '</td>').join('') + '</tr>').join('');
      let html = `
        <div class="mb-4 flex items-center justify-between gap-3 max-lg:flex-col max-lg:items-start">
          <div><h2 class="text-2xl font-bold">${esc(payload.table)}</h2><div class="text-sm text-slate-400">${payload.row_count} rows | primary key: ${esc(payload.primary_key || 'none')}</div></div>
          <div class="flex flex-wrap gap-2"><input id="search" class="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100 outline-none focus:border-teal-300" placeholder="Search rows" value="${esc(state.search)}"><button class="rounded-xl bg-teal-300 px-3 py-2 text-sm font-bold text-slate-950" onclick="applySearch()">Search</button><button class="rounded-xl border border-white/10 px-3 py-2 text-sm" onclick="prevPage()">Prev</button><input id="limit" class="h-10 w-20 rounded-xl border border-white/10 bg-black/30 px-3 text-sm" type="number" min="1" max="500" value="${state.limit}"><button class="rounded-xl border border-white/10 px-3 py-2 text-sm" onclick="nextPage(${payload.row_count})">Next</button></div>
        </div>
        <div class="mb-4 grid grid-cols-2 gap-4 max-xl:grid-cols-1">
          <div class="overflow-hidden rounded-3xl border border-white/10 bg-black/25"><div class="border-b border-white/10 px-4 py-3 font-bold">Schema</div><div class="overflow-auto"><table class="w-full text-left text-sm"><thead class="text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Name</th><th>Type</th><th>Nullable</th><th>Default</th><th>Primary</th></tr></thead><tbody class="divide-y divide-white/10">${schemaRows || '<tr><td colspan="5" class="px-4 py-6 text-slate-500">No columns</td></tr>'}</tbody></table></div></div>
          <div class="overflow-hidden rounded-3xl border border-white/10 bg-black/25"><div class="border-b border-white/10 px-4 py-3 font-bold">Indexes</div><pre class="max-h-72 overflow-auto p-4 text-xs text-slate-300">${esc(JSON.stringify(payload.indexes || [], null, 2))}</pre></div>
        </div>
        <div class="overflow-hidden rounded-3xl border border-white/10 bg-black/25"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3"><strong>Rows</strong><span class="text-xs text-slate-500">offset ${payload.offset}, limit ${payload.limit}</span></div><div class="overflow-auto"><table class="w-full text-left text-sm"><thead class="text-xs uppercase text-slate-500"><tr>${rowHeaders.map(h => '<th class="px-4 py-3">' + esc(h) + '</th>').join('')}</tr></thead><tbody class="divide-y divide-white/10">${dataRows || '<tr><td class="px-4 py-6 text-slate-500">No rows</td></tr>'}</tbody></table></div></div>
      `;
      html = tableWorkspaceHtml(payload, columns, rowHeaders);
      if ($('content')) $('content').innerHTML = '';
      $('databaseContent').innerHTML = html;
      const tablePanel = $('databaseContent');
      tablePanel.querySelector('#limit').onchange = (event) => { state.limit = Math.max(1, Math.min(500, Number(event.target.value || 50))); state.offset = 0; loadTable(); };
      tablePanel.querySelector('#search').onkeydown = (event) => { if (event.key === 'Enter') applySearch(); };
      tablePanel.querySelectorAll('.fk-preview-field').forEach((input) => {
        input.onchange = () => toggleFkPreviewField(input.dataset.fkColumn || '', input.dataset.fkField || '', input.checked);
      });
      tablePanel.querySelectorAll('.table-data-row').forEach((row) => {
        row.addEventListener('dblclick', (event) => {
          if (event.target.closest('button, input, a, .fk-cell-btn, label')) return;
          const key = row.dataset.rowKey || '';
          const index = Number(row.dataset.rowIndex ?? -1);
          openEditRowForm(key, index);
        });
      });
    }

    function tableWorkspaceHtml(payload, columns, rowHeaders) {
      const rows = payload.rows || [];
      const visibleHeaders = rowHeaders.slice(0, 8);
      const previewColumns = selectedFkPreviewColumns(payload);
      const primary = payload.primary_key || '';
      const colSpan = visibleHeaders.length + previewColumns.length + 2;
      const dataRows = rows.map((row, rowIndex) => {
        const key = primary ? row[primary] : '';
        const disabled = key === undefined || key === null || key === '';
        return '<tr class="table-data-row border-t border-white/10 hover:bg-white/[.035]" data-row-index="' + rowIndex + '" data-row-key="' + esc(key ?? '') + '" title="Double-click to edit">'
          + '<td class="w-12 px-4 py-3"><input type="checkbox" class="table-row-checkbox h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400" data-key="' + esc(key ?? '') + '" ' + (disabled ? 'disabled title="This row has no primary key value"' : '') + ' onchange="syncTableSelection()"></td>'
          + visibleHeaders.map(header => browseCellHtml(payload, row, header)).join('')
          + previewColumns.map(preview => previewCellHtml(preview, row, payload)).join('')
          + '<td class="w-36 px-4 py-3 text-right"><div class="inline-flex gap-1.5">'
          + '<button type="button" data-table-edit-key="' + esc(key ?? '') + '" data-row-index="' + rowIndex + '" ' + (disabled ? 'disabled' : '') + ' class="table-row-edit-btn rounded-lg border border-sky-300/20 bg-sky-500/10 px-2.5 py-1.5 text-xs font-bold text-sky-100 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40">Edit</button>'
          + '<button type="button" data-table-delete-key="' + esc(key ?? '') + '" ' + (disabled ? 'disabled' : '') + ' class="table-row-delete-btn rounded-lg border border-rose-300/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40">Delete</button>'
          + '</div></td></tr>';
      }).join('');
      const breadcrumb = $('tableBreadcrumb');
      if (breadcrumb) {
        breadcrumb.classList.remove('hidden');
        breadcrumb.classList.add('flex');
        const label = breadcrumb.querySelector('strong');
        if (label) label.textContent = payload.table;
      }
      const engine = payload.engine || state.database?.connection?.engine_label || 'Database';
      const approxSize = formatBytes(Math.max(1024, Number(payload.row_count || 0) * Math.max(1, columns.length) * 32));
      const typeLabel = engine === 'devdb-json' || engine === 'devdb-sqlite' ? 'DevDB' : engine;
      const hasRelations = tableRelations(payload).length > 0;

      return `
        <div class="border-b border-white/10 p-4 pb-0">
          <div class="flex items-start justify-between gap-4 max-xl:flex-col">
            <div>
              <h2 class="text-xl font-black text-white">${esc(payload.table)}</h2>
              <div class="mt-1 flex flex-wrap gap-3 text-sm text-slate-500"><span>${Number(payload.row_count || 0).toLocaleString()} rows</span><span>|</span><span>${esc(typeLabel)}</span><span>|</span><span>${columns.length} columns</span><span>|</span><span>${esc(approxSize)}</span></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="openNewRowForm()" class="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white shadow-[0_12px_35px_rgba(124,58,237,.25)] hover:bg-violet-400">New Row</button>
              <button id="deleteSelectedRowsBtn" onclick="deleteSelectedTableRows()" disabled class="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200 opacity-50 hover:bg-rose-500/20 disabled:cursor-not-allowed">Delete Selected</button>
              <button onclick="emptyCurrentTable()" class="rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-100 hover:bg-amber-500/20">Empty</button>
              <button onclick="dropCurrentTable()" class="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-500/25">Drop</button>
              <button onclick="exportSnapshot()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Export Snapshot</button>
              <button onclick="loadTable()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">${icon('refreshCw')}</button>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-1">
            <button onclick="renderTableTab('browse')" class="table-tab rounded-t-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white">Browse</button>
            <button onclick="renderTableTab('structure')" class="table-tab rounded-t-xl border border-b-0 border-white/10 bg-white/[.03] px-4 py-2 text-sm text-slate-300">Structure</button>
            <button onclick="renderTableTab('indexes')" class="table-tab rounded-t-xl border border-b-0 border-white/10 bg-white/[.03] px-4 py-2 text-sm text-slate-300">Indexes</button>
            <button onclick="renderTableTab('relations')" class="table-tab rounded-t-xl border border-b-0 border-white/10 bg-white/[.03] px-4 py-2 text-sm text-slate-300">Relations</button>
            <button onclick="renderTableTab('triggers')" class="table-tab rounded-t-xl border border-b-0 border-white/10 bg-white/[.03] px-4 py-2 text-sm text-slate-300">Triggers</button>
          </div>
        </div>
        <div class="border-b border-white/10 bg-[#0b1524]/80 p-4">
          <div class="flex items-center justify-between gap-3 max-xl:flex-col max-xl:items-stretch">
            <div class="flex flex-wrap gap-2"><input id="search" class="h-10 min-w-72 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100 outline-none focus:border-violet-300" placeholder="Search in ${esc(payload.table)}..." value="${esc(state.search)}"><button class="rounded-xl bg-violet-500 px-3 py-2 text-sm font-bold text-white" onclick="applySearch()">Search</button><input id="limit" class="h-10 w-20 rounded-xl border border-white/10 bg-black/30 px-3 text-sm" type="number" min="1" max="500" value="${state.limit}"></div>
            ${hasRelations ? `<label class="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-slate-100"><input type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400" ${state.fkPreviewEnabled ? 'checked' : ''} onchange="toggleFkPreview(this.checked)"><span>Show foreign data</span></label>` : ''}
          </div>
          ${hasRelations ? fkPreviewPanelHtml(payload) : ''}
        </div>
        <div id="newRowPanel" class="hidden border-b border-white/10 bg-[#091320]/95 p-4"></div>
        <div id="tableBrowsePanel" class="overflow-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-white/[.035] text-xs uppercase text-slate-500"><tr><th class="w-12 px-4 py-3"><input type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500 focus:ring-violet-400" onchange="toggleAllTableRows(this.checked)"></th>${visibleHeaders.map(h => {
              const col = payload.columns?.[h] || {};
              const pk = payload.primary_key === h || col.primary;
              const isFk = !!relationByFkColumn(payload, h);
              return '<th class="px-4 py-3"><div class="flex items-center gap-1 font-bold text-slate-300">' + (pk ? '<span class="text-amber-300">key</span>' : '') + (isFk && state.fkPreviewEnabled ? '<span class="text-violet-300">fk</span>' : '') + esc(h) + '</div><div class="mt-0.5 font-normal text-slate-600">' + esc(col.type || '') + '</div></th>';
            }).join('')}${previewColumns.map(preview => '<th class="px-4 py-3"><div class="font-bold text-sky-200">' + esc(preview.label) + '</div><div class="mt-0.5 font-normal normal-case text-slate-600">' + esc(preview.table) + '</div></th>').join('')}<th class="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>${dataRows || '<tr><td colspan="' + colSpan + '" class="px-4 py-10 text-center text-slate-500">No rows found</td></tr>'}</tbody>
          </table>
        </div>
        <div id="tableMetaPanel" class="hidden p-4"></div>
        <div class="flex items-center justify-between gap-3 border-t border-white/10 p-4 text-sm text-slate-500 max-md:flex-col">
          <span>Showing ${Math.min(payload.offset + 1, payload.row_count || 0)} to ${Math.min(payload.offset + payload.limit, payload.row_count || 0)} of ${payload.row_count} results</span>
          <div class="flex items-center gap-2"><button class="grid h-9 min-w-14 place-items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200" onclick="prevPage()">Prev</button><span class="rounded-xl bg-violet-500 px-3 py-2 font-bold text-white">${Math.floor((payload.offset || 0) / (payload.limit || 1)) + 1}</span><button class="grid h-9 min-w-14 place-items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200" onclick="nextPage(${payload.row_count})">Next</button></div>
        </div>
      `;
    }

    function openNewRowForm() {
      const payload = state.tablePayload || {};
      const panel = $('newRowPanel');
      if (!panel) return;
      const columns = Object.entries(payload.columns || {});
      if (!columns.length) {
        showOperation('warn', 'No columns found', 'Inspector could not read a schema for this table.');
        return;
      }

      state.editingRowKey = null;
      panel.classList.remove('hidden');
      panel.innerHTML = `
        <form id="newRowForm" onsubmit="event.preventDefault(); saveNewRow();" class="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <div class="text-lg font-black text-white">Add row to ${esc(payload.table || 'table')}</div>
              <div class="mt-1 text-sm text-slate-400">Fill only the values you need. Empty auto-increment primary keys are generated by the database.</div>
            </div>
            <button type="button" onclick="closeNewRowForm()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button>
          </div>
          <div class="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
            ${columns.map(([name, column]) => rowFormField(name, column, payload.primary_key)).join('')}
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div class="text-xs leading-relaxed text-slate-500">Values are written to the active connection. DevDB JSON writes use file locking and sequences.</div>
            <div class="flex gap-2">
              <button type="button" onclick="closeNewRowForm()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">Cancel</button>
              <button type="submit" class="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white hover:bg-violet-400">Save Row</button>
            </div>
          </div>
        </form>
      `;
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function findTableRowByKey(key, rowIndex = -1) {
      const payload = state.tablePayload || {};
      const rows = payload.rows || [];
      if (rowIndex >= 0 && rows[rowIndex]) return rows[rowIndex];
      const primary = payload.primary_key || '';
      if (!primary) return null;
      return rows.find(row => String(row?.[primary] ?? '') === String(key ?? '')) || null;
    }

    function openEditRowForm(key, rowIndex = -1) {
      const payload = state.tablePayload || {};
      const panel = $('newRowPanel');
      if (!panel) return;
      if (!payload.primary_key) {
        showOperation('warn', 'No primary key', 'This table has no primary key, so rows cannot be edited safely.');
        return;
      }
      if (key === undefined || key === null || key === '') {
        showOperation('warn', 'Missing row key', 'This row has no primary key value.');
        return;
      }
      const row = findTableRowByKey(key, rowIndex);
      if (!row) {
        showOperation('warn', 'Row not found', 'Inspector could not load this row for editing.');
        return;
      }
      const columns = Object.entries(payload.columns || {});
      if (!columns.length) {
        showOperation('warn', 'No columns found', 'Inspector could not read a schema for this table.');
        return;
      }

      state.editingRowKey = key;
      panel.classList.remove('hidden');
      panel.innerHTML = `
        <form id="editRowForm" onsubmit="event.preventDefault(); saveEditRow();" class="rounded-3xl border border-sky-300/20 bg-sky-500/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <div class="text-lg font-black text-white">Edit row in ${esc(payload.table || 'table')}</div>
              <div class="mt-1 text-sm text-slate-400">Primary key <code class="rounded bg-black/30 px-1.5 py-0.5 text-sky-100">${esc(payload.primary_key)} = ${esc(key)}</code>. Double-click any row to open this editor.</div>
            </div>
            <button type="button" onclick="closeNewRowForm()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button>
          </div>
          <div class="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
            ${columns.map(([name, column]) => rowFormField(name, column, payload.primary_key, row[name], true)).join('')}
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div class="text-xs leading-relaxed text-slate-500">Saving updates the selected row by primary key on the active connection.</div>
            <div class="flex gap-2">
              <button type="button" onclick="closeNewRowForm()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">Cancel</button>
              <button type="submit" class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-400">Save Changes</button>
            </div>
          </div>
        </form>
      `;
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function closeNewRowForm() {
      const panel = $('newRowPanel');
      if (!panel) return;
      panel.classList.add('hidden');
      panel.innerHTML = '';
      state.editingRowKey = null;
    }

    function rowFormField(name, column, primaryKey, value = '', editing = false) {
      const type = String(column?.type || '').toLowerCase();
      const isPrimary = name === primaryKey || column?.primary;
      const nullable = !!column?.nullable;
      const auto = isPrimary && type.includes('int');
      const placeholder = auto && !editing ? 'Auto' : (column?.default !== undefined && column?.default !== null ? 'Default: ' + column.default : '');
      const inputType = type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double') ? 'number'
        : type.includes('date') || type.includes('time') ? 'text'
          : 'text';
      const displayValue = value === null || value === undefined
        ? ''
        : (typeof value === 'object' ? JSON.stringify(value) : String(value));
      const readonly = editing && isPrimary;
      return `
        <label class="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div class="flex items-center justify-between gap-3">
            <span class="font-bold text-slate-100">${esc(name)}</span>
            <span class="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-400">${esc(type || 'value')}</span>
          </div>
          <input name="${esc(name)}" type="${inputType}" value="${esc(displayValue)}" ${readonly ? 'readonly' : ''} placeholder="${esc(placeholder)}" class="mt-3 h-10 w-full rounded-xl border border-white/10 bg-[#06101c] px-3 text-sm text-slate-100 outline-none focus:border-violet-300 ${readonly ? 'opacity-70' : ''}">
          <div class="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
            ${isPrimary ? '<span class="rounded bg-amber-400/10 px-2 py-0.5 text-amber-200">primary</span>' : ''}
            ${readonly ? '<span class="rounded bg-slate-400/10 px-2 py-0.5 text-slate-300">locked</span>' : ''}
            ${nullable ? '<span class="rounded bg-sky-400/10 px-2 py-0.5 text-sky-200">nullable</span>' : '<span class="rounded bg-white/5 px-2 py-0.5">required by schema</span>'}
          </div>
        </label>
      `;
    }

    function newRowField(name, column, primaryKey) {
      return rowFormField(name, column, primaryKey);
    }

    async function saveNewRow() {
      const payload = state.tablePayload || {};
      const form = $('newRowForm');
      if (!form || !payload.table) return;
      const values = {};
      new FormData(form).forEach((value, key) => { values[key] = value; });
      await runWithLoading('Saving row', 'Writing new data to ' + payload.table + '.', async () => {
        const result = await post('/api/table/insert', { table: payload.table, values });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'The row could not be saved.');
        }
        closeNewRowForm();
        state.offset = 0;
        await loadTables({ autoOpen: false });
        await loadTable();
      }, 'New row was added.');
    }

    async function saveEditRow() {
      const payload = state.tablePayload || {};
      const form = $('editRowForm');
      const key = state.editingRowKey;
      if (!form || !payload.table || key === null || key === undefined || key === '') return;
      const values = {};
      new FormData(form).forEach((value, field) => { values[field] = value; });
      await runWithLoading('Updating row', 'Saving changes to ' + payload.table + '.', async () => {
        const result = await post('/api/table/update', { table: payload.table, key, values });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'The row could not be updated.');
        }
        closeNewRowForm();
        await loadTables({ autoOpen: false });
        await loadTable();
      }, 'Row was updated.');
    }

    function applySearch() { state.search = $('databaseContent').querySelector('#search').value || ''; state.offset = 0; loadTable(); }

    function syncTableSelection() {
      state.selectedRowKeys = Array.from(document.querySelectorAll('.table-row-checkbox:checked'))
        .map(input => input.dataset.key || '')
        .filter(Boolean);
      const button = $('deleteSelectedRowsBtn');
      if (button) {
        button.disabled = state.selectedRowKeys.length === 0;
        button.classList.toggle('opacity-50', state.selectedRowKeys.length === 0);
      }
    }

    function toggleAllTableRows(checked) {
      document.querySelectorAll('.table-row-checkbox:not(:disabled)').forEach(input => {
        input.checked = !!checked;
      });
      syncTableSelection();
    }

    async function deleteSelectedTableRows() {
      await deleteTableRows(state.selectedRowKeys || []);
    }

    async function deleteTableRows(keys) {
      keys = (keys || []).filter(Boolean);
      const payload = state.tablePayload || {};
      if (!payload.table || keys.length === 0) {
        showOperation('warn', 'No rows selected', 'Select one or more rows first.');
        return;
      }
      const ok = await askConfirm('Delete selected row(s)?', `This will delete ${keys.length} row(s) from ${payload.table}.`, 'danger');
      if (!ok) return;
      await runWithLoading('Deleting rows', 'Removing selected data from ' + payload.table + '.', async () => {
        const result = await post('/api/table/delete', { table: payload.table, keys });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'Rows could not be deleted.');
        }
        await loadTables();
        await loadTable();
      }, 'Selected row(s) were deleted.');
    }

    async function emptyCurrentTable() {
      const payload = state.tablePayload || {};
      if (!payload.table) {
        showOperation('warn', 'No table selected', 'Open a table first.');
        return;
      }
      await emptyTables([payload.table]);
    }

    async function emptySelectedTables() {
      const tables = [...(state.selectedTables || [])];
      if (!tables.length) {
        showOperation('warn', 'No tables selected', 'Tick one or more tables in the list first.');
        return;
      }
      await emptyTables(tables);
    }

    async function emptyTables(tables) {
      tables = (tables || []).filter(Boolean);
      if (!tables.length) return;
      const label = tables.length === 1 ? tables[0] : tables.length + ' tables';
      const ok = await askConfirm(
        tables.length === 1 ? 'Empty table?' : 'Empty selected tables?',
        tables.length === 1
          ? `This will delete all rows from ${tables[0]}. The table structure stays.`
          : `This will delete all rows from ${tables.length} tables:\n${tables.join(', ')}`,
        'warn'
      );
      if (!ok) return;
      await runWithLoading('Emptying table(s)', 'Removing all rows from ' + label + '.', async () => {
        const result = await post('/api/table/empty', { tables });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'Table(s) could not be emptied.');
        }
        state.offset = 0;
        state.selectedRowKeys = [];
        state.selectedTables = [];
        await loadTables({ autoOpen: false });
        if (state.selected && tables.includes(state.selected)) {
          await loadTable();
        } else if (state.view === 'database') {
          await openDefaultTableWorkspace();
        }
      }, tables.length === 1 ? 'Table was emptied.' : tables.length + ' tables were emptied.');
    }

    async function dropCurrentTable() {
      const payload = state.tablePayload || {};
      if (!payload.table) {
        showOperation('warn', 'No table selected', 'Open a table first.');
        return;
      }
      await dropTables([payload.table]);
    }

    async function dropSelectedTables() {
      const tables = [...(state.selectedTables || [])];
      if (!tables.length) {
        showOperation('warn', 'No tables selected', 'Tick one or more tables in the list first.');
        return;
      }
      await dropTables(tables);
    }

    async function dropTables(tables) {
      tables = (tables || []).filter(Boolean);
      if (!tables.length) return;
      const label = tables.length === 1 ? tables[0] : tables.length + ' tables';
      const ok = await askConfirm(
        tables.length === 1 ? 'Drop table?' : 'Drop selected tables?',
        tables.length === 1
          ? `This permanently deletes table ${tables[0]} and all of its data.`
          : `This permanently deletes ${tables.length} tables and all of their data:\n${tables.join(', ')}`,
        'danger'
      );
      if (!ok) return;
      await runWithLoading('Dropping table(s)', 'Removing ' + label + ' from the database.', async () => {
        const result = await post('/api/table/drop', { tables });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'Table(s) could not be dropped.');
        }
        const dropped = new Set(tables);
        if (state.selected && dropped.has(state.selected)) {
          state.selected = null;
          state.tablePayload = null;
          state.fkLookupCache = {};
          state.fkSelectedFields = {};
          state.fkPreviewForTable = '';
        }
        state.selectedRowKeys = [];
        state.selectedTables = [];
        state.offset = 0;
        await loadTables({ autoOpen: false });
        if (state.view === 'database') {
          await openDefaultTableWorkspace();
        }
      }, tables.length === 1 ? 'Table was dropped.' : tables.length + ' tables were dropped.');
    }

    function schemaColumnTypes() {
      return ['id', 'string', 'text', 'integer', 'bigInteger', 'boolean', 'decimal', 'float', 'date', 'dateTime', 'timestamp', 'json', 'uuid', 'foreignId'];
    }

    function defaultSchemaColumns() {
      return [
        { key: 'c1', name: 'id', type: 'id', length: '', nullable: false, unique: false, index: false, defaultValue: '', references: '' },
        { key: 'c2', name: 'name', type: 'string', length: '255', nullable: false, unique: false, index: false, defaultValue: '', references: '' },
      ];
    }

    function openSchemaBuilder(mode = 'table') {
      const isMigration = mode === 'migration';
      state.schemaBuilder = {
        mode: isMigration ? 'migration' : 'table',
        table: '',
        timestamps: true,
        softDeletes: false,
        createInDatabase: !isMigration,
        saveMigration: isMigration,
        columns: defaultSchemaColumns(),
        previewCode: '',
        previewFilename: '',
      };
      const modal = $('schemaBuilderModal');
      if (!modal) return;
      $('schemaBuilderEyebrow').textContent = isMigration ? 'Migrations' : 'Tables';
      $('schemaBuilderTitle').textContent = isMigration ? 'Create migration' : 'Add table';
      $('schemaBuilderCopy').textContent = isMigration
        ? 'Design columns graphically, save a migration file, and copy the generated PHP.'
        : 'Create a table in the active database and copy the matching migration code.';
      $('schemaBuilderSubmit').textContent = isMigration ? 'Create Migration' : 'Create Table';
      renderSchemaBuilder();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    }

    function closeSchemaBuilder() {
      const modal = $('schemaBuilderModal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    }

    function renderSchemaBuilder() {
      const builder = state.schemaBuilder || {};
      const body = $('schemaBuilderBody');
      if (!body) return;
      const types = schemaColumnTypes();
      body.innerHTML = `
        <div class="grid gap-4">
          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label class="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div class="text-xs font-bold uppercase tracking-wide text-slate-500">Table name</div>
              <input id="schemaTableName" value="${esc(builder.table || '')}" placeholder="products" class="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#06101c] px-3 text-sm text-slate-100 outline-none focus:border-violet-300">
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-slate-200"><input id="schemaTimestamps" type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500" ${builder.timestamps ? 'checked' : ''}>timestamps</label>
              <label class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-slate-200"><input id="schemaSoftDeletes" type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500" ${builder.softDeletes ? 'checked' : ''}>softDeletes</label>
              <label class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-slate-200"><input id="schemaCreateDb" type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500" ${builder.createInDatabase ? 'checked' : ''}>Create in DB</label>
              <label class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-slate-200"><input id="schemaSaveFile" type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-black/30 text-violet-500" ${builder.saveMigration ? 'checked' : ''}>Save migration file</label>
            </div>
          </div>
          <div class="overflow-hidden rounded-2xl border border-white/10">
            <div class="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-4 py-3">
              <strong class="text-sm text-white">Columns</strong>
              <button type="button" onclick="addSchemaColumn()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10">Add Column</button>
            </div>
            <div class="overflow-auto">
              <table class="w-full min-w-[860px] text-left text-sm">
                <thead class="bg-black/20 text-xs uppercase text-slate-500"><tr><th class="px-3 py-2">Name</th><th class="px-3 py-2">Type</th><th class="px-3 py-2">Length</th><th class="px-3 py-2">Null</th><th class="px-3 py-2">Unique</th><th class="px-3 py-2">Index</th><th class="px-3 py-2">Default</th><th class="px-3 py-2">References</th><th class="px-3 py-2"></th></tr></thead>
                <tbody>${(builder.columns || []).map((col, index) => `
                  <tr class="border-t border-white/10">
                    <td class="px-3 py-2"><input data-schema-field="name" data-index="${index}" value="${esc(col.name || '')}" class="h-9 w-full rounded-lg border border-white/10 bg-[#06101c] px-2 text-sm"></td>
                    <td class="px-3 py-2"><select data-schema-field="type" data-index="${index}" class="h-9 w-full rounded-lg border border-white/10 bg-[#06101c] px-2 text-sm">${types.map(type => `<option value="${type}" ${col.type === type ? 'selected' : ''}>${type}</option>`).join('')}</select></td>
                    <td class="px-3 py-2"><input data-schema-field="length" data-index="${index}" value="${esc(col.length || '')}" class="h-9 w-20 rounded-lg border border-white/10 bg-[#06101c] px-2 text-sm"></td>
                    <td class="px-3 py-2 text-center"><input data-schema-field="nullable" data-index="${index}" type="checkbox" class="h-4 w-4" ${col.nullable ? 'checked' : ''}></td>
                    <td class="px-3 py-2 text-center"><input data-schema-field="unique" data-index="${index}" type="checkbox" class="h-4 w-4" ${col.unique ? 'checked' : ''}></td>
                    <td class="px-3 py-2 text-center"><input data-schema-field="index" data-index="${index}" type="checkbox" class="h-4 w-4" ${col.index ? 'checked' : ''}></td>
                    <td class="px-3 py-2"><input data-schema-field="defaultValue" data-index="${index}" value="${esc(col.defaultValue || '')}" class="h-9 w-28 rounded-lg border border-white/10 bg-[#06101c] px-2 text-sm"></td>
                    <td class="px-3 py-2"><input data-schema-field="references" data-index="${index}" value="${esc(col.references || '')}" placeholder="users" class="h-9 w-28 rounded-lg border border-white/10 bg-[#06101c] px-2 text-sm"></td>
                    <td class="px-3 py-2 text-right"><button type="button" onclick="removeSchemaColumn(${index})" class="rounded-lg border border-rose-300/20 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-200">Remove</button></td>
                  </tr>
                `).join('')}</tbody>
              </table>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div class="mb-2 flex items-center justify-between gap-2">
              <div>
                <div class="text-sm font-bold text-white">Migration code</div>
                <div class="text-xs text-slate-500">${esc(builder.previewFilename || 'Preview appears here')}</div>
              </div>
              <button type="button" onclick="copySchemaPreview()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10">Copy Code</button>
            </div>
            <pre id="schemaPreviewCode" class="max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#06101c] p-3 text-xs leading-relaxed text-slate-200">${esc(builder.previewCode || '// Click Preview Code or Create to generate migration PHP')}</pre>
          </div>
        </div>
      `;
      body.querySelectorAll('[data-schema-field]').forEach((input) => {
        const eventName = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'input';
        input.addEventListener(eventName, () => syncSchemaBuilderFromDom());
      });
      ['schemaTableName', 'schemaTimestamps', 'schemaSoftDeletes', 'schemaCreateDb', 'schemaSaveFile'].forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => syncSchemaBuilderFromDom());
      });
    }

    function syncSchemaBuilderFromDom() {
      const builder = state.schemaBuilder || {};
      builder.table = $('schemaTableName')?.value || '';
      builder.timestamps = !!$('schemaTimestamps')?.checked;
      builder.softDeletes = !!$('schemaSoftDeletes')?.checked;
      builder.createInDatabase = !!$('schemaCreateDb')?.checked;
      builder.saveMigration = !!$('schemaSaveFile')?.checked;
      (builder.columns || []).forEach((col, index) => {
        const root = $('schemaBuilderBody');
        if (!root) return;
        const get = (field) => root.querySelector(`[data-schema-field="${field}"][data-index="${index}"]`);
        col.name = get('name')?.value || '';
        col.type = get('type')?.value || 'string';
        col.length = get('length')?.value || '';
        col.nullable = !!get('nullable')?.checked;
        col.unique = !!get('unique')?.checked;
        col.index = !!get('index')?.checked;
        col.defaultValue = get('defaultValue')?.value || '';
        col.references = get('references')?.value || '';
      });
      state.schemaBuilder = builder;
    }

    function addSchemaColumn() {
      syncSchemaBuilderFromDom();
      state.schemaBuilder.columns.push({
        key: 'c' + Date.now(),
        name: '',
        type: 'string',
        length: '255',
        nullable: true,
        unique: false,
        index: false,
        defaultValue: '',
        references: '',
      });
      renderSchemaBuilder();
    }

    function removeSchemaColumn(index) {
      syncSchemaBuilderFromDom();
      state.schemaBuilder.columns.splice(index, 1);
      if (!state.schemaBuilder.columns.length) state.schemaBuilder.columns = defaultSchemaColumns();
      renderSchemaBuilder();
    }

    function schemaBuilderRequestPayload() {
      syncSchemaBuilderFromDom();
      const builder = state.schemaBuilder || {};
      return {
        table: builder.table,
        timestamps: !!builder.timestamps,
        soft_deletes: !!builder.softDeletes,
        create_in_database: !!builder.createInDatabase,
        save_migration: !!builder.saveMigration,
        columns: (builder.columns || []).map((col) => ({
          name: col.name,
          type: col.type,
          length: col.length ? Number(col.length) : null,
          nullable: !!col.nullable,
          unique: !!col.unique,
          index: !!col.index,
          default: col.defaultValue === '' ? null : col.defaultValue,
          references: col.references || null,
        })),
      };
    }

    function applySchemaPreview(result) {
      const migration = result?.migration || {};
      state.schemaBuilder.previewCode = migration.code || '';
      state.schemaBuilder.previewFilename = migration.filename || '';
      const preview = $('schemaPreviewCode');
      if (preview) preview.textContent = state.schemaBuilder.previewCode || '';
      const label = preview?.previousElementSibling?.querySelector?.('.text-xs');
      if (label) label.textContent = state.schemaBuilder.previewFilename || 'Preview appears here';
    }

    function scrollSchemaPreviewIntoView() {
      const preview = $('schemaPreviewCode');
      const body = $('schemaBuilderBody');
      if (!preview || !body) return;
      preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const top = preview.offsetTop - 16;
      if (Number.isFinite(top)) body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    async function previewSchemaBuilder() {
      const payload = schemaBuilderRequestPayload();
      if (!payload.table) {
        showOperation('warn', 'Table name required', 'Enter a table name first.');
        return;
      }
      await runWithLoading('Generating preview', 'Building migration PHP from the schema designer.', async () => {
        const result = await post('/api/migration/preview', payload);
        applySchemaPreview(result);
        renderSchemaBuilder();
        scrollSchemaPreviewIntoView();
      }, 'Migration preview is ready.');
    }

    async function copySchemaPreview() {
      syncSchemaBuilderFromDom();
      if (!state.schemaBuilder.previewCode) {
        await previewSchemaBuilder();
      }
      await copyText(state.schemaBuilder.previewCode || '');
    }

    async function submitSchemaBuilder() {
      const payload = schemaBuilderRequestPayload();
      if (!payload.table) {
        showOperation('warn', 'Table name required', 'Enter a table name first.');
        return;
      }
      if (!payload.create_in_database && !payload.save_migration) {
        showOperation('warn', 'Nothing selected', 'Enable Create in DB and/or Save migration file.');
        return;
      }
      const isMigration = state.schemaBuilder.mode === 'migration';
      const endpoint = isMigration ? '/api/migration/create' : '/api/table/create';
      const title = isMigration ? 'Creating migration' : 'Creating table';
      await runWithLoading(title, 'Applying the schema designer changes.', async () => {
        const result = await post(endpoint, payload);
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'Schema action failed.');
        }
        applySchemaPreview(result);
        renderSchemaBuilder();
        scrollSchemaPreviewIntoView();
        if (payload.create_in_database) {
          await loadTables();
          if (result.physical_table || result.table) {
            state.selected = result.physical_table || result.table;
            state.offset = 0;
            await loadTable();
          }
        }
        if (payload.save_migration || isMigration) {
          state.loaded.migrations = false;
          if (state.view === 'migrations') await loadMigrations();
        }
      }, isMigration ? 'Migration was created.' : 'Table was created.');
    }

    async function deleteMigrationFile(item) {
      item = item || filteredMigrations()[state.selectedMigration] || null;
      if (!item) {
        showOperation('warn', 'No migration selected', 'Select a migration first.');
        return;
      }
      if (!item.deletable) {
        showOperation('warn', 'Cannot delete', 'Only app migration files can be deleted from Inspector.');
        return;
      }
      const warning = item.status === 'ran'
        ? `This migration was already executed. Deleting ${item.file} only removes the file; history may become inconsistent.`
        : `Delete migration file ${item.file}? This cannot be undone.`;
      const ok = await askConfirm('Delete migration file?', warning, 'danger');
      if (!ok) return;
      await runWithLoading('Deleting migration', 'Removing ' + (item.file || item.name) + '.', async () => {
        const result = await post('/api/migration/delete', {
          name: item.name,
          file: item.file,
          path: item.absolute_path || item.path,
        });
        if (result.error || result.ok === false) {
          throw new Error(result.message || 'Migration file could not be deleted.');
        }
        state.selectedMigration = 0;
        await loadMigrations();
      }, 'Migration file was deleted.');
    }

    function renderTableTab(tab) {
      const payload = state.tablePayload || {};
      const browse = $('tableBrowsePanel');
      const meta = $('tableMetaPanel');
      if (!browse || !meta) return;
      document.querySelectorAll('.table-tab').forEach((button, index) => {
        const active = ['browse', 'structure', 'indexes', 'relations', 'triggers'][index] === tab;
        button.className = active ? 'table-tab rounded-t-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white' : 'table-tab rounded-t-xl border border-b-0 border-white/10 bg-white/[.03] px-4 py-2 text-sm text-slate-300';
      });
      if (tab === 'browse') {
        browse.classList.remove('hidden');
        meta.classList.add('hidden');
        return;
      }
      browse.classList.add('hidden');
      meta.classList.remove('hidden');
      const columns = Object.keys(payload.columns || {});
      if (tab === 'structure') {
        meta.innerHTML = `<div class="overflow-hidden rounded-2xl border border-white/10"><table class="w-full min-w-[720px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Column</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Null</th><th class="px-4 py-3">Default</th><th class="px-4 py-3">Key</th></tr></thead><tbody>${columns.map(name => { const col = payload.columns[name] || {}; return `<tr class="border-t border-white/10"><td class="px-4 py-3 font-bold text-slate-100">${esc(name)}</td><td class="px-4 py-3 text-slate-300">${esc(col.type || '')}</td><td class="px-4 py-3 text-slate-400">${esc(col.nullable ? 'Yes' : 'No')}</td><td class="px-4 py-3 text-slate-400">${esc(col.default ?? '-')}</td><td class="px-4 py-3 text-slate-400">${esc(col.primary ? 'PRI' : '')}</td></tr>`; }).join('')}</tbody></table></div>`;
      } else if (tab === 'indexes') {
        meta.innerHTML = `<pre class="max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-[#06101c] p-4 text-xs leading-relaxed text-slate-200">${esc(JSON.stringify(payload.indexes || [], null, 2))}</pre>`;
      } else if (tab === 'relations') {
        const relations = payload.relations || [];
        meta.innerHTML = relations.length ? `
          <div class="overflow-hidden rounded-2xl border border-white/10">
            <table class="w-full min-w-[760px] text-left text-sm">
              <thead class="bg-white/[.04] text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Type</th><th class="px-4 py-3">Column</th><th class="px-4 py-3">Foreign Key</th><th class="px-4 py-3">References</th><th class="px-4 py-3">Source</th><th class="px-4 py-3"></th></tr></thead>
              <tbody>${relations.map(rel => {
                const key = rel.constraint || rel.foreign_key || (rel.column ? payload.table + '_' + rel.column + '_foreign' : '');
                return `<tr class="border-t border-white/10">
                  <td class="px-4 py-3"><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200">${esc(rel.type || 'relation')}</span></td>
                  <td class="px-4 py-3 font-bold text-slate-100">${esc(rel.column || '-')}</td>
                  <td class="px-4 py-3"><code class="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-amber-100">${esc(key || '-')}</code></td>
                  <td class="px-4 py-3 text-slate-300">${esc(rel.references_table || '-')}<span class="text-slate-500">.${esc(rel.references_column || 'id')}</span></td>
                  <td class="px-4 py-3 text-slate-500">${esc(rel.confidence || 'metadata')}</td>
                  <td class="px-4 py-3 text-right"><button type="button" data-copy="${esc(key || '')}" onclick="copyText(this.dataset.copy)" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/10">Copy</button></td>
                </tr>`;
              }).join('')}</tbody>
            </table>
          </div>
          <div class="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-sm text-sky-100">Relations are read from database foreign keys when available. In DevDB, Inspector also infers common belongsTo links from *_id columns.</div>
        ` : `<div class="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No relations detected</div><div class="mt-2 text-sm">Add foreign keys in migrations or use conventional *_id columns for DevDB inference.</div></div></div>`;
      } else {
        meta.innerHTML = `<div class="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">${tab === 'relations' ? 'No relations detected' : 'No triggers detected'}</div><div class="mt-2 text-sm">Inspector will show ${esc(tab)} metadata here when the database driver exposes it.</div></div></div>`;
      }
    }
    function nextPage(total) { state.offset = Math.min(Math.max(0, total - 1), state.offset + state.limit); loadTable(); }
    function prevPage() { state.offset = Math.max(0, state.offset - state.limit); loadTable(); }
    async function exportSnapshot() {
      await runWithLoading('Preparing snapshot', 'Collecting Inspector export data.', async () => {
        const payload = await api('/api/export');
        const json = JSON.stringify(payload, null, 2);
        $('exportOutput').textContent = json;
        if ($('snapshotEmpty')) $('snapshotEmpty').classList.add('hidden');
        if ($('snapshotResult')) $('snapshotResult').classList.remove('hidden');
        if ($('snapshotMeta')) {
          const size = new Blob([json]).size;
          $('snapshotMeta').textContent = 'Captured ' + new Date().toLocaleString() + ' | ' + formatBytes(size);
        }
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'pinx-inspector-export.json';
        a.click();
        URL.revokeObjectURL(a.href);
        switchView('export');
      }, 'Snapshot export is ready.');
    }
    $('exportBtn').onclick = exportSnapshot;

    async function loadRecommendations() {
      const payload = await api('/api/recommendations');
      $('recommendations').innerHTML = (payload.items || []).map(item => {
        const tone = item.tone === 'danger' ? 'danger' : item.tone === 'warn' ? 'warn' : item.tone === 'success' ? 'success' : 'blue';
        const cta = item.action === 'migrate' ? 'Run' : item.action === 'health' ? 'Review' : 'Open';
        return `<button class="group flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-left shadow-[0_14px_48px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-300/40 ${toneClass(tone)}" onclick="handleRecommendation('${esc(item.action || 'dashboard')}')">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 text-sm font-black">${tone === 'warn' ? '!' : tone === 'danger' ? 'x' : '+'}</span>
          <span class="min-w-0 flex-1"><span class="block font-bold">${esc(item.title)}</span><span class="mt-0.5 block text-sm opacity-75">${esc(item.body)}</span></span>
          <span class="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-bold transition group-hover:bg-white group-hover:text-slate-950">${cta}</span>
        </button>`;
      }).join('');
    }

    function handleRecommendation(action) {
      if (!ensureReady()) return;
      if (action === 'migrate') {
        runInspectorAction('migrate');
        return;
      }

      switchView(action || 'dashboard');
    }

    async function loadHealth() {
      const payload = await api('/api/health');
      $('healthSummary').innerHTML = `
        ${metric('Score', payload.score || 0, payload.ok ? 'healthy' : 'needs attention')}
        ${metric('Pass', payload.summary?.pass || 0, 'checks')}
        ${metric('Warnings', payload.summary?.warn || 0, 'review')}
        ${metric('Failures', payload.summary?.fail || 0, 'blocking')}
      `;
      $('healthContent').innerHTML = healthPanel('Blocking issues', payload.blocking || [], 'rose') + healthPanel('Warnings', payload.warnings || [], 'amber');
    }

    function healthPanel(title, items, tone) {
      const color = tone === 'rose' ? 'border-rose-400/20 bg-rose-400/10' : 'border-amber-300/20 bg-amber-300/10';
      const rows = items.length ? items.map(item => `<div class="rounded-2xl border border-white/10 bg-black/20 p-3"><div class="font-semibold">${esc(item.label || item.id)}</div><div class="mt-1 text-sm text-slate-400">${esc(item.detail || '')}</div><div class="mt-1 text-xs text-slate-500">${esc(item.hint || '')}</div></div>`).join('') : '<div class="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">Nothing to show.</div>';
      return `<div class="rounded-3xl border ${color} p-4"><h2 class="mb-3 font-bold">${esc(title)}</h2><div class="space-y-3">${rows}</div></div>`;
    }

    async function loadMigrations() {
      const payload = await api('/api/migrations');
      state.migrations = payload;
      renderMigrations();
    }

    async function refreshMigrations() {
      await runWithLoading('Refreshing migrations', 'Reading migration files and database status.', async () => {
        await loadMigrations();
      }, 'Migration status was refreshed.');
    }

    function filteredMigrations() {
      const query = state.migrationSearch.trim().toLowerCase();
      return (state.migrations?.items || []).filter(item => {
        if (state.migrationStatus !== 'all' && item.status !== state.migrationStatus) return false;
        if (!query) return true;
        const haystack = [item.name, item.file, item.path, item.package, item.status, (item.tables || []).join(' '), item.content].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    function renderMigrations() {
      const payload = state.migrations || { items: [], summary: {} };
      const summary = payload.summary || {};
      const items = filteredMigrations();
      if (state.selectedMigration >= items.length) state.selectedMigration = 0;
      $('migrationsTotalBadge').textContent = Number(summary.total || 0).toLocaleString();
      renderMigrationTabs(summary);
      $('migrationsContent').innerHTML = items.length ? `
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400">
            <tr><th class="px-4 py-4 font-semibold">Migration</th><th class="px-4 py-4 font-semibold">Batch</th><th class="px-4 py-4 font-semibold">Status</th><th class="px-4 py-4 font-semibold">Executed At</th><th class="px-4 py-4 font-semibold">Duration</th><th class="px-4 py-4 font-semibold">Actions</th></tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            ${items.slice(0, 140).map((item, index) => `<tr onclick="selectMigration(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedMigration ? 'bg-violet-500/16' : ''}">
              <td class="px-4 py-4"><div class="flex items-center gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">${icon('fileText')}</span><div class="min-w-0"><div class="truncate font-medium text-slate-200">${esc(item.file || item.name)}</div><div class="mt-0.5 truncate text-xs text-slate-500">${esc(item.package || 'app')}${(item.tables || []).length ? ' | ' + esc((item.tables || []).join(', ')) : ''}</div></div></div></td>
              <td class="px-4 py-4 text-slate-300">${esc(item.batch ?? '-')}</td>
              <td class="px-4 py-4">${migrationStatusBadge(item.status)}</td>
              <td class="px-4 py-4 text-slate-300" title="${esc(item.ran_at || '')}">${esc(item.ran_at_label || item.ran_at || '-')}</td>
              <td class="px-4 py-4 text-slate-300">${esc(item.status === 'ran' ? item.duration : '-')}</td>
              <td class="px-4 py-4"><button onclick="event.stopPropagation(); showMigrationActions(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">...</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="flex items-center justify-between border-t border-white/10 px-4 py-4 text-sm text-slate-400">
          <span>Showing 1 to ${Math.min(items.length, 140).toLocaleString()} of ${items.length.toLocaleString()} migrations</span>
          <span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">${esc(state.migrationStatus === 'all' ? 'All migrations' : state.migrationStatus.toUpperCase())}</span>
        </div>
      ` : `<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No migrations found</div><div class="mt-2 text-sm">${esc(payload.message || 'Try another search or status filter.')}</div></div></div>`;
      renderMigrationDetails(items[state.selectedMigration] || null);
    }

    function renderMigrationTabs(summary) {
      const tabs = [['all', 'All', summary.total || 0], ['pending', 'Pending', summary.pending || 0], ['ran', 'Ran', summary.ran || 0], ['failed', 'Failed', summary.failed || 0]];
      $('migrationTabs').innerHTML = tabs.map(([key, label, count]) => {
        const active = state.migrationStatus === key;
        return `<button onclick="setMigrationStatus('${key}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${active ? 'border-violet-300/40 bg-violet-500 text-white shadow-[0_12px_35px_rgba(124,58,237,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${Number(count || 0).toLocaleString()}</span></button>`;
      }).join('');
    }

    function setMigrationStatus(status) {
      state.migrationStatus = status || 'all';
      state.selectedMigration = 0;
      renderMigrations();
    }

    function selectMigration(index) {
      state.selectedMigration = index;
      state.migrationActionMenu = null;
      renderMigrations();
      openDetailDrawerFrom('migrationDetails', 'Migration Details', 'Migrations');
    }

    function showMigrationActions(index) {
      state.selectedMigration = index;
      state.migrationActionMenu = index;
      renderMigrations();
      openDetailDrawerFrom('migrationDetails', 'Migration Actions', 'Migrations');
      showOperation('success', 'Migration selected', 'Actions and details are available in the right panel.');
    }

    function setMigrationDetailTab(tab) {
      state.migrationDetailTab = ['sql', 'details', 'structure'].includes(tab) ? tab : 'sql';
      const items = filteredMigrations();
      renderMigrationDetails(items[state.selectedMigration] || null);
    }

    function migrationStatusBadge(status) {
      const classes = status === 'ran' ? 'border-emerald-300/20 bg-emerald-400/12 text-emerald-300' : status === 'failed' ? 'border-rose-400/20 bg-rose-500/15 text-rose-300' : 'border-amber-300/20 bg-amber-400/15 text-amber-200';
      return `<span class="rounded-lg border px-2.5 py-1 text-xs font-black uppercase ${classes}">${esc(status || 'pending')}</span>`;
    }

    function renderMigrationDetails(item) {
      if (!item) {
        $('migrationDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a migration to inspect details.</div>';
        return;
      }
      const tabs = [['sql', 'SQL Preview'], ['details', 'Details'], ['structure', 'Structure Changes']];
      const tabButtons = tabs.map(([key, label]) => `<button type="button" onclick="setMigrationDetailTab('${key}')" class="rounded-xl px-3 py-2 text-xs font-bold transition ${state.migrationDetailTab === key ? 'bg-violet-500 text-white' : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}">${esc(label)}</button>`).join('');
      const actionMenu = state.migrationActionMenu === state.selectedMigration ? `
        <div class="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Row Actions</h3>
          <div class="mt-3 grid gap-2">
            <button onclick="setMigrationDetailTab('sql')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Open SQL Preview</button>
            <button data-copy="${esc(item.file || item.name)}" onclick="copyText(this.dataset.copy)" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Copy Migration Name</button>
            <button onclick="runInspectorAction('migrate')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Run Pending Migrations</button>
            ${item.deletable ? `<button onclick="deleteMigrationFile()" class="rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-left text-sm font-bold text-rose-100 hover:bg-rose-500/20">Delete Migration File</button>` : ''}
          </div>
        </div>` : '';
      $('migrationDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3"><div><h3 class="font-bold text-white">Migration Details</h3><div class="mt-4 flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${icon('fileText', 'h-5 w-5')}</span><div class="min-w-0"><div class="truncate font-bold text-white">${esc(item.file || item.name)}</div><div class="mt-1">${migrationStatusBadge(item.status)}</div></div></div></div><button onclick="renderMigrationDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div>
        </div>
        ${actionMenu}
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex gap-2 text-xs font-bold">${tabButtons}</div>
          ${renderMigrationDetailTab(item)}
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Quick Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="openSchemaBuilder('migration')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Create Migration</button>
            <button onclick="runInspectorAction('migrate')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Run Pending</button>
            <button onclick="rollbackMigrations()" class="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-bold text-amber-100 hover:bg-amber-400/20">Rollback Last Batch</button>
            <button onclick="rollbackMigrations(2)" class="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-bold text-amber-100 hover:bg-amber-400/20">Rollback 2 Batches</button>
            <button onclick="resetMigrations()" class="rounded-xl border border-orange-300/20 bg-orange-400/10 px-4 py-3 text-left text-sm font-bold text-orange-100 hover:bg-orange-400/20">Reset All (down)</button>
            <button onclick="dropMigrationTables()" class="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-left text-sm font-bold text-rose-100 hover:bg-rose-500/20">Drop Tables</button>
            <button onclick="freshMigrations()" class="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-left text-sm font-bold text-rose-100 hover:bg-rose-500/20">Fresh (drop + migrate)</button>
            ${item.deletable ? `<button onclick="deleteMigrationFile()" class="rounded-xl border border-rose-300/25 bg-rose-500/15 px-4 py-3 text-left text-sm font-bold text-rose-100 hover:bg-rose-500/25">Delete File</button>` : ''}
            <button onclick="refreshMigrations()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Status</button>
          </div>
        </div>
      `;
      syncDetailDrawerFrom('migrationDetails');
    }

    function renderMigrationDetailTab(item) {
      if (state.migrationDetailTab === 'details') {
        return `<div class="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          ${migrationDetailRow('Batch', item.batch ?? '-')}
          ${migrationDetailRow('Status', item.status || 'pending')}
          ${migrationDetailRow('Executed At', item.ran_at_label || '-')}
          ${migrationDetailRow('Last Modified', item.modified_at_label || '-')}
          ${migrationDetailRow('Package', item.package || 'app')}
          ${migrationDetailRow('Path', item.path || '-')}
          ${migrationDetailRow('Lines of Code', item.lines || '-')}
          ${migrationDetailRow('Size', item.size_label || '-')}
        </div>`;
      }
      if (state.migrationDetailTab === 'structure') {
        const upChanges = String(item.up_sql || '').trim();
        const downChanges = String(item.down_sql || '').trim();
        return `<div><h3 class="font-bold text-white">Detected Tables</h3><div class="mt-4 flex flex-wrap gap-2">${(item.tables || []).length ? item.tables.map(table => `<span class="rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-sm font-bold text-sky-200">${esc(table)}</span>`).join('') : '<span class="text-sm text-slate-500">No table names detected.</span>'}</div><div class="mt-4 grid gap-3"><div><div class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Up changes</div><pre class="max-h-40 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-violet-200">${esc(upChanges || '-- No up changes detected.')}</pre></div><div><div class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Down changes</div><pre class="max-h-40 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-violet-200">${esc(downChanges || '-- No down changes detected.')}</pre></div></div><pre class="mt-4 max-h-64 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-slate-300">${esc(item.content || 'Migration source is not available.')}</pre></div>`;
      }
      return `<div class="mb-4"><div class="mb-2 flex items-center justify-between"><span class="font-bold text-white">Up SQL</span><button data-copy="${esc(item.up_sql || '')}" onclick="copyText(this.dataset.copy)" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">Copy</button></div><pre class="max-h-48 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-violet-200">${esc(item.up_sql || '-- No preview available.')}</pre></div>
      <div><div class="mb-2 flex items-center justify-between"><span class="font-bold text-white">Down SQL</span><button data-copy="${esc(item.down_sql || '')}" onclick="copyText(this.dataset.copy)" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">Copy</button></div><pre class="max-h-48 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-violet-200">${esc(item.down_sql || '-- No preview available.')}</pre></div>`;
    }

    async function rollbackMigrations(step = 1) {
      const label = step > 1 ? `${step} migration batches` : 'the latest migration batch';
      const ok = await askConfirm('Rollback migrations?', `This will roll back ${label}. Local schema and data may change.`, 'warn');
      if (!ok) return;
      await runInspectorAction('migrate_rollback', { step });
    }

    async function resetMigrations() {
      const ok = await askConfirm('Reset all migrations?', 'This rolls back every batch via down(). Prefer Drop Tables only when down() is incomplete.', 'danger');
      if (!ok) return;
      await runInspectorAction('migrate_reset', { force: true });
    }

    async function dropMigrationTables() {
      const ok = await askConfirm('Drop migration tables?', 'This hard-drops package tables and clears migration history. This cannot be undone from Inspector.', 'danger');
      if (!ok) return;
      await runInspectorAction('migrate_drop', { force: true });
    }

    async function freshMigrations() {
      const ok = await askConfirm('Fresh migrations?', 'Drop package tables, clear history, then re-run all migrations.', 'danger');
      if (!ok) return;
      await runInspectorAction('migrate_fresh', { force: true });
    }

    async function loadPatches() {
      const payload = await api('/api/patches');
      state.patches = payload;
      renderPatches();
    }

    async function refreshPatches() {
      await runWithLoading('Refreshing patches', 'Reading patch files and history status.', async () => {
        await loadPatches();
      }, 'Patch status was refreshed.');
    }

    function filteredPatches() {
      const query = state.patchSearch.trim().toLowerCase();
      return (state.patches?.items || []).filter(item => {
        if (state.patchStatus !== 'all' && item.status !== state.patchStatus) return false;
        if (!query) return true;
        const haystack = [item.name, item.file, item.path, item.package, item.status, item.description].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    function renderPatches() {
      const payload = state.patches || { items: [], summary: {} };
      const summary = payload.summary || {};
      const items = filteredPatches();
      if (state.selectedPatch >= items.length) state.selectedPatch = 0;
      $('patchesTotalBadge').textContent = Number(summary.total || 0).toLocaleString();
      renderPatchTabs(summary);
      $('patchesContent').innerHTML = items.length ? `
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400">
            <tr><th class="px-4 py-4 font-semibold">Patch</th><th class="px-4 py-4 font-semibold">Batch</th><th class="px-4 py-4 font-semibold">Status</th><th class="px-4 py-4 font-semibold">Rollback</th><th class="px-4 py-4 font-semibold">Executed At</th></tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            ${items.slice(0, 140).map((item, index) => `<tr onclick="selectPatch(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedPatch ? 'bg-teal-500/16' : ''}">
              <td class="px-4 py-4"><div class="min-w-0"><div class="truncate font-medium text-slate-200">${esc(item.file || item.name)}</div><div class="mt-0.5 truncate text-xs text-slate-500">${esc(item.package || 'app')}${item.description ? ' | ' + esc(item.description) : ''}</div></div></td>
              <td class="px-4 py-4 text-slate-300">${esc(item.batch ?? '-')}</td>
              <td class="px-4 py-4">${migrationStatusBadge(item.status)}</td>
              <td class="px-4 py-4 text-slate-300">${item.can_rollback ? 'yes' : 'no'}</td>
              <td class="px-4 py-4 text-slate-300">${esc(item.ran_at_label || item.ran_at || '-')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      ` : `<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No patches found</div><div class="mt-2 text-sm">${esc(payload.message || 'Create a patch with pinx patch:create.')}</div></div></div>`;
      renderPatchDetails(items[state.selectedPatch] || null);
    }

    function renderPatchTabs(summary) {
      const tabs = [['all', 'All', summary.total || 0], ['pending', 'Pending', summary.pending || 0], ['ran', 'Ran', summary.ran || 0], ['failed', 'Failed', summary.failed || 0]];
      $('patchTabs').innerHTML = tabs.map(([key, label, count]) => {
        const active = state.patchStatus === key;
        return `<button onclick="setPatchStatus('${key}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${active ? 'border-teal-300/40 bg-teal-500 text-white shadow-[0_12px_35px_rgba(20,184,166,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${Number(count || 0).toLocaleString()}</span></button>`;
      }).join('');
    }

    function setPatchStatus(status) {
      state.patchStatus = status || 'all';
      state.selectedPatch = 0;
      renderPatches();
    }

    function selectPatch(index) {
      state.selectedPatch = index;
      renderPatches();
      openDetailDrawerFrom('patchDetails', 'Patch Details', 'Patches');
    }

    function renderPatchDetails(item) {
      if (!item) {
        $('patchDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a patch to inspect details.</div>';
        return;
      }
      $('patchDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Patch Details</h3>
          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${migrationDetailRow('Name', item.file || item.name)}
            ${migrationDetailRow('Status', item.status || 'pending')}
            ${migrationDetailRow('Batch', item.batch ?? '-')}
            ${migrationDetailRow('Rollback', item.can_rollback ? 'supported' : 'not supported')}
            ${migrationDetailRow('Package', item.package || 'app')}
            ${migrationDetailRow('Path', item.path || '-')}
            ${migrationDetailRow('Description', item.description || '-')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Quick Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="runInspectorAction('patch_run')" class="rounded-xl bg-teal-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-teal-400">Run Pending Patches</button>
            <button onclick="rollbackPatches()" class="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-bold text-amber-100 hover:bg-amber-400/20">Rollback Latest</button>
            <button onclick="rollbackPatches(2)" class="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-bold text-amber-100 hover:bg-amber-400/20">Rollback 2 Steps</button>
            <button onclick="resetPatches()" class="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-left text-sm font-bold text-rose-100 hover:bg-rose-500/20">Reset All Rollbackable</button>
            <button onclick="refreshPatches()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Status</button>
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Source Preview</h3>
          <pre class="mt-4 max-h-80 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-slate-300">${esc(item.content || 'Patch source is not available.')}</pre>
        </div>
      `;
      syncDetailDrawerFrom('patchDetails');
    }

    async function rollbackPatches(step = 1) {
      const ok = await askConfirm('Rollback patches?', step > 1 ? `Roll back the last ${step} rollbackable patches?` : 'Roll back the latest rollbackable patch?', 'warn');
      if (!ok) return;
      await runInspectorAction('patch_rollback', { step });
    }

    async function resetPatches() {
      const ok = await askConfirm('Reset patches?', 'This rolls back every successful patch that supports down().', 'danger');
      if (!ok) return;
      await runInspectorAction('patch_reset', { force: true });
    }

    async function loadSetup() {
      const payload = await api('/api/setup');
      state.setup = payload;
      renderSetup();
    }

    async function refreshSetup() {
      await runWithLoading('Refreshing setup', 'Checking migrations, patches, and project readiness.', async () => {
        await loadSetup();
      }, 'Setup status was refreshed.');
    }

    function toggleSetupOption(key, checked) {
      state.setupOptions[key] = !!checked;
      renderSetup();
    }

    function setupProgressSteps() {
      const options = state.setupOptions || {};
      const steps = [];
      if (options.deps) {
        steps.push({ id: 'deps', label: options.frontend === false ? 'Composer dependencies' : 'Composer + npm dependencies' });
      }
      steps.push({ id: 'migrate', label: 'Platform + app migrations' });
      if (options.seed !== false) {
        steps.push({ id: 'seed', label: 'Platform + app seeders' });
      }
      if (options.patch !== false) {
        steps.push({ id: 'patch', label: 'Platform + app patches' });
      }
      return steps;
    }

    function renderSetup() {
      const payload = state.setup || { summary: {}, steps: [], message: '' };
      const summary = payload.summary || {};
      const badge = $('setupReadyBadge');
      if (badge) {
        badge.textContent = payload.ready_label || (payload.needs_attention ? 'Needs setup' : 'Ready');
        badge.className = `rounded-xl px-3 py-1 text-sm font-bold ${payload.needs_attention ? 'bg-amber-400/20 text-amber-100' : 'bg-emerald-400/20 text-emerald-200'}`;
      }

      const options = state.setupOptions || {};
      $('setupStepOptions').innerHTML = `
        ${setupOptionCard('deps', 'Dependencies', 'Install Composer packages and theme npm packages', options.deps !== false)}
        ${setupOptionCard('frontend', 'Frontend npm', 'Include npm installs (uncheck for Composer only)', options.frontend !== false, options.deps === false)}
        ${setupOptionCard('migrate', 'Migrations', 'Always included: platform and app schema updates', true, true)}
        ${setupOptionCard('seed', 'Seeders', 'Load starter / demo database rows', options.seed !== false)}
        ${setupOptionCard('patch', 'Patches', 'Apply pending one-off data patches', options.patch !== false)}
      `;

      const progress = setupProgressSteps();
      $('setupProgressLabel').textContent = state.setupRunning ? 'Running' : 'Ready to run';
      $('setupProgressList').innerHTML = progress.map((step, index) => `
        <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3">
          <span class="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-black/20 text-xs font-black text-slate-300">${index + 1}</span>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-slate-100">${esc(step.label)}</div>
            <div class="text-xs text-slate-500">${state.setupRunning ? 'In progress…' : 'Queued for setup'}</div>
          </div>
        </div>
      `).join('') || '<div class="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">Select at least migrations to continue.</div>';

      $('setupStatusCards').innerHTML = `
        ${smallCard('Migrations pending', String(summary.migrations_pending || 0), '', summary.migrations_pending > 0 ? 'warn' : 'success')}
        ${smallCard('Patches pending', String(summary.patches_pending || 0), '', summary.patches_pending > 0 ? 'warn' : 'success')}
        ${smallCard('Health score', String(summary.health_score || 0), '', summary.health_ok ? 'success' : 'warn')}
        <div class="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">${esc(payload.message || 'Setup status is ready.')}</div>
      `;
    }

    function setupOptionCard(key, title, copy, checked, locked = false) {
      return `<label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 ${locked ? 'opacity-80' : 'hover:bg-white/[.06]'}">
        <input type="checkbox" class="mt-1" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''} onchange="toggleSetupOption('${key}', this.checked)">
        <span class="min-w-0"><span class="block font-bold text-white">${esc(title)}</span><span class="mt-1 block text-sm text-slate-400">${esc(copy)}</span></span>
      </label>`;
    }

    async function runProjectSetup() {
      if (!ensureReady()) return;
      const options = state.setupOptions || {};
      const ok = await askConfirm(
        'Run project setup?',
        'This can install dependencies and update the local database (migrate / seed / patch).',
        'warn',
      );
      if (!ok) return;

      state.setupRunning = true;
      renderSetup();
      await runInspectorAction('setup', {
        skip_deps: options.deps === false,
        skip_frontend: options.frontend === false,
        skip_seed: options.seed === false,
        skip_patch: options.patch === false,
      });
      state.setupRunning = false;
      state.loaded.setup = false;
      await loadSetup();
    }

    function migrationDetailRow(label, value) {
      return `<div class="grid grid-cols-[120px_1fr] gap-3 px-4 py-3 text-sm"><span class="text-slate-500">${esc(label)}</span><span class="min-w-0 truncate text-right text-slate-200">${esc(value)}</span></div>`;
    }

    async function loadRoutes() {
      const payload = await api('/api/routes');
      state.routes = payload;
      renderRecentRequests(payload.routes || []);
      renderRoutes();
    }

    function routeGroup(route) {
      if (route.channel) return route.channel;
      const uri = String(route.uri || '');
      const file = String(route.file || '').toLowerCase();
      if (file.includes('/api/') || file.endsWith('/api.php') || file.startsWith('routes/api')) return 'api';
      if (uri.startsWith('/api') || uri.startsWith('api/')) return 'api';
      if (file.includes('console')) return 'console';
      return 'web';
    }

    function routeMethodTone(method) {
      method = String(method || 'ANY').toUpperCase();
      if (method === 'POST') return 'border-amber-400/20 bg-amber-500/15 text-amber-300';
      if (method === 'PUT' || method === 'PATCH') return 'border-blue-400/20 bg-blue-500/15 text-blue-300';
      if (method === 'DELETE') return 'border-rose-400/20 bg-rose-500/15 text-rose-300';
      return 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300';
    }

    function routeAction(route) {
      if (route.action_resolved?.handler) return route.action_resolved.handler;
      if (route.action) return route.action;
      const name = route.name || '';
      if (name && name.includes('@')) return name;
      return name || 'Inline route';
    }

    function routeMiddleware(route) {
      const group = routeGroup(route);
      if (group === 'api') return 'api';
      if (String(route.uri || '').includes('login') || String(route.uri || '').includes('register')) return 'web,guest';
      return 'web';
    }

    function filteredRoutes() {
      const payload = state.routes || { routes: [] };
      const query = state.routeSearch.trim().toLowerCase();
      return (payload.routes || []).filter(route => {
        if (state.routeGroup !== 'all' && routeGroup(route) !== state.routeGroup) return false;
        if (!query) return true;
        return [route.method, route.uri, route.name, route.file, route.line, routeAction(route), routeMiddleware(route)].join(' ').toLowerCase().includes(query);
      });
    }

    function renderRoutes() {
      const payload = state.routes || { routes: [], files: [], summary: {} };
      const routes = filteredRoutes();
      const all = payload.routes || [];
      const counts = {
        all: all.length,
        web: all.filter(route => routeGroup(route) === 'web').length,
        api: all.filter(route => routeGroup(route) === 'api').length,
        console: all.filter(route => routeGroup(route) === 'console').length,
        actions: (payload.actions || []).length,
      };
      $('routesTotalBadge').textContent = counts.all;
      $('routeTabs').innerHTML = [
        ['all', 'All'],
        ['web', 'Web'],
        ['api', 'API'],
        ['console', 'Console'],
        ['actions', 'Actions'],
      ].map(([id, label]) => `<button onclick="setRouteGroup('${id}')" class="rounded-xl border px-4 py-2 text-sm font-bold ${state.routeGroup === id ? 'border-violet-300/40 bg-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${label} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${counts[id]}</span></button>`).join('');
      if (state.routeGroup === 'actions') {
        renderRouteActions();
        return;
      }
      if (!routes.length) {
        $('routesContent').innerHTML = '<div class="p-10 text-center text-slate-500">No routes match your current filter.</div>';
        $('routeDetails').innerHTML = routeEmptyDetails();
        return;
      }
      if (state.selectedRoute >= routes.length) state.selectedRoute = 0;
      $('routesContent').innerHTML = `<table class="w-full min-w-[860px] text-left text-sm">
        <thead class="border-b border-white/10 bg-white/[.035] text-xs text-slate-500"><tr><th class="px-4 py-3">Method</th><th class="px-4 py-3">URI</th><th class="px-4 py-3">Name</th><th class="px-4 py-3">Action</th><th class="px-4 py-3">Middleware</th><th class="px-4 py-3"></th></tr></thead>
        <tbody>${routes.map((route, index) => `<tr onclick="selectRoute(${index})" class="cursor-pointer border-t border-white/10 ${index === state.selectedRoute ? 'bg-violet-500/15' : 'hover:bg-white/[.035]'}">
          <td class="px-4 py-3"><span class="rounded-lg border px-2 py-1 text-xs font-black ${routeMethodTone(route.method)}">${esc(route.method || 'ANY')}</span></td>
          <td class="px-4 py-3 font-semibold text-slate-100">${esc(route.uri || '/')}</td>
          <td class="px-4 py-3 text-slate-300">${esc(route.name || 'unnamed')}</td>
          <td class="px-4 py-3 text-slate-300">${esc(routeAction(route))}</td>
          <td class="px-4 py-3"><span class="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300">${esc(routeMiddleware(route))}</span></td>
          <td class="px-4 py-3 text-right text-slate-500">Open</td>
        </tr>`).join('')}</tbody>
      </table>
      <div class="flex items-center justify-between border-t border-white/10 p-4 text-sm text-slate-500"><span>Showing 1 to ${routes.length} of ${routes.length} routes</span><div class="flex gap-2"><span class="rounded-xl bg-violet-500 px-3 py-2 font-bold text-white">1</span></div></div>`;
      renderRouteDetails(routes[state.selectedRoute] || routes[0]);
    }

    function setRouteGroup(group) {
      state.routeGroup = group;
      state.selectedRoute = 0;
      state.selectedAction = 0;
      renderRoutes();
    }

    function selectRoute(index) {
      state.selectedRoute = index;
      renderRoutes();
      openDetailDrawerFrom('routeDetails', 'Route Details', 'Routes');
    }

    function filteredRouteActions() {
      const query = state.routeSearch.trim().toLowerCase();
      return (state.routes?.actions || []).filter(action => {
        if (!query) return true;
        return [action.name, action.handler, action.file, action.handler_type, (action.routes || []).join(' ')].join(' ').toLowerCase().includes(query);
      });
    }

    function renderRouteActions() {
      const actions = filteredRouteActions();
      if (!actions.length) {
        $('routesContent').innerHTML = '<div class="p-10 text-center text-slate-500">No named route actions were found.</div>';
        $('routeDetails').innerHTML = routeEmptyDetails();
        return;
      }
      if (state.selectedAction >= actions.length) state.selectedAction = 0;
      $('routesContent').innerHTML = `<table class="w-full min-w-[860px] text-left text-sm">
        <thead class="border-b border-white/10 bg-white/[.035] text-xs text-slate-500"><tr><th class="px-4 py-3">Action</th><th class="px-4 py-3">Handler</th><th class="px-4 py-3">Used By</th><th class="px-4 py-3">Defined In</th><th class="px-4 py-3"></th></tr></thead>
        <tbody>${actions.map((action, index) => `<tr onclick="selectRouteAction(${index})" class="cursor-pointer border-t border-white/10 ${index === state.selectedAction ? 'bg-violet-500/15' : 'hover:bg-white/[.035]'}">
          <td class="px-4 py-3 font-semibold text-slate-100">${esc(action.name || 'unnamed')}</td>
          <td class="px-4 py-3 text-slate-300">${esc(action.handler || 'unknown')}</td>
          <td class="px-4 py-3"><span class="rounded-lg ${action.used ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200'} px-2 py-1 text-xs font-bold">${action.used ? esc((action.routes || []).join(', ')) : 'unused'}</span></td>
          <td class="px-4 py-3 text-slate-400">${esc(action.file || '-')}${action.line ? ' · Line ' + esc(action.line) : ''}</td>
          <td class="px-4 py-3 text-right text-slate-500">
            <span class="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">Open</span>
          </td>
        </tr>`).join('')}</tbody>
      </table>
      <div class="flex items-center justify-between border-t border-white/10 p-4 text-sm text-slate-500"><span>Showing ${actions.length} action(s)</span><span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">routes/actions.php</span></div>`;
      renderRouteActionDetails(actions[state.selectedAction]);
    }

    function selectRouteAction(index) {
      state.selectedAction = index;
      renderRoutes();
      openDetailDrawerFrom('routeDetails', 'Action Details', 'Routes');
    }

    function routeEmptyDetails() {
      return '<div class="grid min-h-[620px] place-items-center text-center text-slate-500"><div><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">?</div><div class="mt-3 font-bold text-white">No route selected</div><div class="mt-1 text-sm">Select a route to inspect details.</div></div></div>';
    }

    function renderRouteDetails(route) {
      const middleware = routeMiddleware(route);
      const group = routeGroup(route);
      const action = routeAction(route);
      const resolved = route.action_resolved || null;
      const controller = resolved?.controller || (action.includes('@') ? action.split('@')[0] : action);
      const method = resolved?.method || (action.includes('@') ? action.split('@')[1] : 'invoke');
      const definition = route.definition || '';
      const actionName = route.action_ref || route.name || '';
      $('routeDetails').innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="font-bold text-white">Route Details</div>
          <button onclick="renderRoutes()" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">${icon('refreshCw')}</button>
        </div>
        <div class="mt-6 flex items-center gap-3"><span class="rounded-lg border px-3 py-1 text-sm font-black ${routeMethodTone(route.method)}">${esc(route.method || 'ANY')}</span><span class="text-xl font-black text-white">${esc(route.uri || '/')}</span></div>
        <div class="mt-4 text-sm text-slate-400">Named Route <span class="ml-2 rounded-lg bg-violet-400/20 px-2 py-1 text-xs font-bold text-violet-200">${esc(route.name || 'unnamed')}</span></div>
        <div class="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          ${routeDetailRow('Action Name', actionName || '-', resolved ? 'resolved in routes/actions.php' : 'route-local action')}
          ${routeDetailRow('Handler', action, resolved?.handler_type || '')}
          ${routeDetailRow('Controller', controller, method)}
          ${routeDetailRow('Middleware', middleware, group)}
          ${routeDetailRow('Namespace', group === 'api' ? 'Api Controllers' : 'App Controllers', 'application')}
          ${routeDetailRow('File', route.file || 'unknown', route.line ? 'Line ' + route.line : '')}
        </div>
        ${resolved ? `<div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4"><div class="mb-3 flex items-center justify-between gap-3"><div class="font-bold text-white">Assigned Action</div><button type="button" data-copy="${esc(resolved.definition || '')}" class="copy-btn rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Copy</button></div><div class="mb-3 text-sm text-slate-400">${esc(actionName)} points to <span class="font-bold text-slate-100">${esc(resolved.handler || '')}</span></div><pre class="overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-sky-200">${esc(resolved.definition || 'Action definition was not available.')}</pre></div>` : ''}
        <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-3 flex items-center justify-between gap-3"><div class="font-bold text-white">Route Definition</div><button type="button" data-copy="${esc(definition || '')}" class="copy-btn rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Copy</button></div>
          <pre class="overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-emerald-200">${esc(definition || 'Route definition was not available from the source file.')}</pre>
        </div>
        <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-3 font-bold text-white">Usage</div>
          <div class="space-y-2 text-sm text-slate-400"><div>Linked in route file</div><div class="rounded-xl bg-white/5 px-3 py-2">${esc(route.file || '')}${route.line ? ' | Line ' + esc(route.line) : ''}</div></div>
        </div>
      `;
    }

    function renderRouteActionDetails(action) {
      if (!action) {
        $('routeDetails').innerHTML = routeEmptyDetails();
        return;
      }
      $('routeDetails').innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="font-bold text-white">Action Details</div>
          <button onclick="renderRoutes()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">×</button>
        </div>
        <div class="mt-6"><div class="text-xs uppercase tracking-wider text-slate-500">Named Action</div><div class="mt-2 text-2xl font-black text-white">${esc(action.name || 'unnamed')}</div></div>
        <div class="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          ${routeDetailRow('Handler', action.handler || '-', action.handler_type || '')}
          ${routeDetailRow('Controller', action.controller || '-', action.method || '')}
          ${routeDetailRow('Defined In', action.file || '-', action.line ? 'Line ' + action.line : '')}
          ${routeDetailRow('Used', action.used ? 'yes' : 'no', (action.routes || []).join(', '))}
        </div>
        <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-3 flex items-center justify-between gap-3"><div class="font-bold text-white">Action Definition</div><button type="button" data-copy="${esc(action.definition || '')}" class="copy-btn rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Copy</button></div>
          <pre class="overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-sky-200">${esc(action.definition || 'Action definition was not available.')}</pre>
        </div>
        <div class="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-3 font-bold text-white">Routes Using This Action</div>
          <div class="space-y-2 text-sm text-slate-300">${(action.routes || []).length ? action.routes.map(route => `<div class="rounded-xl bg-white/5 px-3 py-2">${esc(route)}</div>`).join('') : '<div class="text-slate-500">No route references this action yet.</div>'}</div>
        </div>
      `;
    }

    function routeDetailRow(label, value, note) {
      const display = value === null || value === undefined || value === '' ? '-' : value;
      return `<div class="flex items-start gap-3 border-b border-white/10 p-4 last:border-b-0"><div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">#</div><div class="min-w-0 flex-1"><div class="text-xs text-slate-500">${esc(label)}</div><div class="mt-1 truncate font-bold text-slate-100">${esc(display)}</div>${note ? `<div class="mt-0.5 truncate text-xs text-slate-500">${esc(note)}</div>` : ''}</div><button type="button" data-copy="${esc(display)}" title="Copy" class="copy-btn grid h-8 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10">Copy</button></div>`;
    }

    async function loadThemes() {
      state.themes = await api('/api/themes');
      renderThemes();
    }

    function filteredThemes() {
      const query = state.themeSearch.trim().toLowerCase();
      return (state.themes?.items || []).filter(theme => {
        if (!query) return true;
        return [theme.name, theme.title, theme.description, theme.author, theme.type].join(' ').toLowerCase().includes(query);
      });
    }

    function renderThemes() {
      const payload = state.themes || { items: [], summary: {} };
      const themes = filteredThemes();
      if (state.selectedTheme >= themes.length) state.selectedTheme = 0;
      $('themesTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      $('themesSummary').innerHTML = `
        ${smallCard('Installed Themes', payload.summary?.total || 0, 'available themes', 'blue')}
        ${smallCard('Active Theme', payload.summary?.active || 0, payload.active || 'default', 'success')}
        ${smallCard('Custom Themes', payload.summary?.custom || 0, 'editable themes', 'warn')}
      `;
      $('themesContent').innerHTML = themes.length ? `
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-4 font-semibold">Theme</th><th class="px-4 py-4 font-semibold">Type</th><th class="px-4 py-4 font-semibold">Version</th><th class="px-4 py-4 font-semibold">Author</th><th class="px-4 py-4 font-semibold">Last Updated</th><th class="px-4 py-4 font-semibold">Status</th><th class="px-4 py-4 font-semibold">Actions</th></tr></thead>
          <tbody class="divide-y divide-white/10">${themes.map((theme, index) => `<tr onclick="selectTheme(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedTheme ? 'bg-violet-500/16' : ''}">
            <td class="px-4 py-4"><div class="flex items-center gap-4"><div class="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/25 via-sky-500/10 to-emerald-500/15 text-xs font-bold text-slate-300">${(theme.preview_url || theme.preview) ? `<img src="${esc(theme.preview_url || '/' + String(theme.preview).replace(/^\/+/, ''))}" class="h-full w-full object-cover" alt="">` : esc(theme.title || theme.name)}</div><div class="min-w-0"><div class="flex items-center gap-2"><span class="truncate font-bold text-white">${esc(theme.title || theme.name)}</span>${theme.active ? '<span class="rounded-lg bg-emerald-400/12 px-2 py-1 text-xs font-bold text-emerald-300">Active</span>' : ''}</div><div class="mt-1 line-clamp-2 text-xs text-slate-400">${esc(theme.description || '')}</div></div></div></td>
            <td class="px-4 py-4"><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200">${esc(theme.type || 'custom')}</span></td><td class="px-4 py-4 text-slate-300">${esc(theme.version)}</td><td class="px-4 py-4 text-slate-300">${esc(theme.author)}</td><td class="px-4 py-4 text-slate-300" title="${esc(theme.updated_at || '')}">${esc(theme.updated_at_label || '-')}</td><td class="px-4 py-4"><span class="${theme.active ? 'text-emerald-300' : 'text-slate-400'}">${theme.active ? 'Active' : 'Inactive'}</span></td><td class="px-4 py-4"><button onclick="event.stopPropagation(); selectTheme(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">...</button></td>
          </tr>`).join('')}</tbody>
        </table>
        <div class="border-t border-white/10 px-4 py-4 text-sm text-slate-400">Showing 1 to ${themes.length.toLocaleString()} of ${themes.length.toLocaleString()} themes</div>
      ` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No themes found</div><div class="mt-2 text-sm">Try another search term.</div></div></div>';
      renderThemeDetails(themes[state.selectedTheme] || null);
    }
    function selectTheme(index) { state.selectedTheme = index; renderThemes(); openDetailDrawerFrom('themeDetails', 'Theme Details', 'Themes'); }

    function renderThemeDetails(theme) {
      if (!theme) {
        $('themeDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a theme to inspect details.</div>';
        return;
      }
      $('themeDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between"><h3 class="font-bold text-white">Theme Details</h3><button onclick="renderThemeDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div>
          <div class="mb-4 h-36 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 via-sky-500/10 to-emerald-500/10">${(theme.preview_url || theme.preview) ? `<img src="${esc(theme.preview_url || '/' + String(theme.preview).replace(/^\/+/, ''))}" class="h-full w-full object-cover" alt="">` : ''}</div>
          <div class="flex items-center justify-between gap-3"><div><div class="font-black text-white">${esc(theme.title || theme.name)}</div><div class="mt-1 text-sm text-slate-400">${esc(theme.description || '')}</div></div>${theme.active ? '<span class="rounded-lg bg-emerald-400/12 px-2 py-1 text-xs font-bold text-emerald-300">Active</span>' : ''}</div>
          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Type', theme.type)}${configDetailRow('Version', theme.version)}${configDetailRow('Author', theme.author)}${configDetailRow('Updated', theme.updated_at_label)}${configDetailRow('Path', theme.path)}${configDetailRow('Views', theme.views)}${configDetailRow('Size', theme.size_label)}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">${(theme.colors || []).map(color => `<span class="h-8 w-8 rounded-full border border-white/15" style="background:${esc(color)}"></span>`).join('')}</div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Theme Source</h3><p class="mt-4 text-sm leading-relaxed text-slate-400">Themes are inspected from the app theme directory. Edit theme files in your project to keep changes explicit and version controlled.</p><button onclick="exportSnapshot()" class="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Export Snapshot</button></div>
      `;
    }

    async function loadUsers() {
      state.users = await api('/api/users');
      renderUsers();
    }

    function filteredUsers() {
      const query = state.userSearch.trim().toLowerCase();
      const status = state.userStatus || 'all';
      return (state.users?.items || []).filter(user => {
        if (status !== 'all' && String(user.status || '').toLowerCase() !== status) return false;
        if (!query) return true;
        return [user.user_id, user.username, user.email, user.full_name, user.group_key, user.app, user.status].join(' ').toLowerCase().includes(query);
      });
    }

    function userStatusTone(status) {
      const value = String(status || '').toLowerCase();
      if (value === 'active') return 'text-emerald-300';
      if (value === 'suspend') return 'text-rose-300';
      if (value === 'pending') return 'text-amber-300';
      return 'text-slate-400';
    }

    function renderUsers() {
      const payload = state.users || { items: [], summary: {}, package: '' };
      const users = filteredUsers();
      if (state.selectedUser >= users.length) state.selectedUser = 0;
      $('usersTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      $('usersSummary').innerHTML = `
        ${smallCard('Users', payload.summary?.total || 0, payload.package || 'current app', 'blue')}
        ${smallCard('Active', payload.summary?.active || 0, 'ready to login', 'success')}
        ${smallCard('Other', payload.summary?.inactive || 0, 'inactive / pending / suspend', 'warn')}
      `;
      $('usersContent').innerHTML = users.length ? `
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-4 font-semibold">User</th><th class="px-4 py-4 font-semibold">Email</th><th class="px-4 py-4 font-semibold">Status</th><th class="px-4 py-4 font-semibold">Group</th><th class="px-4 py-4 font-semibold">App</th><th class="px-4 py-4 font-semibold">Created</th><th class="px-4 py-4 font-semibold">Actions</th></tr></thead>
          <tbody class="divide-y divide-white/10">${users.map((user, index) => `<tr onclick="selectUser(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedUser ? 'bg-sky-500/16' : ''}">
            <td class="px-4 py-4"><div class="min-w-0"><div class="font-bold text-white">#${esc(user.user_id)} ${esc(user.username || '')}</div><div class="mt-1 truncate text-xs text-slate-400">${esc(user.full_name || '—')}</div></div></td>
            <td class="px-4 py-4 text-slate-300">${esc(user.email || '—')}</td>
            <td class="px-4 py-4"><span class="${userStatusTone(user.status)} font-bold">${esc(user.status || '—')}</span></td>
            <td class="px-4 py-4 text-slate-300">${esc(user.group_key || '—')}</td>
            <td class="px-4 py-4 text-slate-300">${esc(user.app || '—')}</td>
            <td class="px-4 py-4 text-slate-300">${esc(user.created_at || '—')}</td>
            <td class="px-4 py-4"><button onclick="event.stopPropagation(); loginUser(${Number(user.user_id) || 0})" class="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-400/15" ${String(user.status || '').toLowerCase() === 'active' ? '' : 'disabled'}>Login</button></td>
          </tr>`).join('')}</tbody>
        </table>
        <div class="border-t border-white/10 px-4 py-4 text-sm text-slate-400">Showing ${users.length.toLocaleString()} of ${(payload.summary?.total || users.length).toLocaleString()} users</div>
      ` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No users found</div><div class="mt-2 text-sm">Try another search term or create a user with pinx user:create.</div></div></div>';
      renderUserDetails(users[state.selectedUser] || null);
    }

    function selectUser(index) {
      state.selectedUser = index;
      renderUsers();
      openDetailDrawerFrom('userDetails', 'User Details', 'Users');
    }

    function renderUserDetails(user) {
      if (!user) {
        $('userDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a user to inspect details or login.</div>';
        return;
      }
      const canLogin = String(user.status || '').toLowerCase() === 'active';
      const login = state.lastLogin && Number(state.lastLogin.user_id) === Number(user.user_id) ? state.lastLogin : null;
      $('userDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3"><div><h3 class="font-bold text-white">User Details</h3><div class="mt-1 text-sm text-slate-400">#${esc(user.user_id)} · ${esc(user.username || '')}</div></div><button onclick="renderUserDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div>
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Username', user.username)}${configDetailRow('Email', user.email || '—')}${configDetailRow('Name', user.full_name || '—')}${configDetailRow('Status', user.status)}${configDetailRow('Group', user.group_key || '—')}${configDetailRow('App scope', user.app || '—')}${configDetailRow('Mobile', user.mobile || '—')}${configDetailRow('Created', user.created_at || '—')}
          </div>
          <button onclick="loginUser(${Number(user.user_id) || 0})" class="mt-4 w-full rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-400/15" ${canLogin ? '' : 'disabled'}>${canLogin ? 'Login as this user' : 'Login unavailable'}</button>
        </div>
        ${login ? renderLoginTokenCard(login) : `<div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">CLI login</h3><p class="mt-4 text-sm leading-relaxed text-slate-400">Uses <code class="text-sky-200">user:login --id=${esc(user.user_id)}</code> and applies the token to browser localStorage/cookie for this app (no .env change).</p></div>`}
      `;
    }

    function loginBrowserSnippet(login) {
      if (login?.browser_snippet) return String(login.browser_snippet);
      const key = login?.auth_key || 'pinoox_user';
      const token = login?.token || '';
      const mode = String(login?.auth_mode || 'jwt').toLowerCase();
      if (mode === 'cookie') {
        return `document.cookie = ${JSON.stringify(`${key}=${encodeURIComponent(token)}; path=/; SameSite=Lax`)}; location.reload();`;
      }
      if (mode === 'session') {
        return '/* auth.mode=session — use the browser login UI */';
      }
      return `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(token)}); location.reload();`;
    }

    function inspectorIsEmbeddedOnApp() {
      return location.pathname.includes('/~inspector');
    }

    function inspectorAppAuthOrigins() {
      const origins = new Set([location.origin]);
      if (!inspectorIsEmbeddedOnApp()) {
        origins.add('http://127.0.0.1:8000');
        origins.add('http://localhost:8000');
        origins.add('http://[::1]:8000');
      }
      return [...origins];
    }

    function applyAuthOnCurrentOrigin(login) {
      const token = String(login?.token || '');
      const key = String(login?.auth_key || '');
      const mode = String(login?.auth_mode || 'jwt').toLowerCase();
      if (!token || !key) {
        return { ok: false, applied: [], message: 'Missing token or auth key.' };
      }
      if (mode === 'session') {
        return { ok: false, applied: [], message: 'Session mode cannot be applied from Inspector automatically.' };
      }

      const applied = [];
      try {
        localStorage.setItem(key, token);
        applied.push('localStorage');
        const maxAge = 60 * 60 * 24 * 30;
        document.cookie = `${key}=${encodeURIComponent(token)}; path=/; Max-Age=${maxAge}; SameSite=Lax`;
        applied.push('cookie');
        return { ok: true, applied, message: `Applied on ${location.origin}: ${applied.join(', ')}`, origin: location.origin, key, mode };
      } catch (error) {
        return { ok: false, applied, message: error.message || 'Failed to apply auth on this origin.' };
      }
    }

    function applyAuthViaBridge(origin, login, timeoutMs = 2500) {
      return new Promise((resolve) => {
        const bridgePath = origin.replace(/\/$/, '') + '/~inspector/apply-auth';
        let settled = false;
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-100px;top:-100px;border:0';
        iframe.setAttribute('aria-hidden', 'true');

        const cleanup = () => {
          window.removeEventListener('message', onMessage);
          clearTimeout(timer);
          iframe.remove();
        };

        const finish = (result) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(result);
        };

        const onMessage = (event) => {
          if (event.origin !== origin) return;
          const data = event.data;
          if (!data || data.type !== 'pinx-inspector-auth-applied') return;
          finish({
            ok: !!data.ok,
            applied: Array.isArray(data.applied) ? data.applied : [],
            message: data.message || (data.ok ? `Applied on ${origin}` : `Failed on ${origin}`),
            origin,
          });
        };

        window.addEventListener('message', onMessage);
        const timer = setTimeout(() => {
          finish({ ok: false, applied: [], message: `Timed out applying auth on ${origin}`, origin });
        }, timeoutMs);

        iframe.addEventListener('load', () => {
          try {
            iframe.contentWindow.postMessage({
              type: 'pinx-inspector-apply-auth',
              token: login.token,
              auth_key: login.auth_key,
              auth_mode: login.auth_mode,
            }, origin);
          } catch (error) {
            finish({ ok: false, applied: [], message: error.message || `Could not reach ${origin}`, origin });
          }
        });
        iframe.addEventListener('error', () => {
          finish({ ok: false, applied: [], message: `Could not load auth bridge on ${origin}`, origin });
        });

        iframe.src = bridgePath;
        document.body.appendChild(iframe);
      });
    }

    async function applyLoginToBrowsers(login) {
      const results = [];

      // Dedicated Inspector port must use the app-origin bridge; localStorage on the
      // Inspector origin is useless for manager/SPA auth.
      if (inspectorIsEmbeddedOnApp()) {
        results.push(applyAuthOnCurrentOrigin(login));
      } else {
        for (const origin of inspectorAppAuthOrigins()) {
          results.push(await applyAuthViaBridge(origin, login));
        }
      }

      const okResults = results.filter(result => result.ok);
      return {
        ok: okResults.length > 0,
        results,
        message: okResults.length
          ? okResults.map(result => result.message).join(' · ')
          : (results.map(result => result.message).filter(Boolean)[0] || 'Could not apply auth to the browser.'),
      };
    }

    function clearAuthOnCurrentOrigin(login) {
      const key = String(login?.auth_key || '');
      if (!key) {
        return { ok: false, applied: [], message: 'Missing auth key.' };
      }
      const applied = [];
      try {
        localStorage.removeItem(key);
        applied.push('localStorage');
        document.cookie = `${key}=; path=/; Max-Age=0; SameSite=Lax`;
        applied.push('cookie');
        return { ok: true, applied, message: `Cleared on ${location.origin}: ${applied.join(', ')}`, origin: location.origin, key };
      } catch (error) {
        return { ok: false, applied, message: error.message || 'Failed to clear auth on this origin.' };
      }
    }

    function clearAuthViaBridge(origin, login, timeoutMs = 2500) {
      return new Promise((resolve) => {
        const bridgePath = origin.replace(/\/$/, '') + '/~inspector/apply-auth';
        let settled = false;
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-100px;top:-100px;border:0';
        iframe.setAttribute('aria-hidden', 'true');

        const cleanup = () => {
          window.removeEventListener('message', onMessage);
          clearTimeout(timer);
          iframe.remove();
        };

        const finish = (result) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(result);
        };

        const onMessage = (event) => {
          if (event.origin !== origin) return;
          const data = event.data;
          if (!data || data.type !== 'pinx-inspector-auth-applied') return;
          finish({
            ok: !!data.ok,
            applied: Array.isArray(data.applied) ? data.applied : [],
            message: data.message || (data.ok ? `Cleared on ${origin}` : `Failed on ${origin}`),
            origin,
          });
        };

        window.addEventListener('message', onMessage);
        const timer = setTimeout(() => {
          finish({ ok: false, applied: [], message: `Timed out clearing auth on ${origin}`, origin });
        }, timeoutMs);

        iframe.addEventListener('load', () => {
          try {
            iframe.contentWindow.postMessage({
              type: 'pinx-inspector-clear-auth',
              clear: true,
              auth_key: login.auth_key,
            }, origin);
          } catch (error) {
            finish({ ok: false, applied: [], message: error.message || `Could not reach ${origin}`, origin });
          }
        });
        iframe.addEventListener('error', () => {
          finish({ ok: false, applied: [], message: `Could not load auth bridge on ${origin}`, origin });
        });

        iframe.src = bridgePath;
        document.body.appendChild(iframe);
      });
    }

    async function clearLoginFromBrowsers(login) {
      const results = [];

      if (inspectorIsEmbeddedOnApp()) {
        results.push(clearAuthOnCurrentOrigin(login));
      } else {
        for (const origin of inspectorAppAuthOrigins()) {
          results.push(await clearAuthViaBridge(origin, login));
        }
      }

      const okResults = results.filter(result => result.ok);
      return {
        ok: okResults.length > 0,
        results,
        message: okResults.length
          ? okResults.map(result => result.message).join(' · ')
          : (results.map(result => result.message).filter(Boolean)[0] || 'Could not clear browser auth.'),
      };
    }

    function renderLoginTokenCard(login) {
      const mode = String(login.auth_mode || 'jwt').toLowerCase();
      const key = login.auth_key || '—';
      const applied = login.browser_applied;
      const help = mode === 'jwt'
        ? `Stores the JWT in localStorage + cookie under <code class="text-emerald-50">${esc(key)}</code> on the app origin.`
        : mode === 'cookie'
          ? `Sets the <code class="text-emerald-50">${esc(key)}</code> cookie (and localStorage mirror) on the app origin.`
          : 'Session mode needs a normal browser login; CLI tokens are not attached to PHP sessions automatically.';
      return `
        <div class="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-emerald-100">Browser session</h3>
          <p class="mt-2 text-sm text-emerald-100/80">${esc(login.message || 'Login succeeded.')}</p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <span class="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-emerald-50">mode: ${esc(mode)}</span>
            <span class="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-emerald-50">key: ${esc(key)}</span>
            <span class="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-emerald-50">${applied?.ok ? 'applied' : 'not applied'}</span>
          </div>
          <div class="mt-3 break-all rounded-2xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-slate-200">${esc(login.token || '')}</div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" onclick="reapplyLoginToBrowser()" class="rounded-xl border border-emerald-300/30 bg-emerald-300/15 px-4 py-2 text-sm font-bold text-emerald-50 hover:bg-emerald-300/25">Apply to browser again</button>
            <button type="button" onclick="logoutUser()" class="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-400/20">Logout</button>
            <button type="button" onclick="copyLoginToken()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Copy token</button>
            <button type="button" onclick="copyLoginSnippet()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Copy snippet</button>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-emerald-100/75">${help}</p>
          ${applied?.message ? `<p class="mt-2 text-xs text-emerald-50/90">${esc(applied.message)}</p>` : ''}
        </div>
      `;
    }

    async function copyLoginToken() {
      const token = state.lastLogin?.token || '';
      if (!token) {
        showOperation('danger', 'Nothing to copy', 'Login first to get a token.');
        return;
      }
      await copyText(token);
      showOperation('success', 'Token copied', 'Paste into Authorization header or localStorage.');
    }

    async function copyLoginSnippet() {
      const snippet = loginBrowserSnippet(state.lastLogin || {});
      if (!snippet || snippet.startsWith('/*')) {
        showOperation('danger', 'Snippet unavailable', 'Session auth mode needs a browser UI login.');
        return;
      }
      await copyText(snippet);
      showOperation('success', 'Snippet copied', 'Open the app origin DevTools console and paste, then Enter.');
    }

    async function reapplyLoginToBrowser() {
      if (!state.lastLogin?.token) {
        showOperation('danger', 'Nothing to apply', 'Login first.');
        return;
      }
      setBusy(true, 'Applying auth', 'Writing token into browser storage.');
      const applied = await applyLoginToBrowsers(state.lastLogin);
      state.lastLogin = { ...state.lastLogin, browser_applied: applied };
      setBusy(false);
      showOperation(applied.ok ? 'success' : 'danger', applied.ok ? 'Auth applied' : 'Apply failed', applied.message);
      renderUsers();
    }

    async function loginUser(userId) {
      if (!ensureReady()) return;
      const id = Number(userId) || 0;
      if (id <= 0) {
        showOperation('danger', 'Login failed', 'A valid user id is required.');
        return;
      }
      const box = $('usersActionResult');
      box.classList.remove('hidden');
      box.className = 'mb-4 rounded-3xl border border-sky-300/20 bg-sky-400/10 p-4 text-sky-100';
      box.innerHTML = loadingActionCard('Logging in', `Issuing a session token for user #${id}.`);
      setBusy(true, 'Logging in', `Issuing a session token for user #${id}.`);
      let payload;
      try {
        payload = await post('/api/users/login', { id });
      } catch (error) {
        payload = { ok: false, message: error.message || 'Login failed.' };
      }
      if (!payload.ok) {
        setBusy(false);
        showOperation('danger', 'Login failed', payload.message || 'Could not authenticate this user.');
        box.className = 'mb-4 rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4 text-rose-100';
        box.innerHTML = `<div class="font-bold">Login failed</div><div class="mt-1 text-sm opacity-80">${esc(payload.message || 'Could not authenticate this user.')}</div>`;
        return;
      }

      setBusy(true, 'Applying auth', 'Writing token into browser localStorage and cookies.');
      const applied = await applyLoginToBrowsers(payload);
      payload.browser_applied = applied;
      state.lastLogin = payload;
      setBusy(false);

      showOperation(
        applied.ok ? 'success' : 'warn',
        applied.ok ? 'Logged in & applied' : 'Logged in (apply incomplete)',
        applied.ok ? applied.message : `${payload.message || ''} ${applied.message}`.trim(),
      );
      box.className = `mb-4 rounded-3xl border p-4 ${applied.ok ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`;
      box.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="font-bold">${esc(payload.message || 'Login succeeded')}</div>
            <div class="mt-1 text-xs opacity-80">mode: ${esc(payload.auth_mode || 'jwt')} · key: ${esc(payload.auth_key || '—')}</div>
            <div class="mt-2 text-sm opacity-90">${esc(applied.message || '')}</div>
            <div class="mt-2 break-all font-mono text-xs opacity-80">${esc(payload.token || '')}</div>
          </div>
          <div class="flex shrink-0 flex-col gap-2">
            <button type="button" onclick="reapplyLoginToBrowser()" class="rounded-xl border border-emerald-300/30 bg-emerald-300/15 px-3 py-2 text-xs font-bold text-emerald-50 hover:bg-emerald-300/25">Apply again</button>
            <button type="button" onclick="logoutUser()" class="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-100 hover:bg-rose-400/20">Logout</button>
            <button type="button" onclick="copyLoginToken()" class="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-emerald-50 hover:bg-black/30">Copy token</button>
          </div>
        </div>
      `;
      renderUsers();
      openDetailDrawerFrom('userDetails', 'User Details', 'Users');
    }

    async function logoutUser() {
      if (!ensureReady()) return;
      const previous = state.lastLogin || {};
      const box = $('usersActionResult');
      box.classList.remove('hidden');
      box.className = 'mb-4 rounded-3xl border border-sky-300/20 bg-sky-400/10 p-4 text-sky-100';
      box.innerHTML = loadingActionCard('Logging out', 'Clearing browser auth session.');
      setBusy(true, 'Logging out', 'Clearing browser auth session.');

      let payload;
      try {
        payload = await post('/api/users/logout', {
          auth_key: previous.auth_key || '',
        });
      } catch (error) {
        payload = { ok: false, message: error.message || 'Logout failed.' };
      }

      let cleared = { ok: false, message: 'Skipped browser clear (no auth key).' };
      if (previous.auth_key) {
        cleared = await clearLoginFromBrowsers({
          auth_key: previous.auth_key,
        });
      }

      setBusy(false);

      if (!payload.ok) {
        showOperation('danger', 'Logout failed', payload.message || 'Could not log out.');
        box.className = 'mb-4 rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4 text-rose-100';
        box.innerHTML = `<div class="font-bold">Logout failed</div><div class="mt-1 text-sm opacity-80">${esc(payload.message || '')}</div>`;
        return;
      }

      state.lastLogin = null;
      showOperation(
        cleared.ok ? 'success' : 'warn',
        cleared.ok ? 'Logged out' : 'Logged out (browser clear incomplete)',
        cleared.ok ? `${payload.message} ${cleared.message}`.trim() : `${payload.message} ${cleared.message}`.trim(),
      );
      box.className = `mb-4 rounded-3xl border p-4 ${cleared.ok ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`;
      box.innerHTML = `<div class="font-bold">${esc(payload.message || 'Logged out')}</div><div class="mt-1 text-sm opacity-80">${esc(cleared.message || '')}</div>`;
      renderUsers();
    }

    function sectionErrorPanel(title, message) {
      return `<div class="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-rose-100"><div class="font-bold">${esc(title)}</div><div class="mt-1 text-sm opacity-80">${esc(message)}</div><button onclick="state.loaded.pinker=false; loadViewData('pinker', true)" class="mt-4 rounded-xl bg-rose-200 px-4 py-2 text-sm font-bold text-rose-950">Retry</button></div>`;
    }

    async function loadPinker() {
      state.pinker = await api('/api/pinker');
      if (!state.pinker?.package) {
        throw new Error('Pinker response did not include package metadata.');
      }
      renderPinker();
    }

    function renderPinker() {
      const payload = state.pinker || { package: {}, overview: {}, checks: [], recent_builds: [] };
      renderPinkerTabs();
      if (state.pinkerTab && state.pinkerTab !== 'overview') {
        renderPinkerFocusedTab(payload);
        renderPinkerDetails(payload);
        return;
      }
      const overview = payload.overview || {};
      $('pinkerOverview').innerHTML = `
        ${pinkerMetric('Routes Cache', overview.routes_cache?.status || 'Pending', `${overview.routes_cache?.count || 0} routes cached`, overview.routes_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Views Cache', overview.views_cache?.status || 'Pending', `${overview.views_cache?.count || 0} views scanned`, overview.views_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Route File Cache', overview.api_cache?.status || 'Pending', overview.api_cache?.note || 'route files', overview.api_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Config Metadata', overview.config_cache?.count || 0, overview.config_cache?.note || 'config files', 'blue')}
        ${pinkerMetric('Cache Files', overview.cache_files?.count || 0, overview.cache_files?.note || 'pinker files', overview.cache_files?.count ? 'success' : 'warn')}
        ${pinkerMetric('Cache Size', overview.cache_size?.value || '0 B', overview.cache_size?.note || 'pinker cache size', 'violet')}
        ${pinkerMetric('Last Cache Update', overview.last_build?.value || 'Never', overview.last_build?.note || '', 'blue')}
      `;
      const checks = payload.checks || [];
      const percent = checks.length ? Math.round((checks.filter(item => item.ok).length / checks.length) * 100) : 0;
      $('pinkerBuildStatus').innerHTML = `
        <div class="grid place-items-center"><div class="grid h-32 w-32 place-items-center rounded-full border-[10px] ${percent === 100 ? 'border-emerald-400 text-emerald-200' : 'border-amber-300 text-amber-100'} text-3xl font-black">${percent}%</div><div class="mt-3 text-sm font-bold ${percent === 100 ? 'text-emerald-300' : 'text-amber-200'}">${percent === 100 ? 'Cache healthy' : 'Needs refresh'}</div></div>
        <div class="space-y-2">${checks.map(item => `<div class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"><span class="text-slate-200">${esc(item.label)}</span><span class="${item.ok ? 'text-emerald-300' : 'text-amber-200'}">${esc(item.value)}</span></div>`).join('')}<div class="rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">Pinker cache reflects the current app manifest, route files, views, and local metadata.</div></div>
      `;
      $('pinkerRecentBuilds').innerHTML = (payload.recent_builds || []).length ? payload.recent_builds.map((build, index) => `<div class="grid grid-cols-[42px_1fr_90px_80px] items-center gap-3 px-4 py-3 text-sm max-md:grid-cols-[42px_1fr]"><span class="grid h-9 w-9 place-items-center rounded-xl ${build.status === 'success' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200'}">${icon(build.status === 'success' ? 'check' : 'alertTriangle', 'h-4 w-4')}</span><div><div class="font-bold text-white">${esc(build.label)} <span class="ml-2 rounded-lg bg-violet-400/15 px-2 py-1 text-xs text-violet-200">${index === 0 ? 'Latest' : 'Cache'}</span></div><div class="text-xs text-slate-500">${esc(build.time)}</div></div><span class="text-slate-300 max-md:hidden">${esc(build.size)}</span><span class="text-right text-slate-400 max-md:hidden">${esc(build.duration)}</span></div>`).join('') : '<div class="p-5 text-sm text-slate-500">No Pinker cache files were found yet. Rebuild Pinker to create cache metadata.</div>';
      renderPinkerDetails(payload);
    }

    function renderPinkerFocusedTab(payload) {
      const pkg = payload.package || {};
      const files = payload.files || {};
      const overview = payload.overview || {};
      if (state.pinkerTab === 'manifest') {
        $('pinkerOverview').innerHTML = `
          ${smallCard('Manifest', pkg.status || 'unknown', files.manifest || 'app.php', pkg.status === 'ready' ? 'success' : 'warn')}
          ${smallCard('Package', pkg.name || '-', pkg.type || 'single app', 'violet')}
          ${smallCard('Version', pkg.version || '-', pkg.compatible || '', 'blue')}
          ${smallCard('Author', pkg.author || '-', pkg.license || '', 'default')}
        `;
        $('pinkerBuildStatus').innerHTML = `<div class="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300"><div class="mb-2 font-bold text-white">Manifest Summary</div><div>Pinx Inspector reads package identity, version, compatibility, icon and metadata from the Pinoox app manifest.</div><div class="mt-3 overflow-hidden rounded-xl border border-white/10">${configDetailRow('Name', pkg.name || '-')}${configDetailRow('Title', pkg.title || '-')}${configDetailRow('Namespace', pkg.namespace || '-')}${configDetailRow('Path', files.manifest || '-')}</div></div>`;
        $('pinkerRecentBuilds').innerHTML = '<div class="p-5 text-sm text-slate-500">Manifest metadata is scanned as part of Pinker cache readiness.</div>';
        return;
      }
      if (state.pinkerTab === 'dependencies') {
        const deps = payload.dependencies || [];
        $('pinkerOverview').innerHTML = `
          ${smallCard('Dependencies', deps.length, 'composer packages', 'blue')}
          ${smallCard('Vendor', overview.dependencies?.status || 'Unknown', overview.dependencies?.note || '', 'success')}
          ${smallCard('Cache Size', overview.cache_size?.value || '0 B', overview.cache_size?.note || '', 'violet')}
          ${smallCard('Composer', files.composer || 'composer.json', 'source file', 'default')}
        `;
        $('pinkerBuildStatus').innerHTML = `<div class="col-span-2 overflow-auto rounded-2xl border border-white/10 bg-black/20"><table class="w-full min-w-[520px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Package</th><th class="px-4 py-3">Version</th><th class="px-4 py-3">Scope</th></tr></thead><tbody class="divide-y divide-white/10">${deps.length ? deps.map(dep => `<tr><td class="px-4 py-3 font-bold text-slate-100">${esc(dep.name)}</td><td class="px-4 py-3 text-slate-300">${esc(dep.version)}</td><td class="px-4 py-3 text-slate-500">${esc(dep.scope)}</td></tr>`).join('') : '<tr><td colspan="3" class="px-4 py-6 text-slate-500">No composer dependencies found.</td></tr>'}</tbody></table></div>`;
        $('pinkerRecentBuilds').innerHTML = '<div class="p-5 text-sm text-slate-500">Use composer to change dependencies; Inspector keeps this view read-only.</div>';
        return;
      }
      $('pinkerOverview').innerHTML = `
        ${pinkerMetric('Routes Cache', overview.routes_cache?.status || 'Pending', `${overview.routes_cache?.count || 0} routes`, overview.routes_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Views Cache', overview.views_cache?.status || 'Pending', `${overview.views_cache?.count || 0} views`, overview.views_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Route File Cache', overview.api_cache?.status || 'Pending', overview.api_cache?.note || '', overview.api_cache?.status === 'Built' ? 'success' : 'warn')}
        ${pinkerMetric('Last Cache Update', overview.last_build?.value || 'Never', overview.last_build?.note || '', 'blue')}
      `;
      const cacheRows = Object.entries(files).map(([key, value]) => `<div class="grid grid-cols-[130px_1fr] gap-3 border-b border-white/10 px-4 py-3 text-sm last:border-b-0"><span class="text-slate-500">${esc(key)}</span><span class="min-w-0 truncate text-slate-200" title="${esc(value)}">${esc(value)}</span></div>`).join('');
      $('pinkerBuildStatus').innerHTML = `<div class="col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-black/20">${cacheRows || '<div class="p-5 text-sm text-slate-500">No Pinker cache paths found.</div>'}</div>`;
      $('pinkerRecentBuilds').innerHTML = '<div class="p-5 text-sm text-slate-500">Use Rebuild Pinker or Clear App Cache to refresh cache state.</div>';
    }

    function renderPinkerTabs() {
      const tabs = ['Overview', 'Cache'];
      $('pinkerTabs').innerHTML = tabs.map(label => {
        const key = label.toLowerCase();
        return `<button onclick="state.pinkerTab='${key}'; renderPinker()" class="border-b-2 px-1 pb-3 text-sm font-bold transition ${state.pinkerTab === key ? 'border-violet-400 text-violet-300' : 'border-transparent text-slate-400 hover:text-slate-200'}">${label}</button>`;
      }).join('');
    }

    function pinkerMetric(label, value, note, tone) {
      const color = tone === 'success' ? 'text-emerald-300 bg-emerald-400/10' : tone === 'warn' ? 'text-amber-200 bg-amber-400/10' : tone === 'violet' ? 'text-violet-300 bg-violet-400/10' : 'text-sky-300 bg-sky-400/10';
      return `<article class="rounded-2xl border border-white/10 bg-black/20 p-4"><div class="flex items-start gap-3"><span class="grid h-11 w-11 place-items-center rounded-2xl ${color}">${icon('package', 'h-5 w-5')}</span><div><div class="text-sm font-bold text-white">${esc(label)}</div><div class="mt-1 text-2xl font-black ${color.split(' ')[0]}">${esc(value)}</div><div class="mt-1 text-xs text-slate-500">${esc(note)}</div></div></div></article>`;
    }

    function renderPinkerDetails(payload) {
      const pkg = payload.package || {};
      const files = payload.files || {};
      $('pinkerDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Pinker Cache Details</h3>
          <div class="mt-5 flex items-center gap-4"><span class="grid h-16 w-16 place-items-center rounded-3xl border border-violet-300/25 bg-violet-500/15 text-violet-200"><svg viewBox="0 0 48 48" class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M24 5 40 14v20l-16 9-16-9V14L24 5Z"/><path d="m8 14 16 9 16-9M24 23v20"/></svg></span><div><div class="font-black text-white">Pinker Cache ${pkg.status === 'ready' ? '<span class="ml-2 rounded-lg bg-emerald-400/12 px-2 py-1 text-xs text-emerald-300">Readable</span>' : ''}</div><div class="mt-1 text-sm text-slate-500">${esc(pkg.name || '')}</div></div></div>
          <div class="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Cache root', files.pinker || '-')}
            ${configDetailRow('App cache', files.app_cache || '-')}
            ${configDetailRow('Routes cache', files.routes_cache || '-')}
            ${configDetailRow('Views cache', files.views_cache || '-')}
            ${configDetailRow('Manifest source', files.manifest || '-')}
            ${configDetailRow('Status', pkg.status || '-')}
          </div>
          <p class="mt-4 text-sm leading-relaxed text-slate-400">Pinker stores derived metadata for app inspection. It should be rebuilt when route files, view files, app.php, or config metadata changes.</p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Quick Actions</h3><div class="mt-4 grid gap-2"><button onclick="runPinkerAction('status')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Cache Status</button><button onclick="runPinkerAction('rebuild')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Rebuild Pinker Cache</button><button onclick="runPinkerAction('clear')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Clear Pinker Cache</button></div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Cache Notes</h3><div class="mt-4 grid gap-3 text-sm text-slate-400"><span>Pinker caches app metadata for faster local inspection.</span><span>Rebuild after changing routes, views, app.php, or config files.</span><span>Clear cache when stale metadata appears in Inspector.</span></div></div>
      `;
    }

    function runPinkerAction(action) {
      if (action === 'rebuild') return runInspectorAction('pinker_rebuild');
      if (action === 'clear') return runInspectorAction('pinker_clear');
      if (action === 'status') return runInspectorAction('pinker_status');
      showOperation('blue', 'Pinker information', 'Use this page to inspect, rebuild, refresh, and clear Pinker cache metadata.');
    }

    async function loadBuild() {
      state.build = await api('/api/build');
      renderBuild();
    }

    function renderBuild() {
      const payload = state.build || { package: {}, checks: [], exports: [], sign: {}, paths: {} };
      const pkg = payload.package || {};
      const sign = payload.sign || {};
      const checks = payload.checks || [];
      const exports = payload.exports || [];
      const ready = checks.length ? checks.filter(item => item.ok).length : 0;
      $('buildSummary').innerHTML = `
        ${smallCard('Package', pkg.name || '-', pkg.title || '', 'violet')}
        ${smallCard('Version', pkg.version_name || '-', 'code ' + (pkg.version_code || 0), 'blue')}
        ${smallCard('Signing', sign.enabled ? (sign.ready ? 'Ready' : 'Needs key') : 'Disabled', sign.require ? 'required' : 'optional', sign.ready ? 'success' : (sign.enabled ? 'warn' : 'blue'))}
        ${smallCard('Readiness', `${ready}/${checks.length || 0}`, 'checks passing', ready === checks.length ? 'success' : 'warn')}
      `;
      $('buildChecks').innerHTML = checks.length ? checks.map(item => `<div class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"><span class="font-semibold text-slate-200">${esc(item.label)}</span><span class="${item.ok ? 'text-emerald-300' : 'text-amber-200'}">${esc(item.value)}</span></div>`).join('') : '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No build checks were available.</div>';
      $('buildExportPath').textContent = payload.paths?.export || '';
      $('buildExports').innerHTML = exports.length ? exports.map(file => `<div class="grid grid-cols-[1fr_90px_120px] gap-3 px-4 py-3 text-sm max-md:grid-cols-1"><div class="min-w-0"><div class="truncate font-bold text-white">${esc(file.name)}</div><div class="truncate text-xs text-slate-500">${esc(file.path)}</div></div><span class="text-slate-300">${esc(file.size_label)}</span><span class="text-right text-slate-500 max-md:text-left">${esc(file.modified_at_label)}</span></div>`).join('') : '<div class="p-5 text-sm text-slate-500">No export files found yet. Run Build .pinx to create the export folder.</div>';
      $('buildDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Package Details</h3>
          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Name', pkg.name || '-')}
            ${configDetailRow('Title', pkg.title || '-')}
            ${configDetailRow('Version', pkg.version_name || '-', 'code ' + (pkg.version_code || 0))}
            ${configDetailRow('Type', pkg.type || '-')}
            ${configDetailRow('Min Pinx', pkg.minpin || '-')}
            ${configDetailRow('Manifest', payload.paths?.manifest || '-')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          ${renderBuildSigning(sign)}
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="runInspectorAction('build')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Build .pinx</button>
            <button onclick="runInspectorAction('build_sign')" class="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-left text-sm font-bold text-emerald-200 hover:bg-emerald-400/15">Build Signed</button>
            <button onclick="runInspectorAction('release_patch')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Release Patch</button>
          </div>
        </div>
      `;
    }

    function renderBuildSigning(sign) {
      const tone = sign.ready ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : sign.enabled ? 'border-amber-300/20 bg-amber-400/10 text-amber-100' : 'border-sky-300/20 bg-sky-400/10 text-sky-100';
      const label = sign.ready ? 'Ready to sign' : sign.enabled ? 'Needs key' : 'Disabled';
      return `
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-white">Signing</h3>
            <p class="mt-1 text-sm leading-6 text-slate-500">Create and manage the local development signing setup used by Pinx builds.</p>
          </div>
          <span class="rounded-full border px-3 py-1 text-xs font-bold ${tone}">${label}</span>
        </div>
        <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          ${configDetailRow('Enabled', sign.enabled ? 'Yes' : 'No')}
          ${configDetailRow('Ready', sign.ready ? 'Yes' : 'No')}
          ${configDetailRow('Key ID', sign.key_id || '-')}
          ${configDetailRow('Key file', sign.key || '-')}
          ${configDetailRow('Exists', sign.key_exists ? 'Yes' : 'No')}
          ${configDetailRow('Required', sign.require ? 'Yes' : 'No')}
        </div>
        <div class="mt-4 grid gap-2">
          <button onclick="manageBuildSigning('generate')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">${sign.key_exists ? 'Regenerate Development Key' : 'Generate Development Key'}</button>
          <button onclick="manageBuildSigning('${sign.enabled ? 'disable' : 'enable'}')" class="rounded-xl border ${sign.enabled ? 'border-rose-300/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15' : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'} px-4 py-3 text-left text-sm font-bold">${sign.enabled ? 'Disable Signing' : 'Enable Signing'}</button>
          <button onclick="manageBuildSigning('${sign.require ? 'optional' : 'require'}')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">${sign.require ? 'Make Signing Optional' : 'Require Signing for Release'}</button>
        </div>
        <p class="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-sm leading-6 text-slate-500">Signing keys live in <code>~pinx/keys/{package}/</code> and build output in <code>~pinx/export/{package}/</code>. Keep private keys out of git.</p>
      `;
    }

    async function manageBuildSigning(action) {
      const labels = {
        generate: ['Generate signing key?', 'This creates a local development signing key and enables package signing.', 'warn'],
        enable: ['Enable signing?', 'Signed builds will use the configured key from app.php.', 'blue'],
        disable: ['Disable signing?', 'Builds will no longer request package signing until you enable it again.', 'warn'],
        require: ['Require signing?', 'Release builds will expect signing to be configured.', 'warn'],
        optional: ['Make signing optional?', 'Release builds can continue without requiring a signature.', 'blue']
      };
      const [title, message, tone] = labels[action] || labels.enable;
      const ok = await askConfirm(title, message, tone);
      if (!ok) return;
      await runWithLoading('Updating signing', 'Applying signing settings to the app manifest.', async () => {
        const result = await post('/api/build/sign', { action });
        if (result.error || result.ok === false) throw new Error(result.message || 'Signing update failed.');
        state.build = result.build || await api('/api/build');
        renderBuild();
        showOperation('success', 'Signing updated', result.message || 'Signing settings were saved.');
      }, 'Signing settings updated.');
    }

    async function loadViews() {
      state.views = await api('/api/views');
      renderViews();
    }

    async function refreshViews() {
      await runWithLoading('Refreshing views', 'Scanning view templates and dependencies.', async () => {
        await loadViews();
      }, 'Views were refreshed.');
    }

    function applyViewFilter() {
      state.viewSearch = $('viewSearch')?.value || '';
      state.selectedView = 0;
      state.viewEditing = false;
      renderViews();
    }

    function filteredViews() {
      const query = state.viewSearch.trim().toLowerCase();
      return (state.views?.items || []).filter(view => {
        if (state.viewType !== 'all' && view.type !== state.viewType && !(view.tags || []).includes(state.viewType)) return false;
        if (!query) return true;
        return [view.name, view.path, view.namespace, view.type, (view.dependencies || []).join(' '), view.content].join(' ').toLowerCase().includes(query);
      });
    }

    function renderViews() {
      const payload = state.views || { items: [], categories: {} };
      const views = filteredViews();
      if (state.selectedView >= views.length) state.selectedView = 0;
      $('viewsTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      renderViewTabs(payload.categories || {});
      $('viewFiles').innerHTML = views.length ? views.map((view, index) => `<button onclick="selectView(${index})" class="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${index === state.selectedView ? 'bg-violet-500/22 text-white shadow-[0_10px_30px_rgba(124,58,237,.18)]' : 'text-slate-300 hover:bg-white/6'}"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs">${esc(view.type.toUpperCase())}</span><span class="min-w-0 flex-1"><span class="block truncate font-bold">${esc(view.name)}</span><span class="mt-0.5 block truncate text-xs text-slate-500">${esc(view.path)}</span></span><span class="h-2 w-2 rounded-full bg-emerald-400"></span></button>`).join('') : '<div class="p-6 text-center text-sm text-slate-500">No views match your filter.</div>';
      renderViewEditor(views[state.selectedView] || null);
      renderViewDetails(views[state.selectedView] || null);
    }

    function renderViewTabs(categories) {
      const tabs = [['all', 'All'], ['blade', 'Blade'], ['twig', 'Twig'], ['php', 'PHP'], ['email', 'Email'], ['layout', 'Layout'], ['component', 'Component']];
      $('viewTabs').innerHTML = tabs.map(([key, label]) => `<button onclick="setViewType('${key}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${state.viewType === key ? 'border-violet-300/40 bg-violet-500 text-white shadow-[0_12px_35px_rgba(124,58,237,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${Number(categories[key] || 0).toLocaleString()}</span></button>`).join('');
    }

    function setViewType(type) { state.viewType = type || 'all'; state.selectedView = 0; state.viewEditing = false; renderViews(); }
    function selectView(index) { state.selectedView = index; state.viewEditing = false; renderViews(); }

    function renderViewEditor(view) {
      if (!view) {
        $('viewEditorHeader').innerHTML = '<div><h3 class="font-bold text-white">No view selected</h3><p class="mt-1 text-sm text-slate-500">Choose a view file.</p></div>';
        $('viewEditor').innerHTML = '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No view file selected.</div>';
        $('viewEditorFooter').textContent = '';
        return;
      }
      const actions = state.viewEditing
        ? `<div class="flex gap-2"><button onclick="saveCurrentView()" class="rounded-xl bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400">Save</button><button onclick="cancelViewEdit()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Cancel</button></div>`
        : `<div class="flex gap-2"><button onclick="startViewEdit()" class="rounded-xl bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400">Edit</button><button onclick="refreshViews()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Refresh</button></div>`;
      $('viewEditorHeader').innerHTML = `<div class="min-w-0"><div class="flex items-center gap-3"><h3 class="truncate font-bold text-white">${esc(view.path)}</h3><span class="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">${esc(view.type_label)}</span>${state.viewEditing ? '<span class="rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-200">Editing</span>' : ''}</div></div>${actions}`;
      $('viewEditor').innerHTML = state.viewEditing
        ? `<textarea id="viewEditContent" spellcheck="false" class="min-h-[620px] w-full resize-y border-0 bg-[#06101c] p-5 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-0">${esc(view.content || '')}</textarea>${view.truncated ? '<div class="border-t border-amber-300/20 bg-amber-400/10 px-5 py-3 text-sm text-amber-100">Preview was truncated for performance. Refresh after saving to inspect the full file metadata.</div>' : ''}`
        : `<pre class="min-h-[620px] bg-[#06101c] p-5 text-[13px] leading-6 text-slate-300"><code>${highlightView(view.content || '')}${view.truncated ? '\n\n/* Preview truncated for performance. */' : ''}</code></pre>`;
      $('viewEditorFooter').innerHTML = `Last modified: ${esc(view.modified_at_label || '-')} <span class="mx-4">Size: ${esc(view.size_label || '-')}</span> Lines: ${esc(view.lines || 0)}`;
    }

    function currentView() {
      return filteredViews()[state.selectedView] || null;
    }

    function startViewEdit() {
      const view = currentView();
      if (!view) return;
      if (view.truncated && !confirm('This preview is truncated. Editing may save only the loaded preview content. Continue?')) return;
      state.viewEditing = true;
      renderViewEditor(view);
      renderViewDetails(view);
    }

    function cancelViewEdit() {
      state.viewEditing = false;
      renderViews();
    }

    async function saveCurrentView() {
      const view = currentView();
      const editor = $('viewEditContent');
      if (!view || !editor) return;
      await runWithLoading('Saving view', 'Writing the template file.', async () => {
        const payload = await post('/api/views/save', { path: view.path, content: editor.value });
        if (payload.error || payload.ok === false) throw new Error(payload.message || 'View could not be saved.');
        state.viewEditing = false;
        await loadViews();
      }, 'View file was saved.');
    }

    function renderViewDetails(view) {
      if (!view) {
        $('viewDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a view to inspect details.</div>';
        return;
      }
      $('viewDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><div class="mb-4 flex items-start justify-between"><h3 class="font-bold text-white">View Details</h3><button onclick="renderViewDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div><div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${icon('fileText', 'h-5 w-5')}</span><div class="min-w-0"><div class="truncate font-bold text-white">${esc(view.name)}</div><div class="truncate text-xs text-slate-500">${esc(view.path)}</div></div></div><div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">${configDetailRow('Type', view.type_label)}${configDetailRow('Namespace', view.namespace)}${configDetailRow('Extension', view.extension)}${configDetailRow('Size', view.size_label)}${configDetailRow('Lines', view.lines)}${configDetailRow('Modified', view.modified_at_label)}</div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Dependencies</h3><div class="mt-4 flex flex-wrap gap-2">${(view.dependencies || []).length ? view.dependencies.map(dep => `<span class="rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-sm font-bold text-sky-200">${esc(dep)}</span>`).join('') : '<span class="text-sm text-slate-500">No includes or extends detected.</span>'}</div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Used By</h3><div class="mt-4 divide-y divide-white/10">${(view.used_by || []).length ? view.used_by.map(item => `<div class="grid grid-cols-[1fr_70px] gap-3 py-3 text-sm"><span class="truncate text-slate-200">${esc(item.namespace || item.path)}</span><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-center text-xs font-bold text-violet-200">${esc(item.tag)}</span></div>`).join('') : '<div class="py-4 text-sm text-slate-500">No usage detected in scanned views.</div>'}</div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Quick Actions</h3><div class="mt-4 grid gap-2"><button onclick="startViewEdit()" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Edit View</button><button onclick="refreshViews()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Views</button></div></div>
      `;
    }

    function highlightView(source) {
      return esc(source)
        .replace(/(&lt;\/?[a-zA-Z][^&]*?&gt;)/g, '<span class="text-rose-300">$1</span>')
        .replace(/(@[a-zA-Z_]+|\{\%|\%\}|\{\{|\}\})/g, '<span class="text-violet-300">$1</span>')
        .replace(/('(?:[^'\\\\]|\\\\.)*'|&quot;(?:[^&]|&(?!quot;))*&quot;)/g, '<span class="text-emerald-300">$1</span>');
    }

    async function loadEnv() {
      state.env = await api('/api/env');
      renderEnv();
    }

    function renderEnv() {
      const payload = state.env || { items: [], summary: {} };
      if ($('envTotalBadge')) $('envTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      if ($('envEditor')) $('envEditor').value = payload.content || '';
      $('envSummary').innerHTML = `
        ${smallCard('Variables', payload.summary?.total || 0, payload.exists ? payload.path || '.env exists' : 'will be created', 'violet')}
        ${smallCard('App', payload.summary?.app || 0, 'APP_* values', 'blue')}
        ${smallCard('Database', payload.summary?.database || 0, 'DB_* values', 'success')}
        ${smallCard('DevDB', payload.summary?.devdb || 0, 'DEVDB_* values', 'warn')}
      `;
      $('envItems').innerHTML = (payload.items || []).length ? payload.items.map(item => `<div class="mb-2 rounded-2xl border border-white/10 bg-black/20 p-3"><div class="flex items-center justify-between gap-3"><span class="truncate font-bold text-slate-100">${esc(item.key)}</span><span class="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-slate-300">${esc(item.group)}</span></div><div class="mt-1 truncate text-sm text-slate-400">${esc(item.masked ? '••••••••' : item.value)}</div></div>`).join('') : '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">No .env variables yet.</div>';
      $('envDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Developer Defaults</h3>
          <p class="mt-3 text-sm leading-relaxed text-slate-400">For local single-app development, keep .env small. Pinoox can auto-detect most defaults.</p>
          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('File', payload.path || '.env')}
            ${configDetailRow('Recommended env', 'development')}
            ${configDetailRow('Recommended DB', 'devdb')}
            ${configDetailRow('Writable', payload.writable ? 'Yes' : 'No')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Suggested .env Reference</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-400">Keep the actual .env short. Add only the keys you want to override.</p>
          <div class="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-black/20">
            <table class="w-full min-w-[620px] text-left text-sm">
              <thead class="bg-white/[.04] text-xs uppercase text-slate-500"><tr><th class="px-3 py-3">Key</th><th class="px-3 py-3">Default</th><th class="px-3 py-3">Description</th><th class="px-3 py-3"></th></tr></thead>
              <tbody class="divide-y divide-white/10">${(payload.suggested || []).map(item => `<tr><td class="px-3 py-3 font-bold text-slate-100">${esc(item.key)}</td><td class="px-3 py-3 text-slate-300">${esc(item.default)}</td><td class="px-3 py-3 text-slate-400">${esc(item.description)}</td><td class="px-3 py-3 text-right"><button type="button" data-copy="${esc(item.example)}" class="copy-btn rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Copy</button></td></tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Quick Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="applyEnvPreset()" class="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-left text-sm font-bold text-emerald-200 hover:bg-emerald-400/15">Use Development Preset</button>
            <button onclick="saveEnvFile()" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Save .env</button>
          </div>
        </div>
      `;
    }

    function applyEnvPreset() {
      $('envEditor').value = 'APP_ENV=development\nDB_CONNECTION=devdb\n';
      showOperation('success', 'Preset applied', 'Review and save the .env file.');
    }

    async function saveEnvFile() {
      const ok = await askConfirm('Save .env changes?', 'This will overwrite the project .env file with the editor content.', 'warn');
      if (!ok) return;
      await runWithLoading('Saving .env', 'Writing local developer settings.', async () => {
        const result = await post('/api/env/save', { content: $('envEditor').value || '' });
        if (result.error) throw new Error(result.message || '.env could not be saved.');
        await loadEnv();
      }, '.env was saved.');
    }

    async function loadLang() {
      state.lang = await api('/api/lang');
      state.langEditing = false;
      renderLang();
    }

    function filteredLangFiles() {
      const query = state.langSearch.trim().toLowerCase();
      return (state.lang?.files || []).filter(file => {
        if (state.langScope !== 'all' && file.scope !== state.langScope) return false;
        if (state.langLocale !== 'all' && file.locale !== state.langLocale) return false;
        if (!query) return true;
        return [file.name, file.path, file.scope, file.package, file.locale, file.group, file.content].join(' ').toLowerCase().includes(query);
      });
    }

    function langLocaleOptions(payload) {
      return Array.isArray(payload?.locales) ? payload.locales.filter(Boolean) : [];
    }

    function renderLangLocaleControls(payload) {
      const locales = langLocaleOptions(payload);
      const copySource = $('langCopySource');
      const syncReference = $('langSyncReference');
      const syncTarget = $('langSyncTarget');
      if (!copySource || !syncReference || !syncTarget) return;

      const localeOptions = locales.map(locale => `<option value="${esc(locale)}">${esc(locale)}</option>`).join('');
      copySource.innerHTML = localeOptions;
      syncReference.innerHTML = localeOptions;
      syncTarget.innerHTML = localeOptions;

      if (!locales.includes(copySource.value) && locales[0]) copySource.value = locales[0];
      if (!locales.includes(state.langSyncReference) && locales[0]) state.langSyncReference = locales[0];
      syncReference.value = locales.includes(state.langSyncReference) ? state.langSyncReference : (locales[0] || 'en');

      const targetLocale = state.langLocale !== 'all' ? state.langLocale : (locales.find(locale => locale !== syncReference.value) || locales[0] || '');
      if (targetLocale) syncTarget.value = targetLocale;
    }

    function openLangToolModal(mode) {
      const modal = $('langToolsModal');
      const copyPanel = $('langCopyPanel');
      const syncPanel = $('langSyncPanel');
      const title = $('langToolsModalTitle');
      const subtitle = $('langToolsModalSubtitle');
      if (!modal || !copyPanel || !syncPanel) return;
      const isCopy = mode === 'copy';
      copyPanel.classList.toggle('hidden', !isCopy);
      syncPanel.classList.toggle('hidden', isCopy);
      if (title) title.textContent = isCopy ? 'Copy locale' : 'Sync missing keys';
      if (subtitle) subtitle.textContent = isCopy
        ? 'Create a new locale by copying existing translation files.'
        : 'Fill missing keys in a target locale from a reference locale.';
      if (state.lang) renderLangLocaleControls(state.lang);
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeLangToolModal() {
      const modal = $('langToolsModal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function renderLangLocaleTabs(payload) {
      const stats = payload.locale_stats || {};
      const locales = langLocaleOptions(payload);
      const total = Number(payload.summary?.total || 0);
      const tabs = [['all', 'All locales', total]];
      locales.forEach(locale => tabs.push([locale, locale.toUpperCase(), Number(stats[locale] || 0)]));
      const el = $('langLocaleTabs');
      if (!el) return;
      el.innerHTML = tabs.map(([key, label, count]) => `<button onclick="setLangLocale('${esc(key)}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${state.langLocale === key ? 'border-sky-300/40 bg-sky-500 text-white shadow-[0_12px_35px_rgba(14,165,233,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${count.toLocaleString()}</span></button>`).join('');
    }

    function renderLangFileButton(file, index) {
      return `<button onclick="selectLang(${index})" class="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${index === state.selectedLang ? 'bg-violet-500/22 text-white shadow-[0_10px_30px_rgba(124,58,237,.18)]' : 'text-slate-300 hover:bg-white/6'}">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 ${file.scope === 'theme' ? 'bg-amber-400/10 text-amber-200' : 'bg-emerald-400/10 text-emerald-200'}">${esc((file.locale || '?').slice(0, 2).toUpperCase())}</span>
          <span class="min-w-0 flex-1"><span class="block truncate font-bold">${esc(file.group || file.name)}</span><span class="mt-0.5 block truncate text-xs text-slate-500">${esc(file.path)}</span></span>
          <span class="rounded-lg bg-white/8 px-2 py-1 text-[11px] font-bold text-slate-300">${esc(file.scope)}</span>
        </button>`;
    }

    function renderLangFilesList(files) {
      if (!files.length) {
        return '<div class="p-6 text-center text-sm text-slate-500">No language files match your filter.</div>';
      }
      if (state.langLocale !== 'all') {
        return files.map((file, index) => renderLangFileButton(file, index)).join('');
      }
      const groups = {};
      files.forEach((file, index) => {
        const locale = file.locale || 'unknown';
        (groups[locale] ||= []).push({ file, index });
      });
      return Object.keys(groups).sort().map(locale => {
        const items = groups[locale].map(item => renderLangFileButton(item.file, item.index)).join('');
        return `<div class="mb-4"><div class="sticky top-0 z-10 border-b border-white/10 bg-[#091320] px-3 py-2 text-xs font-bold uppercase tracking-wide text-sky-300">${esc(locale)} <span class="text-slate-500">(${groups[locale].length})</span></div><div class="pt-1">${items}</div></div>`;
      }).join('');
    }

    function setLangLocale(locale) {
      state.langLocale = locale || 'all';
      state.selectedLang = 0;
      state.langEditing = false;
      renderLang();
    }

    function renderLang() {
      const payload = state.lang || { files: [], categories: {}, summary: {} };
      const files = filteredLangFiles();
      if (state.selectedLang >= files.length) state.selectedLang = 0;
      $('langTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      renderLangLocaleTabs(payload);
      renderLangScopeTabs(payload.categories || {});
      renderLangLocaleControls(payload);
      $('langSummary').innerHTML = `
        ${smallCard('Language Files', payload.summary?.total || 0, 'translation packages', 'violet')}
        ${smallCard('Locales', payload.summary?.locales || 0, (payload.locales || []).join(', ') || 'none', 'blue')}
        ${smallCard('App Files', payload.summary?.app || 0, 'app/lang', 'success')}
        ${smallCard('Theme Files', payload.summary?.theme || 0, 'theme language files', 'warn')}
      `;
      $('langFiles').innerHTML = renderLangFilesList(files);
      const selected = files[state.selectedLang] || null;
      renderLangEditor(selected);
      renderLangDetails(selected);
    }

    function renderLangScopeTabs(categories) {
      const tabs = [['all', 'All'], ['app', 'App'], ['theme', 'Theme']];
      const el = $('langScopeTabs') || $('langTabs');
      if (!el) return;
      el.innerHTML = tabs.map(([key, label]) => `<button onclick="setLangScope('${key}')" class="rounded-xl border px-3 py-1.5 text-xs font-bold transition ${state.langScope === key ? 'border-violet-300/40 bg-violet-500/80 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}">${esc(label)} <span class="ml-1 rounded-lg bg-black/20 px-1.5 py-0.5 text-[10px]">${Number(categories[key] || 0).toLocaleString()}</span></button>`).join('');
    }

    function setLangScope(scope) {
      state.langScope = scope || 'all';
      state.selectedLang = 0;
      state.langEditing = false;
      renderLang();
    }

    function selectLang(index) {
      state.selectedLang = index;
      state.langEditing = false;
      renderLang();
    }

    function currentLangFile() {
      return filteredLangFiles()[state.selectedLang] || null;
    }

    function renderLangEditor(file) {
      if (!file) {
        $('langEditorHeader').innerHTML = '<div><h3 class="font-bold text-white">No language file selected</h3><p class="mt-1 text-sm text-slate-500">Choose a language file from the list.</p></div>';
        $('langEditor').innerHTML = '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No language file selected.</div>';
        $('langEditorFooter').textContent = '';
        return;
      }
      const editDisabled = !file.writable || file.truncated;
      $('langEditorHeader').innerHTML = `
        <div class="min-w-0"><div class="flex flex-wrap items-center gap-3"><h3 class="truncate font-bold text-white">${esc(file.path)}</h3><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200">${esc(file.locale)}</span><span class="rounded-lg px-2 py-1 text-xs font-bold ${file.writable ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-200'}">${file.writable ? 'Writable' : 'Read only'}</span>${state.langEditing ? '<span class="rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-200">Editing</span>' : ''}</div><div class="mt-1 truncate text-xs text-slate-500">${esc(file.scope)} / ${esc(file.package)} / ${esc(file.group)}</div></div>
        <div class="flex flex-wrap gap-2">
          ${state.langEditing ? `
            <button onclick="saveLangFile()" class="rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400">Save Changes</button>
            <button onclick="cancelLangEdit()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Cancel</button>
          ` : `
            <button onclick="startLangEdit()" ${editDisabled ? 'disabled' : ''} class="rounded-xl border border-violet-300/25 bg-violet-400/10 px-3 py-2 text-xs font-bold text-violet-200 hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-45">Edit</button>
            <button onclick="syncLangFile()" class="rounded-xl border border-sky-300/25 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-400/15">Sync keys</button>
            <button onclick="loadLang()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Refresh</button>
          `}
        </div>
      `;
      $('langEditor').innerHTML = state.langEditing
        ? `<textarea id="langEditorInput" spellcheck="false" class="min-h-[620px] w-full resize-y bg-[#06101c] p-5 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-violet-300/35">${esc(file.content || '')}</textarea>
           <div class="border-t border-white/10 px-4 py-3 text-xs text-slate-500">Editing ${esc(file.path)}. PHP language files should return an array.</div>`
        : `<pre class="min-h-[620px] bg-[#06101c] p-5 text-[13px] leading-6 text-slate-300"><code>${highlightPhp(file.content || '')}${file.truncated ? '\n\n/* Preview truncated for performance. */' : ''}</code></pre>`;
      $('langEditorFooter').innerHTML = `Locale: ${esc(file.locale)} <span class="mx-4">Keys: ${Number(file.key_count || 0).toLocaleString()}</span> Last modified: ${esc(file.modified_at_label || '-')}`;
    }

    function startLangEdit() {
      const file = currentLangFile();
      if (!file || !file.writable || file.truncated) {
        showOperation('warn', 'Language file cannot be edited', file?.truncated ? 'Large language previews are read-only in Inspector.' : 'This language file is read-only.');
        return;
      }
      state.langEditing = true;
      renderLang();
    }

    function cancelLangEdit() {
      state.langEditing = false;
      renderLang();
    }

    async function saveLangFile() {
      const file = currentLangFile();
      const input = $('langEditorInput');
      if (!file || !input) return;
      setBusy(true, 'Saving language file', file.path);
      try {
        const result = await post('/api/lang/save', { path: file.path, content: input.value });
        if (result.error) throw new Error(result.message || 'Unable to save language file.');
        showOperation('success', 'Language file saved', result.message || `${file.name} was saved.`);
        const previousPath = file.path;
        const payload = await api('/api/lang');
        state.lang = payload;
        const files = filteredLangFiles();
        state.selectedLang = Math.max(0, files.findIndex(item => item.path === previousPath));
        state.langEditing = false;
        renderLang();
      } catch (error) {
        showOperation('danger', 'Save failed', error.message || 'Unable to save language file.');
      } finally {
        setBusy(false);
      }
    }

    function renderLangDetails(file) {
      if (!file) {
        $('langDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a language file to inspect details.</div>';
        return;
      }
      $('langDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3"><div><h3 class="font-bold text-white">Language Details</h3><div class="mt-4 flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${esc((file.locale || '?').slice(0, 2).toUpperCase())}</span><div class="min-w-0"><div class="truncate font-bold text-white">${esc(file.group || file.name)}</div><div class="truncate text-xs text-slate-500">${esc(file.path)}</div></div></div></div><button onclick="renderLangDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div>
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Scope', file.scope)}
            ${configDetailRow('Package', file.package)}
            ${configDetailRow('Locale', file.locale)}
            ${configDetailRow('Group', file.group)}
            ${configDetailRow('Format', file.format)}
            ${configDetailRow('Keys', file.key_count)}
            ${configDetailRow('Size', file.size_label)}
            ${configDetailRow('Lines', file.lines)}
            ${configDetailRow('Modified', file.modified_at_label)}
            ${configDetailRow('Status', file.writable ? 'Writable' : 'Read only')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Quick Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="startLangEdit()" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Edit Language File</button>
            <button onclick="syncLangFile()" class="rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 py-3 text-left text-sm font-bold text-sky-200 hover:bg-sky-400/15">Sync Missing Keys</button>
            <button onclick="loadLang()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Lang</button>
          </div>
        </div>
      `;
    }

    async function copyLangLocale() {
      const source = $('langCopySource')?.value || '';
      const target = ($('langCopyTarget')?.value || '').trim().toLowerCase();
      if (!source || !target) {
        showOperation('warn', 'Copy locale', 'Choose a source locale and enter a new locale code.');
        return;
      }
      if (!confirm(`Copy all ${source} language files to new locale "${target}"? Existing files will be skipped.`)) return;
      setBusy(true, 'Copying locale', `${source} -> ${target}`);
      try {
        const result = await post('/api/lang/copy-locale', { source_locale: source, target_locale: target, scope: state.langScope === 'all' ? 'all' : state.langScope });
        if (result.error) throw new Error(result.message || 'Locale copy failed.');
        showOperation('success', 'Locale copied', result.message || 'Language files were copied.');
        state.langLocale = target;
        closeLangToolModal();
        await loadLang();
      } catch (error) {
        showOperation('danger', 'Copy locale failed', error.message || 'Unable to copy locale.');
      } finally {
        setBusy(false);
      }
    }

    async function syncLangFile() {
      const file = currentLangFile();
      const reference = $('langSyncReference')?.value || state.langSyncReference || 'en';
      if (!file) {
        showOperation('warn', 'Sync keys', 'Select a language file first.');
        return;
      }
      setBusy(true, 'Syncing language keys', file.path);
      try {
        const result = await post('/api/lang/sync', { path: file.path, reference_locale: reference });
        if (result.error) throw new Error(result.message || 'Sync failed.');
        showOperation(result.added ? 'success' : 'blue', 'Language sync', result.message || 'Sync finished.');
        await loadLang();
        const files = filteredLangFiles();
        const index = files.findIndex(item => item.path === file.path);
        if (index >= 0) state.selectedLang = index;
        renderLang();
      } catch (error) {
        showOperation('danger', 'Sync failed', error.message || 'Unable to sync language keys.');
      } finally {
        setBusy(false);
      }
    }

    async function syncLangLocale() {
      const reference = $('langSyncReference')?.value || state.langSyncReference || 'en';
      const target = $('langSyncTarget')?.value || (state.langLocale !== 'all' ? state.langLocale : '');
      if (!reference || !target) {
        showOperation('warn', 'Sync locale', 'Choose reference and target locales.');
        return;
      }
      if (reference === target) {
        showOperation('warn', 'Sync locale', 'Reference and target locale must be different.');
        return;
      }
      if (!confirm(`Add missing keys from "${reference}" into all "${target}" language files?`)) return;
      setBusy(true, 'Syncing locale', `${reference} -> ${target}`);
      try {
        const result = await post('/api/lang/sync-locale', {
          reference_locale: reference,
          target_locale: target,
          scope: state.langScope === 'all' ? 'all' : state.langScope,
        });
        if (result.error) throw new Error(result.message || 'Locale sync failed.');
        showOperation('success', 'Locale synced', result.message || 'Missing keys were added.');
        state.langLocale = target;
        state.langSyncReference = reference;
        closeLangToolModal();
        await loadLang();
      } catch (error) {
        showOperation('danger', 'Locale sync failed', error.message || 'Unable to sync locale.');
      } finally {
        setBusy(false);
      }
    }

    async function loadConfig() {
      const payload = await api('/api/config');
      state.config = payload;
      state.configEditing = false;
      renderConfig();
    }

    function filteredConfigFiles() {
      const query = state.configSearch.trim().toLowerCase();
      return (state.config?.files || []).filter(file => {
        if (state.configCategory !== 'all' && file.category !== state.configCategory) return false;
        if (!query) return true;
        const haystack = [file.name, file.path, file.category, (file.env_keys || []).join(' '), file.content].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    function renderConfig() {
      const payload = state.config || { files: [], categories: {}, env: [], summary: {} };
      const files = filteredConfigFiles();
      if (state.selectedConfig >= files.length) state.selectedConfig = 0;
      const selected = files[state.selectedConfig] || null;
      $('configTotalBadge').textContent = Number(payload.summary?.total || 0).toLocaleString();
      $('configWritableBadge').textContent = `${Number(payload.summary?.writable || 0).toLocaleString()} writable`;
      renderConfigTabs(payload.categories || {});
      $('configFiles').innerHTML = files.length ? files.map((file, index) => `
        <button onclick="selectConfig(${index})" class="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${index === state.selectedConfig ? 'bg-violet-500/22 text-white shadow-[0_10px_30px_rgba(124,58,237,.18)]' : 'text-slate-300 hover:bg-white/6'}">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">${configIcon(file.category)}</span>
          <span class="min-w-0 flex-1"><span class="block truncate font-bold">${esc(file.name)}</span><span class="mt-0.5 block truncate text-xs text-slate-500">${esc(file.path)}</span></span>
          <span class="h-2 w-2 rounded-full ${file.writable ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
        </button>
      `).join('') : '<div class="p-6 text-center text-sm text-slate-500">No config files match your filter.</div>';
      renderConfigEditor(selected);
      renderConfigDetails(selected, payload);
    }

    function renderConfigTabs(categories) {
      const labels = [['all', 'All'], ['platform', 'Platform'], ['app', 'App'], ['theme', 'Theme']];
      $('configTabs').innerHTML = labels.map(([key, label]) => {
        const active = state.configCategory === key;
        const count = Number(categories[key] || 0);
        return `<button onclick="setConfigCategory('${key}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${active ? 'border-violet-300/40 bg-violet-500 text-white shadow-[0_12px_35px_rgba(124,58,237,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${count.toLocaleString()}</span></button>`;
      }).join('');
    }

    function setConfigCategory(category) {
      state.configCategory = category || 'all';
      state.selectedConfig = 0;
      state.configEditing = false;
      renderConfig();
    }

    function selectConfig(index) {
      state.selectedConfig = index;
      state.configEditing = false;
      renderConfig();
    }

    function renderConfigEditor(file) {
      if (!file) {
        $('configEditorHeader').innerHTML = '<div><h3 class="font-bold text-white">No file selected</h3><p class="mt-1 text-sm text-slate-500">Choose a config file from the list.</p></div>';
        $('configEditor').innerHTML = '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No config file selected.</div>';
        return;
      }
      const editDisabled = !file.writable || file.truncated;
      $('configEditorHeader').innerHTML = `
        <div class="min-w-0"><div class="flex items-center gap-3"><h3 class="truncate font-bold text-white">${esc(file.name)}</h3><span class="rounded-lg px-2 py-1 text-xs font-bold ${file.writable ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-200'}">${file.writable ? 'Writable' : 'Read only'}</span></div><div class="mt-1 truncate text-xs text-slate-500">${esc(file.path)}</div></div>
        <div class="flex flex-wrap gap-2">
          ${state.configEditing ? `
            <button onclick="saveConfigFile()" class="rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400">Save Changes</button>
            <button onclick="cancelConfigEdit()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Cancel</button>
          ` : `
            <button onclick="startConfigEdit()" ${editDisabled ? 'disabled' : ''} class="rounded-xl border border-violet-300/25 bg-violet-400/10 px-3 py-2 text-xs font-bold text-violet-200 hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-45">Edit</button>
            <button onclick="loadConfig()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">Refresh</button>
          `}
        </div>
      `;
      $('configEditor').innerHTML = state.configEditing
        ? `<textarea id="configEditorInput" spellcheck="false" class="min-h-[620px] w-full resize-y bg-[#06101c] p-5 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-violet-300/35">${esc(file.content || '')}</textarea>
           <div class="border-t border-white/10 px-4 py-3 text-xs text-slate-500">Editing ${esc(file.path)}. Changes are written directly to the project file.</div>`
        : `<pre class="min-h-[620px] bg-[#06101c] p-5 text-[13px] leading-6 text-slate-300"><code>${highlightPhp(file.content || '')}${file.truncated ? '\n\n/* Preview truncated for performance. */' : ''}</code></pre>`;
    }

    function startConfigEdit() {
      const file = filteredConfigFiles()[state.selectedConfig];
      if (!file || !file.writable || file.truncated) {
        showOperation('warn', 'Config cannot be edited', file?.truncated ? 'Large config previews are read-only in Inspector.' : 'This config file is read-only.');
        return;
      }
      state.configEditing = true;
      renderConfig();
    }

    function cancelConfigEdit() {
      state.configEditing = false;
      renderConfig();
    }

    async function saveConfigFile() {
      const file = filteredConfigFiles()[state.selectedConfig];
      const input = $('configEditorInput');
      if (!file || !input) return;
      setBusy(true, 'Saving config', file.path);
      try {
        const result = await post('/api/config/save', { path: file.path, content: input.value });
        if (result.error) throw new Error(result.message || 'Unable to save config file.');
        showOperation('success', 'Config saved', result.message || `${file.name} was saved.`);
        const previousPath = file.path;
        const payload = await api('/api/config');
        state.config = payload;
        const files = filteredConfigFiles();
        state.selectedConfig = Math.max(0, files.findIndex(item => item.path === previousPath));
        state.configEditing = false;
        renderConfig();
      } catch (error) {
        showOperation('danger', 'Save failed', error.message || 'Unable to save config file.');
      } finally {
        setBusy(false);
      }
    }

    function renderConfigDetails(file, payload) {
      if (!file) {
        $('configDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a config file to inspect details.</div>';
        return;
      }
      const env = (payload.env || []).filter(item => (file.env_keys || []).includes(item.key)).slice(0, 8);
      const envFallback = (payload.env || []).slice(0, 6);
      const usage = file.usage || [];
      $('configDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3"><div><h3 class="font-bold text-white">Config Details</h3><div class="mt-4 flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">${configIcon(file.category)}</span><div class="min-w-0"><div class="truncate font-bold text-white">${esc(file.name)}</div><div class="truncate text-xs text-slate-500">${esc(file.path)}</div></div></div></div><button onclick="renderConfigDetails(null, state.config)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div>
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${configDetailRow('Category', file.category)}
            ${configDetailRow('Size', file.size_label || file.size)}
            ${configDetailRow('Lines', file.lines)}
            ${configDetailRow('Last modified', file.modified_at_label, file.modified_at)}
            ${configDetailRow('Status', file.writable ? 'Writable' : 'Read only')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Environment Overrides</h3>
          <p class="mt-1 text-sm text-slate-500">Values loaded from your .env file.</p>
          <div class="mt-4 divide-y divide-white/10">${(env.length ? env : envFallback).length ? (env.length ? env : envFallback).map(item => `<div class="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm"><span class="truncate text-slate-500">${esc(item.key)}</span><span class="truncate text-right text-slate-200">${esc(item.value)}</span></div>`).join('') : '<div class="py-4 text-sm text-slate-500">No matching environment keys were found.</div>'}</div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Config Usage</h3>
          <div class="mt-4 divide-y divide-white/10">${usage.length ? usage.map(item => `<div class="grid grid-cols-[1fr_70px] gap-3 py-3 text-sm"><span class="truncate text-slate-200">${esc(item.file)}</span><span class="text-right text-slate-500">Line ${esc(item.line)}</span></div>`).join('') : '<div class="py-4 text-sm text-slate-500">No direct usage was detected in app files.</div>'}</div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <h3 class="font-bold text-white">Quick Actions</h3>
          <div class="mt-4 grid gap-2">
            <button onclick="runInspectorAction('doctor')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Run Doctor</button>
            <button onclick="runInspectorAction('migrate')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Run Migrations</button>
            <button onclick="exportSnapshot()" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Export Snapshot</button>
          </div>
        </div>
      `;
    }

    function configDetailRow(label, value, note) {
      const display = value === null || value === undefined || value === '' ? '-' : value;
      return `<div class="grid grid-cols-[110px_1fr_auto] items-start gap-3 px-4 py-3 text-sm"><span class="text-slate-500">${esc(label)}</span><span class="min-w-0 truncate text-right text-slate-200">${esc(display)}${note ? `<span class="mt-1 block truncate text-xs text-slate-500">${esc(note)}</span>` : ''}</span><button type="button" data-copy="${esc(display)}" title="Copy" class="copy-btn grid h-7 w-12 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10">Copy</button></div>`;
    }

    function configIcon(category) {
      const name = category === 'database' ? 'database' : category === 'platform' ? 'layers' : category === 'theme' ? 'package' : category === 'frontend' ? 'code' : category === 'services' ? 'settings' : category === 'app' ? 'package' : 'fileText';
      return icon(name, 'h-5 w-5');
    }

    function highlightPhp(source) {
      const escaped = esc(source);
      return escaped
        .replace(/(&lt;\\?php|return|array|true|false|null|class|new|function)/g, '<span class="text-violet-300">$1</span>')
        .replace(/('(?:[^'\\\\]|\\\\.)*'|&quot;(?:[^&]|&(?!quot;))*&quot;)/g, '<span class="text-emerald-300">$1</span>')
        .replace(/(=&gt;)/g, '<span class="text-pink-300">$1</span>')
        .replace(/(env\()/g, '<span class="text-sky-300">$1</span>');
    }

    async function loadFlow() {
      state.flow = await api('/api/flow');
      renderFlow();
    }

    function filteredFlowItems() {
      const query = state.flowSearch.trim().toLowerCase();
      return (state.flow?.items || []).filter(item => {
        if (state.flowType !== 'all' && item.type !== state.flowType) return false;
        if (state.flowStatus !== 'all' && item.status !== state.flowStatus) return false;
        if (!query) return true;
        return [item.name, item.class, item.type, item.group, item.status, item.description, ...(item.routes || []).map(route => route.uri + ' ' + route.action)].join(' ').toLowerCase().includes(query);
      });
    }

    function renderFlow() {
      const payload = state.flow || { items: [], summary: {}, pipeline: [] };
      const items = filteredFlowItems();
      if (state.selectedFlow >= items.length) state.selectedFlow = 0;
      renderFlowTabs();
      $('flowSummary').innerHTML = `
        ${smallCard('Total Flow', payload.summary?.total || 0, '', 'violet')}
        ${smallCard('Enabled', payload.summary?.enabled || 0, '', 'success')}
        ${smallCard('Global', payload.summary?.global || 0, '', 'warn')}
        ${smallCard('Groups', payload.summary?.groups || 0, '', 'blue')}
        ${smallCard('Applied Routes', payload.summary?.applied_routes || 0, '', 'violet')}
      `;
      const types = Array.from(new Set((payload.items || []).map(item => item.type))).sort();
      $('flowTypeFilter').innerHTML = '<option value="all">All Types</option>' + types.map(type => `<option value="${esc(type)}">${esc(type)}</option>`).join('');
      $('flowTypeFilter').value = state.flowType;
      renderFlowMainContent(items);
      renderFlowPipeline(payload.pipeline || []);
      renderFlowDetails(items[state.selectedFlow] || null);
    }

    function renderFlowTabs() {
      const tabs = ['Flow', 'Groups', 'Pipeline', 'Priority', 'Global Stack'];
      $('flowTabs').innerHTML = tabs.map(label => {
        const key = label.toLowerCase().replace(/ /g, '_');
        return `<button onclick="setFlowTab('${key}')" class="border-b-2 px-1 pb-3 text-sm font-bold transition ${state.flowTab === key ? 'border-violet-400 text-violet-300' : 'border-transparent text-slate-400 hover:text-slate-200'}">${esc(label)}</button>`;
      }).join('');
    }

    function setFlowTab(tab) {
      state.flowTab = tab || 'flow';
      state.selectedFlow = 0;
      renderFlow();
    }

    function renderFlowMainContent(items) {
      if (state.flowTab === 'groups') return renderFlowGroups(items);
      if (state.flowTab === 'pipeline') return renderFlowPipelineTable(items);
      if (state.flowTab === 'priority') return renderFlowPriority(items);
      if (state.flowTab === 'global_stack') return renderFlowGlobalStack(items);
      return renderFlowMiddlewareTable(items);
    }

    function renderFlowMiddlewareTable(items) {
      $('flowContent').innerHTML = items.length ? `
        <table class="w-full min-w-[820px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-4">Flow</th><th class="px-4 py-4">Type</th><th class="px-4 py-4">Group</th><th class="px-4 py-4">Priority</th><th class="px-4 py-4">Status</th><th class="px-4 py-4">Applied</th></tr></thead><tbody class="divide-y divide-white/10">${items.map((item, index) => flowTableRow(item, index)).join('')}</tbody></table><div class="border-t border-white/10 px-4 py-4 text-sm text-slate-400">Showing 1 to ${items.length} of ${items.length} flow classes</div>
      ` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No flow classes found.</div>';
    }

    function flowTableRow(item, index) {
      return `<tr onclick="selectFlow(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedFlow ? 'bg-violet-500/16' : ''}"><td class="px-4 py-4"><div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-xl ${flowTypeTone(item.type)}">${icon(item.type === 'auth' || item.type === 'security' ? 'shield' : 'activity', 'h-5 w-5')}</span><div><div class="font-bold text-white">${esc(item.name)}</div><div class="mt-1 text-xs text-slate-500">${esc(item.class)}</div></div></div></td><td class="px-4 py-4"><span class="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200">${esc(item.type)}</span></td><td class="px-4 py-4 text-slate-300">${esc(item.group)}</td><td class="px-4 py-4 text-slate-300">${esc(item.priority)}</td><td class="px-4 py-4">${flowStatusBadge(item.status)}</td><td class="px-4 py-4 text-slate-300">${esc(item.global ? 'Global' : item.applied_routes + ' routes')}</td></tr>`;
    }

    function renderFlowGroups(items) {
      const groups = {};
      items.forEach(item => {
        const group = item.group || 'web';
        groups[group] = groups[group] || [];
        groups[group].push(item);
      });
      const rows = Object.entries(groups).map(([group, groupItems]) => `<button onclick="state.flowGroup='${esc(group)}'; setFlowTab('pipeline')" class="block w-full border-b border-white/10 px-4 py-4 text-left hover:bg-white/[.04]"><div class="flex items-center justify-between gap-3"><div><div class="font-bold text-white">${esc(group)}</div><div class="mt-1 text-sm text-slate-500">${groupItems.length} flow classes | ${groupItems.reduce((sum, item) => sum + Number(item.applied_routes || 0), 0)} applied routes</div></div><span class="rounded-xl bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-200">Open pipeline</span></div></button>`).join('');
      $('flowContent').innerHTML = rows || '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No flow groups found.</div>';
    }

    function renderFlowPipelineTable(items) {
      const group = state.flowGroup || $('flowGroupFilter')?.value || 'web';
      if ($('flowGroupFilter')) $('flowGroupFilter').value = group;
      const pipeline = items.filter(item => item.group === group || item.global).sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
      $('flowContent').innerHTML = pipeline.length ? `<div class="divide-y divide-white/10">${pipeline.map((item, index) => `<button onclick="selectFlow(${items.indexOf(item)})" class="grid w-full grid-cols-[56px_1fr_90px] items-center gap-3 px-4 py-4 text-left hover:bg-white/[.04]"><span class="grid h-10 w-10 place-items-center rounded-full bg-violet-500 text-sm font-black text-white">${index + 1}</span><span><span class="block font-bold text-white">${esc(item.name)}</span><span class="mt-1 block text-xs text-slate-500">${esc(item.class)}</span></span><span class="text-right text-sm text-slate-400">P${esc(item.priority)}</span></button>`).join('')}</div>` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No pipeline steps for this group.</div>';
    }

    function renderFlowPriority(items) {
      const sorted = [...items].sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
      $('flowContent').innerHTML = sorted.length ? `<table class="w-full min-w-[760px] text-left text-sm"><thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-4">Priority</th><th class="px-4 py-4">Flow</th><th class="px-4 py-4">Group</th><th class="px-4 py-4">Routes</th></tr></thead><tbody class="divide-y divide-white/10">${sorted.map(item => `<tr class="hover:bg-white/[.04]"><td class="px-4 py-4 font-black text-violet-200">${esc(item.priority)}</td><td class="px-4 py-4"><div class="font-bold text-white">${esc(item.name)}</div><div class="mt-1 text-xs text-slate-500">${esc(item.class)}</div></td><td class="px-4 py-4 text-slate-300">${esc(item.group)}</td><td class="px-4 py-4 text-slate-300">${esc(item.global ? 'Global' : item.applied_routes + ' routes')}</td></tr>`).join('')}</tbody></table>` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No priority data found.</div>';
    }

    function renderFlowGlobalStack(items) {
      const globals = items.filter(item => item.global || item.group === 'global');
      $('flowContent').innerHTML = globals.length ? `<div class="divide-y divide-white/10">${globals.map((item, index) => `<button onclick="selectFlow(${items.indexOf(item)})" class="block w-full px-4 py-4 text-left hover:bg-white/[.04]"><div class="flex items-center justify-between gap-3"><div><div class="font-bold text-white">${esc(item.name)}</div><div class="mt-1 text-xs text-slate-500">${esc(item.class)}</div></div><span class="rounded-xl bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Global #${index + 1}</span></div></button>`).join('')}</div>` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500">No global flow classes detected.</div>';
    }

    function renderFlowPipeline(items) {
      const group = state.flowGroup || $('flowGroupFilter')?.value || 'web';
      if ($('flowGroupFilter')) $('flowGroupFilter').value = group;
      const filtered = items.filter(item => item.group === group || item.group === 'global').slice(0, 8);
      $('flowPipeline').innerHTML = filtered.length ? filtered.map((item, index) => `<div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-violet-500 text-sm font-black text-white">${index + 1}</span><div class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2"><div class="font-bold text-white">${esc(item.name)}</div><div class="truncate text-xs text-slate-500">${esc(item.class)}</div></div></div>`).join('') : '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No pipeline steps for this group.</div>';
      const routes = flowRoutesForGroup(group);
      $('flowApplied').innerHTML = `<div class="text-2xl font-black text-white">${routes.length.toLocaleString()}</div><div class="mt-1 text-slate-500">Routes in ${esc(group)} flow</div><div class="mt-4 max-h-72 space-y-2 overflow-auto">${routes.length ? routes.slice(0, 24).map(route => `<div class="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2"><div class="font-bold text-slate-100">${esc(route.method)} ${esc(route.uri || '/')}</div><div class="mt-1 truncate text-xs text-slate-500">${esc(route.action || route.name || route.file || '')}</div></div>`).join('') : '<div class="text-sm text-slate-500">No route matched this flow group.</div>'}</div>`;
    }

    function flowRoutesForGroup(group) {
      const items = state.flow?.items || [];
      const routeMap = new Map();
      items.filter(item => item.group === group || item.global).forEach(item => {
        (item.routes || []).forEach(route => routeMap.set(`${route.method}:${route.uri}:${route.file}:${route.line}`, route));
      });
      return Array.from(routeMap.values());
    }

    function selectFlow(index) { state.selectedFlow = index; renderFlow(); openDetailDrawerFrom('flowDetails', 'Flow Details', 'Flow'); }
    function flowTypeTone(type) { return type === 'Auth' ? 'bg-emerald-400/10 text-emerald-300' : type === 'Security' ? 'bg-amber-400/10 text-amber-200' : type === 'System' ? 'bg-sky-400/10 text-sky-300' : type === 'Performance' ? 'bg-violet-400/10 text-violet-300' : 'bg-slate-400/10 text-slate-300'; }
    function flowStatusBadge(status) { return `<span class="rounded-lg border px-2.5 py-1 text-xs font-black capitalize ${status === 'enabled' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300' : 'border-slate-400/20 bg-slate-400/10 text-slate-300'}">${esc(status)}</span>`; }

    function renderFlowDetails(item) {
      if (!item) {
        $('flowDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a flow class to inspect details.</div>';
        return;
      }
      const routes = item.routes || [];
      $('flowDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><div class="mb-4 flex items-start justify-between"><h3 class="font-bold text-white">Flow Details</h3><button onclick="renderFlowDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div><div class="flex items-center gap-3"><span class="grid h-14 w-14 place-items-center rounded-2xl ${flowTypeTone(item.type)}">${icon(item.type === 'auth' || item.type === 'security' ? 'shield' : 'activity', 'h-6 w-6')}</span><div><div class="font-black text-white">${esc(item.name)} ${flowStatusBadge(item.status)}</div><div class="mt-1 text-sm text-slate-500">${esc(item.class)}</div></div></div><div class="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">${configDetailRow('Type', item.type)}${configDetailRow('Group', item.group)}${configDetailRow('Priority', item.priority)}${configDetailRow('Applied To', item.global ? 'Global' : item.applied_routes + ' routes')}${configDetailRow('Global', item.global ? 'Yes' : 'No')}${configDetailRow('Updated', item.updated_at)}</div><p class="mt-4 text-sm leading-relaxed text-slate-300">${esc(item.description)}</p></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Runs On Routes</h3><div class="mt-4 max-h-80 space-y-2 overflow-auto">${routes.length ? routes.map(route => `<div class="rounded-xl border border-white/10 bg-black/20 px-3 py-2"><div class="font-bold text-slate-100">${esc(route.method)} ${esc(route.uri || '/')}</div><div class="mt-1 truncate text-xs text-slate-500">${esc(route.name || route.action || route.file || '')}${route.line ? ' | Line ' + esc(route.line) : ''}</div></div>`).join('') : '<div class="text-sm text-slate-500">No route was matched for this flow group.</div>'}</div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Source</h3><div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">${configDetailRow('Path', item.path || 'Flow/')}${configDetailRow('Created', item.created_at || '-')}${configDetailRow('Updated', item.updated_at || '-')}</div><p class="mt-4 text-sm text-slate-500">Flow is shown as an inspection view. Editing flow classes should stay in source files so behavior remains explicit and reviewable.</p></div>
      `;
    }

    function runFlowAction(action) {
      showOperation('blue', 'Flow is read-only', 'Inspector shows real flow classes and structure. Edit source files directly to change runtime behavior.');
    }

    async function loadSchedule() {
      state.schedule = await api('/api/schedule');
      renderSchedule();
    }

    function filteredScheduleJobs() {
      const query = state.scheduleSearch.trim().toLowerCase();
      return (state.schedule?.jobs || []).filter(job => {
        if (state.scheduleStatus !== 'all' && job.status !== state.scheduleStatus) return false;
        if (!query) return true;
        return [job.name, job.class, job.expression, job.group, job.status, job.description].join(' ').toLowerCase().includes(query);
      });
    }

    function renderSchedule() {
      const payload = state.schedule || { jobs: [], summary: {} };
      const jobs = filteredScheduleJobs();
      if (state.selectedSchedule >= jobs.length) state.selectedSchedule = 0;
      renderScheduleTabs(payload.summary || {});
      $('scheduleContent').innerHTML = jobs.length ? `
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-4 py-4 font-semibold">Job Name</th><th class="px-4 py-4 font-semibold">Expression</th><th class="px-4 py-4 font-semibold">Next Run</th><th class="px-4 py-4 font-semibold">Last Run</th><th class="px-4 py-4 font-semibold">Status</th><th class="px-4 py-4 font-semibold">Actions</th></tr></thead>
          <tbody class="divide-y divide-white/10">${jobs.map((job, index) => `<tr onclick="selectSchedule(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${index === state.selectedSchedule ? 'bg-violet-500/16' : ''}">
            <td class="px-4 py-4"><div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-xl ${scheduleIconTone(job.status)}">${icon('briefcase', 'h-5 w-5')}</span><div><div class="font-bold text-white">${esc(job.name)}</div><div class="mt-1 text-xs text-slate-500">${esc(job.class)}</div></div></div></td>
            <td class="px-4 py-4"><div class="font-mono text-slate-200">${esc(job.expression)}</div><div class="mt-1 text-xs text-slate-500">${esc(job.frequency)}</div></td>
            <td class="px-4 py-4"><div class="text-slate-200">${esc(job.next_run_label)}</div><div class="mt-1 text-xs text-slate-500">in ${esc(job.next_in)}</div></td>
            <td class="px-4 py-4"><div class="text-slate-200">${esc(job.last_run_label)}</div><div class="mt-1 text-xs text-emerald-300">${esc(job.last_duration)}</div></td>
            <td class="px-4 py-4">${scheduleStatusBadge(job.status)}</td>
            <td class="px-4 py-4"><button onclick="event.stopPropagation(); runScheduleAction('run')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">Run</button></td>
          </tr>`).join('')}</tbody>
        </table>
        <div class="border-t border-white/10 px-4 py-4 text-sm text-slate-400">Showing 1 to ${jobs.length.toLocaleString()} of ${jobs.length.toLocaleString()} jobs</div>
      ` : '<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No scheduled jobs yet</div><div class="mt-2 text-sm">Add tasks to schedule.php and Inspector will show them here.</div></div></div>';
      $('scheduleSummary').innerHTML = [
        ['Total Jobs', payload.summary?.total || 0, 'violet'],
        ['Enabled', payload.summary?.enabled || 0, 'success'],
        ['Disabled', payload.summary?.disabled || 0, 'default'],
        ['Running', payload.summary?.running || 0, 'blue'],
        ['Failed', payload.summary?.failed || 0, 'danger'],
        ['Due Soon', payload.summary?.due_soon || 0, 'warn'],
      ].map(item => smallCard(item[0], item[1], '', item[2])).join('');
      $('scheduleNextRuns').innerHTML = jobs.slice().sort((a, b) => String(a.next_run).localeCompare(String(b.next_run))).slice(0, 4).map(job => `<div class="grid grid-cols-[1fr_110px_90px] gap-3 px-4 py-3 text-sm"><span class="font-medium text-white">${esc(job.name)}</span><span class="text-slate-400">in ${esc(job.next_in)}</span><span class="text-right text-slate-500">${esc(job.next_run_label)}</span></div>`).join('') || '<div class="p-5 text-sm text-slate-500">No upcoming runs.</div>';
      renderScheduleDetails(jobs[state.selectedSchedule] || null);
    }

    function renderScheduleTabs(summary) {
      const tabs = [['all', 'All Jobs', summary.total || 0], ['enabled', 'Due Soon', summary.due_soon || 0], ['running', 'Running', summary.running || 0], ['failed', 'Failed', summary.failed || 0], ['disabled', 'Disabled', summary.disabled || 0]];
      $('scheduleTabs').innerHTML = tabs.map(([key, label, count]) => `<button onclick="setScheduleStatus('${key}')" class="border-b-2 px-1 pb-3 text-sm font-bold transition ${state.scheduleStatus === key ? 'border-violet-400 text-violet-300' : 'border-transparent text-slate-400 hover:text-slate-200'}">${esc(label)} <span class="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">${Number(count || 0).toLocaleString()}</span></button>`).join('');
    }

    function setScheduleStatus(status) { state.scheduleStatus = status || 'all'; state.selectedSchedule = 0; renderSchedule(); }
    function selectSchedule(index) { state.selectedSchedule = index; renderSchedule(); openDetailDrawerFrom('scheduleDetails', 'Schedule Details', 'Schedule'); }
    function scheduleIconTone(status) { return status === 'running' ? 'bg-sky-400/10 text-sky-300' : status === 'failed' ? 'bg-rose-500/10 text-rose-300' : status === 'disabled' ? 'bg-slate-400/10 text-slate-400' : 'bg-violet-500/15 text-violet-200'; }
    function scheduleStatusBadge(status) {
      const cls = status === 'running' ? 'border-sky-300/20 bg-sky-400/10 text-sky-300' : status === 'failed' ? 'border-rose-400/20 bg-rose-500/10 text-rose-300' : status === 'disabled' ? 'border-slate-400/20 bg-slate-400/10 text-slate-300' : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300';
      return `<span class="rounded-lg border px-2.5 py-1 text-xs font-black capitalize ${cls}">${esc(status || 'enabled')}</span>`;
    }

    function renderScheduleDetails(job) {
      if (!job) {
        $('scheduleDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a scheduled job to inspect details.</div>';
        return;
      }
      $('scheduleDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><div class="mb-4 flex items-start justify-between"><h3 class="font-bold text-white">Job Details</h3><button onclick="renderScheduleDetails(null)" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button></div><div class="flex items-center gap-3"><span class="grid h-14 w-14 place-items-center rounded-2xl ${scheduleIconTone(job.status)}">${icon('briefcase', 'h-6 w-6')}</span><div><div class="font-black text-white">${esc(job.name)} ${scheduleStatusBadge(job.status)}</div><div class="mt-1 text-sm text-slate-500">${esc(job.class)}</div></div></div><div class="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">${configDetailRow('Expression', job.expression)}${configDetailRow('Next Run', job.next_run_label)}${configDetailRow('Last Run', job.last_run_label)}${configDetailRow('Timezone', state.schedule?.timezone || '')}${configDetailRow('Group', job.group || 'app')}${configDetailRow('Status', job.status || 'enabled')}</div></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Description</h3><p class="mt-4 text-sm leading-relaxed text-slate-300">${esc(job.description || 'Scheduled task defined in schedule.php.')}</p></div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]"><h3 class="font-bold text-white">Actions</h3><div class="mt-4 grid gap-2"><button onclick="runScheduleAction('run')" class="rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-violet-400">Run Due Tasks</button><button onclick="runScheduleAction('list')" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-white/10">Refresh Schedule List</button></div><p class="mt-4 text-xs leading-relaxed text-slate-500">Add, edit, disable, or delete scheduled tasks in schedule.php so changes remain version controlled.</p></div>
      `;
    }

    function runScheduleAction(action) {
      if (action === 'run') return runInspectorAction('schedule_run');
      if (action === 'list') return runInspectorAction('schedule_list');
      showOperation('blue', 'Schedule is source-driven', 'Edit schedule.php to add, change, disable, or delete scheduled tasks.');
    }

    async function loadLogs() {
      const payload = await api('/api/logs');
      state.logs = payload;
      renderRecentLogs(payload.files || []);
      renderLogs();
    }

    function toggleLogLive() {
      state.logLive = !state.logLive;
      if (state.logLive) {
        showOperation('success', 'Live logs enabled', 'Inspector will refresh logs every 3 seconds.');
        clearInterval(toggleLogLive.timer);
        toggleLogLive.timer = setInterval(() => { if (state.view === 'logs') loadLogs(); }, 3000);
      } else {
        clearInterval(toggleLogLive.timer);
        showOperation('success', 'Live logs paused', 'Automatic log refresh was stopped.');
      }
      renderLogs();
    }

    async function clearLogs(file = '') {
      const ok = await askConfirm(file ? 'Clear this log file?' : 'Clear all log files?', file ? `This will empty ${file}.` : 'This will empty all writable log files in storage/logs.', 'danger');
      if (!ok) return;
      await runWithLoading('Clearing logs', 'Updating log files safely.', async () => {
        const result = await post('/api/logs/clear', { file });
        if (result.error) throw new Error(result.message || 'Logs could not be cleared.');
        await loadLogs();
      }, 'Logs were cleared.');
    }

    async function deleteLogFile(file) {
      const ok = await askConfirm('Delete log file?', `This will permanently delete ${file}.`, 'danger');
      if (!ok) return;
      await runWithLoading('Deleting log file', file, async () => {
        const result = await post('/api/logs/delete', { file });
        if (result.error) throw new Error(result.message || 'Log file could not be deleted.');
        await loadLogs();
      }, 'Log file was deleted.');
    }

    function renderLogs() {
      const payload = state.logs || { files: [], counts: {} };
      logContexts.length = 0;
      const entries = filteredLogEntries();
      const total = allLogEntries().length;
      if ($('logsTotalBadge')) $('logsTotalBadge').textContent = total.toLocaleString();
      renderLogTabs(payload.counts || {}, total);
      if (state.selectedLog >= entries.length) state.selectedLog = 0;
      $('logsContent').innerHTML = entries.length ? `
        <table class="w-full min-w-[920px] text-left text-sm">
          <thead class="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-4 font-semibold">Level</th>
              <th class="px-4 py-4 font-semibold">Message</th>
              <th class="px-4 py-4 font-semibold">Context</th>
              <th class="px-4 py-4 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            ${entries.slice(0, 120).map((entry, index) => {
              const active = index === state.selectedLog;
              return `<tr onclick="selectLog(${index})" class="cursor-pointer transition hover:bg-white/[.05] ${active ? 'bg-violet-500/16' : ''}">
                <td class="w-28 px-4 py-4 align-top">${logLevelBadge(entry.level)}</td>
                <td class="px-4 py-4 align-top"><div class="max-w-[560px] break-words leading-relaxed text-slate-200">${esc(entry.message || friendlyMessage(entry))}</div>${entry.channel ? `<div class="mt-1 text-xs text-slate-500">${esc(entry.channel)}</div>` : ''}</td>
                <td class="w-64 px-4 py-4 align-top text-slate-400">${esc(logContextLabel(entry))}</td>
                <td class="w-36 px-4 py-4 align-top text-slate-300" title="${esc(entry.time || '')}">${esc(entry.time_label || entry.time || '')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="flex items-center justify-between border-t border-white/10 px-4 py-4 text-sm text-slate-400">
          <span>Showing 1 to ${Math.min(entries.length, 120).toLocaleString()} of ${entries.length.toLocaleString()} logs</span>
          <span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">${esc(state.logLevel === 'all' ? 'All levels' : state.logLevel.toUpperCase())}</span>
        </div>
      ` : `<div class="grid min-h-[420px] place-items-center p-8 text-center text-slate-500"><div><div class="text-lg font-bold text-slate-300">No logs found</div><div class="mt-2 text-sm">${payload.dir_exists ? 'Try another level or search term.' : `Log directory is not available yet (${esc(payload.dir || 'storage/logs')}).`}</div></div></div>`;
      renderLogDetails(entries[state.selectedLog] || null);
    }

    function filterLogEntries(entries) {
      const query = state.logSearch.trim().toLowerCase();
      return entries.filter(entry => {
        if (state.logLevel !== 'all' && entry.level !== state.logLevel) return false;
        if (!query) return true;
        const haystack = [entry.message, entry.channel, entry.level, entry.time, entry.time_label, JSON.stringify(entry.context || '')].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    function allLogEntries() {
      return (state.logs?.files || [])
        .flatMap(file => (file.entries || []).map(entry => ({ ...entry, file: file.name, file_size: file.size, file_modified_at: file.modified_at, file_modified_at_label: file.modified_at_label })))
        .sort((a, b) => {
          const at = Date.parse(a.time || a.file_modified_at || '') || 0;
          const bt = Date.parse(b.time || b.file_modified_at || '') || 0;
          return bt - at;
        });
    }

    function filteredLogEntries() {
      return filterLogEntries(allLogEntries());
    }

    function renderLogTabs(counts, total) {
      const tabs = [
        ['all', 'All', total],
        ['error', 'Error', counts.error || 0],
        ['warning', 'Warning', counts.warning || 0],
        ['info', 'Info', counts.info || 0],
        ['debug', 'Debug', counts.debug || 0],
      ];
      $('logLevelTabs').innerHTML = tabs.map(([key, label, count]) => {
        const active = state.logLevel === key;
        return `<button onclick="setLogLevel('${key}')" class="rounded-xl border px-4 py-2 text-sm font-bold transition ${active ? 'border-violet-300/40 bg-violet-500 text-white shadow-[0_12px_35px_rgba(124,58,237,.25)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}">${esc(label)} <span class="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs">${Number(count || 0).toLocaleString()}</span></button>`;
      }).join('');
    }

    function setLogLevel(level) {
      state.logLevel = level || 'all';
      state.selectedLog = 0;
      renderLogs();
    }

    function clearLogFilters() {
      state.logLevel = 'all';
      state.logSearch = '';
      state.selectedLog = 0;
      if ($('logSearch')) $('logSearch').value = '';
      renderLogs();
    }

    function selectLog(index) {
      state.selectedLog = index;
      renderLogs();
      openDetailDrawerFrom('logDetails', 'Log Details', 'Logs');
    }

    function logLevelBadge(level) {
      const classes = level === 'error' ? 'border-rose-400/20 bg-rose-500/15 text-rose-300' : level === 'warning' ? 'border-amber-300/20 bg-amber-400/15 text-amber-200' : level === 'debug' ? 'border-slate-300/15 bg-slate-400/10 text-slate-300' : 'border-sky-300/20 bg-sky-400/15 text-sky-300';
      return `<span class="rounded-lg border px-2.5 py-1 text-xs font-black uppercase ${classes}">${esc(level || 'info')}</span>`;
    }

    function logContextLabel(entry) {
      if (entry.context && typeof entry.context === 'object') {
        if (entry.context.file && entry.context.line) return `${entry.context.file}:${entry.context.line}`;
        const keys = Object.keys(entry.context).slice(0, 2);
        if (keys.length) return keys.join(', ');
      }
      return entry.file || entry.channel || '-';
    }

    function logStats() {
      const counts = state.logs?.counts || {};
      const total = Math.max(1, Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0));
      return ['error', 'warning', 'info', 'debug'].map(level => ({ level, count: Number(counts[level] || 0), percent: Math.round((Number(counts[level] || 0) / total) * 1000) / 10 }));
    }

    function renderLogDetails(entry) {
      if (!entry) {
        $('logDetails').innerHTML = '<div class="rounded-3xl border border-dashed border-white/10 p-6 text-center text-slate-500">Select a log entry to inspect details.</div>';
        return;
      }
      const jsonId = registerLogContext(entry.context);
      const stats = logStats();
      const files = (state.logs?.files || []);
      const errorDash = 94 - (stats.find(item => item.level === 'error')?.percent || 0);
      const warningDash = 94 - (stats.find(item => item.level === 'warning')?.percent || 0);
      const infoDash = 94 - (stats.find(item => item.level === 'info')?.percent || 0);
      $('logDetails').innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div><h3 class="font-bold text-white">Selected Entry</h3><div class="mt-3 flex items-center gap-3">${logLevelBadge(entry.level)}<span class="text-sm text-slate-400" title="${esc(entry.time || '')}">${esc(entry.time_label || entry.time || '')}</span></div></div>
            <button onclick="closeLogDetails()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10">Close</button>
          </div>
          <div class="break-words text-sm leading-relaxed text-slate-200">${esc(entry.message || friendlyMessage(entry))}</div>
          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            ${logDetailRow('Source', logContextLabel(entry), entry.file || '')}
            ${logDetailRow('Channel', entry.channel || 'application', entry.raw ? 'Parsed from framework log line' : '')}
            ${logDetailRow('Raw time', entry.time || '-', entry.file_modified_at_label || '')}
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-3 flex items-center justify-between gap-3"><h3 class="font-bold text-white">Context</h3>${jsonId !== null ? `<button onclick="openJsonViewer(${jsonId})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10">JSON Viewer</button>` : ''}</div>
          ${jsonId !== null ? `<pre class="max-h-72 overflow-auto rounded-2xl bg-[#06101c] p-4 text-xs leading-relaxed text-emerald-200">${esc(JSON.stringify(entry.context, null, 2))}</pre>` : '<div class="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No structured context was attached to this log.</div>'}
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-4 flex items-center justify-between"><h3 class="font-bold text-white">Statistics</h3><span class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Loaded logs</span></div>
          <div class="flex items-center gap-5">
            <svg class="h-28 w-28 shrink-0 -rotate-90" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="rgba(255,255,255,.08)" stroke-width="6"></circle>
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#ef4444" stroke-width="6" stroke-dasharray="${100 - errorDash} ${errorDash}" stroke-dashoffset="0"></circle>
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f59e0b" stroke-width="6" stroke-dasharray="${100 - warningDash} ${warningDash}" stroke-dashoffset="-${100 - errorDash}"></circle>
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#38bdf8" stroke-width="6" stroke-dasharray="${100 - infoDash} ${infoDash}" stroke-dashoffset="-${(100 - errorDash) + (100 - warningDash)}"></circle>
            </svg>
            <div class="min-w-0 flex-1 space-y-2">${stats.map(item => `<div class="flex items-center justify-between gap-3 text-sm"><span class="capitalize text-slate-300">${esc(item.level)}</span><span class="text-slate-400">${item.count.toLocaleString()} (${item.percent}%)</span></div>`).join('')}</div>
          </div>
        </div>
        <div class="rounded-3xl border border-white/10 bg-[#091320]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
          <div class="mb-3 font-bold text-white">Log Files</div>
          <div class="divide-y divide-white/10">${files.length ? files.map(file => `<div class="grid grid-cols-[1fr_70px_96px_72px] items-center gap-3 py-3 text-sm"><span class="truncate text-slate-200">${esc(file.name)}</span><span class="text-right text-slate-400">${formatBytes(file.size || 0)}</span><span class="text-right text-slate-500" title="${esc(file.modified_at || '')}">${esc(file.modified_at_label || '')}</span><span class="flex justify-end gap-1"><button onclick="clearLogs('${esc(file.name)}')" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10">Clear</button><button onclick="deleteLogFile('${esc(file.name)}')" class="rounded-lg border border-rose-300/20 bg-rose-400/10 px-2 py-1 text-xs text-rose-200 hover:bg-rose-400/20">Del</button></span></div>`).join('') : '<div class="py-4 text-sm text-slate-500">No log files found.</div>'}</div>
        </div>
      `;
    }

    function closeLogDetails() {
      const drawer = $('detailDrawer');
      if (drawer && !drawer.classList.contains('hidden')) {
        closeDetailDrawer();
        return;
      }
      renderLogDetails(null);
    }

    function logDetailRow(label, value, note) {
      return `<div class="grid grid-cols-[96px_1fr] gap-3 px-4 py-3 text-sm"><span class="text-slate-500">${esc(label)}</span><span class="min-w-0 truncate text-right text-slate-200">${esc(value)}${note ? `<span class="mt-1 block truncate text-xs text-slate-500">${esc(note)}</span>` : ''}</span></div>`;
    }

    function formatBytes(bytes) {
      const value = Number(bytes || 0);
      if (value >= 1048576) return (value / 1048576).toFixed(1) + ' MB';
      if (value >= 1024) return (value / 1024).toFixed(1) + ' KB';
      return value + ' B';
    }

    const logContexts = [];
    function registerLogContext(context) {
      if (context === null || context === undefined) return null;
      logContexts.push(context);
      return logContexts.length - 1;
    }

    function openJsonViewer(id) {
      $('jsonViewerContent').textContent = JSON.stringify(logContexts[id], null, 2);
      $('jsonModal').classList.remove('hidden');
      $('jsonModal').classList.add('flex');
    }

    function closeJsonViewer() {
      $('jsonModal').classList.add('hidden');
      $('jsonModal').classList.remove('flex');
    }

    function friendlyMessage(entry) {
      if (entry.level === 'error') return 'An error was recorded.';
      if (entry.level === 'warning') return 'A warning was recorded.';
      if (entry.level === 'debug') return 'A debug event was recorded.';
      return 'An application event was recorded.';
    }

    function renderRecentRequests(routes) {
      const rows = (routes || []).slice(0, 5).map((route, index) => {
        const method = route.method || 'GET';
        const methodTone = method === 'POST' ? 'bg-amber-500/15 text-amber-300 border-amber-400/20' : method === 'DELETE' ? 'bg-rose-500/15 text-rose-300 border-rose-400/20' : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';
        return `<div class="grid grid-cols-[74px_1fr_70px_70px] items-center gap-3 px-4 py-3 text-sm max-md:grid-cols-[72px_1fr]">
          <span class="rounded-lg border px-3 py-1 text-center text-xs font-black ${methodTone}">${esc(method)}</span>
          <span class="truncate text-slate-200">${esc(route.uri || '/')}</span>
          <span class="text-slate-400 max-md:hidden">200</span>
          <span class="text-right text-slate-400 max-md:hidden">${35 + (index * 17)}ms</span>
        </div>`;
      }).join('');
      $('recentRequests').innerHTML = rows || '<div class="p-5 text-sm text-slate-500">No routes detected yet.</div>';
    }

    function renderRecentLogs(files) {
      const entries = (files || []).flatMap(file => (file.entries || []).map(entry => ({ ...entry, file: file.name }))).slice(-5).reverse();
      $('recentLogs').innerHTML = entries.length ? entries.map(entry => {
        const tone = entry.level === 'error' ? 'bg-rose-500/15 text-rose-300 border-rose-400/20' : entry.level === 'warning' ? 'bg-amber-500/15 text-amber-300 border-amber-400/20' : 'bg-blue-500/15 text-blue-300 border-blue-400/20';
        return `<div class="grid grid-cols-[84px_1fr_86px] items-center gap-3 px-4 py-3 text-sm max-md:grid-cols-[84px_1fr]">
          <span class="rounded-lg border px-2 py-1 text-center text-xs font-black uppercase ${tone}">${esc(entry.level || 'info')}</span>
          <span class="truncate text-slate-200">${esc(entry.message || '')}</span>
          <span class="text-right text-xs text-slate-500 max-md:hidden" title="${esc(entry.time || '')}">${esc(entry.time_label || entry.time || entry.file || '')}</span>
        </div>`;
      }).join('') : '<div class="p-5 text-sm text-slate-500">No log entries yet.</div>';
    }

    async function runInspectorAction(action, options = {}) {
      if (!ensureReady()) return;
      const migrationActions = ['migrate', 'migrate_rollback', 'migrate_reset', 'migrate_drop', 'migrate_fresh', 'migrate_status'];
      const patchActions = ['patch_run', 'patch_rollback', 'patch_reset', 'patch_status'];
      const targetView = action === 'doctor' ? 'health' : action === 'setup' ? 'setup' : migrationActions.includes(action) ? 'migrations' : patchActions.includes(action) ? 'patches' : ['build', 'build_sign', 'release_patch'].includes(action) ? 'build' : ['pinker_status', 'pinker_rebuild', 'pinker_clear'].includes(action) ? 'pinker' : ['schedule_list', 'schedule_run'].includes(action) ? 'schedule' : 'dashboard';
      if (state.view !== targetView) switchView(targetView);
      closeDetailDrawer();
      const actionTitles = {
        migrate: 'Running migrations',
        migrate_rollback: 'Rolling back migrations',
        migrate_reset: 'Resetting migrations',
        migrate_drop: 'Dropping migration tables',
        migrate_fresh: 'Fresh migrations',
        patch_run: 'Running patches',
        patch_rollback: 'Rolling back patches',
        patch_reset: 'Resetting patches',
        setup: 'Running project setup',
        doctor: 'Running doctor',
      };
      const actionMessages = {
        migrate: 'Building app and platform database tables.',
        migrate_rollback: 'Rolling back migration batch(es).',
        migrate_reset: 'Rolling back every executed migration batch.',
        migrate_drop: 'Dropping package tables and clearing history.',
        migrate_fresh: 'Dropping tables and re-running migrations.',
        patch_run: 'Executing pending data patches.',
        patch_rollback: 'Rolling back the latest rollbackable patch(es).',
        patch_reset: 'Rolling back all rollbackable patches.',
        setup: 'Installing dependencies and preparing migrations, seeders, and patches.',
        doctor: 'Checking project health and environment.',
      };
      const actionTitle = actionTitles[action] || 'Running Inspector action';
      const actionMessage = actionMessages[action] || 'Please wait while Inspector finishes this action.';
      const box = actionResultBox(action);
      box.classList.remove('hidden');
      box.className = 'rounded-3xl border border-sky-300/20 bg-sky-400/10 p-4 text-sky-100';
      box.innerHTML = loadingActionCard(actionTitle, actionMessage);
      setBusy(true, actionTitle, actionMessage);
      let payload;
      try {
        payload = await post('/api/action/run', { action, ...options });
      } catch (error) {
        payload = { ok: false, title: actionTitle + ' failed', message: error.message || 'The action could not finish.', cards: [] };
      }
      const tone = payload.ok ? 'success' : 'danger';
      showOperation(tone, payload.title || actionTitle, payload.message || (payload.ok ? 'Action finished.' : 'Action failed.'));
      box.className = `rounded-3xl border p-4 ${toneClass(tone)}`;
      box.innerHTML = `
        <div class="flex items-start justify-between gap-4 max-md:flex-col">
          <div class="flex min-w-0 gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/20">${icon(payload.ok ? 'check' : 'alertTriangle', 'h-5 w-5')}</span>
            <div class="min-w-0"><div class="font-bold">${esc(payload.title || 'Inspector action')}</div><div class="mt-1 text-sm opacity-80">${esc(payload.message || '')}</div></div>
          </div>
          <span class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold uppercase">${payload.ok ? 'done' : 'failed'}</span>
        </div>
        <div class="mt-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
          ${(payload.cards || []).map(card => smallCard(card.label, card.value, '', card.tone)).join('')}
        </div>
        ${payload.raw?.stderr || payload.raw?.stdout ? `<details class="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3"><summary class="cursor-pointer text-sm font-bold">Operation details</summary><pre class="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed opacity-80">${esc(payload.raw.stderr || payload.raw.stdout || '')}</pre></details>` : ''}
      `;
      setBusy(false);
      if (payload.ok) {
        await runWithLoading('Refreshing section', 'Updating the related Inspector page.', async () => {
          await boot();
          state.loaded[targetView] = false;
          await loadViewData(targetView, true);
          if (state.view !== targetView) {
            state.loaded[state.view] = false;
            await loadViewData(state.view, true);
          }
        }, 'This section was updated.');
      }
    }

    function actionResultBox(action) {
      if (action === 'doctor') return $('healthActionResult');
      if (action === 'setup') return $('setupActionResult');
      if (['migrate', 'migrate_rollback', 'migrate_reset', 'migrate_drop', 'migrate_fresh', 'migrate_status'].includes(action)) return $('migrationsActionResult');
      if (['patch_run', 'patch_rollback', 'patch_reset', 'patch_status'].includes(action)) return $('patchesActionResult');
      if (['build', 'build_sign', 'release_patch'].includes(action)) return $('buildActionResult');
      if (['schedule_list', 'schedule_run'].includes(action)) return $('scheduleActionResult');
      return $('actionResult');
    }

    function loadingActionCard(title, message) {
      return `<div class="flex items-start gap-3">
        <div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-200"><span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span></div>
        <div><div class="font-bold">${esc(title)}</div><div class="mt-1 text-sm opacity-80">${esc(message)}</div></div>
      </div>`;
    }

    async function loadViewData(view, force = false) {
      if (!force && state.loaded[view]) return;
      if (state.loading[view]) {
        if (!force) return state.loading[view];
        await state.loading[view];
      }
      showViewLoading(view);
      const task = (async () => {
        if (view === 'dashboard') {
          await Promise.allSettled([loadRecommendations(), loadRoutes(), loadLogs()]);
        } else if (view === 'connections') {
          await loadDatabase();
        } else if (view === 'database') {
          await loadTables({ autoOpen: true });
        } else if (view === 'query') {
          await loadTables({ autoOpen: false });
        } else if (view === 'health') {
          await loadHealth();
        } else if (view === 'setup') {
          await loadSetup();
        } else if (view === 'migrations') {
          await loadMigrations();
        } else if (view === 'patches') {
          await loadPatches();
        } else if (view === 'routes') {
          await loadRoutes();
        } else if (view === 'flow') {
          await loadFlow();
        } else if (view === 'schedule') {
          await loadSchedule();
        } else if (view === 'logs') {
          await loadLogs();
        } else if (view === 'themes') {
          await loadThemes();
        } else if (view === 'users') {
          await loadUsers();
        } else if (view === 'pinker') {
          await loadPinker();
        } else if (view === 'build') {
          await loadBuild();
        } else if (view === 'views') {
          await loadViews();
        } else if (view === 'lang') {
          await loadLang();
        } else if (view === 'env') {
          await loadEnv();
        } else if (view === 'config') {
          await loadConfig();
        }
        state.loaded[view] = true;
      })().catch(error => {
        const message = error.message || `${view} failed to load.`;
        showOperation('danger', 'Could not load section', message);
        if (view === 'pinker') {
          setHtml('pinkerOverview', sectionErrorPanel('Pinker could not load', message));
          setHtml('pinkerBuildStatus', '');
          setHtml('pinkerRecentBuilds', '');
          setHtml('pinkerDetails', sectionErrorPanel('Pinker unavailable', message));
        }
      }).finally(() => {
        delete state.loading[view];
      });
      state.loading[view] = task;
      return task;
    }

    async function refreshCurrentView() {
      await boot();
      state.loaded[state.view] = false;
      await loadViewData(state.view, true);
    }

    function switchView(view) {
      if (!ensureReady()) return;
      const target = $(view + 'View');
      if (!target) {
        showOperation('danger', 'View not found', `Inspector could not open ${view}.`);
        return;
      }
      state.view = view;
      document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
      target.classList.remove('hidden');
      $('viewTitle').textContent = view.charAt(0).toUpperCase() + view.slice(1);
      document.querySelectorAll('.nav-btn').forEach(btn => {
        const active = btn.dataset.view === view;
        btn.classList.toggle('bg-white/10', active);
        btn.classList.toggle('text-white', active);
        btn.setAttribute('aria-current', active ? 'page' : 'false');
      });
      document.querySelector('main')?.scrollIntoView({ block: 'start' });
      if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
      loadViewData(view);
    }
    document.addEventListener('click', (event) => {
      const nav = event.target.closest?.('.nav-btn');
      if (nav) {
        event.preventDefault();
        switchView(nav.dataset.view);
        return;
      }
      const connectionButton = event.target.closest?.('.connection-details-btn');
      if (connectionButton) {
        event.preventDefault();
        const index = Number(connectionButton.dataset.connectionIndex || 0);
        const rows = state.database?.filteredConnectionRows || state.database?.connectionRows || connectionRows(state.database || {});
        state.selectedConnectionIndex = Math.min(index, Math.max(rows.length - 1, 0));
        state.connectionDetailTab = 'details';
        renderConnectionTable(state.database?.connectionRows || rows);
        renderConnectionDetails(rows[state.selectedConnectionIndex], state.database);
        return;
      }
      const rowDeleteButton = event.target.closest?.('.table-row-delete-btn');
      if (rowDeleteButton) {
        event.preventDefault();
        event.stopPropagation();
        const key = rowDeleteButton.dataset.tableDeleteKey || '';
        deleteTableRows(key ? [key] : []);
        return;
      }
      const rowEditButton = event.target.closest?.('.table-row-edit-btn');
      if (rowEditButton) {
        event.preventDefault();
        event.stopPropagation();
        openEditRowForm(rowEditButton.dataset.tableEditKey || '', Number(rowEditButton.dataset.rowIndex ?? -1));
        return;
      }
      const fkCellButton = event.target.closest?.('.fk-cell-btn');
      if (fkCellButton) {
        event.preventDefault();
        event.stopPropagation();
        openFkRelatedRow(fkCellButton.dataset.fkColumn || '', fkCellButton.dataset.fkValue || '');
        return;
      }
      const copyButton = event.target.closest?.('.copy-btn');
      if (copyButton) {
        event.preventDefault();
        copyText(copyButton.dataset.copy || '');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if ($('schemaBuilderModal') && !$('schemaBuilderModal').classList.contains('hidden')) {
          closeSchemaBuilder();
          return;
        }
        closeDetailDrawer();
      }
    });
    $('refresh').onclick = async () => {
      if (!ensureReady()) return;
      await runWithLoading('Refreshing section', 'Reloading the visible Inspector page.', refreshCurrentView, 'This section is up to date.');
    };
    $('logSearch').oninput = (event) => { state.logSearch = event.target.value || ''; state.selectedLog = 0; renderLogs(); };
    $('tableFilter').oninput = (event) => { state.tableFilter = event.target.value || ''; renderTableListModern($('tablesDb')); };
    $('connectionSearch').oninput = () => { if (state.database) renderConnectionTable(state.database.connectionRows || connectionRows(state.database)); };
    $('queryTable').onchange = () => { state.queryTable = $('queryTable').value; loadQuerySchema(); };
    $('queryLimit').onchange = loadQuerySchema;
    $('queryOffset').onchange = loadQuerySchema;
    $('routeSearch').oninput = (event) => { state.routeSearch = event.target.value || ''; state.selectedRoute = 0; renderRoutes(); };
    $('flowSearch').oninput = (event) => { state.flowSearch = event.target.value || ''; state.selectedFlow = 0; renderFlow(); };
    $('flowTypeFilter').onchange = (event) => { state.flowType = event.target.value || 'all'; state.selectedFlow = 0; renderFlow(); };
    $('flowStatusFilter').onchange = (event) => { state.flowStatus = event.target.value || 'all'; state.selectedFlow = 0; renderFlow(); };
    $('flowGroupFilter').onchange = (event) => { state.flowGroup = event.target.value || 'web'; renderFlow(); };
    $('migrationSearch').oninput = (event) => { state.migrationSearch = event.target.value || ''; state.selectedMigration = 0; renderMigrations(); };
    $('patchSearch')?.addEventListener('input', (event) => { state.patchSearch = event.target.value || ''; state.selectedPatch = 0; renderPatches(); });
    $('scheduleSearch').oninput = (event) => { state.scheduleSearch = event.target.value || ''; state.selectedSchedule = 0; renderSchedule(); };
    $('scheduleStatusFilter').onchange = (event) => { state.scheduleStatus = event.target.value || 'all'; state.selectedSchedule = 0; renderSchedule(); };
    $('themeSearch').oninput = (event) => { state.themeSearch = event.target.value || ''; state.selectedTheme = 0; renderThemes(); };
    $('userSearch').oninput = (event) => { state.userSearch = event.target.value || ''; state.selectedUser = 0; renderUsers(); };
    $('userStatusFilter').onchange = (event) => { state.userStatus = event.target.value || 'all'; state.selectedUser = 0; renderUsers(); };
    $('viewSearch').oninput = (event) => { state.viewSearch = event.target.value || ''; state.selectedView = 0; renderViews(); };
    $('langSearch').oninput = (event) => { state.langSearch = event.target.value || ''; state.selectedLang = 0; state.langEditing = false; renderLang(); };
    $('langSyncReference')?.addEventListener('change', (event) => { state.langSyncReference = event.target.value || 'en'; });
    $('configSearch').oninput = (event) => { state.configSearch = event.target.value || ''; state.selectedConfig = 0; renderConfig(); };
    setReady(false);
    loadApps().then(() => boot()).then(() => {
      setReady(true);
      const initial = (location.hash || '#dashboard').slice(1);
      switchView(['dashboard', 'setup', 'connections', 'database', 'query', 'health', 'migrations', 'patches', 'routes', 'users', 'flow', 'schedule', 'logs', 'themes', 'pinker', 'build', 'views', 'lang', 'env', 'config', 'export'].includes(initial) ? initial : 'dashboard');
    }).catch(error => {
      showOperation('danger', 'Inspector could not load', error.message || 'The initial project scan failed.');
      const lock = $('bootLock');
      if (lock) {
        lock.innerHTML = '<div class="w-full max-w-md rounded-3xl border border-rose-400/25 bg-rose-400/10 p-6 text-center text-rose-100 shadow-[0_28px_90px_rgba(0,0,0,.45)]"><div class="text-lg font-black">Inspector could not load</div><div class="mt-2 text-sm opacity-80">' + esc(error.message) + '</div><button onclick="location.reload()" class="mt-5 rounded-xl bg-rose-200 px-4 py-2 text-sm font-bold text-rose-950">Retry</button></div>';
      }
      if ($('databaseContent')) $('databaseContent').innerHTML = '<div class="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-200">' + esc(error.message) + '</div>';
    });
    window.state = state;
