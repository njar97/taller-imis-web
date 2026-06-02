/* IMELTEX — Analítica web y tracking de conversiones
 * ------------------------------------------------------------------
 * Pegá tus IDs abajo. Mientras estén vacíos NO se carga nada: el sitio
 * funciona igual y no se envía ningún dato. En cuanto pongas un ID,
 * ese proveedor se activa solo.
 *
 *   META_PIXEL_ID  → Meta Events Manager → Orígenes de datos → tu Pixel
 *                    (el número largo, ej: "1234567890123456")
 *   GA4_ID         → Google Analytics → Admin → Flujos de datos → web
 *                    (formato "G-XXXXXXXXXX")
 *   GOOGLE_ADS_ID  → Google Ads → Herramientas → Conversiones (opcional)
 *                    (formato "AW-XXXXXXXXX")
 *
 * Eventos de conversión que se disparan automáticamente:
 *   - Click a WhatsApp  → GA "generate_lead" / Meta "Lead"
 *   - Click a teléfono  → GA "contact"       / Meta "Contact"
 *   - Click a email     → GA "contact"       / Meta "Contact"
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  var META_PIXEL_ID = "";   // ej: "1234567890123456"
  var GA4_ID        = "";   // ej: "G-XXXXXXXXXX"
  var GOOGLE_ADS_ID = "";   // ej: "AW-XXXXXXXXX" (opcional)

  /* ---------- Google Analytics 4 / Google Ads (gtag.js) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var gtagId = GA4_ID || GOOGLE_ADS_ID;
  if (gtagId) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gtagId);
    document.head.appendChild(g);
    gtag("js", new Date());
    if (GA4_ID)        gtag("config", GA4_ID);
    if (GOOGLE_ADS_ID) gtag("config", GOOGLE_ADS_ID);
  }

  /* ---------- Meta (Facebook) Pixel ---------- */
  if (META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /* ---------- Tracking de conversiones (clicks a contacto) ---------- */
  function track(gaEvent, fbEvent, params) {
    if (gtagId && window.gtag)       window.gtag("event", gaEvent, params || {});
    if (META_PIXEL_ID && window.fbq) window.fbq("track", fbEvent, params || {});
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = (a.getAttribute("href") || "").toLowerCase();

    if (href.indexOf("wa.me") !== -1 || href.indexOf("api.whatsapp") !== -1) {
      track("generate_lead", "Lead", { method: "whatsapp" });
    } else if (href.indexOf("tel:") === 0) {
      track("contact", "Contact", { method: "phone" });
    } else if (href.indexOf("mailto:") === 0) {
      track("contact", "Contact", { method: "email" });
    }
  }, true);
})();
