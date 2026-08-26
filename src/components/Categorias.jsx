function Categorias({ alSeleccionar }) {

  const categorias = [
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
      nombre: "Moda, belleza y accesorios",
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

  return (
    <div className="categorias">

      <h3>Categorías</h3>

      <div className="grid-categorias">

        {categorias.map((categoria) => (

          <div
            className="tarjeta"
            key={categoria.nombre}
            onClick={() =>
              alSeleccionar(categoria.grupo)
            }
          >

            <span className="icono">
              {categoria.icono}
            </span>

            <strong>
              {categoria.nombre}
            </strong>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Categorias;