import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

let idInsumoActual = 409;

interface Props {
  onClose: () => void;
  onCrear: (formData: any) => void;
}

const CrearInsumoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [precioTexto, setPrecioTexto] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const cantidad = parseInt(form.cantidad.value.replace(/[^\d]/g, ''));
    const precioLimpio = form.precioUnitario.value.replace(/[^\d]/g, '');
    const precioUnitario = parseFloat(precioLimpio);

    if (isNaN(cantidad) || cantidad <= 0) {
      Swal.fire({
        icon: 'error',
        title: '❌ Cantidad inválida',
        text: 'La cantidad debe ser mayor a cero.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      Swal.fire({
        icon: 'error',
        title: '❌ Precio inválido',
        text: 'El precio unitario debe ser mayor a cero.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const nuevoInsumo = {
      IdInsumos: idInsumoActual++,
      IdCatInsumo: form.categoria.value,
      Nombre: form.nombre.value,
      UnidadesMedidas: form.unidadMedida.value || '', // no obligatorio
      cantidad,
      precioUnitario,
      estado: form.estado?.checked ?? false,
    };

    onCrear(nuevoInsumo);
  };

  const formatearCOPInput = (valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num)) return '';
    return num.toLocaleString('es-CO');
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🧰 Crear Nuevo Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Nombre y Categoría */}
                <div className="col-md-6">
                  <label className="form-label">
                    📝 Nombre <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" name="nombre" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" name="categoria" required>
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`Categoría ${i + 1}`}>{`Categoría ${i + 1}`}</option>
                    ))}
                  </select>
                </div>

                
                <div className="col-md-6">
                  <label className="form-label">
                    ⚖ Unidad de Medida <small className="text-muted">(opcional)</small>
                  </label>
                  <input
                    className="form-control"
                    name="unidadMedida"
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
                    required
                    min={1}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      if (parseInt(input.value) < 1) input.value = '';
                    }}
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
                      required
                      placeholder="Ej: 15000"
                      value={precioTexto}
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/[^\d]/g, '');
                        if (soloNumeros === '' || parseInt(soloNumeros) === 0) {
                          setPrecioTexto('');
                        } else {
                          setPrecioTexto(formatearCOPInput(soloNumeros));
                        }
                      }}
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
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearInsumoModal;
