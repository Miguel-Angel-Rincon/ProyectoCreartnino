import React from 'react';
import Swal from 'sweetalert2';

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (nuevoRol: Rol) => void;
}

// ID incremental simulado para roles
let idRolActual = 4;

const CrearRolModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validaciones simples
    if (!form.nombre.value.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre requerido',
        text: 'El nombre del rol es obligatorio.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    const nuevoRol: Rol = {
      idRol: idRolActual++,
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      estado: form.estado.checked,
    };

    onCrear(nuevoRol);
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Crear Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Nombre del Rol */}
              <div className="mb-3">
                <label className="form-label">Nombre del Rol</label>
                <input className="form-control" name="nombre" required />
              </div>

              {/* Descripción */}
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" name="descripcion" rows={3}></textarea>
              </div>

              {/* Estado */}
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" name="estado" defaultChecked />
                <label className="form-check-label">Activo</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-pink">Crear</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearRolModal;
