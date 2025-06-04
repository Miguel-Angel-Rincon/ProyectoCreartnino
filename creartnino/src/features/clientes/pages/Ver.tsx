// components/VerClienteModal.tsx
import React from 'react';

interface Cliente {
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

interface Props {
  cliente: Cliente;
  onClose: () => void;
}

const VerClienteModal: React.FC<Props> = ({ cliente, onClose }) => {
  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-pink text-white">
            <h5 className="modal-title">Detalles del Cliente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">ID Cliente</label>
              <input className="form-control" value={cliente.IdClientes} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={cliente.Nombre} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input className="form-control" value={cliente.Apellido} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo Documento</label>
              <input className="form-control" value={cliente.Tipodocumento} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Número Documento</label>
              <input className="form-control" value={cliente.Numerodocumento} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input className="form-control" value={cliente.Correo} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Celular</label>
              <input className="form-control" value={cliente.Celular} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Departamento</label>
              <input className="form-control" value={cliente.Departamento} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Ciudad</label>
              <input className="form-control" value={cliente.Ciudad} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={cliente.Direccion} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Barrio</label>
              <input className="form-control" value={cliente.Barrio} disabled />
            </div>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={cliente.estado}
                disabled
              />
              <label className="form-check-label">Activo</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerClienteModal;
