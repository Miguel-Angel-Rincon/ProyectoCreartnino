import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardProducto from "../../components/CardProducto";
import "../../styles/categoriasproductos.css";

import type { IProductos } from "../../../features/interfaces/IProductos";
import type { ICatProductos } from "../../../features/interfaces/ICatProductos";

const ProductosPorCategoria = () => {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🔍 Filtros
  const [busqueda, setBusqueda] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([0, 0]);

  // 🔢 Paginación / Ver más
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarVerMasGlobal, setMostrarVerMasGlobal] = useState(true); // si false => modo global 20 por página
  const [extraShownForPage, setExtraShownForPage] = useState<Record<number, number>>({});

  const categoriaSlug = categoria?.toLowerCase() || "todos";

  const normalizarTexto = (txt: string) =>
    txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  const capitalizar = (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.slice(1);

  // 🧠 Cargar datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [respCategorias, respProductos] = await Promise.all([
          fetch("https://www.apicreartnino.somee.com/api/Categoria_productos/Lista"),
          fetch("https://www.apicreartnino.somee.com/api/Productos/Lista"),
        ]);

        if (!respCategorias.ok || !respProductos.ok) {
          throw new Error("Error al obtener datos de la API");
        }

        const dataCategorias: ICatProductos[] = await respCategorias.json();
        const dataProductos: IProductos[] = await respProductos.json();

        setCategorias(dataCategorias.filter((c) => c.Estado === true));
        setProductos(dataProductos);

        const precios = dataProductos.map((p) => p.Precio);
        const maxPrecio = precios.length ? Math.max(...precios) : 1000000;
        const limiteVisual = maxPrecio > 2000000 ? 2000000 : maxPrecio;
        setRangoPrecio([0, limiteVisual]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  // 🔁 Actualizar rango de precio dinámicamente al cambiar de categoría
  useEffect(() => {
    if (productos.length === 0) return;

    const productosFiltradosCategoria =
      categoriaSlug === "todos"
        ? productos
        : productos.filter((p) => {
            const categoriaEncontrada = categorias.find(
              (c) => normalizarTexto(c.CategoriaProducto1) === categoriaSlug
            );
            return p.CategoriaProducto === categoriaEncontrada?.IdCategoriaProducto;
          });

    const preciosCat = productosFiltradosCategoria.map((p) => p.Precio);
    if (preciosCat.length > 0) {
      const nuevoMin = Math.min(...preciosCat);
      const nuevoMax = Math.max(...preciosCat);
      setRangoPrecio([nuevoMin, nuevoMax]);
    }

    // Reinicia estados al cambiar categoría
    setPaginaActual(1);
    setMostrarVerMasGlobal(true);
    setExtraShownForPage({});
  }, [categoriaSlug, productos, categorias]);

  if (cargando) {
    return <p className="cargando">Cargando productos...</p>;
  }

  // 🧩 Filtrado por categoría
  const productosPorCategoria =
    categoriaSlug === "todos"
      ? productos.filter((p) => p.Estado === true)
      : productos.filter((p) => {
          const categoriaEncontrada = categorias.find(
            (c) => normalizarTexto(c.CategoriaProducto1) === categoriaSlug
          );
          return (
            p.CategoriaProducto === categoriaEncontrada?.IdCategoriaProducto &&
            p.Estado === true
          );
        });

  const precios = productosPorCategoria.map((p) => p.Precio);
  const precioMinimoTotal = precios.length ? Math.min(...precios) : 0;
  const precioMaximoTotal = precios.length ? Math.max(...precios) : rangoPrecio[1];

  // 🧮 Filtrado final por nombre y rango de precio
  const productosFiltrados = productosPorCategoria.filter((p) => {
    const coincideNombre = p.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    const dentroRango = p.Precio >= rangoPrecio[0] && p.Precio <= rangoPrecio[1];
    return coincideNombre && dentroRango;
  });

  // 🎚️ Control del slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: "min" | "max") => {
    const valor = Number(e.target.value);
    if (tipo === "min" && valor <= rangoPrecio[1]) setRangoPrecio([valor, rangoPrecio[1]]);
    if (tipo === "max" && valor >= rangoPrecio[0]) setRangoPrecio([rangoPrecio[0], valor]);
  };

  // 📏 Posiciones del rango
  const rangoVisual = Math.max(precioMaximoTotal - precioMinimoTotal, 1);
  const minPos = ((rangoPrecio[0] - precioMinimoTotal) / rangoVisual) * 100;
  const maxPos = ((rangoPrecio[1] - precioMinimoTotal) / rangoVisual) * 100;

  // 🔽 Cambiar categoría
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/productos/${e.target.value}`);
  };

  // -------------------------
  // LÓGICA DE PAGINACIÓN Y "VER MÁS" CORRECTA
  // -------------------------
  const basePageSize = 10;

  // Si mostrarVerMasGlobal === false, usamos tamaño global (20 por página)
  // Si true, cada página base = 10, pero puede tener extras (extraShownForPage)
  // ---------
  // Calcular cantidad mostrada por página (para páginas ya con extras)
  const getCountForPage = (pageNumber: number) => {
    if (!mostrarVerMasGlobal) return basePageSize * 2;
    return basePageSize + (extraShownForPage[pageNumber] || 0);
  };

  // Calcula total de páginas necesarias según el estado actual (considera extras por página)
  const computeTotalPages = () => {
    if (!mostrarVerMasGlobal) {
      return Math.max(1, Math.ceil(productosFiltrados.length / (basePageSize * 2)));
    }
    let remaining = productosFiltrados.length;
    let page = 0;
    // itera sumando páginas hasta cubrir todos los items
    while (remaining > 0) {
      page++;
      remaining -= getCountForPage(page);
      // safety break to avoid infinite loops (no debería ocurrir)
      if (page > 10000) break;
    }
    return Math.max(1, page);
  };

  // Para sacar los items de la página actual necesitamos calcular el índice de inicio
  // sumando lo mostrado en páginas anteriores (según counts calculadas)
  const computeStartIndexForPage = (pageNumber: number) => {
    if (!mostrarVerMasGlobal) {
      // cada página tiene size = basePageSize*2
      return (pageNumber - 1) * basePageSize * 2;
    }
    let start = 0;
    for (let p = 1; p < pageNumber; p++) {
      start += getCountForPage(p);
    }
    return start;
  };

  const startIndex = computeStartIndexForPage(paginaActual);
  const countThisPage = getCountForPage(paginaActual);
  const productosPagina = productosFiltrados.slice(startIndex, startIndex + countThisPage);

  // Remaining after shown (para decidir si se muestra botón Ver más en esta página)
  const remainingAfterShown = Math.max(0, productosFiltrados.length - (startIndex + productosPagina.length));

  // Manejo del botón Ver más:
  // - Si estamos en la página 1 y queremos "combinar" => hacemos modo global 20 (opcional, pero conservamos comportamiento previo)
  // - Si estamos en página >1 => añadimos el siguiente bloque de basePageSize a esta página
  const handleVerMas = () => {
    if (!mostrarVerMasGlobal) {
      // Ya estamos en modo global 20; nada que hacer
      return;
    }

    if (paginaActual === 1) {
      // comportamiento histórico: convertir a modo global 20 por página
      setMostrarVerMasGlobal(false);
      // limpiar extras (no necesarios en modo global)
      setExtraShownForPage({});
      // aseguramos que la página 1 muestre desde inicio
      setPaginaActual(1);
      return;
    }

    // página > 1: añadimos el siguiente bloque de 10 a la página actual
    const alreadyExtra = extraShownForPage[paginaActual] || 0;

    // calcular cuántos quedan realmente después de lo ya mostrado en páginas anteriores + base + alreadyExtra
    const startNext = computeStartIndexForPage(paginaActual) + basePageSize + alreadyExtra;
    const remaining = Math.max(0, productosFiltrados.length - startNext);
    if (remaining <= 0) {
      return; // no hay nada para agregar
    }
    const toAdd = Math.min(basePageSize, remaining);

    setExtraShownForPage({
      ...extraShownForPage,
      [paginaActual]: alreadyExtra + toAdd,
    });
  };

  const cambiarPagina = (num: number) => {
    // si la página pedida supera el total recalculado, ajustamos al máximo
    const total = computeTotalPages();
    const to = Math.max(1, Math.min(num, total));
    setPaginaActual(to);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="categorias-container">
      <h2 className="titulo">
        {categoriaSlug === "todos"
          ? "Todos los Productos"
          : capitalizar(categoriaSlug.replace(/-/g, " "))}
      </h2>

      {/* 🔍 Filtros */}
      <div className="filtros-container-modern">
        <input
          type="text"
          placeholder="🔍 Buscar producto..."
          className="input-busqueda-grande"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className="select-categorias"
          value={categoriaSlug}
          onChange={handleCategoriaChange}
        >
          <option value="todos">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.IdCategoriaProducto} value={normalizarTexto(cat.CategoriaProducto1)}>
              {cat.CategoriaProducto1}
            </option>
          ))}
        </select>

        {/* 🎚️ Rango de precio */}
        <div className="filtro-precio">
          <h4 className="titulo-precio">💰 Rango de Precio</h4>

          <div className="slider-wrapper">
            <div className="slider-linea-base"></div>
            <div
              className="slider-rango-activo"
              style={{
                left: `${minPos}%`,
                width: `${maxPos - minPos}%`,
              }}
            ></div>
            <input
              type="range"
              min={precioMinimoTotal}
              max={precioMaximoTotal}
              value={rangoPrecio[0]}
              onChange={(e) => handleSliderChange(e, "min")}
              className="slider-input"
            />
            <input
              type="range"
              min={precioMinimoTotal}
              max={precioMaximoTotal}
              value={rangoPrecio[1]}
              onChange={(e) => handleSliderChange(e, "max")}
              className="slider-input"
            />
            <div className="slider-punto" style={{ left: `${minPos}%` }}>
              <div className="slider-valor">${rangoPrecio[0].toLocaleString()} COP</div>
            </div>
            <div className="slider-punto" style={{ left: `${maxPos}%` }}>
              <div className="slider-valor">${rangoPrecio[1].toLocaleString()} COP</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🛍️ Productos (lista mostrada según la lógica) */}
      <div className="categorias-grid">
        {productosPagina.length > 0 ? (
          productosPagina.map((producto) => (
            <CardProducto key={producto.IdProducto} producto={producto} />
          ))
        ) : (
          <p>No hay productos que coincidan con los filtros.</p>
        )}
      </div>

      {/* 🌸 Botón "Ver más": aparece solo si hay productos restantes después de lo mostrado en la página actual */}
      {/* 🌸 Botón "Ver más": aparece solo si hay productos restantes y la página actual tiene menos de 20 */}
{remainingAfterShown > 0 && productosPagina.length < 20 && (
  <button className="ver-mas-btn" onClick={handleVerMas}>
    Ver más
  </button>
)}


      {/* 🔢 Paginación siempre visible (recalcula según extras) */}
      <div className="paginacion-container">
        {Array.from({ length: computeTotalPages() }, (_, i) => (
          <button
            key={i + 1}
            className={`pagina-boton ${paginaActual === i + 1 ? "activa" : ""}`}
            onClick={() => cambiarPagina(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductosPorCategoria;
