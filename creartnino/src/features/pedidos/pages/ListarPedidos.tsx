import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaFilePdf ,FaBan  } from 'react-icons/fa';

// import CrearProductoModal from "./NuevoProducto";
// import EditarProductoModal from "./Editar";
// import VerProductoModal from './Ver'; // 👈 Nuevo import

interface Pedidos {
  IdPedido: number;
  IdCliente: string | number; // Cambiado a string | number para permitir tanto números como cadenas
  MetodoPago: string;
  FechaPedido: string;
  FechaEntrega: string;
  Descripcion: string;
  ValorInicial: number;
  ValorRestante: number;
  ComprobantePago: string;
  TotalPedido: number;
  Estado: string;
}

const pedidosiniciales: Pedidos[] = [
  { IdPedido: 601, IdCliente: 'Lucas', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-01', FechaEntrega: '2025-05-05', Descripcion: 'Pedido de productos categoría 1', ValorInicial: 20000, ValorRestante: 100000, ComprobantePago: 'comprobante201.jpg', TotalPedido: 120000, Estado: 'Pendiente' },
  { IdPedido: 602, IdCliente: 'Marta', MetodoPago: 'Efectivo', FechaPedido: '2025-05-02', FechaEntrega: '2025-05-06', Descripcion: 'Pedido de productos categoría 2', ValorInicial: 10000, ValorRestante: 200000, ComprobantePago: 'comprobante202.jpg', TotalPedido: 200000, Estado: 'Pagado' },
  { IdPedido: 603, IdCliente: 'Mario', MetodoPago: 'Transferencia', FechaPedido: '2025-05-03', FechaEntrega: '2025-05-07', Descripcion: 'Pedido de productos categoría 3', ValorInicial: 5000, ValorRestante: 145000, ComprobantePago: 'comprobante203.jpg', TotalPedido: 150000, Estado: 'Parcial' },
  { IdPedido: 604, IdCliente: 'Laura', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-04', FechaEntrega: '2025-05-08', Descripcion: 'Pedido de productos categoría 4', ValorInicial: 12000, ValorRestante: 108000, ComprobantePago: 'comprobante204.jpg', TotalPedido: 120000, Estado: 'Pendiente' },
  { IdPedido: 605, IdCliente: 'Andres', MetodoPago: 'Efectivo', FechaPedido: '2025-05-05', FechaEntrega: '2025-05-09', Descripcion: 'Pedido de productos categoría 5', ValorInicial: 50000, ValorRestante: 180000, ComprobantePago: 'comprobante205.jpg', TotalPedido: 180000, Estado: 'Pagado' },
  { IdPedido: 606, IdCliente: 'Penelope', MetodoPago: 'Transferencia', FechaPedido: '2025-05-06', FechaEntrega: '2025-05-10', Descripcion: 'Pedido de productos categoría 6', ValorInicial: 4000, ValorRestante: 156000, ComprobantePago: 'comprobante206.jpg', TotalPedido: 160000, Estado: 'Parcial' },
  { IdPedido: 607, IdCliente: 'Juan', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-07', FechaEntrega: '2025-05-11', Descripcion: 'Pedido de productos categoría 7', ValorInicial: 30000, ValorRestante: 210000, ComprobantePago: 'comprobante207.jpg', TotalPedido: 210000, Estado: 'Pagado' },
  { IdPedido: 608, IdCliente: 'Angel', MetodoPago: 'Efectivo', FechaPedido: '2025-05-08', FechaEntrega: '2025-05-12', Descripcion: 'Pedido de productos categoría 8', ValorInicial: 13000, ValorRestante: 117000, ComprobantePago: 'comprobante208.jpg', TotalPedido: 130000, Estado: 'Pendiente' }
];


const ListarPedidos: React.FC = () => {
  const [productos, setProductos] = useState<Pedidos[]>(pedidosiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);


  const PedidosPorPagina = 6;

  const handleEliminarProducto = (id: number) => {
    

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, Anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setProductos(prev => prev.filter(p => p.IdPedido !== id));
        Swal.fire({
          icon: 'success',
          title: 'Anulado',
          text: 'El pedido ha sido Anulado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  // const handleEstadoChange = (id: number) => {
  //   setProductos(prev =>
  //     prev.map(p => (p.IdProducto === id ? { ...p, estado: !p.estado } : p))
  //   );
  // };

  

  

  const PedidosFiltrados = productos.filter(p =>
    `${p.IdPedido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * PedidosPorPagina;
  const indexFin = indexInicio + PedidosPorPagina;
  const pedidosPagina = PedidosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(PedidosFiltrados.length / PedidosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Pedidos</h2>
        <button className="btn btn-pink">Crear Pedido</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por ID del Pedido"
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

              <th>Id Cliente</th>
              <th>MetodoPago</th>
              <th>FechaEntrega</th>
              <th>ValorInicial</th>
              <th>TotalPedido</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.map((p, index) => (
              <tr key={p.IdPedido} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.IdCliente}</td>
                <td>{p.MetodoPago}</td>
                <td>{p.FechaEntrega}</td>
                <td>{p.ValorInicial}</td>
                <td>${p.TotalPedido}</td>
                <td>{p.Estado}</td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    // onClick={() => handleVerProducto(p)}
                  />
                  <FaBan
                    className="icono text-warning"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarProducto(p.IdPedido)}
                  />
                  <FaFilePdf
                    className="icono text-danger"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    // onClick={() => handleEditarProducto(p)}
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

      
    </div>
  );
};

export default ListarPedidos;
