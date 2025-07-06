import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import CrearCategoriaModal from "./CrearCatProductos";
import EditarCategoriaProductoModal from "./EditarCatProductos";
import VerCategoriaModal from './VerCatProductos';

interface CategoriaProductos {
  IdCategoriaProducto: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}

const categoriasIniciales: CategoriaProductos[] = [
  { IdCategoriaProducto: 401, Nombre: 'Tazas', Descripcion: 'Productos de tecnología y electrónicos', Estado: true },
  { IdCategoriaProducto: 402, Nombre: 'Toppers', Descripcion: 'Ropa y accesorios para todas las edades', Estado: false },
  { IdCategoriaProducto: 403, Nombre: 'Pesebres', Descripcion: 'Alimentos y bebidas de consumo diario', Estado: true },
  { IdCategoriaProducto: 404, Nombre: 'Camisas', Descripcion: 'Artículos para el hogar y decoración', Estado: true },
  { IdCategoriaProducto: 405, Nombre: 'Luminosos', Descripcion: 'Productos de cuidado personal y belleza', Estado: false },
  { IdCategoriaProducto: 406, Nombre: 'Busos', Descripcion: 'Juguetes y juegos para niños y adultos', Estado: true },
  { IdCategoriaProducto: 407, Nombre: 'Etiquetas', Descripcion: 'Herramientas y equipos para bricolaje', Estado: false },
  { IdCategoriaProducto: 408, Nombre: 'Stikers', Descripcion: 'Libros, música y material educativo', Estado: false },
];

const ListarCatProductos: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaProductos[]>(categoriasIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaProductos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [categoriaVer, setCategoriaVer] = useState<CategoriaProductos | null>(null);

  const categoriasPorPagina = 6;

  const handleEliminarCategoria = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: 'warning',
        title: 'Categoría activa',
        text: 'No puedes eliminar una categoría que está activa. Desactívala primero.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setCategorias(prev => prev.filter(c => c.IdCategoriaProducto !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La categoría ha sido eliminada correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleEstadoChange = (id: number) => {
    setCategorias(prev =>
      prev.map(c => (c.IdCategoriaProducto === id ? { ...c, Estado: !c.Estado } : c))
    );
  };

  const handleCrear = (nuevaCategoria: CategoriaProductos) => {
    setCategorias(prev => [...prev, nuevaCategoria]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Categoría creada correctamente',
      confirmButtonColor: '#f78fb3',
    });
  };

  const handleEditarCategoria = (categoria: CategoriaProductos) => {
    setCategoriaEditar(categoria);
    setMostrarEditarModal(true);
  };

  const handleActualizarCategoria = (categoriaActualizada: CategoriaProductos) => {
    setCategorias(prev =>
      prev.map(c => (c.IdCategoriaProducto === categoriaActualizada.IdCategoriaProducto ? categoriaActualizada : c))
    );
    setMostrarEditarModal(false);
  };

  const handleVerCategoria = (categoria: CategoriaProductos) => {
    setCategoriaVer(categoria);
    setMostrarVerModal(true);
  };

  const categoriasFiltradas = categorias.filter(c =>
  c.Nombre.toLowerCase().startsWith(busqueda.toLowerCase())||
  c.Descripcion.toLowerCase().startsWith(busqueda.toLowerCase())
);

  const indexInicio = (paginaActual - 1) * categoriasPorPagina;
  const indexFin = indexInicio + categoriasPorPagina;
  const categoriasPagina = categoriasFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Categorías de Productos</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Categoría</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre de categoría"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={e => {
          setBusqueda(e.target.value);
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
              <tr key={c.IdCategoriaProducto} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{c.Nombre}</td>
                <td>{c.Descripcion}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.Estado}
                      onChange={() => handleEstadoChange(c.IdCategoriaProducto)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerCategoria(c)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarCategoria(c)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarCategoria(c.IdCategoriaProducto, c.Estado)}
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
              className={`btn me-2 ${paginaActual === i + 1 ? 'btn-pink' : 'btn-light'}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {mostrarModal && (
        <CrearCategoriaModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
        />
      )}

      {mostrarEditarModal && categoriaEditar && (
        <EditarCategoriaProductoModal
          categoria={categoriaEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarCategoria}
        />
      )}

      {mostrarVerModal && categoriaVer && (
        <VerCategoriaModal
          catproducto={categoriaVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarCatProductos;
