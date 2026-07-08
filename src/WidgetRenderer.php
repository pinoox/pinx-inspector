<?php

declare(strict_types=1);

namespace Pinoox\PinxInspector;

final class WidgetRenderer
{
    public static function render(string $route = '/~inspector'): string
    {
        $route = rtrim($route, '/');
        $route = htmlspecialchars($route !== '' ? $route : '/~inspector', ENT_QUOTES, 'UTF-8');
        $routeJs = json_encode($route, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

        return self::minify(<<<HTML
<script>
(function () {
  if (window.__PINX_INSPECTOR_WIDGET__) return;
  window.__PINX_INSPECTOR_WIDGET__ = true;
  var route = {$routeJs};
  var host = document.createElement('div');
  host.id = 'pinx-inspector-widget-host';
  host.setAttribute('data-pinx-inspector-host', 'true');
  host.style.cssText = 'all:initial;position:fixed;inset:auto auto 0 0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none';
  var shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
<style>
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.pinx-root {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 2147483647;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #eef2ff;
  text-align: left;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  pointer-events: none;
  isolation: isolate;
}
.pinx-root * {
  font-family: inherit;
  line-height: inherit;
  pointer-events: auto;
}
.pinx-root a { color: inherit; text-decoration: none; }
.pinx-root button {
  appearance: none;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.pinx-panel {
  display: none;
  position: relative;
  width: min(292px, calc(100vw - 24px));
  margin-bottom: 10px;
  border: 1px solid rgba(216,180,254,.30);
  border-radius: 20px;
  background: linear-gradient(145deg,#111827,#2b1558 48%,#050914);
  color: #eef2ff;
  box-shadow: 0 20px 70px rgba(15,23,42,.42), inset 0 1px 0 rgba(255,255,255,.16);
  overflow: hidden;
}
.pinx-panel.is-open { display: block; }
.pinx-panel-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 18% 0%,rgba(255,255,255,.13),transparent 32%), radial-gradient(circle at 88% 12%,rgba(168,85,247,.18),transparent 28%);
}
.pinx-panel-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 13px;
  border-bottom: 1px solid rgba(255,255,255,.10);
}
.pinx-panel-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.pinx-panel-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 14px;
  background: linear-gradient(145deg,#3b2a64,#28144f);
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 0 24px rgba(167,139,250,.24);
  flex: 0 0 auto;
}
.pinx-panel-name {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -.01em;
  white-space: nowrap;
}
.pinx-panel-status {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: #cbd5e1;
}
.pinx-panel-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.pinx-icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: #e5e7eb;
  cursor: pointer;
}
.pinx-icon-btn:hover { background: rgba(255,255,255,.12); }
.pinx-dot {
  height: 8px;
  width: 8px;
  border-radius: 999px;
  background: #34d399;
  box-shadow: 0 0 16px #34d399;
}
.pinx-links {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  padding: 10px;
}
.pinx-link-primary {
  grid-column: 1 / -1;
  color: #fff !important;
  background: linear-gradient(135deg,#7c3aed,#a855f7);
  border-radius: 13px;
  padding: 9px 11px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 12px 26px rgba(124,58,237,.24), inset 0 1px 0 rgba(255,255,255,.16);
}
.pinx-link-secondary {
  color: #e5e7eb !important;
  background: #1f2937;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  padding: 8px 9px;
  font-size: 12px;
  font-weight: 800;
}
.pinx-stats {
  position: relative;
  border-top: 1px solid rgba(255,255,255,.08);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: rgba(255,255,255,.06);
}
.pinx-stat {
  background: #111827;
  padding: 8px 9px;
  min-width: 0;
}
.pinx-stat-label {
  font-size: 10px;
  color: #cbd5e1;
}
.pinx-stat-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}
.pinx-fab {
  height: 50px;
  width: 50px;
  border: 1px solid rgba(221,214,254,.38);
  border-radius: 18px;
  background: linear-gradient(145deg,#49317a,#6d28d9 46%,#111827);
  color: #fff;
  display: grid;
  place-items: center;
  padding: 0;
  box-shadow: 0 18px 46px rgba(88,28,135,.38), inset 0 1px 0 rgba(255,255,255,.20);
  cursor: pointer;
}
.pinx-hide-bar {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 7px 10px;
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,.16);
  background: rgba(15,23,42,.72);
  font-size: 11px;
  color: #cbd5e1;
}
.pinx-hide-bar.is-visible { display: flex; }
.pinx-hide-btn {
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.14);
}
.pinx-hide-btn:hover { background: rgba(255,255,255,.16); }
.pinx-restore {
  display: none;
  align-items: center;
  gap: 7px;
  padding: 7px 10px 7px 8px;
  border-radius: 999px;
  border: 1px solid rgba(221,214,254,.34);
  background: linear-gradient(145deg,#49317a,#6d28d9 46%,#111827);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(88,28,135,.34);
  cursor: pointer;
}
.pinx-root.is-hidden .pinx-panel,
.pinx-root.is-hidden .pinx-fab,
.pinx-root.is-hidden .pinx-hide-bar { display: none !important; }
.pinx-root.is-hidden .pinx-restore { display: inline-flex; }
</style>
<div class="pinx-root" data-pinx-root>
  <div class="pinx-panel" data-pinx-panel>
    <div class="pinx-panel-glow"></div>
    <div class="pinx-panel-head">
      <div class="pinx-panel-title">
        <div class="pinx-panel-icon">
          <svg viewBox="0 0 48 48" width="23" height="23" aria-hidden="true"><path fill="none" stroke="#d8b4fe" stroke-width="2.4" d="M24 5 40 14v20l-16 9-16-9V14L24 5Z"/><path fill="none" stroke="#c4b5fd" stroke-width="2.4" d="m8 14 16 9 16-9M24 23v20M16 18.5l16-9"/><path fill="#a78bfa" fill-opacity=".28" d="m24 5 16 9-16 9-16-9 16-9Z"/></svg>
        </div>
        <div>
          <div class="pinx-panel-name">Pinx Inspector</div>
          <div class="pinx-panel-status" data-pinx-status>Checking local app...</div>
        </div>
      </div>
      <div class="pinx-panel-actions">
        <span class="pinx-dot" data-pinx-dot aria-hidden="true"></span>
        <button type="button" class="pinx-icon-btn" data-pinx-collapse title="Collapse panel" aria-label="Collapse panel">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 15 12 9 6 15"/></svg>
        </button>
        <button type="button" class="pinx-icon-btn" data-pinx-hide title="Hide widget" aria-label="Hide widget">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
        </button>
      </div>
    </div>
    <div class="pinx-links">
      <a class="pinx-link-primary" data-pinx-link="home" href="#" target="_blank" rel="noreferrer">Open Inspector</a>
      <a class="pinx-link-secondary" data-pinx-link="database" href="#" target="_blank" rel="noreferrer">Database</a>
      <a class="pinx-link-secondary" data-pinx-link="health" href="#" target="_blank" rel="noreferrer">Health</a>
      <a class="pinx-link-secondary" data-pinx-link="migrations" href="#" target="_blank" rel="noreferrer">Migrate</a>
      <a class="pinx-link-secondary" data-pinx-link="logs" href="#" target="_blank" rel="noreferrer">Logs</a>
    </div>
    <div class="pinx-stats">
      <div class="pinx-stat"><div class="pinx-stat-label">Tables</div><strong class="pinx-stat-value" data-pinx-tables>--</strong></div>
      <div class="pinx-stat"><div class="pinx-stat-label">Rows</div><strong class="pinx-stat-value" data-pinx-rows>--</strong></div>
      <div class="pinx-stat"><div class="pinx-stat-label">Engine</div><strong class="pinx-stat-value" data-pinx-engine>--</strong></div>
    </div>
  </div>
  <div class="pinx-hide-bar" data-pinx-hide-bar>
    <span>Need the full page?</span>
    <button type="button" class="pinx-hide-btn" data-pinx-hide-inline>Hide widget</button>
  </div>
  <button type="button" class="pinx-fab" data-pinx-toggle title="Pinx Inspector" aria-label="Open Pinx Inspector">
    <svg viewBox="0 0 48 48" width="27" height="27" aria-hidden="true"><path fill="rgba(167,139,250,.18)" stroke="#ddd6fe" stroke-width="2.3" d="M24 5 40 14v20l-16 9-16-9V14L24 5Z"/><path fill="none" stroke="#c4b5fd" stroke-width="2.3" d="m8 14 16 9 16-9M24 23v20M16 18.5l16-9"/></svg>
  </button>
  <button type="button" class="pinx-restore" data-pinx-restore title="Show Pinx Inspector" aria-label="Show Pinx Inspector">
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="rgba(167,139,250,.18)" stroke="#ddd6fe" stroke-width="2.3" d="M24 5 40 14v20l-16 9-16-9V14L24 5Z"/><path fill="none" stroke="#c4b5fd" stroke-width="2.3" d="m8 14 16 9 16-9M24 23v20M16 18.5l16-9"/></svg>
    Inspector
  </button>
</div>`;
  var root = shadow.querySelector('[data-pinx-root]');
  var panel = shadow.querySelector('[data-pinx-panel]');
  var hideBar = shadow.querySelector('[data-pinx-hide-bar]');
  function setPanelOpen(open) {
    if (!panel || !hideBar) return;
    panel.classList.toggle('is-open', open);
    hideBar.classList.toggle('is-visible', open);
  }
  function setHidden(hidden) {
    if (!root) return;
    root.classList.toggle('is-hidden', hidden);
    if (hidden) setPanelOpen(false);
  }
  shadow.querySelector('[data-pinx-toggle]')?.addEventListener('click', function () {
    setPanelOpen(!panel?.classList.contains('is-open'));
  });
  shadow.querySelector('[data-pinx-collapse]')?.addEventListener('click', function () {
    setPanelOpen(false);
  });
  shadow.querySelector('[data-pinx-hide]')?.addEventListener('click', function () {
    setHidden(true);
  });
  shadow.querySelector('[data-pinx-hide-inline]')?.addEventListener('click', function () {
    setHidden(true);
  });
  shadow.querySelector('[data-pinx-restore]')?.addEventListener('click', function () {
    setHidden(false);
  });
  shadow.querySelectorAll('[data-pinx-link]').forEach(function (link) {
    var hash = link.getAttribute('data-pinx-link');
    link.href = hash === 'home' ? route : route + '#' + hash;
  });
  fetch(route + '/api/summary', { cache: 'no-store' }).then(function (res) { return res.json(); }).then(function (summary) {
    var status = shadow.querySelector('[data-pinx-status]');
    var tables = shadow.querySelector('[data-pinx-tables]');
    var rows = shadow.querySelector('[data-pinx-rows]');
    var engine = shadow.querySelector('[data-pinx-engine]');
    if (status) status.textContent = (summary.app && summary.app.name ? summary.app.name : 'Local app') + ' is connected';
    if (tables) tables.textContent = summary.database && summary.database.table_count != null ? summary.database.table_count : '--';
    if (rows) rows.textContent = summary.stats && summary.stats.rows != null ? summary.stats.rows : '--';
    if (engine) engine.textContent = summary.database && summary.database.engine ? summary.database.engine : '--';
  }).catch(function () {
    var status = shadow.querySelector('[data-pinx-status]');
    var dot = shadow.querySelector('[data-pinx-dot]');
    if (status) status.textContent = 'Inspector is starting...';
    if (dot) dot.style.background = '#f59e0b';
  });
  function mount() {
    if (!document.body || document.getElementById('pinx-inspector-widget-host')) return;
    document.body.appendChild(host);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
</script>
HTML);
    }

    private static function minify(string $html): string
    {
        $html = preg_replace('/>\s+</', '><', $html) ?? $html;

        return preg_replace('/\s+/', ' ', trim($html)) ?? $html;
    }
}
