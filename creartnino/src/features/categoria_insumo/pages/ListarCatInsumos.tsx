// src/components/ListarCatInsumos.tsx
import React, { useEffect, useState } from "react";
import "../styles/style.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import CrearCategoriaModal from "./Crear";
import EditarICatInsumosModal from "./Editar";
import VerInsumoModal from "./Ver";

import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";

const categoriasPorPagina = 6;

const ListarCatInsumos: React.FC = () => {
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<ICatInsumos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [categoriaVer, setCategoriaVer] = useState<ICatInsumos | null>(null);
  

  // --- Construcción de URL base ---
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Cargar categorías al inicio ---
  useEffect(() => {
    obtenerCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerCategorias = async () => {
    try {
      const resp = await fetch(buildUrl("Categoria_Insumos/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ICatInsumos[] = await resp.json();
      setCategorias(
  Array.isArray(data)
    ? data.sort((a, b) => (b.IdCatInsumo ?? 0) - (a.IdCatInsumo ?? 0))
    : []
);

    } catch (err) {
      console.error("obtenerCategorias:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las categorías.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  // --- Eliminar categoría ---
  const handleEliminarCategoria = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Categoría activa",
        text: "No puedes eliminar una categoría activa. Desactívala primero.",
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
          const resp = await fetch(buildUrl(`Categoria_Insumos/Eliminar/${id}`), {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          setCategorias((prev) => prev.filter((c) => c.IdCatInsumo !== id));
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "La categoría ha sido eliminada correctamente",
            timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false, 
          });
        } catch (err) {
          console.error("eliminarCategoria:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar la categoría. Esta Asociada a insumos.",
            confirmButtonColor: "#e83e8c",
          });
        }
      }
    });
  };

  // --- Cambiar estado ---
  const handleEstadoChange = async (id: number) => {
    const target = categorias.find((c) => c.IdCatInsumo === id);
    if (!target) return;

    const actualizado = { ...target, Estado: !target.Estado };

    // Optimista en UI
    setCategorias((prev) =>
      prev.map((c) => (c.IdCatInsumo === id ? actualizado : c))
    );

    try {
      const resp = await fetch(buildUrl(`Categoria_Insumos/Actualizar/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await obtenerCategorias();

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `Estado actualizado correctamente`,
        timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false, 

      });

    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado de la categoría.",
        confirmButtonColor: "#e83e8c",
      });
      setCategorias((prev) =>
        prev.map((c) => (c.IdCatInsumo === id ? target : c))
      );
    }
  };

  // --- Abrir modales ---
  const handleEditarCategoria = (categoria: ICatInsumos) => {
    setCategoriaEditar(categoria);
    setMostrarEditarModal(true);
  };

  const handleVerCategoria = (categoria: ICatInsumos) => {
    setCategoriaVer(categoria);
    setMostrarVerModal(true);
  };

  // --- Filtro búsqueda ---
  const categoriasFiltradas = categorias.filter((c) => {
    return (
      String(c.Nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
      String(c.Descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * categoriasPorPagina;
  const categoriasPagina = categoriasFiltradas.slice(
    indexInicio,
    indexInicio + categoriasPorPagina
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(categoriasFiltradas.length / categoriasPorPagina)
  );

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Categorías de Insumos Registradas</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Categoría
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o descripción"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
          setPaginaActual(1);
        }}
      />

      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasPagina.map((c, index) => (
              <tr
                key={c.IdCatInsumo}
                className={index % 2 === 0 ? "fila-par" : "fila-impar"}
              >
                <td>{c.NombreCategoria}</td>
                <td>{c.Descripcion}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.Estado}
                      onChange={() =>
                        typeof c.IdCatInsumo === "number" &&
                        handleEstadoChange(c.IdCatInsumo)
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleVerCategoria(c)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEditarCategoria(c)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      typeof c.IdCatInsumo === "number" &&
                      handleEliminarCategoria(c.IdCatInsumo, c.Estado)
                    }
                  />
                </td>
              </tr>
            ))}
            {categoriasPagina.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  No hay categorías registradas
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
        <CrearCategoriaModal
          onClose={() => setMostrarModal(false)}
          categorias={categorias}
          onCrear={async (nuevaCategoria: any) => {
            try {
              if (nuevaCategoria && nuevaCategoria.IdCategoriaInsumo) {
                setCategorias((prev) => [...prev, nuevaCategoria]);
              } else {
                await obtenerCategorias();
              }
              setMostrarModal(false);
              
            } catch (err) {
              console.error("onCrear:", err);
            }
          }}
        />
      )}

      {/* Editar */}
      {mostrarEditarModal && categoriaEditar && (
        <EditarICatInsumosModal
          categoria={categoriaEditar}
          categorias={categorias}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={async (categoriaActualizada: any) => {
            try {
              if (categoriaActualizada && categoriaActualizada.IdCategoriaInsumo) {
                setCategorias((prev) =>
                  prev.map((c) =>
                    c.IdCatInsumo === categoriaActualizada.IdCategoriaInsumo
                      ? categoriaActualizada
                      : c
                  )
                );
              } else {
                await obtenerCategorias();
              }
              setMostrarEditarModal(false);
              
            } catch (err) {
              console.error("onEditar:", err);
            }
          }}
        />
      )}

      {/* Ver */}
      {mostrarVerModal && categoriaVer && (
        <VerInsumoModal
          catinsumo={categoriaVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarCatInsumos;
