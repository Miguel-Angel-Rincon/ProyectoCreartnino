// components/CrearCategoriaModal.tsx
import React from 'react';
import Swal from 'sweetalert2';
import '../styles/Funciones.css';

interface CategoriaProductos {
  IdCategoriaProducto: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (nuevaCategoria: CategoriaProductos) => void;
}

// Contador incremental para IDs de categorías
let idCategoriaActual = 409;

const CrearCategoriaModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nombre = form.nombre.value.trim();
    const descripcion = form.descripcion.value.trim();
    const estado = form.estado?.checked ?? true; // Por defecto, estado es true si no se especifica

    if (!nombre || !descripcion) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Nombre y Descripción no pueden estar vacíos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    const nuevaCategoria: CategoriaProductos = {
      IdCategoriaProducto: idCategoriaActual++,
      Nombre: nombre,
      Descripcion: descripcion,
      Estado: estado,
    };

    onCrear(nuevaCategoria);
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📦 Crear Categoría de Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label">📛 Nombre</label>
                  <input className="form-control" name="nombre" required />
                </div>
                <div className="col-md-12">
                  <label className="form-label">📝 Descripción</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows={3}
                    required
                  />
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

export default CrearCategoriaModal;
