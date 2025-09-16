// components/EditarCategoriaProductoModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/funciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatProductos } from "../../interfaces/ICatProductos";

interface Props {
  categoria: ICatProductos;
  onClose: () => void;
  onEditar: (formData: ICatProductos) => void;
}

const EditarCategoriaProductoModal: React.FC<Props> = ({
  categoria,
  onClose,
  onEditar,
}) => {
  const [formData, setFormData] = useState<ICatProductos>(categoria);

  useEffect(() => {
    setFormData(categoria);
  }, [categoria]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.CategoriaProducto1.trim() || !formData.Descripcion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Nombre y Descripción no pueden estar vacíos.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    try {
      const resp = await fetch(
        `${APP_SETTINGS.apiUrl}Categoria_Productos/Actualizar/${formData.IdCategoriaProducto}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data: ICatProductos = await resp.json();

      onEditar(data);

      await Swal.fire({
        icon: "success",
        title: "Categoría actualizada",
        text: "Los cambios se han guardado correctamente.",
        confirmButtonColor: "#f78fb3",
      });

      onClose();
    } catch (error) {
      console.error("Error editando categoría:", error);
      Swal.fire({
        icon: "error",
        title: "Error al editar",
        text: "Ocurrió un error inesperado al guardar los cambios.",
        confirmButtonColor: "#f78fb3",
      });
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Categoría de Producto</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label">
                    📛 Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="CategoriaProducto1"
                    value={formData.CategoriaProducto1}
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
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
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
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
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarCategoriaProductoModal;
