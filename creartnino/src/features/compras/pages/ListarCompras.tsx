import { useState } from "react";
    import '../styles/style.css';
    import Swal from 'sweetalert2';
    import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';


    // import CrearProductoModal from "./NuevoProducto";
    // import EditarProductoModal from "./Editar";
    // import VerProductoModal from './Ver'; // 👈 Nuevo import

    interface Compras {
    IdCompra: number;
    IdProveedor: string | number; // Cambiado a string | number para permitir tanto números como cadenas
    MetodoPago: string;
    FechaCompra: string;
    TotalCompra: number;
    IdEstado: string;
    }

    const comprasIniciales: Compras[] = [
    { IdCompra: 601, IdProveedor: 'Lucas', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-01', TotalCompra: 120000, IdEstado: 'Anulado' },
    { IdCompra: 602, IdProveedor: 'Marta', MetodoPago: 'Efectivo', FechaCompra: '2025-05-02', TotalCompra: 200000, IdEstado: 'En proceso' },
    { IdCompra: 603, IdProveedor: 'Mario', MetodoPago: 'Transferencia', FechaCompra: '2025-05-03', TotalCompra: 150000, IdEstado: 'En proceso' },
    { IdCompra: 604, IdProveedor: 'Laura', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-04', TotalCompra: 120000, IdEstado: 'Completado' },
    { IdCompra: 605, IdProveedor: 'Andres', MetodoPago: 'Efectivo', FechaCompra: '2025-05-05', TotalCompra: 180000, IdEstado: 'Completado' },
    { IdCompra: 606, IdProveedor: 'Penelope', MetodoPago: 'Transferencia', FechaCompra: '2025-05-06', TotalCompra: 160000, IdEstado: 'Anulado' },
    { IdCompra: 607, IdProveedor: 'Juan', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-07', TotalCompra: 210000, IdEstado: 'En proceso' },
    { IdCompra: 608, IdProveedor: 'Angel', MetodoPago: 'Efectivo', FechaCompra: '2025-05-08', TotalCompra: 130000, IdEstado: 'Completado' }
    ];



    const ListarCompras: React.FC = () => {
    const [Compras, setCompras] = useState<Compras[]>(comprasIniciales);
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
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        }).then((result) => {
        if (result.isConfirmed) {
            setCompras(prev => prev.filter(p => p.IdCompra !== id));
            Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto ha sido eliminado correctamente',
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
    

    const PedidosFiltrados = Compras.filter(p =>
        p.IdCompra.toString().toLowerCase().includes(busqueda.toLowerCase())
    );

    const indexInicio = (paginaActual - 1) * PedidosPorPagina;
    const indexFin = indexInicio + PedidosPorPagina;
    const comprasPagina = PedidosFiltrados.slice(indexInicio, indexFin);
    const totalPaginas = Math.ceil(PedidosFiltrados.length / PedidosPorPagina);

    return (
        <div className="container-fluid main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="titulo">Compras</h2>
            <button className="btn btn-pink">Crear Compra</button>
        </div>

        <input
            type="text"
            placeholder="Buscar por ID de la compra"
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
                <th>Id Proveedor</th>
                <th>Metodo Pago</th>
                <th>Fecha de Compra</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {comprasPagina.map((p, index) => (
                <tr key={p.IdCompra} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                    <td>{p.IdProveedor}</td>
                    <td>{p.MetodoPago}</td>
                    <td>{p.FechaCompra}</td>
                    <td>${p.TotalCompra}</td>
                    <td>{p.IdEstado}</td>
                    <td>
                    <FaEye
                        className="icono text-info"
                        style={{ cursor: 'pointer', marginRight: '10px' }}
                        // onClick={() => handleVerProducto(p)}
                    />
                    <FaEdit
                        className="icono text-warning"
                        style={{ cursor: 'pointer', marginRight: '10px' }}
                        // onClick={() => handleEditarProducto(p)}
                    />
                    <FaTrash
                        className="icono text-danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEliminarProducto(p.IdCompra)}
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

    export default ListarCompras;