// Catálogo de la tienda IMELTEX.
//
// ⚠ Los precios de acá son SOLO para pintar la vitrina. El total que se cobra
// lo recalcula el Worker (worker-tienda/src/index.js) con esta misma tabla:
// si alguien edita el carrito desde el navegador, el servidor lo corrige.
// Cuando cambie un precio hay que tocarlo en LOS DOS lados.
//
// Todos los precios llevan IVA incluido.

export const PRODUCTOS = [
  {
    id: "guantes-blancos",
    nombre: "Guantes blancos de tela",
    resumen: "Par de guantes blancos con broche de presión. Talla única de adulto.",
    fotos: ["img/guantes-par.jpg", "img/guantes-medidas.jpg"],
    unidad: "par",
    unidadPlural: "pares",
    // Escalones por cantidad: desde `min` pares, cada par vale `precio`.
    // Ordenados de mayor a menor cantidad para que el primero que calce gane.
    escalones: [
      { min: 100, precio: 1.10, etiqueta: "100 pares o más" },
      { min: 48,  precio: 1.25, etiqueta: "48 pares o más" },
      { min: 12,  precio: 1.50, etiqueta: "12 pares o más" },
      { min: 1,   precio: 2.00, etiqueta: "Menos de 12 pares" },
    ],
    minimo: 1,
    pesoLb: 0.04,        // ~1,000 pares por quintal; se usa para el bulto del envío
    envioXL: false,
    detalle: [
      "Blanco fuerte (no hueso ni crema).",
      "Broche de presión en la muñeca.",
      "Largo 24 cm, estira ~3 cm más. Puño 18 cm, estirado 26 cm.",
      "Talla única: le queda a mano de adulto.",
      "Para desfiles, procesiones, protocolo y eventos.",
    ],
    nota: "El precio baja solo al llegar a 12, 48 y 100 pares — no hay que pedir descuento.",
  },
  {
    id: "bandera-sv-150x90",
    nombre: "Bandera de El Salvador 1.50 × 0.90 m",
    resumen: "Bandera sublimada a todo color, con escudo por ambos lados.",
    fotos: ["img/bandera-sv.jpg"],
    unidad: "bandera",
    unidadPlural: "banderas",
    escalones: [{ min: 1, precio: 39.55, etiqueta: "Precio por bandera" }],
    minimo: 1,
    pesoLb: 1,
    envioXL: false,
    detalle: [
      "Medida 1.50 m de largo × 0.90 m de alto.",
      "Sublimada a todo color, escudo al derecho por ambos lados.",
      "Vaina para asta en el lado corto.",
      "Se fabrica por encargo: 6 a 7 días hábiles.",
    ],
    nota: "Se hace por encargo, no hay existencia en bodega.",
  },
  {
    id: "bandera-sv-245x145",
    nombre: "Bandera de El Salvador 2.45 × 1.45 m",
    resumen: "La grande, para asta institucional. Escudo de 38 cm.",
    fotos: ["img/bandera-sv.jpg"],
    unidad: "bandera",
    unidadPlural: "banderas",
    escalones: [{ min: 1, precio: 66.67, etiqueta: "Precio por bandera" }],
    minimo: 1,
    pesoLb: 2,
    envioXL: false,
    detalle: [
      "Medida 2.45 m de largo × 1.45 m de alto.",
      "Sublimada a todo color, escudo de 38 cm al derecho por ambos lados.",
      "Vaina de 6 cm en el lado de 1.45 m.",
      "Se fabrica por encargo: 6 a 7 días hábiles.",
    ],
    nota: "Se hace por encargo, no hay existencia en bodega.",
  },
  {
    id: "asta-madera-2m",
    nombre: "Asta de madera 2 m con base circular",
    resumen: "Asta de 2 metros con base circular, para bandera institucional.",
    fotos: ["img/bandera-sv.jpg"],
    unidad: "asta",
    unidadPlural: "astas",
    escalones: [{ min: 1, precio: 120.00, etiqueta: "Precio por asta" }],
    minimo: 1,
    pesoLb: 12,
    envioXL: true,      // obliga tarifa de paquete XL
    detalle: [
      "Asta de 2 metros con base circular.",
      "Sirve para las dos medidas de bandera: se cuelga por el lado corto.",
      "Se entrega junto con la bandera, en 6 a 7 días hábiles.",
    ],
    nota: "Por su tamaño el envío va como paquete XL.",
  },
];

// ── Envío (tarifas de Express El Salvador) ──
export const ENVIOS = [
  {
    id: "retiro",
    nombre: "Retiro en Sonsonate",
    costo: 0,
    detalle: "Coordinamos el punto: taller IMELTEX (Col. Santa Marta), oficina en Barrio El Ángel o Col. Aída.",
  },
  {
    id: "agencia",
    nombre: "Recoger en agencia Express",
    costo: 1.65,
    costoXL: 8.20,
    detalle: "Llega a la agencia de Express El Salvador más cercana. 24 a 48 horas.",
  },
  {
    id: "domicilio",
    nombre: "Entrega a domicilio",
    costo: 4.10,
    costoXL: 8.20,
    detalle: "A la puerta, a cualquier parte del país. 24 a 48 horas.",
  },
];

// Comisión del servicio de pago contra entrega (la cobra la transportista).
// Se SUMA al total y se explica al cliente; no va en la factura.
export const COD_PCT = 0.025;

export const PAGOS = [
  {
    id: "transferencia",
    nombre: "Transferencia bancaria",
    detalle: "Le enviamos los datos de la cuenta por WhatsApp. El pedido arranca al recibir el comprobante.",
  },
  {
    id: "contra-entrega",
    nombre: "Pago contra entrega (efectivo)",
    detalle: "Le paga en efectivo al motorista cuando reciba. La transportista cobra 2.5% por el servicio.",
  },
  {
    id: "tarjeta",
    nombre: "Tarjeta de crédito o débito",
    detalle: "Pago en línea, seguro.",
    proximamente: true,
  },
];
