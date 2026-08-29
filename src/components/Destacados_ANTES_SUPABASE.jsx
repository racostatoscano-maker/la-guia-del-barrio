import { useState, useEffect } from "react";
import negociosIniciales from "../data/negocios";
import { supabase } from "../supabase";

function obtenerNegociosLocales() {
  const guardados = localStorage.getItem("negociosConecta");

  if (guardados) {
    try {
      return JSON.parse(guardados);
    } catch {
      return negociosIniciales;
    }
  }

  return negociosIniciales;
}

async function cargarNegociosSupabase() {
  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(
      "Error al cargar negocios desde Supabase:",
      error
    );
    return obtenerNegociosLocales();
  }

  return (data || []).map((item) => {
    const especialidades =
      typeof item.especialidades === "string"
        ? item.especialidades
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

    return {
      nombreNegocio: item.nombre_negocio || "",
      responsable: item.responsable || "",
      nombre:
        item.nombre_negocio ||
        item.responsable ||
        "",
      grupo: item.grupo || "Técnicos",
      especialidad: especialidades.join(", "),
      especialidades,
      otroEspecialidad: item.otro_especialidad || "",
      descripcion: item.descripcion || "",
      barrio: item.barrio || "",
      tipoAtencion:
        item.tipo_atencion || "Domicilio",
      direccion: item.direccion || "",
      telefono: item.telefono || "",
      horario: item.horario || {},
      festivos:
        item.festivos_data ||
        item.festivos ||
        "No atiende",
      horarioFestivos:
        item.horario_festivos || ""
    };
  });
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
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function convertirHorarioSeguro(horario) {
  if (!horario) {
    return null;
  }

  if (Array.isArray(horario)) {
    return horario;
  }

  if (typeof horario === "string") {
    const texto = horario.trim();

    if (
      !texto ||
      normalizar(texto).includes("no atiende")
    ) {
      return null;
    }

    const horarios = texto
      .split(",")
      .map((parte) => {
        const horas = parte.trim().split("-");

        if (horas.length !== 2) {
          return null;
        }

        return [
          horas[0].trim(),
          horas[1].trim()
        ];
      })
      .filter(Boolean);

    return horarios.length > 0
      ? horarios
      : null;
  }

  return null;
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

  const hora12 = h % 12 || 12;

  return `${hora12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

function textoHorario(horarios) {
  const lista = convertirHorarioSeguro(horarios);

  if (
    !Array.isArray(lista) ||
    lista.length === 0
  ) {
    return null;
  }

  return lista
    .map(
      ([inicio, fin]) =>
        `${formatoHora(inicio)} – ${formatoHora(fin)}`
    )
    .join(" y ");
}

function obtenerFestivos(negocio) {
  const festivos = negocio.festivos;

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
      horario: null
    };
  }

  if (Array.isArray(festivos)) {
    return {
      atiende: true,
      horario: textoHorario(festivos)
    };
  }

  if (typeof festivos === "object") {
    return {
      atiende: Boolean(festivos.atiende),
      horario: textoHorario(festivos.horario)
    };
  }

  return {
    atiende: false,
    horario: null
  };
}

function Destacados({
  grupoSeleccionado,
  busqueda,
  volverInicio,
  limpiarBusqueda
}) {
  const [listaNegocios, setListaNegocios] =
    useState([]);

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
    const cargar = async () => {
      const datos = await cargarNegociosSupabase();
      setListaNegocios(datos);
    };

    cargar();

    setEspecialidadSeleccionada("");
    setNegocioSeleccionado(null);
    setMostrarHorario(false);
  }, [grupoSeleccionado, busqueda]);

  const obtenerEstado = (negocio) => {
    const ahora = new Date();

    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado"
    ];

    const dia = dias[ahora.getDay()];

    const horario = negocio.horario || {};

    const horariosHoy =
      convertirHorarioSeguro(horario[dia]);

    if (
      !Array.isArray(horariosHoy) ||
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
      horariosHoy.some(([inicio, fin]) => {
        const [horaInicio, minutoInicio] =
          String(inicio)
            .split(":")
            .map(Number);

        const [horaFin, minutoFin] =
          String(fin)
            .split(":")
            .map(Number);

        const inicioMinutos =
          horaInicio * 60 + minutoInicio;

        const finMinutos =
          horaFin * 60 + minutoFin;

        return (
          minutosActuales >= inicioMinutos &&
          minutosActuales < finMinutos
        );
      });

    return {
      abierto: estaAtendiendo,
      texto: estaAtendiendo
        ? "Atendiendo ahora"
        : "No atiende en este momento",
      horario: textoHorario(horariosHoy)
    };
  };

  const mostrarHorarioCompleto = (negocio) => {
    const dias = [
      ["lunes", "Lunes"],
      ["martes", "Martes"],
      ["miercoles", "Miércoles"],
      ["jueves", "Jueves"],
      ["viernes", "Viernes"],
      ["sabado", "Sábado"],
      ["domingo", "Domingo"]
    ];

    const horario = negocio.horario || {};

    const festivos =
      obtenerFestivos(negocio);

    return (
      <div className="horario-completo">
        <strong>
          🕐 Horario de atención
        </strong>

        {dias.map(([clave, nombre]) => {
          const horarioDia =
            textoHorario(horario[clave]);

          return (
            <p key={clave}>
              <strong>
                {nombre}:
              </strong>{" "}
              {horarioDia || "No atiende"}
            </p>
          );
        })}

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

  const abrirWhatsApp = (negocio) => {
    let numero =
      String(negocio.telefono || "")
        .replace(/\D/g, "");

    if (!numero.startsWith("57")) {
      numero = "57" + numero;
    }

    const mensaje =
      `Hola, encontré tu negocio en Talentosos Somos Todos y me gustaría obtener más información sobre tus servicios.`;

    const enlace =
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(
      enlace,
      "_blank"
    );
  };

  const abrirMapa = (negocio) => {
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

  const ordenarNegocios = (lista) => {
    return [...lista].sort((a, b) => {
      const estadoA =
        obtenerEstado(a).abierto;

      const estadoB =
        obtenerEstado(b).abierto;

      if (estadoA && !estadoB) return -1;
      if (!estadoA && estadoB) return 1;

      return String(a.nombre || "").localeCompare(
        String(b.nombre || "")
      );
    });
  };

  const coincideBusqueda = (negocio, textoBuscado) => {
    const texto = normalizar(textoBuscado);

    if (!texto) {
      return true;
    }

    const datos = [
      negocio.nombre,
      negocio.grupo,
      negocio.especialidad,
      negocio.barrio,
      negocio.descripcion,
      negocio.tipoAtencion
    ]
      .filter(Boolean)
      .map(normalizar);

    // Busca coincidencias directas.
    if (
      datos.some(
        (dato) =>
          dato.includes(texto) ||
          texto.includes(dato)
      )
    ) {
      return true;
    }

    // Busca palabra por palabra.
    const palabras = texto
      .split(/\s+/)
      .filter(Boolean);

    return palabras.every((palabra) =>
      datos.some((dato) =>
        dato.includes(palabra)
      )
    );
  };

  const mostrarTarjeta = (negocio) => {
    const estado =
      obtenerEstado(negocio);

    return (
      <div
        className="negocio negocio-resumen"
        key={`${negocio.nombre}-${negocio.telefono}`}
      >
        {negocio.logo && (
          <img
            src={negocio.logo}
            alt={`Logo de ${negocio.nombre}`}
            className="logo-negocio"
          />
        )}

        <h4>
          🔧 {negocio.nombre}
        </h4>

        <p>
          🔧 {nombreBonito(negocio.especialidad)}
          {" · "}
          📍 {negocio.barrio}
        </p>

        <p
          className={
            estado.abierto
              ? "estado abierto"
              : "estado cerrado"
          }
        >
          {estado.abierto ? "🟢" : "⚪"}{" "}
          {estado.texto}
        </p>

        <button
          onClick={() => {
            setNegocioSeleccionado(negocio);
            setMostrarHorario(false);
          }}
        >
          Ver detalles
        </button>
      </div>
    );
  };

  const mostrarFicha = (negocio) => {
    const estado =
      obtenerEstado(negocio);

    return (
      <div className="destacados">
        <div className="navegacion">
          <button
            onClick={() => {
              setNegocioSeleccionado(null);
              setMostrarHorario(false);
            }}
          >
            ← Atrás
          </button>

          <button
            onClick={volverInicio}
          >
            ⌂ Inicio
          </button>
        </div>

        {negocio.logo && (
          <div className="contenedor-logo-ficha">
            <img
              src={negocio.logo}
              alt={`Logo de ${negocio.nombre}`}
              className="logo-negocio logo-ficha"
            />
          </div>
        )}

        <h3>
          🔧 {negocio.nombre}
        </h3>

        <div className="negocio">
          <p>
            🔧 {nombreBonito(negocio.especialidad)}
          </p>

          {negocio.descripcion && (
            <p className="descripcion">
              {negocio.descripcion}
            </p>
          )}

          <p>
            📍 {negocio.barrio}
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
              {negocio.direccion && (
                <p>
                  <button
                    className="direccion-boton"
                    onClick={() =>
                      abrirMapa(negocio)
                    }
                  >
                    🏠 {negocio.direccion}
                  </button>
                </p>
              )}

              <p>
                🏪 Atención en local
              </p>
            </>
          )}

          {negocio.tipoAtencion ===
            "Local y domicilio" && (
            <>
              {negocio.direccion && (
                <p>
                  <button
                    className="direccion-boton"
                    onClick={() =>
                      abrirMapa(negocio)
                    }
                  >
                    🏠 {negocio.direccion}
                  </button>
                </p>
              )}

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
            {estado.abierto ? "🟢" : "⚪"}{" "}
            {estado.texto}
          </p>

          {estado.horario && (
            <p>
              🕐 Hoy: {estado.horario}
            </p>
          )}

          <button
            className="boton-horario"
            onClick={() =>
              setMostrarHorario(!mostrarHorario)
            }
          >
            🕐{" "}
            {mostrarHorario
              ? "Ocultar horario"
              : "Ver horario"}
          </button>

          {mostrarHorario &&
            mostrarHorarioCompleto(negocio)}

          <button
            onClick={() =>
              abrirWhatsApp(negocio)
            }
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    );
  };

  if (negocioSeleccionado) {
    return mostrarFicha(
      negocioSeleccionado
    );
  }

  if (busqueda && normalizar(busqueda)) {
    const textoBuscado =
      normalizar(busqueda);

    const resultados =
      listaNegocios.filter((negocio) =>
        coincideBusqueda(
          negocio,
          textoBuscado
        )
      );

    return (
      <div className="destacados">
        <div className="navegacion">
          <button onClick={limpiarBusqueda}>
            ← Atrás
          </button>

          <button onClick={volverInicio}>
            ⌂ Inicio
          </button>
        </div>

        <h3>
          🔍 Resultados de búsqueda
        </h3>

        <p>
          Resultados para: <strong>{busqueda}</strong>
        </p>

        {resultados.length === 0 ? (
          <p>
            No encontramos negocios para "{busqueda}".
          </p>
        ) : (
          ordenarNegocios(resultados).map(
            mostrarTarjeta
          )
        )}
      </div>
    );
  }

  if (!grupoSeleccionado) {
    return null;
  }

  const negociosDelGrupo =
    listaNegocios.filter((negocio) => {
      const grupoNegocio =
        normalizar(negocio.grupo)
          .replace(/s$/, "");

      const grupoSeleccion =
        normalizar(grupoSeleccionado)
          .replace(/s$/, "");

      return grupoNegocio === grupoSeleccion;
    });

  const especialidades = [];

  negociosDelGrupo.forEach((negocio) => {
    const listaEspecialidades =
      Array.isArray(negocio.especialidades) &&
      negocio.especialidades.length > 0
        ? negocio.especialidades
        : negocio.especialidad
          ? String(negocio.especialidad)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

    listaEspecialidades.forEach((especialidad) => {
      const existente =
        especialidades.find(
          (item) =>
            normalizar(item) ===
            normalizar(especialidad)
        );

      if (!existente) {
        especialidades.push(
          nombreBonito(especialidad)
        );
      }
    });
  });

  const negociosFiltrados =
    especialidadSeleccionada
      ? negociosDelGrupo.filter((negocio) => {
          const listaEspecialidades =
            Array.isArray(negocio.especialidades) &&
            negocio.especialidades.length > 0
              ? negocio.especialidades
              : negocio.especialidad
                ? String(negocio.especialidad)
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

          return listaEspecialidades.some(
            (especialidad) =>
              normalizar(especialidad) ===
              normalizar(especialidadSeleccionada)
          );
        })
      : [];

  if (!especialidadSeleccionada) {
    return (
      <div className="destacados">
        <div className="navegacion">
          <button onClick={volverInicio}>
            ← Atrás
          </button>

          <button onClick={volverInicio}>
            ⌂ Inicio
          </button>
        </div>

        <h3>
          🔧 {grupoSeleccionado}
        </h3>

        <h4>
          ¿Qué necesitas?
        </h4>

        {especialidades.length === 0 ? (
          <p>
            Aún no hay servicios registrados en esta categoría.
          </p>
        ) : (
          <div className="botones-especialidades">
            {especialidades.map(
              (especialidad) => (
                <button
                  key={normalizar(especialidad)}
                  onClick={() =>
                    setEspecialidadSeleccionada(
                      especialidad
                    )
                  }
                >
                  {especialidad}
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="destacados">
      <div className="navegacion">
        <button
          onClick={() =>
            setEspecialidadSeleccionada("")
          }
        >
          ← Atrás
        </button>

        <button onClick={volverInicio}>
          ⌂ Inicio
        </button>
      </div>

      <h3>
        🔧 {nombreBonito(especialidadSeleccionada)}
      </h3>

      {ordenarNegocios(
        negociosFiltrados
      ).map(mostrarTarjeta)}
    </div>
  );
}

export default Destacados;