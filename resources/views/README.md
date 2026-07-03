# Pinx Inspector Views

Pinx Inspector uses small PHP partials so the UI can stay dependency-free and still be easy to extend.

Structure:
- `app.php`: the base shell. It loads the head, layout, pages, global components, and Inspector JavaScript.
- `layout/`: shared layout pieces such as `head.php`, `sidebar.php`, and `header.php`.
- `pages/`: one file per Inspector page. Keep page HTML shells here and leave runtime behavior in `resources/assets/inspector.js`.
- `components/`: reusable global UI pieces such as modals, drawers, boot lock, and operation HUD.

Adding a page:
1. Create `pages/my-page.php` with a top-level `<section id="myPageView" class="view hidden">`.
2. Include it from `app.php`.
3. Add a sidebar button with `data-view="myPage"` in `layout/sidebar.php`.
4. Add the matching loader/render function in `resources/assets/inspector.js`.

Notes:
- Avoid CDN assets. CSS is generated into `resources/assets/inspector.css`.
- Avoid adding Twig as a hard dependency for now. PHP partials keep `pinx dev` working after installing only Pinx CLI and the Inspector package.
- Keep `resources/router.php` focused on local-only routing and APIs; UI markup belongs in this folder.
