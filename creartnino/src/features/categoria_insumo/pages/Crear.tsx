// CrearCategoriaModal.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import "../styles/funciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";

interface Props {
  onClose: () => void;
  onCrear: (nuevaCategoria: ICatInsumos) => void;
}

const CrearCategoriaModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState({
    NombreCategoria: "",
    Descripcion: "",
    Estado: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.NombreCategoria.trim() || !formData.Descripcion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Nombre y Descripción no pueden estar vacíos.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    try {
      const resp = await fetch(`${APP_SETTINGS.apiUrl}Categoria_Insumos/Crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data: ICatInsumos = await resp.json();

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "La categoría fue creada correctamente",
        confirmButtonColor: "#e83e8c",
      });

      onCrear(data);
      onClose();
    } catch (err) {
      console.error("Error creando categoría:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la categoría",
        confirmButtonColor: "#e83e8c",
      });
    }
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
                  <label className="form-label">
                    📛 Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="NombreCategoria"
                    value={formData.NombreCategoria}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">
                    📝 Descripción <span className="text-danger">*</span>
                  </label>
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
              <button
                type="button"
                className="btn pastel-btn-secondary"
                onClick={onClose}
              >
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
