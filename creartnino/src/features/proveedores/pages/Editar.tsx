import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';


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
  proveedor: Proveedores;
  onClose: () => void;
  onEditar: (formData: Proveedores) => void;
}

const departamentosColombia = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
  'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
];

const EditarProveedorModal: React.FC<Props> = ({ proveedor, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Proveedores>(proveedor);

  

  useEffect(() => {
    setFormData(proveedor);
  }, [proveedor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      onEditar(formData);
      await Swal.fire({
        icon: 'success',
        title: 'Proveedor actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#e83e8c',
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al editar',
        text: 'Ocurrió un error inesperado al guardar los cambios.',
        confirmButtonColor: '#e83e8c',
      });
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Editar Proveedor</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div className="mb-3">
                <label className="form-label">Tipo de Persona</label>
                <select className="form-select" name="tipoPersona" required>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>
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
                <input
                  className="form-control"
                  name="NombreCompleto"
                  value={formData.NombreCompleto}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Número de Documento</label>
                <input
                  className="form-control"
                  name="NumDocumento"
                  value={formData.NumDocumento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Departamento</label>
                <select
                  className="form-select"
                  name="Departamento"
                  value={formData.Departamento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentosColombia.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Ciudad</label>
                <input
                  className="form-control"
                  name="Ciudad"
                  value={formData.Ciudad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  className="form-control"
                  name="Direccion"
                  value={formData.Direccion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Celular</label>
                <input
                  className="form-control"
                  name="Celular"
                  value={formData.Celular}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                />
                <label className="form-check-label">Activo</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-pink">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProveedorModal;
