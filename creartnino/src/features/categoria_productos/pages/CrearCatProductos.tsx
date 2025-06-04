// components/CrearCategoriaModal.tsx
import React from 'react';
import Swal from 'sweetalert2';


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
    const estado = form.estado.checked;

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
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Crear Categoría</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input className="form-control" name="nombre" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" name="descripcion" rows={3} required />
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" name="estado" defaultChecked />
                <label className="form-check-label">Activa</label>
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

export default CrearCategoriaModal;
