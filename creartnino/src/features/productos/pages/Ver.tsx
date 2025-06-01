// components/VerProductoModal.tsx
import React from 'react';


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
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-pink text-white">
            <h5 className="modal-title">Detalles del Producto</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <input
                className="form-control"
                value={producto.IdCatProductos}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={producto.Nombre}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Imagen</label>
              <input
                className="form-control"
                value={producto.Imagen}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Cantidad</label>
              <input
                className="form-control"
                value={producto.cantidad}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Precio</label>
              <input
                className="form-control"
                value={`$${producto.precio.toFixed(2)}`}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Marca</label>
              <input
                className="form-control"
                value={producto.marca}
                disabled
              />
            </div>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={producto.estado}
                disabled
              />
              <label className="form-check-label">Activo</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProductoModal;
