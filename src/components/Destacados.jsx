import { useState, useEffect } from "react";
import negociosIniciales from "../data/negocios";
import { supabase } from "../supabase";

function obtenerNegocios() {
  const guardados =
    localStorage.getItem("negociosConecta");

  if (guardados) {
    try {
      return JSON.parse(guardados);
    } catch {
      return negociosIniciales;
    }
  }

  return negociosIniciales;
}

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function nombreBonito(texto) {
  if (!texto) return "";

  return String(texto)
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      if (!palabra) return "";

      return (
        palabra.charAt(0).toUpperCase() +
        palabra.slice(1)
      );
    })
    .join(" ");
}

/* =====================================================
   GRUPOS
===================================================== */

function grupoEquivalente(grupo) {
  const nombre = normalizar(grupo);

  const equivalencias = {
    tecnicos: "tecnicos",
    tecnico: "tecnicos",
    "tecnicos y reparaciones": "tecnicos",

    hogar: "hogar",
    "hogar y oficios": "hogar",
    "hogar, cuidado y oficios": "hogar",

    restaurantes: "comidas",
    restaurante: "comidas",
    comida: "comidas",
    comidas: "comidas",
    "comidas y bebidas": "comidas",

    belleza: "belleza",
    "belleza y bienestar": "belleza",

    tienda: "tiendas",
    tiendas: "tiendas",
    "tiendas y compras": "tiendas",
    "comercio / tiendas": "tiendas",

    moda: "moda",
    "moda, ropa y calzado": "moda",

    profesionales: "profesionales",
    profesional: "profesionales",

    costura: "confeccion",
    costurera: "confeccion",
    costureras: "confeccion",
    confeccion: "confeccion",
    "confeccion y arreglos": "confeccion",

    transporte: "transporte",
    "transporte y domicilios": "transporte",

    "otros servicios": "otros"
  };

  return equivalencias[nombre] || nombre;
}

/* =====================================================
   SUBCATEGORÍAS
===================================================== */

const subcategorias = {

  tecnicos: [
    "Urgencias del hogar",
    "Electrodomésticos y gas",
    "Celulares y computadores",
    "Televisores y equipos electrónicos",
    "Arreglos y mantenimiento del hogar",
    "Otro"
  ],

  hogar: [
    "Limpieza y servicio doméstico",
    "Cuidado de niños",
    "Cuidado de adultos mayores",
    "Cuidado de mascotas",
    "Jardinería",
    "Mantenimiento y reparaciones",
    "Lavado de muebles y colchones",
    "Otro"
  ],

  comidas: [
    "Restaurantes",
    "Comida rápida",
    "Panadería",
    "Repostería y tortas",
    "Comidas caseras",
    "Desayunos",
    "Bebidas",
    "Otro"
  ],

  belleza: [
    "Cuidado del cabello",
    "Estética de manos y pies",
    "Rostro y mirada",
    "Estética facial y corporal",
    "Masajes y bienestar",
    "Otro"
  ],

  tiendas: [
    "Tecnología y celulares",
    "Supermercados y tiendas",
    "Hogar y construcción",
    "Papelería y regalos",
    "Otro"
  ],

  moda: [
    "Ropa",
    "Calzado",
    "Bolsos y accesorios",
    "Perfumes y cosméticos",
    "Cuidado personal",
    "Otro"
  ],

  profesionales: [
    "Salud",
    "Tecnología",
    "Negocios y administración",
    "Educación",
    "Creativos y diseño",
    "Derecho",
    "Veterinaria y mascotas",
    "Otro"
  ],

  confeccion: [
    "Arreglos de ropa",
    "Confección a medida",
    "Uniformes",
    "Bordados y personalización",
    "Otro"
  ],

  transporte: [
    "Domicilios y mensajería",
    "Acarreos y carga",
    "Transporte de personas",
    "Otro"
  ]
};

const iconosGrupo = {
  tecnicos: "🔧",
  hogar: "🏠",
  comidas: "🍔",
  belleza: "💇‍♀️",
  tiendas: "🛒",
  moda: "👗",
  profesionales: "⚖️",
  confeccion: "🧵",
  transporte: "🚚"
};

/* =====================================================
   HORARIOS
===================================================== */



function convertirHorarioSeguro(horario) {
  if (horario == null || horario === "") {
    return null;
  }

  // Si Supabase ya entrega los turnos como pares [inicio, fin],
  // conservamos ese formato.
  if (Array.isArray(horario)) {
    const pares = horario
      .filter((turno) => Array.isArray(turno) && turno.length >= 2)
      .map(([inicio, fin]) => [
        convertirHora24(inicio),
        convertirHora24(fin)
      ])
      .filter(([inicio, fin]) => inicio !== null && fin !== null);

    return pares.length > 0 ? pares : null;
  }

  if (typeof horario !== "string") {
    return null;
  }

  const texto = horario.trim();

  if (
    !texto ||
    normalizar(texto).includes("no atiende")
  ) {
    return null;
  }

  // Acepta formatos como 8-21, 08:00-19:00 y 9 a 12 y 2 a 5.
  const expresion =
    /(\d{1,2})(?::(\d{2}))?\s*(?:a|[-–—])\s*(\d{1,2})(?::(\d{2}))?/gi;

  const coincidencias = [...texto.matchAll(expresion)];

  if (coincidencias.length === 0) {
    return null;
  }

  const horarios = [];
  let finAnterior = null;

  for (const coincidencia of coincidencias) {
    let inicio = Number(coincidencia[1]);
    const minutoInicio = Number(coincidencia[2] || 0);
    let fin = Number(coincidencia[3]);
    const minutoFin = Number(coincidencia[4] || 0);

    if (
      inicio > 23 ||
      fin > 23 ||
      minutoInicio > 59 ||
      minutoFin > 59
    ) {
      continue;
    }

    // En un horario dividido, el segundo turno suele ser por la tarde:
    // "9 a 12 y 2 a 5" se interpreta como 09:00-12:00 y 14:00-17:00.
    if (
      finAnterior !== null &&
      inicio < 12 &&
      finAnterior >= 12
    ) {
      inicio += 12;
    }

    if (fin < inicio) {
      fin += 12;
    }

    if (inicio > 23 || fin > 24) {
      continue;
    }

    horarios.push([
      `${String(inicio).padStart(2, "0")}:${String(minutoInicio).padStart(2, "0")}`,
      `${String(fin).padStart(2, "0")}:${String(minutoFin).padStart(2, "0")}`
    ]);

    finAnterior = fin;
  }

  return horarios.length > 0 ? horarios : null;
}

function convertirHora24(hora) {
  if (hora == null || hora === "") {
    return null;
  }

  const texto = String(hora).trim();
  const coincidencia = texto.match(/^(\d{1,2})(?::(\d{2}))?$/);

  if (!coincidencia) {
    return null;
  }

  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2] || 0);

  if (horas > 24 || minutos > 59 || (horas === 24 && minutos !== 0)) {
    return null;
  }

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function formatoHora(hora) {
  const partes = String(hora)
    .split(":")
    .map(Number);

  const h = partes[0];
  const m = partes[1] || 0;

  if (Number.isNaN(h)) {
    return hora;
  }

  const sufijo =
    h >= 12
      ? "p. m."
      : "a. m.";

  const hora12 =
    h % 12 || 12;

  return `${hora12}:${String(m).padStart(
    2,
    "0"
  )} ${sufijo}`;
}

function textoHorario(horarios) {
  const lista =
    convertirHorarioSeguro(horarios);

  if (
    !Array.isArray(lista) ||
    lista.length === 0
  ) {
    return null;
  }

  return lista
    .map(
      ([inicio, fin]) =>
        `${formatoHora(
          inicio
        )} – ${formatoHora(fin)}`
    )
    .join(" y ");
}

function obtenerFestivos(negocio) {
  const festivos =
    negocio.festivos ||
    negocio.horario?.festivos;

  if (
    !festivos ||
    festivos === "No atiende"
  ) {
    return {
      atiende: false,
      horario: null
    };
  }

  if (festivos === "Atiende") {
    return {
      atiende: true,
      horario: textoHorario(negocio.horarioFestivos)
    };
  }

  if (Array.isArray(festivos)) {
    return {
      atiende: true,
      horario: textoHorario(
        festivos
      )
    };
  }

  if (
    typeof festivos === "object"
  ) {
    return {
      atiende: Boolean(
        festivos.atiende
      ),
      horario: textoHorario(
        festivos.horario
      )
    };
  }

  return {
    atiende: false,
    horario: null
  };
}

/* =====================================================
   ESPECIALIDADES
===================================================== */

/*
  Esta función es MUY IMPORTANTE.

  Si una persona tiene:

  especialidades:
  [
    "Cuidado del cabello",
    "Rostro y mirada",
    "Otro"
  ]

  y escribió:

  otroEspecialidad:
  "Especialista en caída del cabello"

  públicamente mostraremos:

  Cuidado del cabello,
  Rostro y mirada,
  Especialista en caída del cabello

  Nunca mostraremos "Otro".
*/

function obtenerEspecialidadesNegocio(
  negocio
) {
  let lista = [];

  /*
    Primero intentamos usar el nuevo formato:
    especialidades: []
  */
  if (
    Array.isArray(
      negocio.especialidades
    )
  ) {
    lista = [
      ...negocio.especialidades
    ];
  }

  /*
    Compatibilidad con negocios antiguos.
  */
  else if (
    negocio.especialidad
  ) {
    lista = String(
      negocio.especialidad
    )
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  /*
    Quitamos "Otro".
  */
  lista = lista.filter(
    (item) =>
      normalizar(item) !==
      "otro"
  );

  /*
    Agregamos el texto real
    que escribió la persona.
  */
  if (
    negocio.otroEspecialidad &&
    negocio.otroEspecialidad.trim()
  ) {
    lista.push(
      negocio.otroEspecialidad.trim()
    );
  }

  return lista;
}

/*
  Determina si una persona pertenece
  a una subcategoría.
*/
function negocioTieneEspecialidad(
  negocio,
  especialidad
) {
  const buscada =
    normalizar(
      especialidad
    );

  /*
    "Otro" significa cualquier servicio
    personalizado escrito por la persona.
  */
  if (
    buscada === "otro"
  ) {
    return Boolean(
      negocio.otroEspecialidad &&
      negocio.otroEspecialidad.trim()
    );
  }

  const especialidades =
    obtenerEspecialidadesNegocio(
      negocio
    );

  return especialidades.some(
    (valor) =>
      normalizar(valor).includes(
        buscada
      )
  );
}

/* =====================================================
   BÚSQUEDA
===================================================== */

function coincideBusqueda(
  negocio,
  textoBuscado
) {
  const especialidades =
    obtenerEspecialidadesNegocio(
      negocio
    );

  const datos = [
    negocio.nombre,
    negocio.nombreNegocio,
    negocio.responsable,
    negocio.grupo,

    ...especialidades,

    /*
      También incluimos explícitamente
      el texto de "Otro".
    */
    negocio.otroEspecialidad,

    negocio.barrio,
    negocio.descripcion,
    negocio.tipoAtencion
  ]
    .filter(Boolean)
    .map(normalizar);

  return datos.some(
    (dato) =>
      dato.includes(
        textoBuscado
      )
  );
}

/* =====================================================
   COMPONENTE
===================================================== */

function Destacados({
  grupoSeleccionado,
  busqueda,
  volverInicio,
  limpiarBusqueda
}) {

  const [
    listaNegocios,
    setListaNegocios
  ] = useState([]);

  const [
    especialidadSeleccionada,
    setEspecialidadSeleccionada
  ] = useState("");

  const [
    negocioSeleccionado,
    setNegocioSeleccionado
  ] = useState(null);

  const [
    mostrarHorario,
    setMostrarHorario
  ] = useState(false);

  useEffect(() => {
    const cargarNegocios = async () => {
      const { data, error } = await supabase
        .from("negocios")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Error al cargar negocios desde Supabase:",
          error
        );

        setListaNegocios(
          obtenerNegocios()
        );

        return;
      }

      const negocios = (data || []).map(
        (item) => ({
          nombreNegocio:
            item.nombre_negocio || "",

          responsable:
            item.responsable || "",

          nombre:
            item.nombre_negocio ||
            item.responsable ||
            "",

          grupo:
            item.grupo ||
            "Técnicos",

          especialidad:
            item.especialidades || "",

          especialidades:
            typeof item.especialidades ===
            "string"
              ? item.especialidades
                  .split(",")
                  .map((item) =>
                    item.trim()
                  )
                  .filter(Boolean)
              : [],

          otroEspecialidad:
            item.otro_especialidad || "",

          descripcion:
            item.descripcion || "",

          barrio:
            item.barrio || "",

          tipoAtencion:
            item.tipo_atencion ||
            "Domicilio",

          direccion:
            item.direccion || "",

          telefono:
            item.telefono || "",

          horario: {
  ...(item.horario || {}),
  lunes: item.horario?.lunes || item.lunes_viernes || "",
  martes: item.horario?.martes || item.lunes_viernes || "",
  miercoles: item.horario?.miercoles || item.lunes_viernes || "",
  jueves: item.horario?.jueves || item.lunes_viernes || "",
  viernes: item.horario?.viernes || item.lunes_viernes || "",
  sabado: item.horario?.sabado || item.sabado || "",
  domingo: item.horario?.domingo || item.domingo || "",
},

          festivos:
            item.festivos_data ||
            item.festivos ||
            "No atiende",

          horarioFestivos:
            item.horario_festivos || ""
        })
      );

      setListaNegocios(negocios);
    };

    cargarNegocios();

    setEspecialidadSeleccionada("");
    setNegocioSeleccionado(null);
    setMostrarHorario(false);
  }, [
    grupoSeleccionado,
    busqueda
  ]);

  /* ===================================================
     ESTADO DEL NEGOCIO
  =================================================== */

  const obtenerEstado =
    (negocio) => {

      const ahora =
        new Date();

      const dias = [
        "domingo",
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado"
      ];

      const dia =
        dias[ahora.getDay()];

      const horario =
        negocio.horario || {};

      const horariosHoy =
        convertirHorarioSeguro(
          horario[dia]
        );

      if (
        !Array.isArray(
          horariosHoy
        ) ||
        horariosHoy.length === 0
      ) {
        return {
          abierto: false,
          texto: "No atiende hoy",
          horario: null
        };
      }

      const minutosActuales =
        ahora.getHours() * 60 +
        ahora.getMinutes();

      const estaAtendiendo =
        horariosHoy.some(
          ([inicio, fin]) => {

            const [
              horaInicio,
              minutoInicio
            ] = String(inicio)
              .split(":")
              .map(Number);

            const [
              horaFin,
              minutoFin
            ] = String(fin)
              .split(":")
              .map(Number);

            const inicioMinutos =
              horaInicio * 60 +
              minutoInicio;

            const finMinutos =
              horaFin * 60 +
              minutoFin;

            return (
              minutosActuales >=
                inicioMinutos &&
              minutosActuales <
                finMinutos
            );
          }
        );

      return {
        abierto:
          estaAtendiendo,

        texto:
          estaAtendiendo
            ? "Atendiendo ahora"
            : "No atiende en este momento",

        horario:
          textoHorario(
            horariosHoy
          )
      };
    };

  /* ===================================================
     HORARIO COMPLETO
  =================================================== */

  const mostrarHorarioCompleto =
    (negocio) => {

      const dias = [
        ["lunes", "Lunes"],
        ["martes", "Martes"],
        [
          "miercoles",
          "Miércoles"
        ],
        ["jueves", "Jueves"],
        ["viernes", "Viernes"],
        ["sabado", "Sábado"],
        ["domingo", "Domingo"]
      ];

      const horario =
        negocio.horario || {};

      const festivos =
        obtenerFestivos(
          negocio
        );

      return (
        <div className="horario-completo">

          <strong>
            🕐 Horario de atención
          </strong>

          {dias.map(
            ([
              clave,
              nombre
            ]) => {

              const horarioDia =
                textoHorario(
                  horario[clave]
                );

              return (
                <p key={clave}>

                  <strong>
                    {nombre}:
                  </strong>{" "}

                  {horarioDia ||
                    "No atiende"}

                </p>
              );
            }
          )}

          <p>

            <strong>
              Festivos:
            </strong>{" "}

            {!festivos.atiende
              ? "No atiende"
              : festivos.horario
                ? festivos.horario
                : "Atiende"}

          </p>

        </div>
      );
    };

  /* ===================================================
     WHATSAPP
  =================================================== */

  const abrirWhatsApp =
    (negocio) => {

      let numero =
        String(
          negocio.telefono ||
          ""
        ).replace(
          /\D/g,
          ""
        );

      if (
        !numero.startsWith("57")
      ) {
        numero =
          "57" + numero;
      }

      const nombre =
        negocio.nombreNegocio ||
        negocio.nombre ||
        negocio.responsable ||
        "tu negocio";

      const mensaje =
        `Hola, encontré tu negocio en Talentosos Somos Todos y me gustaría obtener más información sobre tus servicios.`;

      window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(
          mensaje
        )}`,
        "_blank"
      );
    };

  /* ===================================================
     MAPA
  =================================================== */

  const abrirMapa =
    (negocio) => {

      const direccion =
        `${negocio.direccion}, ${negocio.barrio}, Bucaramanga, Santander`;

      const enlace =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          direccion
        )}`;

      window.open(
        enlace,
        "_blank"
      );
    };

  /* ===================================================
     ORDENAR NEGOCIOS
  =================================================== */

  const ordenarNegocios =
    (lista) => {

      return [
        ...lista
      ].sort(
        (a, b) => {

          const estadoA =
            obtenerEstado(a)
              .abierto;

          const estadoB =
            obtenerEstado(b)
              .abierto;

          if (
            estadoA &&
            !estadoB
          ) {
            return -1;
          }

          if (
            !estadoA &&
            estadoB
          ) {
            return 1;
          }

          const nombreA =
            a.nombreNegocio ||
            a.nombre ||
            a.responsable ||
            "";

          const nombreB =
            b.nombreNegocio ||
            b.nombre ||
            b.responsable ||
            "";

          return String(
            nombreA
          ).localeCompare(
            String(nombreB)
          );
        }
      );
    };

  /* ===================================================
     TARJETA RESUMIDA
  =================================================== */

  const mostrarTarjeta =
    (negocio) => {

      const estado =
        obtenerEstado(
          negocio
        );

      const nombre =
        negocio.nombreNegocio ||
        negocio.nombre ||
        negocio.responsable ||
        "Sin nombre";

      const responsable =
        negocio.responsable || "";

      const especialidades =
        obtenerEspecialidadesNegocio(
          negocio
        );

      return (
        <div
          className="negocio negocio-resumen"
          key={`${nombre}-${JSON.stringify(
            especialidades
          )}-${negocio.telefono || ""}`}
        >

          {negocio.logo && (
            <img
              src={negocio.logo}
              alt={`Logo de ${nombre}`}
              className="logo-negocio"
            />
          )}

          <h4>
            🔧 {nombre}
          </h4>

          {responsable &&
            responsable !==
              nombre && (

            <p>
              👤 Responsable:{" "}
              {responsable}
            </p>

          )}

          <p>

            🔧{" "}

            {especialidades
              .map(nombreBonito)
              .join(", ")}

            {" · "}

            📍{" "}
            {negocio.barrio}

          </p>

          <p
            className={
              estado.abierto
                ? "estado abierto"
                : "estado cerrado"
            }
          >

            {estado.abierto
              ? "🟢"
              : "⚪"}{" "}

            {estado.texto}

          </p>

          <button
            onClick={() => {

              setNegocioSeleccionado(
                negocio
              );

              setMostrarHorario(
                false
              );

            }}
          >
            Ver detalles
          </button>

        </div>
      );
    };

  /* ===================================================
     FICHA COMPLETA
  =================================================== */

  const mostrarFicha =
    (negocio) => {

      const estado =
        obtenerEstado(
          negocio
        );

      const nombre =
        negocio.nombreNegocio ||
        negocio.nombre ||
        negocio.responsable ||
        "Sin nombre";

      const especialidades =
        obtenerEspecialidadesNegocio(
          negocio
        );

      return (
        <div className="destacados">

          <div className="navegacion">

            <button
              onClick={() => {

                setNegocioSeleccionado(
                  null
                );

                setMostrarHorario(
                  false
                );

              }}
            >
              ← Atrás
            </button>

            <button
              onClick={
                volverInicio
              }
            >
              ⌂ Inicio
            </button>

          </div>

          {negocio.logo && (

            <div className="contenedor-logo-ficha">

              <img
                src={negocio.logo}
                alt={`Logo de ${nombre}`}
                className="logo-negocio logo-ficha"
              />

            </div>

          )}

          <h3>
            🔧 {nombre}
          </h3>

          <div className="negocio">

            {negocio.responsable &&
              negocio.responsable !==
                nombre && (

              <p>
                👤 Responsable:{" "}
                {
                  negocio.responsable
                }
              </p>

            )}

            <p>

              🔧{" "}

              {especialidades
                .map(nombreBonito)
                .join(", ")}

            </p>

            {negocio.descripcion && (

              <p className="descripcion">
                {
                  negocio.descripcion
                }
              </p>

            )}

            <p>
              📍{" "}
              {negocio.barrio}
            </p>

            {negocio.tipoAtencion ===
              "Domicilio" && (

              <p>
                🚗 Servicio a domicilio
              </p>

            )}

            {negocio.tipoAtencion ===
              "Local" && (

              <>

                <p>

                  <button
                    className="direccion-boton"
                    onClick={() =>
                      abrirMapa(
                        negocio
                      )
                    }
                  >
                    🏠{" "}
                    {
                      negocio.direccion
                    }
                  </button>

                </p>

                <p>
                  🏪 Atención en local
                </p>

              </>

            )}

            {negocio.tipoAtencion ===
              "Local y domicilio" && (

              <>

                <p>

                  <button
                    className="direccion-boton"
                    onClick={() =>
                      abrirMapa(
                        negocio
                      )
                    }
                  >
                    🏠{" "}
                    {
                      negocio.direccion
                    }
                  </button>

                </p>

                <p>
                  🚗 Local y servicio a domicilio
                </p>

              </>

            )}

            <p
              className={
                estado.abierto
                  ? "estado abierto"
                  : "estado cerrado"
              }
            >

              {estado.abierto
                ? "🟢"
                : "⚪"}{" "}

              {estado.texto}

            </p>

            {estado.horario && (

              <p>
                🕐 Hoy:{" "}
                {estado.horario}
              </p>

            )}

            <button
              className="boton-horario"
              onClick={() =>
                setMostrarHorario(
                  !mostrarHorario
                )
              }
            >

              🕐{" "}

              {mostrarHorario
                ? "Ocultar horario"
                : "Ver horario"}

            </button>

            {mostrarHorario &&
              mostrarHorarioCompleto(
                negocio
              )}

            <button
              onClick={() =>
                abrirWhatsApp(
                  negocio
                )
              }
            >
              💬 WhatsApp
            </button>

          </div>

        </div>
      );
    };

  /* ===================================================
     SI ESTAMOS VIENDO UNA FICHA
  =================================================== */

  if (
    negocioSeleccionado
  ) {
    return mostrarFicha(
      negocioSeleccionado
    );
  }

  /* ===================================================
     BÚSQUEDA GENERAL
  =================================================== */

  if (
    busqueda &&
    busqueda.trim()
  ) {

    const textoBuscado =
      normalizar(
        busqueda
      );

    const resultados =
      listaNegocios.filter(
        (negocio) =>
          coincideBusqueda(
            negocio,
            textoBuscado
          )
      );

    return (
      <div className="destacados">

        <div className="navegacion">

          <button
            onClick={
              limpiarBusqueda
            }
          >
            ← Atrás
          </button>

          <button
            onClick={
              volverInicio
            }
          >
            ⌂ Inicio
          </button>

        </div>

        <h3>
          🔍 Resultados de búsqueda
        </h3>

        <p>
          Resultados para:{" "}
          {busqueda}
        </p>

        {resultados.length ===
        0 ? (

          <p>
            No encontramos negocios
            para "{busqueda}".
          </p>

        ) : (

          ordenarNegocios(
            resultados
          ).map(
            mostrarTarjeta
          )

        )}

      </div>
    );
  }

  /* ===================================================
     SI NO HAY CATEGORÍA
  =================================================== */

  if (
    !grupoSeleccionado
  ) {
    return null;
  }

  /* ===================================================
     CATEGORÍA SELECCIONADA
  =================================================== */

  const grupoSeleccionCanonico =
    grupoEquivalente(
      grupoSeleccionado
    );

  const negociosDelGrupo =
    listaNegocios.filter(
      (negocio) =>
        grupoEquivalente(
          negocio.grupo
        ) ===
        grupoSeleccionCanonico
    );

  /* ===================================================
     SEGUNDA PANTALLA:
     SUBCATEGORÍAS
  =================================================== */

  if (
    !especialidadSeleccionada
  ) {

    const opciones =
      subcategorias[
        grupoSeleccionCanonico
      ] || [];

    return (
      <div className="destacados">

        <div className="navegacion">

          <button
            onClick={
              volverInicio
            }
          >
            ← Atrás
          </button>

          <button
            onClick={
              volverInicio
            }
          >
            ⌂ Inicio
          </button>

        </div>

        <h3>

          {iconosGrupo[
            grupoSeleccionCanonico
          ] || "🔎"}{" "}

          {grupoSeleccionado}

        </h3>

        <h4>
          ¿Qué necesitas?
        </h4>

        {opciones.length ===
        0 ? (

          <p>
            Aún no hay opciones
            registradas para esta categoría.
          </p>

        ) : (

          <div className="botones-especialidades">

            {opciones.map(
              (opcion) => (

                <button
                  type="button"
                  key={opcion}
                  onClick={() =>
                    setEspecialidadSeleccionada(
                      opcion
                    )
                  }
                >
                  {opcion}
                </button>

              )
            )}

          </div>

        )}

      </div>
    );
  }

  /* ===================================================
     TERCERA PANTALLA:
     PERSONAS QUE EJERCEN LA ESPECIALIDAD
  =================================================== */

  const negociosFiltrados =
    negociosDelGrupo.filter(
      (negocio) =>
        negocioTieneEspecialidad(
          negocio,
          especialidadSeleccionada
        )
    );

  return (
    <div className="destacados">

      <div className="navegacion">

        <button
          onClick={() =>
            setEspecialidadSeleccionada(
              ""
            )
          }
        >
          ← Atrás
        </button>

        <button
          onClick={
            volverInicio
          }
        >
          ⌂ Inicio
        </button>

      </div>

      <h3>

        {iconosGrupo[
          grupoSeleccionCanonico
        ] || "🔎"}{" "}

        {especialidadSeleccionada}

      </h3>

      {negociosFiltrados.length ===
      0 ? (

        <p>
          Aún no hay personas
          registradas en esta especialidad.
        </p>

      ) : (

        ordenarNegocios(
          negociosFiltrados
        ).map(
          mostrarTarjeta
        )

      )}

    </div>
  );
}

export default Destacados;