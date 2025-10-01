import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import "../styles/ListarProductos.css";
import { APP_SETTINGS } from "../../../settings/appsettings";

import CrearProductoModal from "./NuevoProducto";
import EditarProductoModal from "./Editar";
// import VerProductoModal from "./Ver";

import type { IProductos } from "../../interfaces/IProductos";
import type { ICatProductos } from "../../interfaces/ICatProductos";
import VerProductoModal from "./Ver";

const ListarProductos: React.FC = () => {
  // 🔹 Estados
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState<IProductos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [productoVer, setProductoVer] = useState<IProductos | null>(null);

  const productosPorPagina = 6;

  // 🔹 API: Productos
  const obtenerProductos = async () => {
    try {
      const response = await fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`);
      if (response.ok) {
        const data = await response.json();
setProductos(
  Array.isArray(data)
    ? data.sort((a, b) => (b.IdProducto ?? 0) - (a.IdProducto ?? 0))
    : []
);

      }
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  // 🔹 API: Categorías
  const obtenerCategorias = async () => {
    try {
      const response = await fetch(`${APP_SETTINGS.apiUrl}Categoria_Productos/Lista`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  // 🔹 Montaje inicial
  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  // 🔹 Eliminar producto
  const handleEliminarProducto = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Producto activo",
        text: "No puedes eliminar un producto que está activo. Desactívalo primero.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${APP_SETTINGS.apiUrl}Productos/Eliminar/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await obtenerProductos();
            Swal.fire({
              icon: "success",
              title: "Eliminado",
              text: "El producto ha sido eliminado correctamente",
              confirmButtonColor: "#e83e8c",
            });
          }
        } catch (error) {
          console.error("Error eliminando producto", error);
        }
      }
    });
  };

  // 🔹 Cambiar estado (activo/inactivo)
  const handleEstadoChange = async (id: number) => {
    const producto = productos.find((p) => p.IdProducto === id);
    if (!producto) return;

    if (producto.Estado && producto.Cantidad > 0) {
      Swal.fire({
        icon: "warning",
        title: "No se puede desactivar",
        text: "No puedes desactivar un producto que aún tiene existencias.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    const actualizado = { ...producto, Estado: !producto.Estado };

    try {
      const response = await fetch(`${APP_SETTINGS.apiUrl}Productos/Actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (response.ok) {
        await obtenerProductos();
      }

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `Estado actualizado correctamente`,
        confirmButtonColor: "#f78fb3",
    });

    } catch (error) {
      console.error("Error actualizando estado producto", error);
    }
  };

  // 🔹 Editar producto
  const handleEditarProducto = (producto: IProductos) => {
    setProductoEditar(producto);
    setMostrarEditarModal(true);
  };

  const handleActualizarProducto = async (productoActualizado: IProductos) => {
    try {
      const response = await fetch(
        `${APP_SETTINGS.apiUrl}Productos/Actualizar/${productoActualizado.IdProducto}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productoActualizado),
        }
      );
      if (response.ok) {
        await obtenerProductos();
        setMostrarEditarModal(false);
      }
    } catch (error) {
      console.error("Error actualizando producto", error);
    }
  };

  // 🔹 Ver producto
  const handleVerProducto = (producto: IProductos) => {
    setProductoVer(producto);
    setMostrarVerModal(true);
  };

  // 🔹 Filtro búsqueda
  const productosFiltrados = productos.filter(
    (p) =>
      p.Nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.Cantidad.toString().includes(busqueda) ||
      categorias
        .find((c) => c.IdCategoriaProducto === p.CategoriaProducto)
        ?.CategoriaProducto1?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      p.Precio.toString().includes(busqueda)
  );

  // 🔹 Paginación
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  return (
    <div className="container-fluid main-content">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Productos Registrados</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Producto
        </button>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por Nombre, Categoría o Precio"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
          setPaginaActual(1);
        }}
      />

      {/* Tabla */}
      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p, index) => {
              const categoriaNombre =
                categorias.find((c) => c.IdCategoriaProducto === p.CategoriaProducto)
                  ?.CategoriaProducto1 || "Sin categoría";
              return (
                <tr
                  key={p.IdProducto}
                  className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                >
                  <td>{p.Nombre}</td>
                  <td>{categoriaNombre}</td>
                  <td>{p.Cantidad}</td>
                  <td>${p.Precio.toLocaleString("es-CO")}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={p.Estado}
                        onChange={() => handleEstadoChange(p.IdProducto!)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <FaEye
                      className="icono text-info"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleVerProducto(p)}
                    />
                    <FaEdit
                      className="icono text-warning"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleEditarProducto(p)}
                    />
                    <FaTrash
                      className="icono text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleEliminarProducto(p.IdProducto!, p.Estado)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="d-flex justify-content-center align-items-center mt-4 mb-3">
              <button
                className="btn btn-light me-2"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                «
              </button>

              {paginaActual > 1 && (
                <button
                  className="btn btn-light me-2"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                >
                  {paginaActual - 1}
                </button>
              )}

              <button className="btn btn-pink me-2">{paginaActual}</button>

              {paginaActual < totalPaginas && (
                <button
                  className="btn btn-light me-2"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                >
                  {paginaActual + 1}
                </button>
              )}

              <button
                className="btn btn-light"
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaActual === totalPaginas}
              >
                »
              </button>
            </div>
      </div>

      {/* Modales */}
      {mostrarModal && (
        <CrearProductoModal
          onClose={() => setMostrarModal(false)}
          onCrear={() => {
            obtenerProductos();
            setPaginaActual(1);
            setMostrarModal(false);
          }}
        />
      )}

      {mostrarEditarModal && productoEditar && (
        <EditarProductoModal
          producto={productoEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarProducto}
        />
      )}

      
      {mostrarVerModal && productoVer && (
        <VerProductoModal producto={productoVer} onClose={() => setMostrarVerModal(false)} />
      )} 
     
    </div>
  );
};

export default ListarProductos;
