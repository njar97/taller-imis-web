# -*- coding: utf-8 -*-
"""Pone al día el sitemap y avisa a los buscadores.

Corre solo en cada push (ver .github/workflows/seo.yml):

1. Recorre los .html de la raíz y les pone en el sitemap el `lastmod` real,
   sacado de la fecha del último commit que tocó ese archivo. Antes esa fecha
   se escribía a mano y quedaba vieja, que es justo lo que hace que Google no
   vuelva a mirar la página.
2. Manda a IndexNow (Bing y Yandex) SOLO las páginas que cambiaron en este push.
   Google no tiene un ping equivalente: se entera por el sitemap.

Uso local:  python tools/actualizar_sitemap.py --dry
"""
import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# La consola de la PC de Javier usa cp936 (GBK) y revienta con acentos.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

RAIZ = Path(__file__).resolve().parent.parent
SITIO = "https://imeltex.com.sv"
CLAVE = "e5be14d35507745ff0e91a04b599b209"   # archivo <clave>.txt en la raíz

# Prioridad de cada página en el sitemap. La portada manda.
PRIORIDAD = {"index.html": "1.0"}
PRIORIDAD_DEFECTO = "0.9"

# Páginas que no queremos en el sitemap (verificaciones, plantillas, etc.)
EXCLUIR = {"google9323fe2a40affb04.html"}


def sh(*args):
    return subprocess.run(args, cwd=RAIZ, capture_output=True, text=True).stdout.strip()


def fecha_commit(archivo):
    """Fecha del último commit que tocó el archivo (YYYY-MM-DD)."""
    f = sh("git", "log", "-1", "--format=%cs", "--", archivo)
    return f or datetime.now(timezone.utc).strftime("%Y-%m-%d")


def url_de(archivo):
    return f"{SITIO}/" if archivo == "index.html" else f"{SITIO}/{archivo}"


def paginas():
    return sorted(p.name for p in RAIZ.glob("*.html") if p.name not in EXCLUIR)


def construir_sitemap():
    filas = []
    for archivo in paginas():
        filas.append(
            "  <url>\n"
            f"    <loc>{url_de(archivo)}</loc>\n"
            f"    <lastmod>{fecha_commit(archivo)}</lastmod>\n"
            "    <changefreq>monthly</changefreq>\n"
            f"    <priority>{PRIORIDAD.get(archivo, PRIORIDAD_DEFECTO)}</priority>\n"
            "  </url>"
        )
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "\n".join(filas) + "\n</urlset>\n")


def cambiadas_en_este_push():
    """Los .html tocados por el último commit."""
    salida = sh("git", "diff", "--name-only", "HEAD~1", "HEAD")
    return [l for l in salida.splitlines()
            if l.endswith(".html") and "/" not in l and l not in EXCLUIR]


def avisar_indexnow(urls):
    if not urls:
        print("IndexNow: no cambió ninguna página, no hay nada que avisar.")
        return
    cuerpo = json.dumps({
        "host": SITIO.replace("https://", ""),
        "key": CLAVE,
        "keyLocation": f"{SITIO}/{CLAVE}.txt",
        "urlList": urls,
    }).encode()
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=cuerpo,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"IndexNow: HTTP {r.status} para {len(urls)} URL(s)")
    except Exception as e:
        # Que no tumbe el deploy: avisar a los buscadores es un extra.
        print(f"IndexNow falló (no es grave): {e}")


def main():
    dry = "--dry" in sys.argv
    nuevo = construir_sitemap()
    destino = RAIZ / "sitemap.xml"
    actual = destino.read_text(encoding="utf-8") if destino.exists() else ""

    if nuevo != actual:
        if dry:
            print("El sitemap CAMBIARÍA (dry run, no se escribió).")
        else:
            destino.write_text(nuevo, encoding="utf-8")
            print(f"sitemap.xml actualizado con {len(paginas())} páginas.")
    else:
        print("El sitemap ya estaba al día.")

    urls = [url_de(a) for a in cambiadas_en_este_push()]
    print("Páginas cambiadas en este push:", urls or "ninguna")
    if dry:
        print("(dry run: no se avisó a IndexNow)")
    else:
        avisar_indexnow(urls)


if __name__ == "__main__":
    main()
