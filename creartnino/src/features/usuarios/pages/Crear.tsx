// components/CrearUsuarioModal.tsx
import React from 'react';
import Swal from 'sweetalert2';

export interface Usuario {
  IdUsuarios: number;
  Nombre: string;
  Apellido: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Direccion: string;
  Barrio: string;
  Correo: string;
  idRol: string;
  estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (nuevoUsuario: Usuario) => void;
}

// Variable para manejar ID incremental simulado
let idUsuarioActual = 101;

const CrearUsuarioModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validaciones básicas de algunos campos
    if (!form.Nombre.value.trim() || !form.Apellido.value.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error en los datos',
        text: 'Nombre y Apellido son obligatorios.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    if (!form.Correo.value.includes('@')) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor ingresa un correo válido.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    // Construir nuevo usuarios
    const nuevoUsuario: Usuario = {
      IdUsuarios: idUsuarioActual++,
      Nombre: form.Nombre.value,
      Apellido: form.Apellido.value,
      Tipodocumento: form.Tipodocumento.value,
      Numerodocumento: form.Numerodocumento.value,
      Celular: form.Celular.value,
      Direccion: form.Direccion.value,
      Barrio: form.Barrio.value,
      Correo: form.Correo.value,
      idRol: form.idRol.value,
      estado: form.estado.checked,
    };

    onCrear(nuevoUsuario);
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Crear Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input className="form-control" name="Nombre" required />
              </div>

              {/* Apellido */}
              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input className="form-control" name="Apellido" required />
              </div>

              {/* Tipo Documento */}
              <div className="mb-3">
                <label className="form-label">Tipo Documento</label>
                <select className="form-select" name="Tipodocumento" required>
                  <option value="">Seleccione...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
              </div>

              {/* Número Documento */}
              <div className="mb-3">
                <label className="form-label">Número Documento</label>
                <input className="form-control" name="Numerodocumento" required />
              </div>

              {/* Celular */}
              <div className="mb-3">
                <label className="form-label">Celular</label>
                <input className="form-control" name="Celular" type="tel" />
              </div>

              {/* Dirección */}
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input className="form-control" name="Direccion" />
              </div>

              {/* Barrio */}
              <div className="mb-3">
                <label className="form-label">Barrio</label>
                <input className="form-control" name="Barrio" />
              </div>

              {/* Correo */}
              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input className="form-control" name="Correo" type="email" required />
              </div>

              {/* Rol */}
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select className="form-select" name="idRol" required>
                  <option value="">Seleccione...</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
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

export default CrearUsuarioModal;
