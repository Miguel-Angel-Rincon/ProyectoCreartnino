    import { useState } from "react";
    import '../styles/ListarInsumos.css';
    import Swal from 'sweetalert2';
    import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

    import CrearInsumoModal from "./CrearInsumo";
    import EditarInsumoModal from "./EditarInsumo";
    import VisualizarInsumoModal from './VisualizarInsumo'; // 👈 Nuevo import

interface Insumos {
    IdInsumos: number;
    IdCatInsumo: string;
    Nombre: string;
    Descripcion: string;
    marca: string;
    cantidad: number;
    precioUnitario: number;
    estado: boolean;
}

const insumosiniciales: Insumos[] = [
    { IdInsumos: 401, IdCatInsumo: 'Papel', Nombre: 'Cartulina Iris', Descripcion: 'Cartulina de colores surtidos, ideal para manualidades escolares.', marca: 'Artel', cantidad: 10, precioUnitario: 10000, estado: false },
    { IdInsumos: 402, IdCatInsumo: 'Pintura', Nombre: 'Acrílicos Neon', Descripcion: 'Set de pinturas acrílicas neón de alta cobertura.', marca: 'Acuarel', cantidad: 20, precioUnitario: 20000, estado: true },
    { IdInsumos: 403, IdCatInsumo: 'Pegantes', Nombre: 'Colbón Escolar', Descripcion: 'Pegante blanco no tóxico para uso escolar.', marca: 'Pritt', cantidad: 15, precioUnitario: 15000, estado: true },
    { IdInsumos: 404, IdCatInsumo: 'Herramientas', Nombre: 'Tijeras Punta Roma', Descripcion: 'Tijeras de seguridad con punta redondeada para niños.', marca: 'Faber-Castell', cantidad: 5, precioUnitario: 12000, estado: false },
    { IdInsumos: 405, IdCatInsumo: 'Papel', Nombre: 'Papel Crepé', Descripcion: 'Rollo de papel crepé para decoración y manualidades.', marca: 'Vinifan', cantidad: 8, precioUnitario: 18000, estado: true },
    { IdInsumos: 406, IdCatInsumo: 'Decoración', Nombre: 'Foamy Brillante', Descripcion: 'Láminas de foamy con escarcha, fáciles de cortar.', marca: 'Artístico', cantidad: 12, precioUnitario: 16000, estado: false },
    { IdInsumos: 407, IdCatInsumo: 'Pintura', Nombre: 'Temperas Surtidas', Descripcion: 'Set de témperas escolares colores básicos.', marca: 'Pelikan', cantidad: 18, precioUnitario: 21000, estado: true },
    { IdInsumos: 408, IdCatInsumo: 'Pegantes', Nombre: 'Silicona Líquida', Descripcion: 'Silicona líquida transparente de secado rápido.', marca: 'UHU', cantidad: 7, precioUnitario: 13000, estado: false },
];



    const ListarInsumos: React.FC = () => {
    const [insumos, setInsumos] = useState<Insumos[]>(insumosiniciales);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
    const [productoEditar, setProductoEditar] = useState<Insumos | null>(null);
    const [mostrarVerModal, setMostrarVerModal] = useState(false);
    const [productoVer, setProductoVer] = useState<Insumos | null>(null);

    const INSUMOS_POR_PAGINA = 6;

    const handleEliminarInsumo = (id: number, estado: boolean) => {
        if (estado) {
        Swal.fire({
            icon: 'warning',
            title: 'Insumo activo',
            text: 'No puedes eliminar un Insumo que está activo. Desactívalo primero.',
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
            setInsumos(prev => prev.filter(p => p.IdInsumos !== id));
            Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El insumo ha sido eliminado correctamente',
            confirmButtonColor: '#e83e8c',
            });
        }
        });
    };

    const handleEstadoChange = (id: number) => {
        setInsumos(prev =>
        prev.map(p => (p.IdInsumos === id ? { ...p, estado: !p.estado } : p))
        );
    };

    const handleCrear = (nuevoInsumo: Insumos) => {
        setInsumos(prev => [...prev, nuevoInsumo]);
        setMostrarModal(false);
        Swal.fire({
        icon: 'success',
        title: 'Insumo creado correctamente',
        confirmButtonColor: '#e83e8c',
        });
    };

    const handleEditarProducto = (producto: Insumos) => {
        setProductoEditar(producto);
        setMostrarEditarModal(true);
    };

    const handleActualizarProducto = (productoActualizado: Insumos) => {
        setInsumos(prev =>
        prev.map(p => (p.IdInsumos === productoActualizado.IdInsumos ? productoActualizado : p))
        );
        setMostrarEditarModal(false);
    };

    const handleVerProducto = (producto: Insumos) => {
        setProductoVer(producto);
        setMostrarVerModal(true);
    };

    const insumosFiltrados = insumos.filter(p =>
p.Nombre.toLowerCase().startsWith(busqueda.toLowerCase()) ||
p.IdCatInsumo.toLowerCase().startsWith(busqueda.toLowerCase()) ||
p.marca.toLowerCase().startsWith(busqueda.toLowerCase()) ||
p.cantidad.toString().includes(busqueda) ||
p.precioUnitario.toString().includes(busqueda)
);

    const indexInicio = (paginaActual - 1) * INSUMOS_POR_PAGINA;
    const indexFin = indexInicio + INSUMOS_POR_PAGINA;
    const productosPagina = insumosFiltrados.slice(indexInicio, indexFin);
    const totalPaginas = Math.ceil(insumosFiltrados.length / INSUMOS_POR_PAGINA);

    return (
        <div className="container-fluid main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="titulo">Insumos</h2>
            <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Insumo</button>
        </div>

        <input
            type="text"
            placeholder="Buscar por Nombre del insumo"
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
                
                <th>Marca</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {productosPagina.map((p, index) => (
                <tr key={p.IdInsumos} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                    <td>{p.Nombre}</td>
                    <td>{p.IdCatInsumo}</td>
                    
                    <td>{p.marca}</td>
                    <td>{p.cantidad}</td>
                    <td>{p.precioUnitario.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</td>
                    <td>
                    <label className="switch">
                        <input
                        type="checkbox"
                        checked={p.estado}
                        onChange={() => handleEstadoChange(p.IdInsumos)}
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
                        onClick={() => handleEliminarInsumo(p.IdInsumos, p.estado)}
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
            <CrearInsumoModal
            onClose={() => setMostrarModal(false)}
            onCrear={handleCrear}
            />
        )}

        {mostrarEditarModal && productoEditar && (
            <EditarInsumoModal
            insumo={productoEditar}
            onClose={() => setMostrarEditarModal(false)}
            onEditar={handleActualizarProducto}
            />
        )}

        {mostrarVerModal && productoVer && (
            <VisualizarInsumoModal
            insumo={productoVer}
            onClose={() => setMostrarVerModal(false)}
            />
        )}
        </div>
    );
    };

    export default ListarInsumos;
