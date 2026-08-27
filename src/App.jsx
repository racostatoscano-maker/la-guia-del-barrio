import { useState } from "react";
import Destacados from "./components/Destacados";
import Admin from "./components/Admin";

function App() {
  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [mostrarBusqueda, setMostrarBusqueda] =
    useState(false);

  const grupos = [
    {
      nombre: "Técnicos y reparaciones",
      grupo: "Técnicos",
      icono: "🔧"
    },
    {
      nombre: "Hogar, cuidado y oficios",
      grupo: "Hogar",
      icono: "🏠"
    },
    {
      nombre: "Comidas y bebidas",
      grupo: "Restaurantes",
      icono: "🍔"
    },
    {
      nombre: "Belleza y bienestar",
      grupo: "Belleza",
      icono: "💇‍♀️"
    },
    {
      nombre: "Comercio / Tiendas",
      grupo: "Tienda",
      icono: "🛒"
    },
    {
      nombre: "Moda, ropa y calzado",
      grupo: "Moda",
      icono: "👗"
    },
    {
      nombre: "Profesionales",
      grupo: "Profesionales",
      icono: "⚖️"
    },
    {
      nombre: "Confección y arreglos",
      grupo: "Costura",
      icono: "🧵"
    },
    {
      nombre: "Transporte y domicilios",
      grupo: "Transporte",
      icono: "🚚"
    }
  ];

  const volverInicio = () => {
    setGrupoSeleccionado("");
    setBusqueda("");
    setMostrarBusqueda(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const seleccionarGrupo = (grupo) => {
    setGrupoSeleccionado(grupo);
    setBusqueda("");
    setMostrarBusqueda(false);
  };

  const cambiarBusqueda = (e) => {
    const texto = e.target.value;

    setBusqueda(texto);
    setGrupoSeleccionado("");

    if (texto.trim()) {
      setMostrarBusqueda(true);
    } else {
      setMostrarBusqueda(false);
    }
  };

  const buscar = (e) => {
    e.preventDefault();

    if (!busqueda.trim()) {
      setMostrarBusqueda(false);
      return;
    }

    setGrupoSeleccionado("");
    setMostrarBusqueda(true);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setMostrarBusqueda(false);
  };

  if (window.location.pathname === "/administracion") {
    return <Admin />;
  }

  return (
    <div className="app">

      <header className="encabezado">

        <h1>
          Talentosos Somos Todos 
        </h1>

        <p>
          Negocios y servicios de la comunidad a tu alcance
        </p>

      </header>

      <main>

        {!grupoSeleccionado && (
          <section className="buscador">

            <form onSubmit={buscar}>

              <input
                type="text"
                value={busqueda}
                onChange={cambiarBusqueda}
                placeholder="🔎 ¿Qué estás buscando?"
              />

              <button type="submit">
                🔎 Buscar
              </button>

            </form>

          </section>
        )}

        {!grupoSeleccionado &&
          !mostrarBusqueda && (
            <section className="categorias">

              <h2>
                Categorías
              </h2>

              <div className="grupos">

                {grupos.map((grupo) => (

                  <button
                    key={grupo.grupo}
                    className="grupo"
                    onClick={() =>
                      seleccionarGrupo(
                        grupo.grupo
                      )
                    }
                  >

                    <span>
                      {grupo.icono}
                    </span>

                    {grupo.nombre}

                  </button>

                ))}

              </div>

            </section>
          )}

        {(grupoSeleccionado ||
          mostrarBusqueda) && (

          <Destacados
            grupoSeleccionado={
              grupoSeleccionado
            }
            busqueda={
              mostrarBusqueda
                ? busqueda
                : ""
            }
            volverInicio={
              volverInicio
            }
            limpiarBusqueda={
              limpiarBusqueda
            }
          />

        )}

      </main>

      <footer>

        <p>
          Talentosos Somos Todos
        </p>

        <p>
          Directorio de Oportunidades, Comercio y Emprendimiento
        </p>

      </footer>

    </div>
  );
}

export default App;