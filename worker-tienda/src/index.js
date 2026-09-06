// ══ Worker de la tienda IMELTEX ══
//
// Recibe el pedido de imeltex.com.sv/tienda, RECALCULA los precios acá
// (nunca se confía en lo que manda el navegador) y lo escribe en la misma
// tabla `taller_pedidos` que usa la app del taller, para que le aparezca a
// Javier como cualquier otro pedido.
//
// Deploy:  npx wrangler deploy --config worker-tienda/wrangler.toml

// ── Catálogo autoritativo ──
// ⚠ Copia de tienda/productos.js. Si cambia un precio, cambia en los dos lados.
const PRODUCTOS = {
  "guantes-blancos": {
    nombre: "Guantes blancos de tela",
    unidad: "par", unidadPlural: "pares", envioXL: false,
    escalones: [
      { min: 100, precio: 1.10 },
      { min: 48, precio: 1.25 },
      { min: 12, precio: 1.50 },
      { min: 1, precio: 2.00 },
    ],
  },
  "bandera-sv-150x90": {
    nombre: "Bandera de El Salvador 1.50 × 0.90 m",
    unidad: "bandera", unidadPlural: "banderas", envioXL: false,
    escalones: [{ min: 1, precio: 39.55 }],
  },
  "bandera-sv-245x145": {
    nombre: "Bandera de El Salvador 2.45 × 1.45 m",
    unidad: "bandera", unidadPlural: "banderas", envioXL: false,
    escalones: [{ min: 1, precio: 66.67 }],
  },
  "asta-madera-2m": {
    nombre: "Asta de madera 2 m con base circular",
    unidad: "asta", unidadPlural: "astas", envioXL: true,
    escalones: [{ min: 1, precio: 120.00 }],
  },
};

const ENVIOS = {
  retiro: { nombre: "Retiro en Sonsonate", costo: 0, costoXL: 0 },
  agencia: { nombre: "Recoger en agencia Express", costo: 1.65, costoXL: 8.20 },
  domicilio: { nombre: "Entrega a domicilio", costo: 4.10, costoXL: 8.20 },
};

const PAGOS = {
  transferencia: "Transferencia bancaria",
  "contra-entrega": "Contra entrega en efectivo (Express El Salvador)",
};

const COD_PCT = 0.025;
const MAX_CANT = 5000;          // tope por línea; arriba de eso es error o broma
const SUPA = "https://kszdievqesveluzcnzsh.supabase.co/rest/v1";

const CORS = {
  "Access-Control-Allow-Origin": "https://imeltex.com.sv",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const redondear = n => Math.round(n * 100) / 100;
const dinero = n => "$" + n.toFixed(2);
const limpiar = (s, max = 200) => String(s ?? "").trim().slice(0, max);

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);
    if (new URL(request.url).pathname !== "/pedido") return json({ error: "No encontrado" }, 404);

    let d;
    try {
      d = await request.json();
    } catch {
      return json({ error: "Pedido ilegible" }, 400);
    }

    try {
      const pedido = armarPedido(d);
      const id = await insertar(pedido, env);
      return json({ ok: true, pedido: id, total: pedido._total });
    } catch (err) {
      if (err instanceof PedidoInvalido) return json({ error: err.message }, 400);
      console.error("Error guardando pedido:", err && err.stack || err);
      return json({ error: "No se pudo guardar el pedido" }, 500);
    }
  },
};

class PedidoInvalido extends Error {}

// ── Armado y validación ──────────────────────────────────────

function armarPedido(d) {
  // Líneas
  if (!Array.isArray(d.items) || !d.items.length) throw new PedidoInvalido("El pedido va vacío");
  if (d.items.length > 20) throw new PedidoInvalido("Demasiadas líneas en el pedido");

  const lineas = d.items.map(it => {
    const p = PRODUCTOS[it.id];
    if (!p) throw new PedidoInvalido("Producto desconocido");
    const cant = Math.floor(Number(it.cant));
    if (!Number.isFinite(cant) || cant < 1 || cant > MAX_CANT) throw new PedidoInvalido("Cantidad inválida");
    const esc = p.escalones.find(e => cant >= e.min) || p.escalones[p.escalones.length - 1];
    return { id: it.id, prod: p, cant, precio: esc.precio, subtotal: redondear(esc.precio * cant) };
  });

  // Datos del cliente
  const nombre = limpiar(d.nombre, 120);
  const telefono = limpiar(d.telefono, 30);
  if (!nombre) throw new PedidoInvalido("Falta el nombre");
  if (telefono.replace(/\D/g, "").length < 8) throw new PedidoInvalido("Falta un teléfono válido");

  const envio = ENVIOS[d.envio] ? d.envio : "retiro";
  const pago = PAGOS[d.pago] ? d.pago : "transferencia";
  const conCredito = d.documento === "Crédito fiscal";

  const municipio = limpiar(d.municipio, 120);
  const direccion = limpiar(d.direccion, 400);
  if (envio !== "retiro" && (!municipio || !direccion)) throw new PedidoInvalido("Falta la dirección de entrega");

  const razonSocial = limpiar(d.razonSocial, 160);
  const nit = limpiar(d.nit, 25);
  const nrc = limpiar(d.nrc, 20);
  const dirFiscal = limpiar(d.dirFiscal, 300);
  if (conCredito && (!razonSocial || !nit || !nrc || !dirFiscal))
    throw new PedidoInvalido("Faltan los datos fiscales");

  // Totales
  const productos = redondear(lineas.reduce((s, l) => s + l.subtotal, 0));
  const hayXL = lineas.some(l => l.prod.envioXL);
  const tarifa = ENVIOS[envio];
  const costoEnvio = redondear(hayXL ? tarifa.costoXL : tarifa.costo);
  const comision = pago === "contra-entrega" ? redondear((productos + costoEnvio) * COD_PCT) : 0;
  const total = redondear(productos + costoEnvio + comision);

  // Texto para el taller
  const detalle = lineas
    .map(l => `${l.cant} ${l.cant === 1 ? l.prod.unidad : l.prod.unidadPlural} de ${l.prod.nombre} a ${dinero(l.precio)} c/u`)
    .join("; ");

  const hoy = new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10);  // El Salvador = UTC−6

  const cobro = [
    `Productos ${dinero(productos)}`,
    costoEnvio ? `envío ${dinero(costoEnvio)}` : "retiro en Sonsonate",
    comision ? `comisión contra entrega ${dinero(comision)}` : null,
    `TOTAL A COBRAR ${dinero(total)}`,
  ].filter(Boolean).join(" · ");

  const notas = [
    `🛒 PEDIDO DE LA TIENDA WEB — sin confirmar. Escribirle al ${telefono} por WhatsApp.`,
    cobro,
    `Pago elegido: ${PAGOS[pago]}.`,
    envio === "retiro"
      ? "El cliente retira en Sonsonate (falta acordar el punto)."
      : `Envío: ${tarifa.nombre} — ${direccion}, ${municipio}.`,
    limpiar(d.correo, 120) ? `Correo: ${limpiar(d.correo, 120)}` : null,
    limpiar(d.notas, 500) ? `Nota del cliente: ${limpiar(d.notas, 500)}` : null,
    "⚠ El envío y la comisión no van en la factura, solo el producto.",
  ].filter(Boolean).join(" ");

  const fila = {
    fecha: hoy,
    cliente: conCredito ? razonSocial : nombre,
    tipo_cliente: conCredito ? "empresa" : "persona",
    nombre_contacto: nombre,
    telefono,
    correo: limpiar(d.correo, 120) || null,
    modo_prenda: "tallas",
    modo_tallas: "libre",
    tipo_prenda: lineas.length === 1
      ? lineas[0].prod.nombre
      : `Pedido web (${lineas.length} productos)`,
    tallas_items: lineas.map((l, i) => ({
      id: `${l.id}-${i}`,
      qty: l.cant,
      spec: "",
      tipo: l.prod.nombre,
      grupo: "adulto",
      talla: "Única",
      precio: l.precio.toFixed(2),
    })),
    descripcion: detalle + ", IVA incluido.",
    precio: productos.toFixed(2),      // solo producto: el flete no se factura
    estatus: "Cotización",
    tipo_documento: conCredito ? "Crédito Fiscal" : "Consumidor Final",
    razon_social: conCredito ? razonSocial : null,
    nit: conCredito ? nit : null,
    nrc: conCredito ? nrc : null,
    dir_fiscal: conCredito ? dirFiscal : null,
    forma_pago: PAGOS[pago],
    lugar_entrega: envio === "retiro"
      ? "Retiro en Sonsonate"
      : `${tarifa.nombre} — ${direccion}, ${municipio}`,
    notas,
    iva_incluido: true,
    modo_registro: "web",
  };

  fila._total = total;
  return fila;
}

// ── Escritura en Supabase ────────────────────────────────────

async function insertar(fila, env) {
  const key = env.SUPABASE_KEY;
  if (!key) throw new Error("Falta el secreto SUPABASE_KEY");
  const headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
  };

  const { _total, ...datos } = fila;

  // La app genera los ids en el cliente (max+1); acá se hace igual, con un
  // reintento si otro pedido se metió en medio y chocó la clave primaria.
  for (let intento = 0; intento < 4; intento++) {
    const r = await fetch(`${SUPA}/taller_pedidos?select=id&order=id.desc&limit=1`, { headers });
    if (!r.ok) throw new Error("No se pudo leer el último id: " + r.status);
    const ultimo = await r.json();
    const id = (ultimo[0]?.id || 0) + 1;

    const ins = await fetch(`${SUPA}/taller_pedidos`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({ id, ...datos }),
    });

    if (ins.ok) return id;

    const txt = await ins.text();
    const choque = ins.status === 409 || txt.includes("duplicate key");
    if (!choque) throw new Error(`PostgREST ${ins.status}: ${txt.slice(0, 300)}`);
    await new Promise(r => setTimeout(r, 120 * (intento + 1)));
  }
  throw new Error("No se pudo asignar un número de pedido");
}
