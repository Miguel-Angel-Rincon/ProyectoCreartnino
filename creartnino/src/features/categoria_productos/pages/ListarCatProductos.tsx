// components/ListarCatProductos.tsx
import { useEffect, useState } from "react";
import "../styles/style.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import CrearCategoriaModal from "./CrearCatProductos";
import EditarCategoriaProductoModal from "./EditarCatProductos";
import VerProductoModal from "./VerCatProductos"; // 🔹 Actualizado

import type { ICatProductos } from "../../interfaces/ICatProductos";

const ListarCatProductos: React.FC = () => {
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<ICatProductos | null>(
    null
  );
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [categoriaVer, setCategoriaVer] = useState<ICatProductos | null>(null);

  const categoriasPorPagina = 6;

  // 🚀 Consumir API al cargar el componente
  const obtenerCategorias = async () => {
    try {
      const res = await fetch(
        "https://www.apicreartnino.somee.com/api/Categoria_Productos/Lista"
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setCategorias(
    data.sort((a, b) => (b.IdCategoriaProducto ?? 0) - (a.IdCategoriaProducto ?? 0))
  );
} else if (Array.isArray(data.data)) {
  setCategorias(
    data.data.sort((a: { IdCategoriaProducto: any; }, b: { IdCategoriaProducto: any; }) => (b.IdCategoriaProducto ?? 0) - (a.IdCategoriaProducto ?? 0))
  );
      } else {
        throw new Error("Formato inesperado en la API");
      }
    } catch (err) {
      console.error("Error al obtener categorías:", err);
      Swal.fire("Error", "No se pudieron cargar las categorías", "error");
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  // ✅ Eliminar categoría
  const handleEliminarCategoria = async (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Categoría activa",
        text: "No puedes eliminar una categoría que está activa. Desactívala primero.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const resp = await fetch(
          `https://www.apicreartnino.somee.com/api/Categoria_Productos/Eliminar/${id}`,
          { method: "DELETE" }
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "La categoría ha sido eliminada correctamente",
          timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
        });

        obtenerCategorias();
      } catch (err) {
        console.error("Error al eliminar:", err);
        Swal.fire("Error", "No se pudo eliminar la categoría", "error");
      }
    }
  };

  // ✅ Actualizar estado en la API
  const handleEstadoChange = async (id: number) => {
    const target = categorias.find((c) => c.IdCategoriaProducto === id);
    if (!target) return;

    // Si el estado actual es true (activo) y se va a desactivar, pedir confirmación
    if (target.Estado) {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción desactivará la categoría. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });
      if (!confirmacion.isConfirmed) return;
    }

    const actualizado = { ...target, Estado: !target.Estado };

    // Optimista: actualizar UI inmediatamente
    setCategorias((prev) =>
      prev.map((c) => (c.IdCategoriaProducto === id ? actualizado : c))
    );

    try {
      const resp = await fetch(
        `https://www.apicreartnino.somee.com/api/Categoria_Productos/Actualizar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado),
        }
      );
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
      console.error("Error al actualizar estado:", err);
      Swal.fire(
        "Error",
        "No se pudo actualizar el estado de la categoría",
        "error"
      );

      // Revertir cambio en UI si falla la petición
      setCategorias((prev) =>
        prev.map((c) => (c.IdCategoriaProducto === id ? target : c))
      );
    }
  };

  const handleCrear = () => {
    setMostrarModal(false);
    obtenerCategorias();
  };

  const handleEditarCategoria = (categoria: ICatProductos) => {
    setCategoriaEditar(categoria);
    setMostrarEditarModal(true);
  };

  const handleActualizarCategoria = () => {
    setMostrarEditarModal(false);
    obtenerCategorias();
  };

  const handleVerCategoria = (categoria: ICatProductos) => {
    setCategoriaVer(categoria);
    setMostrarVerModal(true);
  };

  // ✅ Filtro seguro
  const categoriasFiltradas = categorias.filter(
    (c) =>
      c.CategoriaProducto1?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * categoriasPorPagina;
  const indexFin = indexInicio + categoriasPorPagina;
  const categoriasPagina = categoriasFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(
    categoriasFiltradas.length / categoriasPorPagina
  );

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Categorías de Productos Registrados</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Categoría
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre o Descripción"
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
                key={c.IdCategoriaProducto}
                className={index % 2 === 0 ? "fila-par" : "fila-impar"}
              >
                <td>{c.CategoriaProducto1}</td>
                <td>{c.Descripcion}</td>
                <td>
  <label className="switch">
    <input
      type="checkbox"
      checked={c.Estado}
      onChange={() => {
        if (c.IdCategoriaProducto !== undefined) {
          handleEstadoChange(c.IdCategoriaProducto);
        }
      }}
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
  onClick={() => {
    if (c.IdCategoriaProducto !== undefined) {
      handleEliminarCategoria(c.IdCategoriaProducto, c.Estado);
    }
  }}
/>

                </td>
              </tr>
            ))}
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

      {/* Modal Crear */}
      {mostrarModal && (
        <CrearCategoriaModal
          categorias={categorias} // 👈 AQUI
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
        />
      )}

      {/* Modal Editar */}
      {mostrarEditarModal && categoriaEditar && (
        <EditarCategoriaProductoModal
          categorias={categorias} 
          categoria={categoriaEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarCategoria}
        />
      )}

      {/* Modal Ver */}
      {mostrarVerModal && categoriaVer && (
        <VerProductoModal
          catproducto={categoriaVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarCatProductos;
