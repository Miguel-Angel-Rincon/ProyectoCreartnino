import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/funciones.css';

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

let idCategoriaActual = 609;

const CrearCategoriaModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState<CategoriaInsumos>({
    IdCategoriaInsumo: idCategoriaActual,
    Nombre: '',
    Descripcion: '',
    Estado: true, // Eliminamos visualmente pero lo dejamos como true por defecto
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.Nombre.trim() || !formData.Descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Nombre y Descripción no pueden estar vacíos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    onCrear({ ...formData, IdCategoriaInsumo: idCategoriaActual++ });
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📂 Crear Categoría de Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label">📛 Nombre</label>
                  <input
                    className="form-control"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">📝 Descripción</label>
                  <textarea
                    className="form-control"
                    name="Descripcion"
                    value={formData.Descripcion}
                    onChange={handleChange}
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
