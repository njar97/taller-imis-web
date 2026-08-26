# -*- coding: utf-8 -*-
"""Aprieta por vos el botón «Solicitar indexación» de Google Search Console.

Google NO tiene API para esto (su Indexing API solo acepta ofertas de empleo y
transmisiones en vivo), así que la única forma es el botón. Este script lo
maneja desde tu propio Chrome, que ya tiene la sesión de Google abierta.

⚠ Es lo más frágil de todo el SEO automático: si Google cambia los textos o el
   diseño de Search Console, deja de encontrar el botón. Cuando falle, se hace
   a mano y listo. Google además limita a unas pocas URLs por día.

CÓMO SE USA
  1. Cerrá Chrome del todo.
  2. Doble clic en tools/chrome-debug.bat  (abre TU Chrome con el puerto 9222)
  3. python tools/pedir_indexacion.py https://imeltex.com.sv/banderas.html
     Sin argumentos, manda todas las páginas del sitemap.
"""
import json
import sys
import time
import urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

import websocket  # pip install websocket-client

PUERTO = 9222
PROPIEDAD = "https://imeltex.com.sv/"
INSPECT = "https://search.google.com/search-console/inspect?resource_id=" + \
          urllib.request.quote(PROPIEDAD, safe="")
ESPERA_RESULTADO = 12      # segundos que le damos a Search Console para responder


class Chrome:
    """Cliente CDP mínimo: lo justo para navegar, escribir y hacer clic."""

    def __init__(self, puerto=PUERTO):
        try:
            paginas = json.load(urllib.request.urlopen(
                f"http://localhost:{puerto}/json", timeout=5))
        except Exception:
            sys.exit("No encontré Chrome escuchando en el puerto %d.\n"
                     "Cerrá Chrome y abrilo con tools/chrome-debug.bat" % puerto)
        objetivo = next((p for p in paginas if p["type"] == "page"), None)
        if not objetivo:
            sys.exit("Chrome está abierto pero sin ninguna pestaña usable.")
        self.ws = websocket.create_connection(objetivo["webSocketDebuggerUrl"],
                                              timeout=30)
        self.n = 0

    def cmd(self, metodo, **params):
        self.n += 1
        self.ws.send(json.dumps({"id": self.n, "method": metodo, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.n:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})

    def js(self, expr):
        r = self.cmd("Runtime.evaluate", expression=expr, returnByValue=True,
                     awaitPromise=True)
        return r.get("result", {}).get("value")

    def ir(self, url, espera=6):
        self.cmd("Page.navigate", url=url)
        time.sleep(espera)

    def escribir(self, texto):
        self.cmd("Input.insertText", text=texto)

    def enter(self):
        for tipo in ("keyDown", "keyUp"):
            self.cmd("Input.dispatchKeyEvent", type=tipo, key="Enter",
                     code="Enter", windowsVirtualKeyCode=13, nativeVirtualKeyCode=13)


# JS que busca un elemento por su texto y lo clickea. Search Console cambia las
# clases todo el tiempo, pero el texto del botón se mantiene.
CLICK_POR_TEXTO = """
(() => {
  const objetivo = %s;
  const nodos = [...document.querySelectorAll('span,div,button,a')];
  const el = nodos.reverse().find(n =>
      objetivo.some(t => (n.textContent || '').trim().toUpperCase() === t)
      && n.offsetParent !== null);
  if (!el) return 'NO_ENCONTRADO';
  el.click();
  return 'CLICKEADO';
})()
"""

TEXTO_VISIBLE = "document.body.innerText"


def pedir(ch, url):
    print(f"\n→ {url}")
    ch.ir(INSPECT, espera=7)

    # La barra de inspección: se escribe la URL y se manda con Enter.
    listo = ch.js("""
      (() => {
        const i = document.querySelector('input[aria-label*="Inspeccionar"],'
                                       + 'input[placeholder*="Inspeccionar"],'
                                       + 'input[type="text"]');
        if (!i) return false;
        i.focus(); i.select();
        return true;
      })()
    """)
    if not listo:
        print("  no encontré la barra de inspección — hacelo a mano")
        return False

    ch.escribir(url)
    ch.enter()
    time.sleep(ESPERA_RESULTADO)

    texto = (ch.js(TEXTO_VISIBLE) or "")
    if "está indexada" in texto and "no está" not in texto:
        print("  ya estaba indexada, no hace falta pedir nada")
        return True

    r = ch.js(CLICK_POR_TEXTO % json.dumps(["SOLICITAR INDEXACIÓN",
                                            "REQUEST INDEXING"]))
    if r != "CLICKEADO":
        print("  no encontré el botón «Solicitar indexación» — hacelo a mano")
        return False

    time.sleep(10)
    texto = (ch.js(TEXTO_VISIBLE) or "")
    if "solicitado la indexación" in texto or "Indexing requested" in texto:
        print("  ✓ indexación solicitada")
        return True
    if "cuota" in texto.lower() or "quota" in texto.lower():
        print("  ✗ Google dice que se agotó la cuota del día")
        return False
    print("  clic dado, pero no vi la confirmación — revisalo en pantalla")
    return False


def urls_del_sitemap():
    import re
    from pathlib import Path
    xml = (Path(__file__).resolve().parent.parent / "sitemap.xml").read_text(encoding="utf-8")
    return re.findall(r"<loc>(.*?)</loc>", xml)


if __name__ == "__main__":
    objetivos = sys.argv[1:] or urls_del_sitemap()
    print(f"Voy a pedir indexación de {len(objetivos)} URL(s).")
    ch = Chrome()
    ok = 0
    for u in objetivos:
        try:
            ok += bool(pedir(ch, u))
        except Exception as e:
            print(f"  error: {e}")
        time.sleep(3)
    print(f"\nListas: {ok} de {len(objetivos)}")
