import { useState } from "react";
import negocios from "../data/negocios";

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function Buscador({ alBuscar }) {
  const [texto, setTexto] = useState("");

  const textoNormalizado = normalizar(texto);

  const sugerencias = textoNormalizado.length >= 2
    ? [...new Set(
        negocios
          .flatMap((negocio) => [
            negocio.especialidad,
            negocio.grupo
          ])
          .filter(Boolean)
          .filter((dato) =>
            normalizar(dato).includes(textoNormalizado)
          )
      )].slice(0, 5)
    : [];

  const realizarBusqueda = (e) => {
    e.preventDefault();

    if (texto.trim() === "") {
      return;
    }

    alBuscar(texto.trim());
  };

  const elegirSugerencia = (sugerencia) => {
    setTexto(sugerencia);
    alBuscar(sugerencia);
  };

  return (
    <form onSubmit={realizarBusqueda}>

      <div className="contenedor-buscador">

        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué servicio estás buscando?"
        />

        {sugerencias.length > 0 && (
          <div className="sugerencias">

            {sugerencias.map((sugerencia) => (
              <button
                type="button"
                key={sugerencia}
                onClick={() =>
                  elegirSugerencia(sugerencia)
                }
              >
                🔎 {sugerencia}
              </button>
            ))}

          </div>
        )}

      </div>

      <button type="submit">
        🔎 Buscar
      </button>

    </form>
  );
}

export default Buscador;