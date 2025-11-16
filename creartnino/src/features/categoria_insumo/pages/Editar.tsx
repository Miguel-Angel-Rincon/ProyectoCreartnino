// EditarCategoriaInsumosModal.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/funciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";

interface Props {
  categoria: ICatInsumos;
  onClose: () => void;
  onEditar: (categoriaEditada: ICatInsumos) => void;
  categorias: ICatInsumos[]; // 👈 AQUI
}

const EditarCategoriaInsumosModal: React.FC<Props> = ({
  categoria,
  onClose,
  onEditar,
  categorias,
}) => {
  const [formData, setFormData] = useState<ICatInsumos>(categoria);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setFormData(categoria);
  }, [categoria]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //para manejar el envio del formulario

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);

  // 🔹 Funciones auxiliares
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = 4) => new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.5) => {
    const specials = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specials / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  // 🔸 Validaciones básicas
  if (!formData.NombreCategoria.trim() || !formData.Descripcion.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Nombre y Descripción no pueden estar vacíos.",
      confirmButtonColor: "#e83e8c",
    });
    setIsSubmitting(false);
    return;
  }

  const nombre = formData.NombreCategoria.trim();
  const descripcion = formData.Descripcion.trim();

  // ✅ Validar nombre de categoría (sin caracteres especiales)
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombre)) {
    Swal.fire({
      icon: "error",
      title: "Nombre inválido",
      text: "El nombre solo puede contener letras, números y espacios (sin caracteres especiales).",
      confirmButtonColor: "#e83e8c",
    });
    setIsSubmitting(false);
    return;
  }

  if (
    nombre.length < 3 ||
    nombre.length > 50 ||
    isAllSameChar(nombre) ||
    hasLongRepeatSequence(nombre) ||
    isOnlySpecialChars(nombre) ||
    hasTooManySpecialChars(nombre) ||
    hasLowVariety(nombre)
  ) {
    Swal.fire({
      icon: "error",
      title: "Nombre inválido",
      text: "Debe tener entre 3 y 50 caracteres, sin repeticiones, sin exceso de símbolos ni baja variedad.",
      confirmButtonColor: "#e83e8c",
    });
    setIsSubmitting(false);
    return;
  }

  // ✅ Validar nombre duplicado (ignorando mayúsculas y el propio registro)
  const existeNombre = categorias.some(
    (cat) =>
      cat.NombreCategoria.toLowerCase().trim() === nombre.toLowerCase() &&
      cat.IdCatInsumo !== formData.IdCatInsumo
  );

  if (existeNombre) {
    Swal.fire({
      icon: "error",
      title: "Nombre duplicado",
      text: "Ya existe una categoría con ese nombre. Por favor elige otro.",
      confirmButtonColor: "#e83e8c",
    });
    setIsSubmitting(false);
    return;
  }

  // ✅ Validar descripción
  if (
    descripcion.length < 5 ||
    descripcion.length > 200 ||
    isAllSameChar(descripcion) ||
    hasLongRepeatSequence(descripcion) ||
    isOnlySpecialChars(descripcion) ||
    hasTooManySpecialChars(descripcion) ||
    hasLowVariety(descripcion)
  ) {
    Swal.fire({
      icon: "error",
      title: "Descripción inválida",
      text: "Debe tener entre 5 y 200 caracteres, sin repeticiones, sin exceso de símbolos ni baja variedad.",
      confirmButtonColor: "#e83e8c",
    });
    setIsSubmitting(false);
    return;
  }

  // Enviar datos al backend
  try {
    setIsSubmitting(true);
    const resp = await fetch(
      `${APP_SETTINGS.apiUrl}Categoria_Insumos/Actualizar/${formData.IdCatInsumo}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data: ICatInsumos = await resp.json();

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Categoría actualizada correctamente",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false, 
    });

    onEditar(data);
    onClose();
  } catch (err) {
    console.error("Error actualizando categoría:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar la categoría",
      confirmButtonColor: "#e83e8c",
    });
  } finally {
    setIsSubmitting(false);
  }
};
  

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📂 Editar Categoría de Insumo</h5>
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
                    name="NombreCategoria"
                    value={formData.NombreCategoria}
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
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={isSubmitting} // 🚫 evita doble clic
>
  {isSubmitting ? (
    <>
      Guardando...
    </>
  ) : (
    "Guardar Cambios"
  )}
</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarCategoriaInsumosModal;
