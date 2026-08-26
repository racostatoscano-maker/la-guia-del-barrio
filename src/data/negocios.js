const negocios = [
  {
    nombre: "Carlos Ramírez",
    grupo: "Técnicos",
    especialidad: "Lavadoras",
    descripcion: "Reparación y mantenimiento de lavadoras.",
    barrio: "El Rocío",
    tipoAtencion: "Domicilio",
    direccion: "",
    telefono: "3001234567",
    horario: {
      lunes: [["08:00", "18:00"]],
      martes: [["08:00", "18:00"]],
      miercoles: [["08:00", "18:00"]],
      jueves: [["08:00", "18:00"]],
      viernes: [["08:00", "18:00"]],
      sabado: [["08:00", "18:00"]],
      domingo: null
    }
  },

  {
    nombre: "Pedro Gómez",
    grupo: "Técnicos",
    especialidad: "Equipos de sonido",
    descripcion: "Reparación de equipos de sonido y audio.",
    barrio: "El Rocío",
    tipoAtencion: "Domicilio",
    direccion: "",
    telefono: "3001111111",
    horario: {
      lunes: [["08:00", "18:00"]],
      martes: [["08:00", "18:00"]],
      miercoles: [["08:00", "18:00"]],
      jueves: [["08:00", "18:00"]],
      viernes: [["08:00", "18:00"]],
      sabado: [["08:00", "13:00"]],
      domingo: null
    }
  },

  {
    nombre: "Luis Pérez",
    grupo: "Técnicos",
    especialidad: "Neveras",
    descripcion: "Reparación y mantenimiento de neveras.",
    barrio: "Provenza",
    tipoAtencion: "Domicilio",
    direccion: "",
    telefono: "3002222222",
    horario: {
      lunes: [["08:00", "17:00"]],
      martes: [["08:00", "17:00"]],
      miercoles: [["08:00", "17:00"]],
      jueves: [["08:00", "17:00"]],
      viernes: [["08:00", "17:00"]],
      sabado: [["08:00", "13:00"]],
      domingo: null
    }
  },

  {
    nombre: "Ana Gómez",
    grupo: "Costura",
    especialidad: "Arreglos y confección",
    descripcion: "Arreglos de ropa, confección y modificaciones.",
    barrio: "Provenza",
    tipoAtencion: "Local",
    direccion: "Calle 45 # 20-15",
    telefono: "3003333333",
    horario: {
      lunes: [["08:00", "12:00"], ["14:00", "18:00"]],
      martes: [["08:00", "12:00"], ["14:00", "18:00"]],
      miercoles: [["08:00", "12:00"], ["14:00", "18:00"]],
      jueves: [["08:00", "12:00"], ["14:00", "18:00"]],
      viernes: [["08:00", "12:00"], ["14:00", "18:00"]],
      sabado: [["08:00", "13:00"]],
      domingo: null
    }
  },

  {
    nombre: "Sandra Ríos",
    grupo: "Costura",
    especialidad: "Confección",
    descripcion: "Confección y arreglos de prendas.",
    barrio: "El Rocío",
    tipoAtencion: "Local y domicilio",
    direccion: "Carrera 30 # 15-20",
    telefono: "3004444444",
    horario: {
      lunes: [["08:00", "18:00"]],
      martes: [["08:00", "18:00"]],
      miercoles: [["08:00", "18:00"]],
      jueves: [["08:00", "18:00"]],
      viernes: [["08:00", "18:00"]],
      sabado: [["08:00", "14:00"]],
      domingo: null
    }
  },

  {
    nombre: "María López",
    grupo: "Hogar",
    especialidad: "Plomería general",
    descripcion: "Reparaciones e instalaciones de plomería.",
    barrio: "El Rocío",
    tipoAtencion: "Domicilio",
    direccion: "",
    telefono: "3005555555",
    horario: {
      lunes: [["07:00", "18:00"]],
      martes: [["07:00", "18:00"]],
      miercoles: [["07:00", "18:00"]],
      jueves: [["07:00", "18:00"]],
      viernes: [["07:00", "18:00"]],
      sabado: [["08:00", "14:00"]],
      domingo: null
    }
  },

  {
    nombre: "Jorge Torres",
    grupo: "Hogar",
    especialidad: "Instalaciones eléctricas",
    descripcion: "Instalaciones y reparaciones eléctricas.",
    barrio: "Provenza",
    tipoAtencion: "Domicilio",
    direccion: "",
    telefono: "3006666666",
    horario: {
      lunes: [["08:00", "18:00"]],
      martes: [["08:00", "18:00"]],
      miercoles: [["08:00", "18:00"]],
      jueves: [["08:00", "18:00"]],
      viernes: [["08:00", "18:00"]],
      sabado: [["08:00", "13:00"]],
      domingo: null
    }
  },

  {
    nombre: "Rosa Martínez",
    grupo: "Belleza",
    especialidad: "Peluquería",
    descripcion: "Corte, peinados y servicios de peluquería.",
    barrio: "El Rocío",
    tipoAtencion: "Local",
    direccion: "Carrera 25 # 18-30",
    telefono: "3007777777",
    horario: {
      lunes: [["08:00", "19:00"]],
      martes: [["08:00", "19:00"]],
      miercoles: [["08:00", "19:00"]],
      jueves: [["08:00", "19:00"]],
      viernes: [["08:00", "19:00"]],
      sabado: [["08:00", "17:00"]],
      domingo: null
    }
  },

  {
    nombre: "Doña Marta",
    grupo: "Restaurantes",
    especialidad: "Comida casera",
    descripcion: "Comida casera para llevar.",
    barrio: "El Rocío",
    tipoAtencion: "Local",
    direccion: "Calle 40 # 22-10",
    telefono: "3008888888",
    horario: {
      lunes: [["11:00", "15:00"]],
      martes: [["11:00", "15:00"]],
      miercoles: [["11:00", "15:00"]],
      jueves: [["11:00", "15:00"]],
      viernes: [["11:00", "15:00"]],
      sabado: [["11:00", "16:00"]],
      domingo: null
    }
  },

  {
    nombre: "Don Alberto",
    grupo: "Tienda",
    especialidad: "Tienda de barrio",
    descripcion: "Víveres, bebidas y productos para el hogar.",
    barrio: "El Rocío",
    tipoAtencion: "Local",
    direccion: "Carrera 28 # 19-05",
    telefono: "3009999999",
    horario: {
      lunes: [["06:00", "21:00"]],
      martes: [["06:00", "21:00"]],
      miercoles: [["06:00", "21:00"]],
      jueves: [["06:00", "21:00"]],
      viernes: [["06:00", "21:00"]],
      sabado: [["06:00", "21:00"]],
      domingo: [["07:00", "14:00"]]
    }
  },

  {
    nombre: "TIENDAS NIC - Nestor Ivan Cabeza",
    grupo: "Tienda",
    especialidad: "Tienda Virtual",
    descripcion: "Venta de prendas de vestir y perfumes. Pedidos por WhatsApp.",
    barrio: "El Rocío",
    tipoAtencion: "Domicilio",
    direccion: "Solo si tiene local",
    telefono: "3138147602",
    horario: {
      lunes: [["09:00", "19:00"]],
      martes: [["09:00", "19:00"]],
      miercoles: [["09:00", "19:00"]],
      jueves: [["09:00", "19:00"]],
      viernes: [["09:00", "19:00"]],
      sabado: [["09:00", "19:00"]],
      domingo: null,
      festivos: [["09:00", "19:00"]]
    }
  }
];

export default negocios;