import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash,FaExclamationTriangle } from "react-icons/fa";

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

  const [mostrarAlarmaStock, setMostrarAlarmaStock] = useState(false);
const [productoResaltado, setProductoResaltado] = useState<number | null>(null);
const filaResaltadaRef = useRef<HTMLTableRowElement>(null);


  const productosPorPagina = 6;
const STOCK_MINIMO = 10;


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

  const productosStockBajo = productos.filter(
  (p) => p.Estado && p.Cantidad <= STOCK_MINIMO
);

useEffect(() => {
  if (productoResaltado && filaResaltadaRef.current) {
    filaResaltadaRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    const timer = setTimeout(() => {
      setProductoResaltado(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [productoResaltado, paginaActual]);

const handleNavegarAProducto = (productoId: number) => {
  const indiceProducto = productosFiltrados.findIndex(
    (p) => p.IdProducto === productoId
  );

  if (indiceProducto !== -1) {
    const paginaProducto = Math.floor(indiceProducto / productosPorPagina) + 1;
    setPaginaActual(paginaProducto);
    setProductoResaltado(productoId);
    setMostrarAlarmaStock(false);
  }
};


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
      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3 filtros-container">
  <div style={{ position: "relative", minWidth: "fit-content" }}>
    <button
      className="btn btn-outline-danger d-flex align-items-center"
      onClick={() => setMostrarAlarmaStock(!mostrarAlarmaStock)}
      style={{
        borderRadius: "8px",
        padding: "8px 16px",
        fontWeight: "500",
        borderWidth: "2px",
        whiteSpace: "nowrap",
      }}
    >
      <FaExclamationTriangle style={{ marginRight: "8px" }} />
      Alertas de Stock
      {productosStockBajo.length > 0 && (
        <span
          className="badge bg-danger"
          style={{
            marginLeft: "8px",
            borderRadius: "50%",
            padding: "4px 8px",
          }}
        >
          {productosStockBajo.length}
        </span>
      )}
    </button>

    {/* 🔔 Modal de alerta de stock */}
    {mostrarAlarmaStock && (
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          left: "0",
          backgroundColor: "white",
          border: "2px solid #dc3545",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(220, 53, 69, 0.2)",
          minWidth: "350px",
          maxWidth: "400px",
          zIndex: 1000,
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #dee2e6",
            backgroundColor: "#f8d7da",
            borderRadius: "6px 6px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h6 style={{ margin: 0, color: "#721c24", fontWeight: "600" }}>
            ⚠ Productos con Stock Bajo
          </h6>
          <button
            onClick={() => setMostrarAlarmaStock(false)}
            style={{
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#721c24",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "12px" }}>
          {productosStockBajo.length === 0 ? (
            <p style={{ margin: "12px", color: "#28a745", textAlign: "center" }}>
              ✓ Todos los productos tienen stock suficiente
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {productosStockBajo.map((producto) => (
                <li
                  key={producto.IdProducto}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffe6e6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                  onClick={() => handleNavegarAProducto(producto.IdProducto!)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#333" }}>{producto.Nombre}</strong>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {categorias.find(
                          (c) => c.IdCategoriaProducto === producto.CategoriaProducto
                        )?.CategoriaProducto1 || "Sin categoría"}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        marginLeft: "12px",
                        color: producto.Cantidad === 0 ? "#dc3545" : "#ff6b6b",
                        fontWeight: "bold",
                      }}
                    >
                      {producto.Cantidad}
                    </div>
                    <div
                      style={{
                        marginLeft: "8px",
                        color: "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      →
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )}
  </div>

  {/* 🔍 Buscador existente */}
  <input
    type="text"
    placeholder="Buscar por Nombre, Categoría o Precio"
    className="form-control buscador"
    value={busqueda}
    onChange={(e) => {
      const value = e.target.value;
      if (value.trim() === "" && value !== "") return;
      setBusqueda(value);
      setPaginaActual(1);
    }}
  />
</div>

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
  ref={p.IdProducto === productoResaltado ? filaResaltadaRef : null}
  className={index % 2 === 0 ? "fila-par" : "fila-impar"}
  style={{
    backgroundColor: p.IdProducto === productoResaltado ? "#ffe6e6" : undefined,
    border: p.IdProducto === productoResaltado ? "2px solid #dc3545" : undefined,
    transition: "all 0.3s ease",
    boxShadow:
      p.IdProducto === productoResaltado
        ? "0 4px 12px rgba(220, 53, 69, 0.3)"
        : undefined,
  }}
>
  <td>
    {p.Nombre}
    {p.IdProducto === productoResaltado && (
      <span style={{ marginLeft: "8px", color: "#dc3545", fontSize: "18px" }}>
        👈
      </span>
    )}
  </td>
                  <td>{categoriaNombre}</td>
                  <td>
  {p.Cantidad}
  {p.Estado && p.Cantidad <= STOCK_MINIMO && (
    <FaExclamationTriangle
      style={{
        color: p.Cantidad === 0 ? "#dc3545" : "#ff6b6b",
        marginLeft: "8px",
      }}
      title="Stock bajo"
    />
  )}
</td>

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
