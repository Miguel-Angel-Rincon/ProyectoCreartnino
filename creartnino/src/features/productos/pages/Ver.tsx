import React from 'react';
import '../styles/acciones.css';

interface Producto {
  IdProducto: number;
  IdCatProductos: string;
  Nombre: string;
  Imagen: string;
  cantidad: number;
  marca: string;
  precio: number;
  estado: boolean;
}

interface Props {
  producto: Producto;
  onClose: () => void;
}

const VerProductoModal: React.FC<Props> = ({ producto, onClose }) => {
  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Detalles del Producto</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              {/* Nombre y Categoría */}
              <div className="col-md-12 d-flex gap-3">
                <div className="flex-fill">
                  <label className="form-label">🛍️ Nombre</label>
                  <input className="form-control" value={producto.Nombre} disabled />
                </div>
                <div className="flex-fill">
                  <label className="form-label">📦 Categoría</label>
                  <input className="form-control" value={producto.IdCatProductos} disabled />
                </div>
              </div>

              {/* Cantidad y Precio */}
              <div className="col-md-6">
                <label className="form-label">🔢 Cantidad</label>
                <input className="form-control" value={producto.cantidad} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">💲 Precio</label>
                <input className="form-control" value={`$${producto.precio.toFixed(0)}`} disabled />
              </div>

              {/* Marca */}
              <div className="col-md-6">
                <label className="form-label">🏷️ Marca</label>
                <input className="form-control" value={producto.marca} disabled />
              </div>

              {/* Vista previa de Imagen */}
              <div className="col-md-12">
                <div className="border rounded pastel-img-container p-2 text-center">
                  <img
                    src={producto.Imagen}
                    alt="Producto"
                    className="img-fluid rounded"
                    style={{ maxHeight: '250px', objectFit: 'contain' }}
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProductoModal;
