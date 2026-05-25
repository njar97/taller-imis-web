# UDP Confecciones IMIS — Web pública

Landing page del taller. HTML/CSS/JS plano, sin frameworks. Servido por GitHub Pages.

**Producción:** https://njar97.github.io/taller-imis-web/ (mientras no haya dominio propio)

## Cómo editar

1. Editá `index.html` — todo el contenido y estilos están ahí.
2. Commit + push a `main` → GH Pages despliega automático.
3. La PWA / app interna está en otro repo: [taller-imis-pedidos](https://github.com/njar97/taller-imis-pedidos).

## Estructura

- `index.html` — landing completa (single file)
- Sin build step. Lo que ves es lo que se sirve.

## Agregar fotos a la galería

Reemplazá los placeholders `<div class="galeria-item">🎓</div>` por `<img src="fotos/uniforme1.jpg" alt="Uniforme escolar" class="galeria-item">`.

Subí las fotos a una carpeta `fotos/` en este mismo repo. Recomendado: comprimir antes (max 800px ancho, JPEG 80% calidad) para que cargue rápido.

## Dominio propio (cuando estés listo)

1. Comprar dominio (`.com.sv` en NIC.SV ~$30/año, `.com` en Cloudflare/Namecheap ~$12/año)
2. Agregar archivo `CNAME` con el dominio (ej: `tallerimis.com.sv`)
3. En el panel de DNS del dominio, apuntar A records a las IPs de GitHub Pages
4. En Settings del repo → Pages → Custom domain → poner el dominio
