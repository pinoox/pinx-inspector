<?= inspector_view('layout/head.php', ['assetBase' => $assetBase]) ?>
<body class="min-h-screen overflow-x-hidden bg-[#050914] text-slate-100 antialiased">
  <div class="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(139,92,246,.17),transparent_28%),radial-gradient(circle_at_78%_2%,rgba(14,165,233,.10),transparent_30%),linear-gradient(180deg,#050914,#07101c_48%,#050914)]"></div>
  <div class="fixed right-0 top-0 -z-10 h-full w-[22vw] opacity-50 [background-image:radial-gradient(rgba(124,58,237,.55)_1px,transparent_1px)] [background-size:22px_22px] max-xl:hidden"></div>
  <div class="grid min-h-screen grid-cols-[268px_1fr] max-lg:grid-cols-1">
    <?= inspector_view('layout/sidebar.php') ?>
    <main class="min-w-0 p-4 pb-16">
      <?= inspector_view('layout/header.php') ?>
      <?= inspector_view('pages/dashboard.php') ?>
      <?= inspector_view('pages/connections.php') ?>
      <?= inspector_view('pages/database.php') ?>
      <?= inspector_view('pages/query.php') ?>
      <?= inspector_view('pages/health.php') ?>
      <?= inspector_view('pages/migrations.php') ?>
      <?= inspector_view('pages/patches.php') ?>
      <?= inspector_view('pages/routes.php') ?>
      <?= inspector_view('pages/users.php') ?>
      <?= inspector_view('pages/flow.php') ?>
      <?= inspector_view('pages/schedule.php') ?>
      <?= inspector_view('pages/logs.php') ?>
      <?= inspector_view('pages/themes.php') ?>
      <?= inspector_view('pages/pinker.php') ?>
      <?= inspector_view('pages/views.php') ?>
      <?= inspector_view('pages/lang.php') ?>
      <?= inspector_view('pages/config.php') ?>
      <?= inspector_view('pages/env.php') ?>
      <?= inspector_view('pages/build.php') ?>
      <?= inspector_view('pages/export.php') ?>
    </main>
  </div>
  <?= inspector_view('components/boot-lock.php') ?>
  <?= inspector_view('components/operation-hud.php') ?>
  <?= inspector_view('components/detail-drawer.php') ?>
  <?= inspector_view('components/confirm-modal.php') ?>
  <?= inspector_view('components/lang-tools-modal.php') ?>
  <?= inspector_view('components/progress-style.php') ?>
  <?= inspector_view('components/json-modal.php') ?>
  <script src="<?= $assetBase ?>/assets/inspector.js"></script>
</body>
</html>
