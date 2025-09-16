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
        setCategorias(data);
      } else if (Array.isArray(data.data)) {
        setCategorias(data.data);
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
          confirmButtonColor: "#e83e8c",
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

    const actualizado = { ...target, Estado: !target.Estado };

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
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      Swal.fire(
        "Error",
        "No se pudo actualizar el estado de la categoría",
        "error"
      );

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
        <h2 className="titulo">Categorías de Productos</h2>
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

        <div className="paginacion text-end">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={`btn me-2 ${
                paginaActual === i + 1 ? "btn-pink" : "btn-light"
              }`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Crear */}
      {mostrarModal && (
        <CrearCategoriaModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
        />
      )}

      {/* Modal Editar */}
      {mostrarEditarModal && categoriaEditar && (
        <EditarCategoriaProductoModal
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
