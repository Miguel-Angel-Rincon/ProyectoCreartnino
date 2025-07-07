import { useState } from "react";
import '../styles/ListarProductos.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import CrearProductoModal from "./NuevoProducto";
import EditarProductoModal from "./Editar";
import VerProductoModal from './Ver';

interface Productos {
  IdProducto: number;
  IdCatProductos: string;
  Nombre: string;
  Imagen: string;
  cantidad: number;
  marca: string;
  precio: number;
  estado: boolean;
}

const productosiniciales: Productos[] = [
  { IdProducto: 201, IdCatProductos: 'Categoria1', Nombre: 'producto1', Imagen: 'img1.jpg', cantidad: 10, marca: 'Creartnino', precio: 10000, estado: false },
  { IdProducto: 202, IdCatProductos: 'Categoria2', Nombre: 'producto2', Imagen: 'img2.jpg', cantidad: 20, marca: 'Creartnino', precio: 20000, estado: true },
  { IdProducto: 203, IdCatProductos: 'Categoria3', Nombre: 'producto3', Imagen: 'img3.jpg', cantidad: 15, marca: 'Creartnino', precio: 15000, estado: true },
  { IdProducto: 204, IdCatProductos: 'Categoria4', Nombre: 'producto4', Imagen: 'img4.jpg', cantidad: 5, marca: 'Creartnino', precio: 12000, estado: false },
  { IdProducto: 205, IdCatProductos: 'Categoria5', Nombre: 'producto5', Imagen: 'img5.jpg', cantidad: 8, marca: 'Creartnino', precio: 18000, estado: true },
  { IdProducto: 206, IdCatProductos: 'Categoria6', Nombre: 'producto6', Imagen: 'img6.jpg', cantidad: 12, marca: 'Creartnino', precio: 16000, estado: false },
  { IdProducto: 207, IdCatProductos: 'Categoria7', Nombre: 'producto7', Imagen: 'img7.jpg', cantidad: 18, marca: 'Creartnino', precio: 21000, estado: true },
  { IdProducto: 208, IdCatProductos: 'Categoria8', Nombre: 'producto8', Imagen: 'img8.jpg', cantidad: 7, marca: 'Creartnino', precio: 13000, estado: false },
];

const ListarProductos: React.FC = () => {
  const [productos, setProductos] = useState<Productos[]>(productosiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Productos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [productoVer, setProductoVer] = useState<Productos | null>(null);

  const productosPorPagina = 6;

  const handleEliminarProducto = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto activo',
        text: 'No puedes eliminar un producto que está activo. Desactívalo primero.',
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
        setProductos(prev => prev.filter(p => p.IdProducto !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El producto ha sido eliminado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleEstadoChange = (id: number) => {
    setProductos(prev =>
      prev.map(p => {
        if (p.IdProducto === id) {
          if (p.estado && p.cantidad > 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No se puede desactivar',
              text: 'No puedes desactivar un producto que aún tiene existencias.',
              confirmButtonColor: '#e83e8c',
            });
            return p;
          }
          return { ...p, estado: !p.estado };
        }
        return p;
      })
    );
  };

  const handleCrear = (nuevoProducto: Productos) => {
    setProductos(prev => [nuevoProducto, ...prev]); // ✅ Insertar al principio
    setPaginaActual(1); // ✅ Volver a la primera página
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Producto creado correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const handleEditarProducto = (producto: Productos) => {
    setProductoEditar(producto);
    setMostrarEditarModal(true);
  };

  const handleActualizarProducto = (productoActualizado: Productos) => {
    setProductos(prev =>
      prev.map(p => (p.IdProducto === productoActualizado.IdProducto ? productoActualizado : p))
    );
    setMostrarEditarModal(false);
  };

  const handleVerProducto = (producto: Productos) => {
    setProductoVer(producto);
    setMostrarVerModal(true);
  };

  const productosFiltrados = productos.filter(p =>
    p.Nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cantidad.toString().includes(busqueda) ||
    p.IdCatProductos.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.precio.toString().includes(busqueda)
  );

  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Productos</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Producto</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del producto"
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
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p, index) => (
              <tr key={p.IdProducto} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.Nombre}</td>
                <td>{p.IdCatProductos}</td>
                <td>{p.cantidad}</td>
                <td>${p.precio.toLocaleString('es-CO')}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={p.estado}
                      onChange={() => handleEstadoChange(p.IdProducto)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerProducto(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarProducto(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarProducto(p.IdProducto, p.estado)}
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
        <CrearProductoModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
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
        <VerProductoModal
          producto={productoVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarProductos;
