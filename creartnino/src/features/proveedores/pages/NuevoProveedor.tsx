// components/CrearProveedorModal.tsx
import React from 'react';
import Swal from 'sweetalert2';

// Variable externa para manejar el ID incremental
let idProveedorActual = 9;

interface Proveedores {
  IdProveedores: number;
  IdTipoPersona: string;
  IdTipoDocumento: string;
  NombreCompleto: string;
  NumDocumento: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  Celular: string;
  estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (formData: Proveedores) => void;
}

// Lista de departamentos de Colombia
const departamentosColombia = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá",
  "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
  "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo",
  "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada"
];

const CrearProveedorModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const celular = form.celular.value;
    const numDocumento = form.numDocumento.value;

    if (!/^\d+$/.test(celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe contener solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    if (!/^\d+$/.test(numDocumento)) {
      Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'El número de documento debe contener solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    const nuevoProveedor: Proveedores = {
      IdProveedores: idProveedorActual++,
      IdTipoPersona: form.tipoPersona.value,
      IdTipoDocumento: form.tipoDocumento.value,
      NombreCompleto: form.nombreCompleto.value,
      NumDocumento: numDocumento,
      Departamento: form.departamento.value,
      Ciudad: form.ciudad.value,
      Direccion: form.direccion.value,
      Celular: celular,
      estado: form.estado.checked,
    };

    onCrear(nuevoProveedor);
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Crear Proveedor</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tipo de Persona</label>
                <select className="form-select" name="tipoPersona" required>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo de Documento</label>
                <select className="form-select" name="tipoDocumento" required>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Nombre Completo</label>
                <input className="form-control" name="nombreCompleto" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Número de Documento</label>
                <input className="form-control" name="numDocumento" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Departamento</label>
                <select className="form-select" name="departamento" required>
                  <option value="">Seleccione un departamento</option>
                  {departamentosColombia.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Ciudad</label>
                <input className="form-control" name="ciudad" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input className="form-control" name="direccion" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Celular</label>
                <input className="form-control" name="celular" required />
              </div>
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

export default CrearProveedorModal;
