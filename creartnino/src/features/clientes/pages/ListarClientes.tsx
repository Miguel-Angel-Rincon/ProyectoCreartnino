import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import CrearClienteModal from "./Crear";
import EditarClienteModal from "./Editar";
import VerClienteModal from './Ver'; // 👈 Asegúrate de tener este componente

interface Clientes {
  IdClientes: number;
  Nombre: string;
  Apellido: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Correo: string;
  Celular: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  Barrio: string;
  estado: boolean;
}

const clientesiniciales: Clientes[] = [
  { IdClientes: 1, Nombre: 'Juan', Apellido: 'Pérez', Tipodocumento: 'CC', Numerodocumento: '1010101010', Correo: 'juan.perez@example.com', Celular: '3001234567', Departamento: 'Antioquia', Ciudad: 'Medellín', Direccion: 'Calle 123 #45-67', Barrio: 'San Fernando', estado: true },
  { IdClientes: 2, Nombre: 'María', Apellido: 'Gómez', Tipodocumento: 'TI', Numerodocumento: '1020304050', Correo: 'maria.gomez@example.com', Celular: '3007654321', Departamento: 'Cundinamarca', Ciudad: 'Bogotá', Direccion: 'Carrera 10 #20-30', Barrio: 'La Floresta', estado: true },
  { IdClientes: 3, Nombre: 'Carlos', Apellido: 'Ramirez', Tipodocumento: 'CC', Numerodocumento: '1122334455', Correo: 'carlos.ramirez@example.com', Celular: '3012345678', Departamento: 'Valle del Cauca', Ciudad: 'Cali', Direccion: 'Av. Siempre Viva 742', Barrio: 'Centro', estado: false },
  { IdClientes: 4, Nombre: 'Laura', Apellido: 'Martínez', Tipodocumento: 'CE', Numerodocumento: '5566778899', Correo: 'laura.martinez@example.com', Celular: '3023456789', Departamento: 'Antioquia', Ciudad: 'Medellín', Direccion: 'Calle 50 #10-20', Barrio: 'El Poblado', estado: true },
  { IdClientes: 5, Nombre: 'Andrés', Apellido: 'López', Tipodocumento: 'CC', Numerodocumento: '9988776655', Correo: 'andres.lopez@example.com', Celular: '3034567890', Departamento: 'Atlántico', Ciudad: 'Barranquilla', Direccion: 'Diagonal 60 #30-40', Barrio: 'Los Álamos', estado: false },
  { IdClientes: 6, Nombre: 'Sofía', Apellido: 'Torres', Tipodocumento: 'TI', Numerodocumento: '3344556677', Correo: 'sofia.torres@example.com', Celular: '3045678901', Departamento: 'Santander', Ciudad: 'Bucaramanga', Direccion: 'Transversal 80 #40-50', Barrio: 'Villa Hermosa', estado: true },
  { IdClientes: 7, Nombre: 'Miguel', Apellido: 'Salazar', Tipodocumento: 'CC', Numerodocumento: '7788990011', Correo: 'miguel.salazar@example.com', Celular: '3056789012', Departamento: 'Tolima', Ciudad: 'Ibagué', Direccion: 'Calle 70 #30-31', Barrio: 'Boston', estado: true },
  { IdClientes: 8, Nombre: 'Valentina', Apellido: 'Ríos', Tipodocumento: 'CE', Numerodocumento: '4455667788', Correo: 'valentina.rios@example.com', Celular: '3067890123', Departamento: 'Risaralda', Ciudad: 'Pereira', Direccion: 'Carrera 25 #15-16', Barrio: 'La América', estado: false }
];

const ListarClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Clientes[]>(clientesiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Clientes | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [clienteVer, setClienteVer] = useState<Clientes | null>(null);

  const clientesPorPagina = 6;

  const handleEliminarCliente = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: 'warning',
        title: 'Cliente activo',
        text: 'No puedes eliminar un cliente activo. Desactívalo primero.',
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
        setClientes(prev => prev.filter(c => c.IdClientes !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El cliente ha sido eliminado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleEstadoChange = (id: number) => {
    setClientes(prev =>
      prev.map(c => (c.IdClientes === id ? { ...c, estado: !c.estado } : c))
    );
  };

  const handleCrear = (nuevoCliente: Clientes) => {
    setClientes(prev => [...prev, nuevoCliente]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Cliente creado correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const handleEditarCliente = (cliente: Clientes) => {
    setClienteEditar(cliente);
    setMostrarEditarModal(true);
  };

  const handleActualizarCliente = (clienteActualizado: Clientes) => {
    setClientes(prev =>
      prev.map(c => (c.IdClientes === clienteActualizado.IdClientes ? clienteActualizado : c))
    );
    setMostrarEditarModal(false);
  };

  const handleVerCliente = (cliente: Clientes) => {
    setClienteVer(cliente);
    setMostrarVerModal(true);
  };

  const clientesFiltrados = clientes.filter(c =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * clientesPorPagina;
  const indexFin = indexInicio + clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Clientes</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Cliente</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del Cliente"
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
              <th>Nombre Completo</th>
              <th>T.D</th>
              <th># Documento</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesPagina.map((c, index) => (
              <tr key={c.IdClientes} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{c.Nombre} {c.Apellido}</td>
                <td>{c.Tipodocumento}</td>
                <td>{c.Numerodocumento}</td>
                <td>{c.Correo}</td>
                <td>{c.Celular}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.estado}
                      onChange={() => handleEstadoChange(c.IdClientes)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerCliente(c)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarCliente(c)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarCliente(c.IdClientes, c.estado)}
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
        <CrearClienteModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
        />
      )}

      {mostrarEditarModal && clienteEditar && (
        <EditarClienteModal
          cliente={clienteEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarCliente}
        />
      )}

      {mostrarVerModal && clienteVer && (
        <VerClienteModal
          cliente={clienteVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarClientes;
