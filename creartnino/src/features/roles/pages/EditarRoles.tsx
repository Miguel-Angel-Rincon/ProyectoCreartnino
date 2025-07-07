import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  permisos: string[];
}

interface Props {
  rol: Rol;
  onClose: () => void;
  onEditar: (rolActualizado: Rol) => void;
}

const MODULOS = [
  'Dashboard',
  'Roles',
  'Usuario',
  'Clientes',
  'Proveedores',
  'Cate.Insumo',
  'Insumos',
  'Compras',
  'Producción',
  'Cat.Productos',
  'Productos',
  'Pedidos',
];

const EditarRolModal: React.FC<Props> = ({ rol, onClose, onEditar }) => {
  const [nombre, setNombre] = useState(rol.nombre);
  const [descripcion, setDescripcion] = useState(rol.descripcion);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(rol.permisos);

  const togglePermiso = (modulo: string) => {
    setPermisosSeleccionados(prev =>
      prev.includes(modulo) ? prev.filter(p => p !== modulo) : [...prev, modulo]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre requerido',
        text: 'El nombre del rol es obligatorio.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (permisosSeleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Permisos requeridos',
        text: 'Debe seleccionar al menos un permiso.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const rolActualizado: Rol = {
      ...rol,
      nombre,
      descripcion,
      permisos: permisosSeleccionados,
    };

    onEditar(rolActualizado);

    Swal.fire({
      icon: 'success',
      title: 'Rol actualizado correctamente',
      confirmButtonColor: '#f78fb3',
    });

    onClose();
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                <div className="col-md-6">
                  <label className="form-label">
                    🏷️ Nombre del Rol <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Descripción</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    style={{ resize: 'none', overflow: 'hidden' }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onBlur={(e) => {
                      e.target.style.height = 'auto';
                    }}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    🔐 Permisos <span className="text-danger">*</span>
                  </label>
                  <div className="row">
                    {MODULOS.map((modulo) => (
                      <div key={modulo} className="col-6 col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={modulo}
                            checked={permisosSeleccionados.includes(modulo)}
                            onChange={() => togglePermiso(modulo)}
                          />
                          <label className="form-check-label" htmlFor={modulo}>
                            {modulo}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12">
                  <small className="text-muted">
                    Los campos marcados con <span className="text-danger">*</span> son obligatorios.
                  </small>
                </div>

              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRolModal;
