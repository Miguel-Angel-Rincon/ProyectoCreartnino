import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

interface Insumos {
  IdInsumos: number;
  IdCatInsumo: string;
  Nombre: string;
  UnidadesMedidas: string; // ahora será Unidad de Medida
  cantidad: number;
  precioUnitario: number;
  estado: boolean;
}

interface Props {
  insumo: Insumos;
  onClose: () => void;
  onEditar: (formData: Insumos) => void;
}

const EditarInsumoModal: React.FC<Props> = ({ insumo, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Insumos>(insumo);
  const [precioTexto, setPrecioTexto] = useState('');

  useEffect(() => {
    setFormData(insumo);
    setPrecioTexto(insumo.precioUnitario.toLocaleString('es-CO'));
  }, [insumo]);

  const formatearCOP = (valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num)) return '';
    return num.toLocaleString('es-CO');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'precioUnitario') {
      const soloNumeros = value.replace(/[^\d]/g, '');
      if (soloNumeros === '' || parseInt(soloNumeros) <= 0) {
        setPrecioTexto('');
        setFormData((prev) => ({ ...prev, precioUnitario: 0 }));
      } else {
        setPrecioTexto(formatearCOP(soloNumeros));
        setFormData((prev) => ({
          ...prev,
          precioUnitario: parseFloat(soloNumeros),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.cantidad <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: '❌ Cantidad inválida',
        text: 'La cantidad debe ser mayor a cero.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (formData.precioUnitario <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: '❌ Precio inválido',
        text: 'El precio unitario debe ser mayor a cero.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    try {
      onEditar(formData);
      await Swal.fire({
        icon: 'success',
        title: 'Insumo actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#f78fb3',
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al editar',
        text: 'Ocurrió un error inesperado al guardar los cambios.',
        confirmButtonColor: '#f78fb3',
      });
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📝 Editar Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                {/* Nombre y Categoría */}
                <div className="col-md-6">
                  <label className="form-label">
                    📝 Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="IdCatInsumo"
                    value={formData.IdCatInsumo}
                    onChange={handleChange}
                    required
                  >
                    <option value={formData.IdCatInsumo}>{formData.IdCatInsumo}</option>
                    {Array.from({ length: 8 }, (_, i) => {
                      const cat = `Categoría ${i + 1}`;
                      return cat !== formData.IdCatInsumo ? (
                        <option key={i} value={cat}>{cat}</option>
                      ) : null;
                    })}
                  </select>
                </div>

                {/* Unidad de Medida */}
                <div className="col-md-6">
                  <label className="form-label">
                    ⚖ Unidad de Medida <small className="text-muted">(opcional)</small>
                  </label>
                  <input
                    className="form-control"
                    name="Descripcion"
                    value={formData.UnidadesMedidas}
                    onChange={handleChange}
                    placeholder="Ej: kg, mL, unidades..."
                  />
                </div> 

                {/* Cantidad */}
                <div className="col-md-6">
                  <label className="form-label">
                    🔢 Cantidad <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantidad"
                    value={formData.cantidad}
                    min={1}
                    onChange={handleChange}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      if (parseInt(input.value) < 1) input.value = '';
                    }}
                    required
                  />
                </div>

                {/* Precio Unitario */}
                <div className="col-md-6">
                  <label className="form-label">
                    💲 Precio Unitario (COP) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      name="precioUnitario"
                      placeholder="Ej: 15000"
                      value={precioTexto}
                      onChange={handleChange}
                      required
                    />
                  </div>
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

export default EditarInsumoModal;
