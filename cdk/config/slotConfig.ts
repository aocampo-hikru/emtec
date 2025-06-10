export const defaultSlotConfig = {
  soporte: {
    required: [
      "cliente",
      "marca_central",
      "contacto",
      "contacto_tel",
      "contacto_email",
      "ubicacion",
      "detalle_problema",
      "check_conexiones",
      "check_internet",
      "check_lineas",
      "reporto_operador"
    ]
  },
  ventas: {
    required: [
      "cliente",
      "articulo",
      "contacto",
      "contacto_tel",
      "contacto_email",
      "ubicacion",
      "central_extensiones",
      "operador_lineas"
    ]
  }
} as const;

export type SlotConfig = typeof defaultSlotConfig;
