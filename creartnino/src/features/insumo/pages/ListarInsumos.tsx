// src/components/ListarInsumos.tsx
import React, { useEffect, useState, useRef } from "react";
import "../styles/ListarInsumos.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";

import CrearInsumoModal from "./CrearInsumo";
import EditarInsumoModal from "./EditarInsumo";
import VisualizarInsumoModal from "./VisualizarInsumo";

import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IInsumos } from "../../interfaces/IInsumos";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";

const INSUMOS_POR_PAGINA = 6;
const STOCK_MINIMO = 10;

const ListarInsumos: React.FC = () => {
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState<IInsumos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [insumoVer, setInsumoVer] = useState<IInsumos | null>(null);
  const [mostrarAlarmaStock, setMostrarAlarmaStock] = useState(false);
  const [insumoResaltado, setInsumoResaltado] = useState<number | null>(null);

  const filaResaltadaRef = useRef<HTMLTableRowElement>(null);

  // --- API Base URL ---
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Helpers Estado ---
  const getEstado = (i: any): boolean => !!(i?.Estado ?? i?.estado ?? false);
  const setEstadoKey = (obj: any, value: boolean) => {
    if ("Estado" in obj) obj.Estado = value;
    else if ("estado" in obj) obj.estado = value;
    else obj.Estado = value;
    return obj;
  };

  // Filtrar insumos con stock bajo
  const insumosStockBajo = insumos.filter(
    (i) => getEstado(i) && i.Cantidad <= STOCK_MINIMO
  );

  // --- Cargar insumos y categorías ---
  useEffect(() => {
    obtenerInsumos();
    obtenerCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para hacer scroll al insumo resaltado (solo vertical)
  useEffect(() => {
    if (insumoResaltado && filaResaltadaRef.current) {
      filaResaltadaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest", // 👈 Evita scroll horizontal
      });

      const timer = setTimeout(() => {
        setInsumoResaltado(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [insumoResaltado, paginaActual]);

  const obtenerInsumos = async () => {
    try {
      const resp = await fetch(buildUrl("Insumos/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: IInsumos[] = await resp.json();
      setInsumos(
        Array.isArray(data)
          ? data.sort((a, b) => (b.IdInsumo ?? 0) - (a.IdInsumo ?? 0))
          : []
      );
    } catch (err) {
      console.error("obtenerInsumos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los insumos.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  const obtenerCategorias = async () => {
    try {
      const resp = await fetch(buildUrl("Categoria_Insumos/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ICatInsumos[] = await resp.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("obtenerCategorias:", err);
    }
  };

  // --- Eliminar insumo ---
  const handleEliminarInsumo = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Insumo activo",
        text: "No puedes eliminar un insumo activo. Desactívalo primero.",
        confirmButtonColor: "#e83e8c",
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
          const resp = await fetch(buildUrl(`Insumos/Eliminar/${id}`), {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          setInsumos((prev) => prev.filter((i) => i.IdInsumo !== id));
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El insumo ha sido eliminado correctamente",
            timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
          });
        } catch (err) {
          console.error("eliminarInsumo:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el insumo.Esta Asociado a alguna Compra o Produccion",
            confirmButtonColor: "#e83e8c",
          });
        }
      }
    });
  };

  // --- Cambiar estado ---
  const handleEstadoChange = async (id: number) => {
    const target = insumos.find((i) => i.IdInsumo === id);
    if (!target) return;

    if (getEstado(target) && target.Cantidad > 0) {
      Swal.fire({
        icon: "warning",
        title: "No permitido",
        text: "No puedes desactivar un insumo que aún tiene existencias.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    const current = getEstado(target);
    const actualizado = setEstadoKey({ ...target } as any, !current) as IInsumos;

    setInsumos((prev) =>
      prev.map((i) => (i.IdInsumo === id ? actualizado : i))
    );

    try {
      const resp = await fetch(buildUrl(`Insumos/Actualizar/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await obtenerInsumos();

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Estado actualizado correctamente",
       timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      });

    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del insumo.",
        confirmButtonColor: "#e83e8c",
      });
      setInsumos((prev) =>
        prev.map((i) => (i.IdInsumo === id ? target : i))
      );
    }
  };

  // --- Abrir modales ---
  const handleEditarInsumo = (insumo: IInsumos) => {
    setInsumoEditar(insumo);
    setMostrarEditarModal(true);
  };

  const handleVerInsumo = (insumo: IInsumos) => {
    setInsumoVer(insumo);
    setMostrarVerModal(true);
  };

  // Navegar al insumo desde la alarma
  const handleNavegarAInsumo = (insumoId: number) => {
    const indiceInsumo = insumosFiltrados.findIndex((i) => i.IdInsumo === insumoId);

    if (indiceInsumo !== -1) {
      const paginaInsumo = Math.floor(indiceInsumo / INSUMOS_POR_PAGINA) + 1;
      setPaginaActual(paginaInsumo);
      setInsumoResaltado(insumoId);
      setMostrarAlarmaStock(false);
    }
  };

  // --- Filtro búsqueda ---
  const insumosFiltrados = insumos.filter((i) => {
    const nombre = (i.Nombre ?? "").toString();
    const categoriaNombre =
      categorias.find((c) => c.IdCatInsumo === i.IdCatInsumo)?.NombreCategoria ||
      "";
    const cantidad = (i.Cantidad ?? "").toString();
    const precio = (i.PrecioUnitario ?? "").toString();

    return (
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      categoriaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cantidad.includes(busqueda) ||
      precio.includes(busqueda)
    );
  });

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * INSUMOS_POR_PAGINA;
  const insumosPagina = insumosFiltrados.slice(
    indexInicio,
    indexInicio + INSUMOS_POR_PAGINA
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(insumosFiltrados.length / INSUMOS_POR_PAGINA)
  );

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Insumos Registrados</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Insumo
        </button>
      </div>

      {/* 👇 Sección de alertas y búsqueda */}
      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3 filtros-container">
        {/* Botón de alarma de stock bajo */}
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
            {insumosStockBajo.length > 0 && (
              <span
                className="badge bg-danger"
                style={{
                  marginLeft: "8px",
                  borderRadius: "50%",
                  padding: "4px 8px",
                }}
              >
                {insumosStockBajo.length}
              </span>
            )}
          </button>

          {/* Modal de alarma de stock */}
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
                  ⚠ Insumos con Stock Bajo
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
                {insumosStockBajo.length === 0 ? (
                  <p style={{ margin: "12px", color: "#28a745", textAlign: "center" }}>
                    ✓ Todos los insumos tienen stock suficiente
                  </p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {insumosStockBajo.map((insumo) => {
                      const categoriaNombre =
                        categorias.find((c) => c.IdCatInsumo === insumo.IdCatInsumo)
                          ?.NombreCategoria || "Sin categoría";

                      return (
                        <li
                          key={insumo.IdInsumo}
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
                          onClick={() => {
                            if (typeof insumo.IdInsumo === "number") {
                              handleNavegarAInsumo(insumo.IdInsumo);
                            }
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                              <strong style={{ color: "#333" }}>
                                {insumo.Nombre}
                              </strong>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {categoriaNombre}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", marginLeft: "12px" }}>
                              <div
                                style={{
                                  color: insumo.Cantidad === 0 ? "#dc3545" : "#ff6b6b",
                                  fontWeight: "bold",
                                  fontSize: "16px",
                                }}
                              >
                                {insumo.Cantidad}
                              </div>
                              <div style={{ fontSize: "11px", color: "#999" }}>
                                unidades
                              </div>
                            </div>
                            <div style={{ marginLeft: "8px", color: "#dc3545", fontWeight: "bold" }}>
                              →
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {insumosStockBajo.length > 0 && (
                  <div style={{ 
                    padding: "12px", 
                    fontSize: "12px", 
                    color: "#666", 
                    textAlign: "center",
                    borderTop: "1px solid #f0f0f0",
                    marginTop: "8px"
                  }}>
                    💡 Haz clic en un insumo para verlo en la tabla
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="🔍 Buscar por Nombre o Categoría"
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
            {insumosPagina.map((i, index) => {
              const categoriaNombre =
                categorias.find((c) => c.IdCatInsumo === i.IdCatInsumo)
                  ?.NombreCategoria || "Sin categoría";

              const esResaltado = i.IdInsumo === insumoResaltado;

              return (
                <tr
                  key={i.IdInsumo}
                  ref={esResaltado ? filaResaltadaRef : null}
                  className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                  style={{
                    backgroundColor: esResaltado ? "#ffe6e6" : undefined,
                    border: esResaltado ? "2px solid #dc3545" : undefined,
                    transition: "all 0.3s ease",
                    boxShadow: esResaltado ? "0 4px 12px rgba(220, 53, 69, 0.3)" : undefined,
                  }}
                >
                  <td>
                    {i.Nombre}
                    {esResaltado && (
                      <span style={{ marginLeft: "8px", color: "#dc3545", fontSize: "18px" }}>
                        👈
                      </span>
                    )}
                  </td>
                  <td>{categoriaNombre}</td>
                  <td>
                    {i.Cantidad}
                    {getEstado(i) && i.Cantidad <= STOCK_MINIMO && (
                      <FaExclamationTriangle
                        style={{
                          color: i.Cantidad === 0 ? "#dc3545" : "#ff6b6b",
                          marginLeft: "8px",
                        }}
                        title="Stock bajo"
                      />
                    )}
                  </td>
                  <td>
                    {Number(i.PrecioUnitario).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={getEstado(i)}
                        onChange={() =>
                          typeof i.IdInsumo === "number" &&
                          handleEstadoChange(i.IdInsumo)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <FaEye
                      className="icono text-info"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleVerInsumo(i)}
                    />
                    <FaEdit
                      className="icono text-warning"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleEditarInsumo(i)}
                    />
                    <FaTrash
                      className="icono text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        typeof i.IdInsumo === "number" &&
                        handleEliminarInsumo(i.IdInsumo, getEstado(i))
                      }
                    />
                  </td>
                </tr>
              );
            })}
            {insumosPagina.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay insumos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

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

      {/* Crear */}
      {mostrarModal && (
        <CrearInsumoModal
          insumos={insumos}
          onClose={() => setMostrarModal(false)}
          onCrear={async () => {
            await obtenerInsumos();
            setPaginaActual(1);
            setMostrarModal(false);
          }}
        />
      )}

      {/* Editar */}
      {mostrarEditarModal && insumoEditar && (
        <EditarInsumoModal
          insumos={insumos}
          insumo={insumoEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={async () => {
            await obtenerInsumos();
            setMostrarEditarModal(false);
          }}
        />
      )}

      {/* Ver */}
      {mostrarVerModal && insumoVer && typeof insumoVer.IdInsumo === "number" && (
        <VisualizarInsumoModal insumo={insumoVer} onClose={() => setMostrarVerModal(false)} />
      )}
    </div>
  );
};

export default ListarInsumos;