/* IMELTEX — página de trabajos: filtros por tipo + visor de fotos */
(function () {
  'use strict';
  var grid = document.getElementById('trabajos');
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.querySelectorAll('.tr-item'));
  var chips = document.querySelectorAll('.chip');

  /* filtros */
  function filtrar(f) {
    items.forEach(function (it) { it.hidden = (f !== 'todos' && it.getAttribute('data-cat') !== f); });
    chips.forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-f') === f); });
    if (history.replaceState) history.replaceState(null, '', f === 'todos' ? location.pathname : '#' + f);
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { filtrar(c.getAttribute('data-f')); }); });
  var h = location.hash.replace('#', '');
  if (h && document.querySelector('.chip[data-f="' + h + '"]')) filtrar(h);

  /* visor */
  var lb = document.getElementById('lb'), img = document.getElementById('lb-img'), cap = document.getElementById('lb-cap');
  var cur = -1;
  function visibles() { return items.filter(function (it) { return !it.hidden; }); }
  function mostrar(i) {
    var v = visibles(); if (!v.length) return;
    cur = (i + v.length) % v.length;
    var a = v[cur].querySelector('a');
    img.src = a.getAttribute('href'); img.alt = a.getAttribute('data-cap'); cap.textContent = a.getAttribute('data-cap');
    lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function cerrar() { lb.hidden = true; document.body.style.overflow = ''; img.src = ''; }
  items.forEach(function (it) {
    it.querySelector('a').addEventListener('click', function (e) { e.preventDefault(); mostrar(visibles().indexOf(it)); });
  });
  document.getElementById('lb-x').addEventListener('click', cerrar);
  document.getElementById('lb-p').addEventListener('click', function () { mostrar(cur - 1); });
  document.getElementById('lb-n').addEventListener('click', function () { mostrar(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) cerrar(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrar(); else if (e.key === 'ArrowLeft') mostrar(cur - 1); else if (e.key === 'ArrowRight') mostrar(cur + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) mostrar(dx < 0 ? cur + 1 : cur - 1);
  });
})();
