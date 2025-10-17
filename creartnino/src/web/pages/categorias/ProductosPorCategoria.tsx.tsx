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
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const abrirImagen = (url: string) => setImagenSeleccionada(url);
  const cerrarImagen = () => setImagenSeleccionada(null);

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
              (c) =>
                normalizarTexto(c.CategoriaProducto1) === categoriaSlug
            );
            return p.CategoriaProducto === categoriaEncontrada?.IdCategoriaProducto;
          });

    const preciosCat = productosFiltradosCategoria.map((p) => p.Precio);
    if (preciosCat.length > 0) {
      const nuevoMin = Math.min(...preciosCat);
      const nuevoMax = Math.max(...preciosCat);
      setRangoPrecio([nuevoMin, nuevoMax]);
    }
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

  // 📏 Posiciones de los puntos
  const rangoVisual = Math.max(precioMaximoTotal - precioMinimoTotal, 1);
  const minPos = ((rangoPrecio[0] - precioMinimoTotal) / rangoVisual) * 100;
  const maxPos = ((rangoPrecio[1] - precioMinimoTotal) / rangoVisual) * 100;

  // 🔽 Cambiar categoría desde el select
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    navigate(`/productos/${value}`);
  };

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

        {/* 🧭 Select de Categorías */}
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

      {/* 🛍️ Productos */}
      <div className="categorias-grid">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <CardProducto key={producto.IdProducto} producto={producto} overImagen={abrirImagen} />
          ))
        ) : (
          <p>No hay productos que coincidan con los filtros.</p>
        )}
      </div>

      {/* 🖼️ Modal de imagen */}
      {imagenSeleccionada && (
        <div className="modal-imagen" onClick={cerrarImagen}>
          <div className="modal-imagen-contenido">
            <img src={imagenSeleccionada} alt="Vista ampliada" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPorCategoria;
