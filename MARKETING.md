# Plan de marketing — IMELTEX

Estado del plan de marketing digital del taller. Cualquier sesión de Claude Code
(o cualquier persona) puede leer esto para continuar desde donde se quedó.

**Sitio:** https://imeltex.com.sv · **Página FB:** Imeltex · **Instagram:** vinculado (business)

## Credenciales / acceso (NUNCA en el repo)

El repo `taller-imis-web` es **público**. Los tokens **no se versionan**: se leen de
**variables de entorno del environment** de Claude Code en la web (se configuran una
sola vez en la UI del environment y quedan disponibles en toda sesión).

| Variable | Valor / descripción |
|---|---|
| `FB_APP_ID` | `1035442325718327` |
| `FB_PAGE_ID` | `1066639549873838` (página "Imeltex") |
| `FB_IG_BUSINESS_ID` | `17841430447788965` |
| `FB_PAGE_TOKEN` | token de página (Graph API) — **secreto** |
| `FB_USER_TOKEN` | long-lived user token — **secreto** |

> El archivo local `.fb-token-temp.txt` está en `.gitignore` y solo existe en el
> contenedor de quien lo generó. Las sesiones nuevas leen de las env vars de arriba.

Business "Imeltex": `1539727937714293`.

### Scopes que necesita el token
Ya presentes: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
`business_management`, `instagram_basic`, `instagram_content_publish`.
**Por agregar** (para que Claude trabaje autónomo en ads): `ads_management`,
`ads_read`, `read_insights`, `pages_manage_engagement`.

## Hecho

- [x] Landing `imeltex.com.sv` con SEO, OG images, páginas `/bordados` y `/cuellos`, verificada en Google Search Console.
- [x] Página de Facebook "Imeltex" + Instagram business vinculado.
- [x] Assets de marca (perfil cream/navy, portada FB).
- [x] Post de bienvenida (corregido 02-jun: WhatsApp `6015-8047` + `imeltex.com.sv`).
- [x] **Tracking** montado: `analytics.js` (GA4 + Meta Pixel + conversiones WhatsApp) en las 3 páginas, **gateado** por IDs.
- [x] Token de FB sacado del repo + `.gitignore`.

## Por hacer (próximos pasos)

1. **Activar tracking** — pegar IDs en `analytics.js`:
   - `GA4_ID` (Google Analytics → Admin → Flujos de datos → `G-XXXXXXXXXX`)
   - `META_PIXEL_ID` (Meta Events Manager → Orígenes de datos → Pixel)
   - Una vez con `ads_management`, Claude puede **crear el Pixel vía API** y pegar el ID solo.
2. **Configurar billing** en la cuenta de anuncios de Meta (solo lo puede hacer el dueño).
3. **Contenido orgánico** — calendario de posts FB/IG (creativos en Canva).
4. **Primera campaña pagada** — público (Sonsonate + El Salvador, instituciones/colegios/empresas), presupuesto, creativos, objetivo = mensajes a WhatsApp / leads.
5. Actualizar `canonical` y `og:url` de `njar97.github.io/...` → `imeltex.com.sv` (SEO).

## Notas de seguridad

- El token viejo estuvo en el historial git público → al regenerar uno nuevo,
  **invalidar el anterior** en la config de la app de Meta.
- Nunca volver a commitear tokens. Usar env vars del environment.
