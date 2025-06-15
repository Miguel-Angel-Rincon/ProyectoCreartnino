import React from 'react';
import Swal from 'sweetalert2';
import { FaTags } from 'react-icons/fa'; // Ícono para el título
import '../styles/acciones.css';

interface CategoriaInsumos {
  IdCategoriaInsumo: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (nuevaCategoria: CategoriaInsumos) => void;
}

// Contador incremental simulado
let idCategoriaActual = 609;

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

    const nuevaCategoria: CategoriaInsumos = {
      IdCategoriaInsumo: idCategoriaActual++,
      Nombre: nombre,
      Descripcion: descripcion,
      Estado: estado,
    };

    onCrear(nuevaCategoria);
  };

  return (
    <>
      <div className="modal-backdrop fade show pastel-overlay"></div>
      <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content pastel-modal">
            <form onSubmit={handleSubmit}>
              <div className="modal-header pastel-header">
                <h5 className="modal-title d-flex align-items-center">
                  <FaTags className="me-2" />
                  Crear Categoría de Insumo
                </h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>

              <div className="modal-body px-4">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      placeholder="Ej. Textiles"
                      required
                    />
                  </div>

                  
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows={3}
                    placeholder="Describe brevemente la categoría"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer pastel-footer">
                <button type="button" className="pastel-btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="pastel-btn-primary">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CrearCategoriaModal;
