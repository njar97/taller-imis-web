# IMELTEX — Sitio Web y Marketing

Sitio público del taller textil IMELTEX, Sonsonate, El Salvador.
URL producción: https://njar97.github.io/taller-imis-web/

## Contexto del negocio

**IMELTEX** (UDP Confecciones IMIS) — taller textil desde 2011. Tres servicios diferenciadores:
1. **Cuellos tejidos** — inversión grande en maquinaria propia, especialidad única en la zona. **Producto estrella — debe tener la mayor visibilidad en el sitio.**
2. **Bordados computarizados** — equipo propio, diseños propios
3. **Confección con sublimación / DTF** — personalización de prendas (uniformes, camisas institucionales, etc.)

Cliente tipo: instituciones, empresas, escuelas, iglesias, grupos. También licitaciones COMPRASAL.

---

## Sistema paralelo de gestión interna

Existe un sistema de pedidos separado (`taller-imis-pedidos`, app React/Vite en `pedidos.imeltex.com.sv`) que gestiona pedidos, bordados, cuellos y clientes. Ese sistema tiene su propio plan de desarrollo (ver `docs/PLAN_ESTRATEGICO.md` en ese repo).

**Importante:** los cambios en este repo (web/marketing) son independientes de los cambios en el repo de pedidos. Ambos pueden avanzar en paralelo sin conflicto. El dueño del taller puede estar trabajando en el sistema de pedidos desde otra sesión mientras acá se trabaja el marketing.

En el futuro el sitio web se conectará a Supabase para leer el catálogo en tiempo real (productos con `visible_en_web=true`), pero **eso es fase futura**. Por ahora el sitio es HTML/CSS/JS estático.

---

## Plan de marketing — estado actual y qué sigue

### Lo que ya está
- SEO básico: Schema.org LocalBusiness, Open Graph, sitemap.xml, robots.txt
- Páginas: index, cuellos, bordados, catálogo
- Google font: Playfair Display + Inter
- Paleta: `#1B2845` (navy) como color principal

### Pendiente de marketing (por donde continuamos)

#### 1. Google Business Profile
- Crear/reclamar perfil en Google Maps para búsquedas locales
- Categorías: "Servicio de bordado" + "Fabricante de ropa" + "Tienda de uniformes"
- Subir fotos del taller, productos, equipo
- Solicitar reseñas a clientes actuales

#### 2. Google Search Console
- Verificar propiedad del sitio
- Monitorear palabras clave posicionadas
- Detectar errores de indexación

**Keywords prioritarias:**
- "cuellos tejidos El Salvador" / "cuellos tejidos Sonsonate"
- "bordados computarizados uniformes El Salvador"
- "confección uniformes escolares Sonsonate"
- "sublimación camisas El Salvador"
- "licitaciones uniformes COMPRASAL"

#### 3. Google Ads
- Campaña específica para cuellos tejidos (diferenciador, poco competidor)
- Segmentación: El Salvador, prioridad Sonsonate / San Salvador
- Keywords exactas: "cuellos tejidos uniforme", "bordados computarizados sonsonate"
- El formulario de cotización es el destino → medir conversiones

#### 4. Meta Ads (Facebook / Instagram)
- Fotografía real del proceso: máquina tejiendo, bordado en tiempo real, resultado final
- Retargeting a quienes visitaron /cuellos o /bordados sin cotizar

#### 5. Scripts PowerShell (automatización)
Desde la PC del taller se puede gestionar:
```powershell
# Google Ads API — campañas, reportes de conversión
# Meta Graph API — publicar, reportes de alcance
# Google Search Console API — posicionamiento de keywords
# Reportes semanales automáticos a Excel/CSV
```

---

## Rediseño visual pendiente

El sitio actual es funcional pero genérico. La dirección acordada:

**Concepto: "El taller como espacio"** — que se sienta como entrar al taller, no como landing de SaaS.

- Fondo oscuro texturizado (tela lona / denim, no negro plano)
- Tipografía editorial con peso — títulos grandes, contraste extremo
- Cuellos y bordados como protagonistas visuales
- Fichas de catálogo con estética de etiqueta textil: fondo crema, bordes definidos, specs técnicas visibles
- Paleta: crema / casi-negro / acento dorado (hilo metálico)
- **Sin stock photos. Sin íconos genéricos. Sin gradientes de startup.**

**Lo más urgente para que el rediseño funcione: fotografía real del taller.**
- Cuello tejido de cerca — textura del hilo, variedad de colores, en uso
- Máquina de tejido en operación
- Bordado computarizado en proceso y resultado final
- El taller: espacio, personas trabajando

### Estructura de páginas acordada
```
/           Hero con cuellos tejidos como protagonista
            3 servicios: Cuellos · Bordados · Confección
            Por qué IMELTEX (15 años, maquinaria propia)
            CTA → cotizar

/cuellos    Landing dedicada — página estrella
            Tipos disponibles, materiales, tallas, tiempos, galería

/bordados   Landing dedicada
            Técnicas: bordado, sublimación, DTF — galería + specs

/catalogo   Productos disponibles (futuro: desde Supabase)

/cotizar    Flujo conversacional en pasos, no formulario plano
            Futuro: POST a Supabase → crea cotización en sistema de pedidos

/nosotros   Historia, personas, maquinaria, ubicación
```

---

## Cuando digas "sigamos con lo de Google"

Continuar con el punto que esté pendiente de la lista de marketing arriba. El orden sugerido:
1. Google Search Console — verificar e identificar keywords actuales
2. Ajustar meta tags y H1 en todas las páginas con keywords prioritarias
3. Google Business Profile — crear/optimizar
4. Primera campaña Google Ads — cuellos tejidos
5. Scripts PowerShell para automatización y reportes

---

## Datos del negocio

- **Nombre legal:** UDP Confecciones IMIS
- **Marca:** IMELTEX / ImelTex Bazar y Confección
- **Dirección:** Av. Centroamericana, Col. Santa Marta, Casa N.° 5-A, Sonsonate
- **Teléfonos:** +503-2451-1620 · +503-6015-8047
- **Email:** confecciones_imis@hotmail.com
- **Desde:** 2011
- **Especialidad única:** cuellos tejidos (maquinaria propia)
