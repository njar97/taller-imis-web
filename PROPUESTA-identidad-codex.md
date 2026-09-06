# Aplicación de identidad IMELTEX 2026

## Cambios realizados

- Reemplacé la marca provisional y el logo anterior por el nuevo isologo en el menú de `index.html`, `banderas.html`, `catalogo.html`, `bordados.html` y `cuellos.html`. El menú utiliza la versión compacta `imeltex-isologo-2026@400.png` y el pie navy la variante blanca `imeltex-isologo-2026-blanco.png`.
- Actualicé el icono del sitio y los metadatos Open Graph para usar la palmera en PNG. También actualicé el `logo` e `image` del schema local de la portada al isologo nuevo.
- Organicé el sistema visual alrededor del índigo institucional `#14213D`, el coral `#E8623A` como acento y los fondos claros. El coral queda reservado para énfasis, estados y detalles de acción; ya no hay tonos dorados ajenos a la paleta en los fondos de interfaz.
- Aumenté y espacié el isologo en la navegación para que pueda leerse como marca, ajusté el pie para la proporción vertical del nuevo isologo y suavicé sus bordes para no competir con el contenido.
- Integré la palmera desde su SVG mediante máscara CSS: aparece como marca de agua muy sutil en los héroes y como identificador coral de los rótulos de sección. Son dos usos repetibles y contenidos, sin convertirla en adorno por toda la página.
- Ajusté dos puntos móviles detectables por estructura: el catálogo pasa a una sola columna antes de que su mínimo de 300 px pueda desbordar a 320 px; y la tabla de medidas de cuellos queda dentro de un contenedor con desplazamiento horizontal accesible.

## Verificación y revisión pendiente

- Comprobé que las cinco páginas referencian una vez el isologo de menú y una vez el isologo blanco de pie, y que ya no quedan referencias a `imeltex-logo-2026.png`, `imeltex-logo.png`, `imeltex-logo-blanco-2026.png`, los iconos anteriores ni `og-image.png` fuera de `tienda/` y `worker-tienda/`.
- La estructura HTML de las cinco páginas pasó el parseo y el diff no contiene espacios o marcadores inválidos.
- Intenté la revisión visual pedida en un iframe fijo de 390 px y 320 px. El navegador integrado no está habilitado en esta sesión y Chrome/Edge en modo headless fallan antes de dibujar por el proceso GPU del entorno. Conviene hacer una pasada visual final en un navegador normal antes de publicar, especialmente sobre la intensidad de la palmera de agua y el tamaño del isologo en el menú.

## Decisiones que conviene confirmar

- El PNG de 512 px de la palmera se usa literalmente como imagen Open Graph por pedido. Para redes sociales que privilegian una tarjeta horizontal puede ser útil preparar en el futuro una composición 1200 × 630, pero no la generé aquí porque la instrucción fue usar la palmera existente.
