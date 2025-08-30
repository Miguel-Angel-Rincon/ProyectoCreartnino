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
  onClose: () => void;
  onCrear: (nuevoRol: Rol) => void;
}

let idRolActual = 4;

const MODULOS = [
  'Dashboard', 'Roles', 'Usuario', 'Clientes', 'Proveedores',
  'Cate.Insumo', 'Insumos', 'Compras', 'Producción',
  'Cat.Productos', 'Productos', 'Pedidos',
];

const CrearRolModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

  const togglePermiso = (modulo: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(modulo)
        ? prev.filter((m) => m !== modulo)
        : [...prev, modulo]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nombre = (form.nombre as HTMLInputElement).value.trim();
    const descripcion = (form.descripcion as HTMLInputElement).value.trim();

    if (!nombre) {
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

    const nuevoRol: Rol = {
      idRol: idRolActual++,
      nombre,
      descripcion,
      estado: true,
      permisos: permisosSeleccionados,
    };

    onCrear(nuevoRol);

    Swal.fire({
      icon: 'success',
      title: '¡Rol creado!',
      text: `El rol "${nombre}" se ha creado exitosamente.`,
      confirmButtonColor: '#f78fb3',
    });

    form.reset();
    setPermisosSeleccionados([]);
    onClose();
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🛡️ Crear Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                <div className="col-md-6">
                  <label className="form-label">
                    🏷️ Nombre del Rol <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" name="nombre" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Descripción</label>
                  <input className="form-control" name="descripcion" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🔐 Permisos <span className="text-danger">*</span></label>
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
                  <small className="text-muted">Los campos marcados con <span className="text-danger">*</span> son obligatorios.</small>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearRolModal;
