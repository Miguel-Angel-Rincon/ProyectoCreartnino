// src/web/pages/ProductosPorCategoria.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CardProducto from "../../components/CardProducto";
import "../../styles/categoriasproductos.css";

import type { IProductos } from "../../../features/interfaces/IProductos";
import type { ICatProductos } from "../../../features/interfaces/ICatProductos";

const ProductosPorCategoria = () => {
  const { categoria } = useParams();
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [cargando, setCargando] = useState(true);

  const categoriaSlug = categoria?.toLowerCase() || "todos";

  // 🔧 Normaliza texto para slug (sin acentos y en minúscula)
  const normalizarTexto = (txt: string) =>
    txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  // 🔠 Capitaliza texto para mostrar en título
  const capitalizar = (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.slice(1);

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

        // ✅ Guardar solo categorías activas
        setCategorias(dataCategorias.filter((c) => c.Estado === true));
        setProductos(dataProductos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  if (cargando) {
    return <p className="cargando">Cargando productos...</p>;
  }

  // ✅ Filtrar productos activos según la categoría seleccionada
  const productosFiltrados =
    categoriaSlug === "todos"
      ? productos.filter((p) => p.Estado === true) // Solo activos
      : productos.filter((p) => {
          const categoriaEncontrada = categorias.find(
            (c) => normalizarTexto(c.CategoriaProducto1) === categoriaSlug
          );
          return (
            p.CategoriaProducto === categoriaEncontrada?.IdCategoriaProducto &&
            p.Estado === true
          );
        });

  return (
    <div className="categorias-container">
      <h2 className="titulo">
        {categoriaSlug === "todos"
          ? "Todos los Productos"
          : capitalizar(categoriaSlug.replace(/-/g, " "))}
      </h2>

      <div className="categorias-grid">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <CardProducto key={producto.IdProducto} producto={producto} />
          ))
        ) : (
          <p>No hay productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
};

export default ProductosPorCategoria;
