// components/CrearInsumoModal.tsx
import React from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

let idInsumoActual = 409;

interface Props {
  onClose: () => void;
  onCrear: (formData: any) => void;
}

const CrearInsumoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const cantidad = parseInt(form.cantidad.value);
    const precioUnitario = parseFloat(form.precioUnitario.value);

    if (cantidad < 0 || precioUnitario < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'La cantidad y el precio deben ser positivos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const nuevoInsumo = {
      IdInsumos: idInsumoActual++,
      IdCatInsumo: form.categoria.value,
      Nombre: form.nombre.value,
      Descripcion: form.descripcion.value,
      marca: form.marca.value,
      cantidad,
      precioUnitario,
      estado: form.estado.checked,
    };

    onCrear(nuevoInsumo);
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

                {/* Fila 1: Categoría y Nombre */}
                <div className="col-md-6">
                  <label className="form-label">📝 Nombre</label>
                  <input className="form-control" name="nombre" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📦 Categoría</label>
                  <select className="form-select" name="categoria" required>
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`Categoría ${i + 1}`}>Categoría {i + 1}</option>
                    ))}
                  </select>
                </div>

                {/* Fila 2: Marca y Descripción */}
                <div className="col-md-6">
                  <label className="form-label">🏷️ Marca</label>
                  <input className="form-control" name="marca" required />
                </div>

                <div className="col-md-6">
  <label className="form-label">🧾 Descripción</label>
  <textarea
    className="form-control"
    name="descripcion"
    onFocus={(e) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    onBlur={(e) => {
      e.target.style.height = 'auto';
    }}
    title=""
    rows={1}
    style={{ resize: 'none', overflow: 'hidden' }}
    required
  />
</div>

                {/* Fila 3: Cantidad y Precio Unitario */}
                <div className="col-md-6">
                  <label className="form-label">🔢 Cantidad</label>
                  <input type="number" className="form-control" name="cantidad" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">💲 Precio Unitario</label>
                  <input type="number" step="0.01" className="form-control" name="precioUnitario" required />
                </div>

              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Crear Insumo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearInsumoModal;
