import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import negociosIniciales from "../data/negocios";

const subcategorias = {
  Técnicos: [
    "Urgencias del hogar",
    "Electrodomésticos y gas",
    "Celulares y computadores",
    "Televisores y equipos electrónicos",
    "Arreglos y mantenimiento del hogar",
    "Otro"
  ],

  Hogar: [
    "Limpieza y servicio doméstico",
    "Cuidado de niños",
    "Cuidado de adultos mayores",
    "Cuidado de mascotas",
    "Jardinería",
    "Mantenimiento y reparaciones",
    "Lavado de muebles y colchones",
    "Otro"
  ],

  Restaurantes: [
    "Restaurantes",
    "Comida rápida",
    "Panadería",
    "Repostería y tortas",
    "Comidas caseras",
    "Desayunos",
    "Bebidas",
    "Otro"
  ],

  Belleza: [
    "Cuidado del cabello",
    "Estética de manos y pies",
    "Rostro y mirada",
    "Estética facial y corporal",
    "Masajes y bienestar",
    "Otro"
  ],

  Tienda: [
    "Tecnología y celulares",
    "Supermercados y tiendas",
    "Hogar y construcción",
    "Papelería y regalos",
    "Otro"
  ],

  Moda: [
    "Ropa",
    "Calzado",
    "Bolsos y accesorios",
    "Perfumes y cosméticos",
    "Cuidado personal",
    "Otro"
  ],

  Profesionales: [
    "Salud",
    "Tecnología",
    "Negocios y administración",
    "Educación",
    "Creativos y diseño",
    "Derecho",
    "Veterinaria y mascotas",
    "Otro"
  ],

  Costura: [
    "Arreglos de ropa",
    "Confección a medida",
    "Uniformes",
    "Bordados y personalización",
    "Otro"
  ],

  Transporte: [
    "Domicilios y mensajería",
    "Acarreos y carga",
    "Transporte de personas",
    "Otro"
  ]
};

const formularioVacio = {
  nombreNegocio: "",
  responsable: "",
  grupo: "Técnicos",
  especialidad: "",
  especialidades: [],
  otroEspecialidad: "",
  descripcion: "",
  barrio: "",
  tipoAtencion: "Domicilio",
  direccion: "",
  telefono: "",
  lunesViernes: "",
  sabado: "",
  domingo: "",
  festivos: "No atiende",
  horarioFestivos: ""
};

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function convertirHorario(texto) {
  if (
    !texto ||
    normalizar(texto).includes("no atiende")
  ) {
    return null;
  }

  const horarios = String(texto)
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

function horarioTexto(horario, dia) {
  if (!horario || !horario[dia]) {
    return "";
  }

  const horarios = horario[dia];

  if (Array.isArray(horarios)) {
    return horarios
      .map(
        ([inicio, fin]) =>
          `${inicio}-${fin}`
      )
      .join(", ");
  }

  if (typeof horarios === "string") {
    return horarios;
  }

  return "";
}

function prepararNegocio(item) {
  const horario = item.horario || {};
  const nombreNegocio = item.nombreNegocio ?? item.nombre_negocio ?? "";
  const responsable = item.responsable ?? item.nombre ?? "";
  const grupo = item.grupo ?? "Técnicos";
  const especialidadPrincipal = item.especialidad ?? "";
  const especialidadesGuardadas = item.especialidades ?? "";
  const otroEspecialidad = item.otroEspecialidad ?? item.otro_especialidad ?? "";
  const tipoAtencion = item.tipoAtencion ?? item.tipo_atencion ?? "Domicilio";
  const direccion = item.direccion ?? "";
  const telefono = item.telefono ?? "";
  const descripcion = item.descripcion ?? "";
  const barrio = item.barrio ?? "";

  const lunes =
    horarioTexto(horario, "lunes");

  const martes =
    horarioTexto(horario, "martes");

  const miercoles =
    horarioTexto(horario, "miercoles");

  const jueves =
    horarioTexto(horario, "jueves");

  const viernes =
    horarioTexto(horario, "viernes");

  let lunesViernes = "";

  if (
    lunes &&
    lunes === martes &&
    lunes === miercoles &&
    lunes === jueves &&
    lunes === viernes
  ) {
    lunesViernes = lunes;
  } else {
    lunesViernes = lunes || "";
  }

  let horarioFestivos = "";

  if (Array.isArray(item.festivos)) {
    horarioFestivos = item.festivos
      .map(
        ([inicio, fin]) =>
          `${inicio}-${fin}`
      )
      .join(", ");
  } else if (
    item.festivos &&
    typeof item.festivos === "object" &&
    Array.isArray(item.festivos.horario)
  ) {
    horarioFestivos =
      item.festivos.horario
        .map(
          ([inicio, fin]) =>
            `${inicio}-${fin}`
        )
        .join(", ");
  } else if (
    horario.festivos &&
    Array.isArray(horario.festivos)
  ) {
    horarioFestivos =
      horario.festivos
        .map(
          ([inicio, fin]) =>
            `${inicio}-${fin}`
        )
        .join(", ");
  }

  let estadoFestivos = "No atiende";

  if (item.festivos === "Atiende") {
    estadoFestivos = "Atiende";
  }

  if (Array.isArray(item.festivos)) {
    estadoFestivos = "Atiende";
  }

  if (
    item.festivos &&
    typeof item.festivos === "object" &&
    item.festivos.atiende
  ) {
    estadoFestivos = "Atiende";
  }

  if (
    horario.festivos &&
    Array.isArray(horario.festivos)
  ) {
    estadoFestivos = "Atiende";
  }

  let especialidades = [];

  if (Array.isArray(especialidadesGuardadas)) {
    especialidades = especialidadesGuardadas;
  } else if (especialidadesGuardadas) {
    especialidades = String(especialidadesGuardadas)
      .split(",")
      .map((especialidad) => especialidad.trim())
      .filter(Boolean);
  } else if (especialidadPrincipal) {
    especialidades = String(especialidadPrincipal)
      .split(",")
      .map((especialidad) => especialidad.trim())
      .filter(Boolean);
  }

  return {
    id: item.id ?? null,

    nombreNegocio,

    responsable,

    nombre:
      item.nombre ??
      nombreNegocio ??
      responsable ??
      "",

    grupo,

    especialidad:
      especialidadPrincipal,

    especialidades,

    otroEspecialidad,

    descripcion,

    barrio,

    tipoAtencion,

    direccion,

    telefono:

    lunesViernes,

    sabado:
      horarioTexto(
        horario,
        "sabado"
      ),

    domingo:
      horarioTexto(
        horario,
        "domingo"
      ),

    festivos:
      estadoFestivos,

    horarioFestivos
  };
}
function filaSupabaseANegocio(item) {
  return prepararNegocio({
    id: item.id,
    nombre_negocio: item.nombre_negocio,
    responsable: item.responsable,
    grupo: item.grupo,
    especialidades: item.especialidades,
    otro_especialidad: item.otro_especialidad,
    descripcion: item.descripcion,
    barrio: item.barrio,
    tipo_atencion: item.tipo_atencion,
    direccion: item.direccion,
    telefono: item.telefono,
    horario: item.horario || {},
    festivos:
      item.festivos_data ||
      item.festivos ||
      "No atiende",
  });
}

function construirDatosSupabase(item) {
  let festivosGuardados = "No atiende";

  if (item.festivos === "Atiende") {
    festivosGuardados = {
      atiende: true,
      horario: convertirHorario(item.horarioFestivos),
    };
  }

  const horarioLunesViernes = convertirHorario(item.lunesViernes);

  return {
    nombre_negocio: item.nombreNegocio || "",
    responsable: item.responsable || "",
    grupo: item.grupo || "",
    especialidades: Array.isArray(item.especialidades)
      ? item.especialidades.join(", ")
      : item.especialidad || "",
    otro_especialidad: item.otroEspecialidad || "",
    descripcion: item.descripcion || "",
    barrio: item.barrio || "",
    tipo_atencion: item.tipoAtencion || "",
    direccion:
      item.tipoAtencion === "Domicilio"
        ? ""
        : item.direccion || "",
    telefono: item.telefono || "",
    lunes_viernes: item.lunesViernes || "",
    sabado: item.sabado || "",
    domingo: item.domingo || "",
    festivos: item.festivos || "No atiende",
    horario_festivos: item.horarioFestivos || "",
    horario: {
      lunes: horarioLunesViernes,
      martes: horarioLunesViernes,
      miercoles: horarioLunesViernes,
      jueves: horarioLunesViernes,
      viernes: horarioLunesViernes,
      sabado: convertirHorario(item.sabado),
      domingo: convertirHorario(item.domingo),
    },
    festivos_data: festivosGuardados,
  };
}

function Admin() {
  const [negocios, setNegocios] = useState([]);
  const [pantalla, setPantalla] = useState("menu");
  const [editando, setEditando] = useState(null);
  const [textoBuscar, setTextoBuscar] = useState("");
  const [negocio, setNegocio] = useState(formularioVacio);
  const [cargando, setCargando] = useState(true);

  const cargarNegocios = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("negocios")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar negocios desde Supabase:", error);
      alert("No se pudieron cargar los negocios desde la nube.");
      setCargando(false);
      return false;
    }

    setNegocios((data || []).map(filaSupabaseANegocio));
    setCargando(false);
    return true;
  };

  useEffect(() => {
    cargarNegocios();
  }, []);

  const cambiarDato = (e) => {
    const { name, value } = e.target;
    if (name === "grupo") {
      setNegocio({ ...negocio, grupo: value, especialidades: [], otroEspecialidad: "" });
      return;
    }
    setNegocio({ ...negocio, [name]: value });
  };

  const cambiarEspecialidad = (especialidad) => {
    setNegocio((anterior) => {
      const yaExiste = anterior.especialidades.includes(especialidad);
      return {
        ...anterior,
        especialidades: yaExiste
          ? anterior.especialidades.filter((item) => item !== especialidad)
          : [...anterior.especialidades, especialidad],
      };
    });
  };

  const nuevoNegocio = () => {
    setNegocio(formularioVacio);
    setEditando(null);
    setPantalla("formulario");
  };

  const guardarNegocio = async (e) => {
    e.preventDefault();

    if (!negocio.responsable.trim()) {
      alert("Debes escribir el nombre de la persona o responsable.");
      return;
    }
    if (negocio.especialidades.length === 0) {
      alert("Debes seleccionar al menos una especialidad.");
      return;
    }
    if (negocio.especialidades.includes("Otro") && !negocio.otroEspecialidad.trim()) {
      alert('Si seleccionas "Otro", escribe cuál es el servicio.');
      return;
    }

    const nombreNegocio = negocio.nombreNegocio.trim();
    const responsable = negocio.responsable.trim();
    const datos = construirDatosSupabase({
      ...negocio,
      nombreNegocio,
      responsable,
      especialidades: negocio.especialidades,
      otroEspecialidad: negocio.otroEspecialidad.trim(),
      descripcion: negocio.descripcion.trim(),
      barrio: negocio.barrio.trim(),
      direccion: negocio.direccion.trim(),
      telefono: negocio.telefono.trim(),
    });

    if (editando !== null && negocio.id) {
      const { error } = await supabase
        .from("negocios")
        .update(datos)
        .eq("id", negocio.id);

      if (error) {
        console.error(error);
        alert("No se pudieron guardar los cambios en la nube.");
        return;
      }
      alert(`"${nombreNegocio || responsable}" fue actualizado correctamente.`);
    } else {
      const { error } = await supabase.from("negocios").insert(datos);

      if (error) {
        console.error(error);
        alert("No se pudo registrar el negocio en la nube.");
        return;
      }
      alert(`"${nombreNegocio || responsable}" fue guardado correctamente.`);
    }

    await cargarNegocios();
    setNegocio(formularioVacio);
    setEditando(null);
    setPantalla("lista");
  };

  const editarNegocio = (indice) => {
    const seleccionado = negocios[indice];
    setNegocio({
      ...formularioVacio,
      ...prepararNegocio(seleccionado),
      id: seleccionado?.id ?? null,
    });
    setEditando(seleccionado?.id ?? indice);
    setPantalla("formulario");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarNegocio = async (indice) => {
    const seleccionado = negocios[indice];
    if (!seleccionado?.id) {
      alert("Este registro no tiene un ID de Supabase y no se puede eliminar desde aquí.");
      return;
    }

    const nombreMostrar = seleccionado.nombreNegocio || seleccionado.responsable || seleccionado.nombre;
    const confirmar = window.confirm(`¿Quieres eliminar a "${nombreMostrar}" del directorio?`);
    if (!confirmar) return;

    const { error } = await supabase.from("negocios").delete().eq("id", seleccionado.id);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el negocio de la nube.");
      return;
    }

    await cargarNegocios();
    alert(`"${nombreMostrar}" fue eliminado correctamente.`);
  };

  const volverMenu = () => {
    setPantalla("menu");
    setEditando(null);
    setTextoBuscar("");
    setNegocio(formularioVacio);
  };

  const negociosFiltrados = negocios.filter((item) => {
    const texto = normalizar(textoBuscar);
    if (!texto) return true;
    const especialidades = Array.isArray(item.especialidades) ? item.especialidades : [];
    return (
      normalizar(item.nombreNegocio).includes(texto) ||
      normalizar(item.responsable || item.nombre).includes(texto) ||
      normalizar(item.especialidad).includes(texto) ||
      especialidades.some((especialidad) => normalizar(especialidad).includes(texto)) ||
      normalizar(item.descripcion).includes(texto) ||
      normalizar(item.barrio).includes(texto) ||
      normalizar(item.grupo).includes(texto)
    );
  });

  const opcionesEspecialidad = subcategorias[negocio.grupo] || [];

  return (
    <div className="admin">
      <h2>Administrar negocios</h2>

      {pantalla === "menu" && (
        <div className="admin-menu">
          <p>¿Qué deseas hacer?</p>
          <div className="admin-opciones">
            <button type="button" onClick={() => setPantalla("lista")}>📋 Ver negocios registrados</button>
            <button type="button" onClick={nuevoNegocio}>➕ Registrar nuevo negocio</button>
          </div>
        </div>
      )}

      {pantalla === "lista" && (
        <div>
          <button type="button" onClick={volverMenu}>← Volver</button>
          <h3>Negocios registrados</h3>
          <button type="button" onClick={cargarNegocios} disabled={cargando}>
            {cargando ? "🔄 Cargando..." : "🔄 Actualizar lista"}
          </button>
          <input type="text" value={textoBuscar} onChange={(e) => setTextoBuscar(e.target.value)} placeholder="🔎 Buscar por nombre, servicio o barrio" />
          <p>{negociosFiltrados.length} negocio(s)</p>

          {cargando ? (
            <p>Cargando negocios desde la nube...</p>
          ) : negociosFiltrados.length === 0 ? (
            <p>No encontramos negocios.</p>
          ) : (
            negociosFiltrados.map((item, indice) => {
              const indiceReal = negocios.indexOf(item);
              const nombreMostrar = item.nombreNegocio || item.responsable || item.nombre;
              const responsableMostrar = item.responsable || item.nombre;
              return (
                <div className="admin-negocio" key={item.id ?? indice}>
                  <strong>{nombreMostrar}</strong>
                  {item.nombreNegocio && <p>👤 Responsable: {responsableMostrar}</p>}
                  <p>📂 {item.grupo}</p>
                  <p>🔧 {Array.isArray(item.especialidades) ? item.especialidades.filter((e) => e !== "Otro").join(", ") : item.especialidad}</p>
                  {item.otroEspecialidad && <p>✏️ Otro: {item.otroEspecialidad}</p>}
                  <p>📍 {item.barrio}</p>
                  <div className="admin-acciones">
                    <button type="button" onClick={() => editarNegocio(indiceReal)}>✏️ Editar</button>
                    <button type="button" className="boton-eliminar" onClick={() => eliminarNegocio(indiceReal)}>🗑️ Eliminar</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {pantalla === "formulario" && (
        <div>
          <button type="button" onClick={volverMenu}>← Volver</button>
          {editando !== null && (
            <div className="editando-aviso">✏️ <strong>Editando: {negocio.nombreNegocio || negocio.responsable}</strong></div>
          )}
          <h3>{editando !== null ? "Editar negocio" : "Registrar nuevo negocio"}</h3>

          <form onSubmit={guardarNegocio}>
            <label>Nombre del negocio (si tiene)</label>
            <input name="nombreNegocio" value={negocio.nombreNegocio} onChange={cambiarDato} placeholder="Ej: Sala de Belleza Marianne" />

            <label>Nombre de la persona o responsable</label>
            <input name="responsable" value={negocio.responsable} onChange={cambiarDato} placeholder="Ej: Marianne Gómez" required />

            <label>Categoría</label>
            <select name="grupo" value={negocio.grupo} onChange={cambiarDato}>
              <option value="Técnicos">Técnicos y reparaciones</option>
              <option value="Hogar">Hogar, cuidado y oficios</option>
              <option value="Restaurantes">Comidas y bebidas</option>
              <option value="Belleza">Belleza y bienestar</option>
              <option value="Tienda">Comercio / Tiendas</option>
              <option value="Moda">Moda, ropa y calzado</option>
              <option value="Profesionales">Profesionales</option>
              <option value="Costura">Confección y arreglos</option>
              <option value="Transporte">Transporte y domicilios</option>
            </select>

            <label>Especialidades</label>
            <p className="ayuda-horario">Selecciona una o varias opciones.</p>
            <div className="especialidades-belleza" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", textAlign: "left" }}>
              {opcionesEspecialidad.map((especialidad) => (
                <label key={especialidad} className="opcion-especialidad" style={{ display: "grid", gridTemplateColumns: "22px minmax(0, 1fr)", alignItems: "center", columnGap: "8px", width: "100%", maxWidth: "100%", boxSizing: "border-box", marginBottom: "8px", padding: 0, textAlign: "left", cursor: "pointer" }}>
                  <input type="checkbox" checked={negocio.especialidades.includes(especialidad)} onChange={() => cambiarEspecialidad(especialidad)} style={{ margin: 0, width: "16px", height: "16px" }} />
                  <span style={{ display: "block", width: "100%", minWidth: 0, margin: 0, padding: 0, textAlign: "left", overflowWrap: "break-word" }}>{especialidad}</span>
                </label>
              ))}
            </div>

            {negocio.especialidades.includes("Otro") && (
              <>
                <label>¿Cuál otro servicio?</label>
                <input name="otroEspecialidad" value={negocio.otroEspecialidad} onChange={cambiarDato} placeholder="Escribe aquí el servicio" required />
              </>
            )}

            <label>Descripción</label>
            <textarea name="descripcion" value={negocio.descripcion} onChange={cambiarDato} placeholder="Describe brevemente los servicios que ofrece" />
            <p className="ayuda-horario">Aquí puedes escribir detalles. Por ejemplo: tintes, balayage, keratina, uñas, maquillaje, reparaciones específicas, tipos de comida, etc.</p>

            <label>Barrio</label>
            <input name="barrio" value={negocio.barrio} onChange={cambiarDato} placeholder="Ej: El Rocío" required />

            <label>Tipo de atención</label>
            <select name="tipoAtencion" value={negocio.tipoAtencion} onChange={cambiarDato}>
              <option>Domicilio</option><option>Local</option><option>Local y domicilio</option>
            </select>

            <label>Dirección</label>
            <input name="direccion" value={negocio.direccion} onChange={cambiarDato} placeholder="Solo si tiene local" />

            <label>Teléfono / WhatsApp</label>
            <input name="telefono" value={negocio.telefono} onChange={cambiarDato} placeholder="Ej: 3156206209" required />

            <h3>Horarios</h3>
            <label>Lunes a viernes</label>
            <input name="lunesViernes" value={negocio.lunesViernes} onChange={cambiarDato} placeholder="08:00-12:00, 14:00-18:00" />
            <label>Sábado</label>
            <input name="sabado" value={negocio.sabado} onChange={cambiarDato} placeholder="08:00-13:00" />
            <label>Domingo</label>
            <input name="domingo" value={negocio.domingo} onChange={cambiarDato} placeholder="No atiende" />
            <label>Festivos</label>
            <select name="festivos" value={negocio.festivos} onChange={cambiarDato}><option>No atiende</option><option>Atiende</option></select>

            {negocio.festivos === "Atiende" && (
              <>
                <label>Horario en festivos</label>
                <input name="horarioFestivos" value={negocio.horarioFestivos} onChange={cambiarDato} placeholder="Ej: 09:00-13:00" />
                <p className="ayuda-horario">Puedes escribir uno o dos horarios. Ejemplo: 08:00-12:00, 14:00-18:00</p>
              </>
            )}

            <button type="submit">{editando !== null ? "💾 Guardar cambios" : "💾 Guardar negocio"}</button>
            {editando !== null && <button type="button" className="boton-cancelar" onClick={volverMenu}>Cancelar edición</button>}
          </form>
        </div>
      )}
    </div>
  );
}

export default Admin;