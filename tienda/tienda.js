// ══ Tienda IMELTEX ══
// Vitrina + carrito + checkout. Sin framework: el estado vive en un objeto
// y cada cambio vuelve a pintar la vista que toca.
//
// El pedido se manda al Worker (worker-tienda), que recalcula los precios y
// lo escribe en la misma base que usa la app del taller. Si el Worker no
// contesta, el pedido NO se pierde: se ofrece mandarlo por WhatsApp.

import { PRODUCTOS, ENVIOS, PAGOS, COD_PCT } from "./productos.js";

const API = "https://tienda-imeltex.prensaplumalibre.workers.dev/pedido";
const WA_TALLER = "50360158047";
const LS_CARRITO = "imeltex_carrito";

// ── Estado ───────────────────────────────────────────────────

const estado = {
  carrito: leerCarrito(),   // [{ id, cant }]
  envio: "retiro",
  pago: "transferencia",
  documento: "Consumidor final",
  foto: 0,                  // índice de la foto abierta en la ficha
  enviando: false,
};

function leerCarrito() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_CARRITO) || "[]");
    // Descarta ids que ya no existan en el catálogo (precios viejos, productos retirados)
    return raw.filter(l => producto(l.id) && l.cant > 0);
  } catch { return []; }
}

function guardarCarrito() {
  try { localStorage.setItem(LS_CARRITO, JSON.stringify(estado.carrito)); } catch {}
}

const producto = id => PRODUCTOS.find(p => p.id === id);
const $ = sel => document.querySelector(sel);

// ── Precios ──────────────────────────────────────────────────

// El escalón que aplica: el primero (de mayor a menor) cuyo mínimo alcanza.
export function escalonDe(prod, cant) {
  return prod.escalones.find(e => cant >= e.min) || prod.escalones[prod.escalones.length - 1];
}

const dinero = n => "$" + n.toFixed(2);

function lineas() {
  return estado.carrito.map(l => {
    const p = producto(l.id);
    const esc = escalonDe(p, l.cant);
    return { prod: p, cant: l.cant, precio: esc.precio, escalon: esc, subtotal: redondear(esc.precio * l.cant) };
  });
}

const redondear = n => Math.round(n * 100) / 100;

function costoEnvio(ls) {
  const opcion = ENVIOS.find(e => e.id === estado.envio) || ENVIOS[0];
  if (!opcion.costo && !opcion.costoXL) return 0;
  const hayXL = ls.some(l => l.prod.envioXL);
  return hayXL && opcion.costoXL ? opcion.costoXL : opcion.costo;
}

function totales() {
  const ls = lineas();
  const productos = redondear(ls.reduce((s, l) => s + l.subtotal, 0));
  const envio = redondear(costoEnvio(ls));
  const base = redondear(productos + envio);
  const comision = estado.pago === "contra-entrega" ? redondear(base * COD_PCT) : 0;
  return { ls, productos, envio, comision, total: redondear(base + comision) };
}

// ── Carrito ──────────────────────────────────────────────────

function agregar(id, cant) {
  const linea = estado.carrito.find(l => l.id === id);
  if (linea) linea.cant += cant;
  else estado.carrito.push({ id, cant });
  guardarCarrito();
  pintarBadge();
  abrirCarrito();
}

function cambiarCant(id, cant) {
  const linea = estado.carrito.find(l => l.id === id);
  if (!linea) return;
  if (cant <= 0) estado.carrito = estado.carrito.filter(l => l.id !== id);
  else linea.cant = cant;
  guardarCarrito();
  pintarBadge();
  pintarCarrito();
  if (!$("#vista-checkout").hidden) pintarCheckout();
}

function pintarBadge() {
  const n = estado.carrito.reduce((s, l) => s + l.cant, 0);
  const badge = $("#badgeCarrito");
  badge.textContent = n;
  badge.hidden = n === 0;
}

function abrirCarrito() {
  pintarCarrito();
  $("#carrito").hidden = false;
  $("#carritoFondo").hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  $("#carrito").hidden = true;
  $("#carritoFondo").hidden = true;
  document.body.style.overflow = "";
}

function pintarCarrito() {
  const cont = $("#carritoItems");
  const pie = $("#carritoPie");
  const { ls, productos } = totales();

  if (!ls.length) {
    cont.innerHTML = `<div class="carrito-vacio">Su pedido está vacío.<br />Agregue productos de la tienda.</div>`;
    pie.innerHTML = `<button class="btn-secundario" data-cerrar-carrito>Ver la tienda</button>`;
    return;
  }

  cont.innerHTML = ls.map(l => `
    <div class="item">
      <div class="mini"><img src="${l.prod.fotos[0]}" alt="" loading="lazy" /></div>
      <div class="info">
        <h4>${l.prod.nombre}</h4>
        <div class="lin">${l.cant} ${l.cant === 1 ? l.prod.unidad : l.prod.unidadPlural} × ${dinero(l.precio)}</div>
        <div class="cantidad-ctrl" style="margin-top:7px;transform:scale(.82);transform-origin:left">
          <button data-menos="${l.prod.id}" aria-label="Quitar uno">−</button>
          <input type="number" value="${l.cant}" min="0" data-cant="${l.prod.id}" aria-label="Cantidad" />
          <button data-mas="${l.prod.id}" aria-label="Agregar uno">+</button>
        </div>
        <button class="quitar" data-quitar="${l.prod.id}">Quitar</button>
      </div>
      <div class="monto">${dinero(l.subtotal)}</div>
    </div>
  `).join("");

  pie.innerHTML = `
    <div class="linea"><span>Productos</span><span>${dinero(productos)}</span></div>
    <div class="linea"><span>Envío</span><span>se elige al finalizar</span></div>
    <div class="linea total"><span>Subtotal</span><span>${dinero(productos)}</span></div>
    <button class="btn-principal" data-ir="checkout">Finalizar pedido</button>
  `;
}

// ── Vistas ───────────────────────────────────────────────────

function ir(vista, param) {
  location.hash = param ? `#${vista}/${param}` : `#${vista}`;
}

function router() {
  const [vista, param] = location.hash.replace(/^#/, "").split("/");
  cerrarCarrito();
  for (const v of document.querySelectorAll(".vista")) v.hidden = true;

  if (vista === "producto" && producto(param)) {
    estado.foto = 0;
    pintarProducto(producto(param));
    $("#vista-producto").hidden = false;
  } else if (vista === "checkout" && estado.carrito.length) {
    pintarCheckout();
    $("#vista-checkout").hidden = false;
  } else if (vista === "listo") {
    $("#vista-listo").hidden = false;
  } else {
    $("#vista-catalogo").hidden = false;
  }
  window.scrollTo(0, 0);
}

function pintarCatalogo() {
  $("#gridProductos").innerHTML = PRODUCTOS.map(p => {
    const barato = p.escalones[0];
    const caro = p.escalones[p.escalones.length - 1];
    const hayEscala = p.escalones.length > 1;
    return `
      <article class="card-prod" data-abrir="${p.id}">
        <div class="foto"><img src="${p.fotos[0]}" alt="${p.nombre}" loading="lazy" /></div>
        <div class="cuerpo">
          <h3>${p.nombre}</h3>
          <p class="resumen">${p.resumen}</p>
          ${hayEscala ? `<div class="desde">Desde</div>` : ""}
          <div class="precio">${dinero(hayEscala ? barato.precio : caro.precio)}
            <small>por ${p.unidad}</small></div>
        </div>
      </article>`;
  }).join("");
}

function pintarProducto(p) {
  const cant = estado.cantProd && estado.cantProd.id === p.id ? estado.cantProd.cant : p.minimo;
  estado.cantProd = { id: p.id, cant };
  const esc = escalonDe(p, cant);
  const hayEscala = p.escalones.length > 1;

  // ¿Cuánto falta para el siguiente escalón más barato?
  const mejor = [...p.escalones].reverse().find(e => e.min > cant);
  const aviso = mejor
    ? `Agregue ${mejor.min - cant} ${mejor.min - cant === 1 ? p.unidad : p.unidadPlural} más y el precio baja a <b>${dinero(mejor.precio)}</b> cada ${p.unidad}.`
    : "";

  $("#detalleProducto").innerHTML = `
    <div class="prod-fotos">
      <div class="prod-foto-grande"><img src="${p.fotos[estado.foto]}" alt="${p.nombre}" /></div>
      ${p.fotos.length > 1 ? `<div class="prod-miniaturas">${p.fotos.map((f, i) =>
        `<button data-foto="${i}" class="${i === estado.foto ? "activa" : ""}"><img src="${f}" alt="" /></button>`).join("")}</div>` : ""}
    </div>
    <div class="prod-info">
      <h1>${p.nombre}</h1>
      <p class="resumen">${p.resumen}</p>
      <div class="prod-precio">${dinero(esc.precio)} <small>por ${p.unidad}</small></div>
      ${hayEscala ? `<div class="prod-escalon">${esc.etiqueta}</div>` : ""}

      ${hayEscala ? `
      <table class="tabla-escalones">
        <thead><tr><th>Cantidad</th><th style="text-align:right">Precio por ${p.unidad}</th></tr></thead>
        <tbody>${[...p.escalones].reverse().map(e => `
          <tr class="${e === esc ? "activo" : ""}"><td>${e.etiqueta}</td><td>${dinero(e.precio)}</td></tr>`).join("")}
        </tbody>
      </table>` : ""}

      ${aviso ? `<div class="aviso-escalon">${aviso}</div>` : ""}

      <div class="cantidad">
        <div class="cantidad-ctrl">
          <button data-prod-menos aria-label="Menos">−</button>
          <input type="number" id="cantProd" value="${cant}" min="${p.minimo}" aria-label="Cantidad" />
          <button data-prod-mas aria-label="Más">+</button>
        </div>
        <div class="subtotal">Subtotal<br /><b>${dinero(redondear(esc.precio * cant))}</b></div>
      </div>

      <button class="btn-principal" data-agregar="${p.id}" style="margin-top:12px">Agregar al pedido</button>

      <ul class="detalle-lista">${p.detalle.map(d => `<li>${d}</li>`).join("")}</ul>
      ${p.nota ? `<p class="nota-prod">${p.nota}</p>` : ""}
    </div>`;
}

function pintarCheckout() {
  const t = totales();

  $("#resumenCheckout").innerHTML = t.ls.map(l => `
    <div class="fila">
      <span>${l.cant} ${l.cant === 1 ? l.prod.unidad : l.prod.unidadPlural} · ${l.prod.nombre}</span>
      <b>${dinero(l.subtotal)}</b>
    </div>`).join("") +
    `<div class="fila" style="border-top:1px solid var(--linea);margin-top:6px;padding-top:10px">
       <span>Productos</span><b>${dinero(t.productos)}</b></div>`;

  const hayXL = t.ls.some(l => l.prod.envioXL);
  $("#opcionesEnvio").innerHTML = ENVIOS.map(e => {
    const costo = hayXL && e.costoXL ? e.costoXL : e.costo;
    return `
      <label class="opcion">
        <input type="radio" name="envio" value="${e.id}" ${estado.envio === e.id ? "checked" : ""} />
        <div><strong>${e.nombre}</strong><span>${e.detalle}</span></div>
        <span class="costo">${costo ? dinero(costo) : "Gratis"}</span>
      </label>`;
  }).join("");

  $("#opcionesPago").innerHTML = PAGOS.map(p => `
    <label class="opcion ${p.proximamente ? "deshabilitada" : ""}">
      <input type="radio" name="pago" value="${p.id}" ${estado.pago === p.id ? "checked" : ""} ${p.proximamente ? "disabled" : ""} />
      <div><strong>${p.nombre}${p.proximamente ? " — muy pronto" : ""}</strong><span>${p.detalle}</span></div>
    </label>`).join("");

  $("#totalCheckout").innerHTML = `
    <div class="fila"><span>Productos</span><span>${dinero(t.productos)}</span></div>
    <div class="fila"><span>Envío</span><span>${t.envio ? dinero(t.envio) : "Gratis"}</span></div>
    ${t.comision ? `<div class="fila"><span>Servicio de pago contra entrega (2.5%)</span><span>${dinero(t.comision)}</span></div>` : ""}
    <div class="fila grande"><span>Total</span><span>${dinero(t.total)}</span></div>
    <div style="font-size:12px;color:var(--gris-claro);margin-top:6px">IVA incluido.</div>`;

  $("#camposDireccion").hidden = estado.envio === "retiro";
  $("#camposFiscales").hidden = estado.documento !== "Crédito fiscal";
}

// ── Envío del pedido ─────────────────────────────────────────

function datosFormulario() {
  const f = $("#formCheckout");
  const v = n => (f.elements[n]?.value || "").trim();
  return {
    nombre: v("nombre"), telefono: v("telefono"), correo: v("correo"),
    municipio: v("municipio"), direccion: v("direccion"),
    documento: estado.documento, razonSocial: v("razonSocial"),
    nit: v("nit"), nrc: v("nrc"), dirFiscal: v("dirFiscal"), giro: v("giro"),
    notas: v("notas"), envio: estado.envio, pago: estado.pago,
    items: estado.carrito.map(l => ({ id: l.id, cant: l.cant })),
  };
}

function validar(d) {
  const faltan = [];
  const marcar = (campo, mal) => {
    const el = $("#formCheckout").elements[campo];
    if (el) el.classList.toggle("error", mal);
  };
  const pedir = (campo, valor, etiqueta) => {
    const mal = !valor;
    marcar(campo, mal);
    if (mal) faltan.push(etiqueta);
  };

  pedir("nombre", d.nombre, "su nombre");
  pedir("telefono", d.telefono.replace(/\D/g, "").length >= 8, "un teléfono de 8 dígitos");
  if (d.envio !== "retiro") {
    pedir("municipio", d.municipio, "el municipio");
    pedir("direccion", d.direccion, "la dirección");
  }
  if (d.documento === "Crédito fiscal") {
    pedir("razonSocial", d.razonSocial, "la razón social");
    pedir("nit", d.nit, "el NIT");
    pedir("nrc", d.nrc, "el NRC");
    pedir("dirFiscal", d.dirFiscal, "la dirección fiscal");
  }
  return faltan;
}

function textoWhatsApp(d, t, numero) {
  const l = [];
  l.push(numero ? `Pedido web N° ${numero}` : "Pedido desde la tienda en línea:");
  l.push("");
  for (const li of t.ls) l.push(`• ${li.cant} ${li.cant === 1 ? li.prod.unidad : li.prod.unidadPlural} — ${li.prod.nombre}: ${dinero(li.subtotal)}`);
  l.push("");
  l.push(`Envío: ${ENVIOS.find(e => e.id === d.envio).nombre}${t.envio ? " " + dinero(t.envio) : " (gratis)"}`);
  if (t.comision) l.push(`Servicio contra entrega: ${dinero(t.comision)}`);
  l.push(`TOTAL: ${dinero(t.total)}`);
  l.push("");
  l.push(`Nombre: ${d.nombre}`);
  l.push(`Teléfono: ${d.telefono}`);
  if (d.correo) l.push(`Correo: ${d.correo}`);
  if (d.envio !== "retiro") l.push(`Dirección: ${d.direccion}, ${d.municipio}`);
  l.push(`Documento: ${d.documento}`);
  if (d.documento === "Crédito fiscal") l.push(`${d.razonSocial} · NIT ${d.nit} · NRC ${d.nrc}`);
  l.push(`Pago: ${PAGOS.find(p => p.id === d.pago).nombre}`);
  if (d.notas) l.push(`Nota: ${d.notas}`);
  return l.join("\n");
}

const linkWA = texto => `https://wa.me/${WA_TALLER}?text=${encodeURIComponent(texto)}`;

async function enviarPedido(ev) {
  ev.preventDefault();
  if (estado.enviando) return;

  const d = datosFormulario();
  const t = totales();
  const faltan = validar(d);
  const cajaError = $("#erroresCheckout");

  if (faltan.length) {
    cajaError.innerHTML = `Falta ${faltan.join(", ")}.`;
    cajaError.hidden = false;
    $("#formCheckout").querySelector(".error")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
  cajaError.hidden = true;

  estado.enviando = true;
  const btn = $("#btnEnviarPedido");
  btn.disabled = true;
  btn.textContent = "Enviando…";

  let numero = null, guardado = false;
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (r.ok) {
      const j = await r.json();
      numero = j.pedido;
      guardado = true;
    }
  } catch {
    // Sin conexión con el Worker: seguimos por WhatsApp, el pedido no se pierde.
  }

  estado.enviando = false;
  btn.disabled = false;
  btn.textContent = "Enviar pedido";

  const wa = linkWA(textoWhatsApp(d, t, numero));
  $("#confirmacion").innerHTML = guardado ? `
    <div class="check" aria-hidden="true">✓</div>
    <h1>¡Pedido recibido!</h1>
    <div class="num-pedido">N° ${numero}</div>
    <p>Ya entró al taller. Le vamos a escribir por WhatsApp al <b>${d.telefono}</b> para confirmarle la fecha y coordinar ${d.envio === "retiro" ? "el retiro" : "el envío"}.</p>
    <p><b>Total: ${dinero(t.total)}</b></p>
    <div class="acciones">
      <a class="btn-wa" href="${wa}" target="_blank" rel="noopener">Escribirnos ahora por WhatsApp</a>
      <a class="btn-secundario" href="index.html">Volver a la tienda</a>
    </div>` : `
    <div class="check" style="background:#FFF3CD;color:#856404" aria-hidden="true">!</div>
    <h1>Casi listo</h1>
    <p>No pudimos guardar el pedido automáticamente. Toque el botón y nos llega por WhatsApp con todo el detalle ya escrito — solo tiene que enviarlo.</p>
    <p><b>Total: ${dinero(t.total)}</b></p>
    <div class="acciones">
      <a class="btn-wa" href="${wa}" target="_blank" rel="noopener">Enviar el pedido por WhatsApp</a>
      <a class="btn-secundario" href="index.html">Volver a la tienda</a>
    </div>`;

  if (guardado) {
    estado.carrito = [];
    guardarCarrito();
    pintarBadge();
  }
  ir("listo");
}

// ── Eventos ──────────────────────────────────────────────────

document.addEventListener("click", ev => {
  const t = ev.target;
  const cerca = sel => t.closest(sel);

  if (cerca("[data-abrir]")) return ir("producto", cerca("[data-abrir]").dataset.abrir);
  if (cerca("[data-ir]")) return ir(cerca("[data-ir]").dataset.ir);
  if (cerca("[data-cerrar-carrito]")) return cerrarCarrito();
  if (t.id === "btnCarrito") return abrirCarrito();
  if (t.id === "cerrarCarrito" || t.id === "carritoFondo") return cerrarCarrito();

  const foto = cerca("[data-foto]");
  if (foto) {
    estado.foto = +foto.dataset.foto;
    return pintarProducto(producto(location.hash.split("/")[1]));
  }

  const agregarBtn = cerca("[data-agregar]");
  if (agregarBtn) {
    const p = producto(agregarBtn.dataset.agregar);
    agregar(p.id, estado.cantProd?.cant || p.minimo);
    estado.cantProd = null;
    return;
  }

  // Cantidad en la ficha de producto
  if (cerca("[data-prod-mas]") || cerca("[data-prod-menos]")) {
    const p = producto(location.hash.split("/")[1]);
    const paso = cerca("[data-prod-mas]") ? 1 : -1;
    estado.cantProd.cant = Math.max(p.minimo, estado.cantProd.cant + paso);
    return pintarProducto(p);
  }

  // Cantidad en el carrito
  const mas = cerca("[data-mas]"), menos = cerca("[data-menos]"), quitar = cerca("[data-quitar]");
  if (mas || menos || quitar) {
    const id = (mas || menos || quitar).dataset.mas || (menos || quitar).dataset.menos || quitar.dataset.quitar;
    const linea = estado.carrito.find(l => l.id === id);
    if (!linea) return;
    if (quitar) return cambiarCant(id, 0);
    return cambiarCant(id, linea.cant + (mas ? 1 : -1));
  }
});

document.addEventListener("change", ev => {
  const t = ev.target;
  if (t.name === "envio") { estado.envio = t.value; return pintarCheckout(); }
  if (t.name === "pago") { estado.pago = t.value; return pintarCheckout(); }
  if (t.name === "documento") { estado.documento = t.value; return pintarCheckout(); }
  if (t.dataset.cant) return cambiarCant(t.dataset.cant, parseInt(t.value, 10) || 0);
  if (t.id === "cantProd") {
    const p = producto(location.hash.split("/")[1]);
    estado.cantProd.cant = Math.max(p.minimo, parseInt(t.value, 10) || p.minimo);
    return pintarProducto(p);
  }
});

$("#formCheckout").addEventListener("submit", enviarPedido);
window.addEventListener("hashchange", router);

pintarCatalogo();
pintarBadge();
router();
