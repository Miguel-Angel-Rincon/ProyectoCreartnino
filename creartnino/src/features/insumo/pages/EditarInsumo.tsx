// src/components/EditarInsumo.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";
import type { IInsumos } from "../../interfaces/IInsumos";

interface Props {
  insumo: IInsumos;
  onClose: () => void;
  onEditar: () => void; // 👈 refresca lista en el padre
  insumos: IInsumos[]; // 👈 lista completa de insumos para validación
}

const EditarInsumoModal: React.FC<Props> = ({ insumo, onClose, onEditar,insumos }) => {
  const [formData, setFormData] = useState<IInsumos>(insumo);
  const [precioTexto, setPrecioTexto] = useState("");
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- API Base URL ---
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Inicializar formData ---
  useEffect(() => {
    setFormData(insumo);
    setPrecioTexto(insumo.PrecioUnitario.toLocaleString("es-CO"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insumo]);

  // --- Cargar categorías ---
  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const resp = await fetch(buildUrl("Categoria_Insumos/Lista"));
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: ICatInsumos[] = await resp.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("obtenerCategorias:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las categorías de insumos.",
          confirmButtonColor: "#f78fb3",
        });
      }
    };
    obtenerCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Formatear COP ---
  const formatearCOPInput = (valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num)) return "";
    return num.toLocaleString("es-CO");
  };

  // --- Handle change ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "PrecioUnitario") {
      const soloNumeros = value.replace(/[^\d]/g, "");
      if (soloNumeros.length > 7) return; // 👈 máximo 7 cifras
      if (soloNumeros === "" || parseInt(soloNumeros) <= 0) {
        setPrecioTexto("");
        setFormData((prev) => ({ ...prev, PrecioUnitario: 0 }));
      } else {
        setPrecioTexto(formatearCOPInput(soloNumeros));
        setFormData((prev) => ({
          ...prev,
          PrecioUnitario: parseFloat(soloNumeros),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  // para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (isSubmitting) return;

  //  Funciones auxiliares de validación
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = 4) =>
    new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.5) => {
    const specials = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specials / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  const nombre = formData.Nombre?.trim() ?? "";

  // Validación: campos requeridos
  if (!nombre) {
    Swal.fire({
      icon: "warning",
      title: "Nombre requerido",
      text: "El nombre del insumo no puede estar vacío.",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  // Validar caracteres especiales
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombre)) {
    Swal.fire({
      icon: "error",
      title: "Nombre inválido",
      text: "El nombre solo puede contener letras, números y espacios (sin caracteres especiales).",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  // Validar longitud, repeticiones, variedad...
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
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  // Validación: duplicado (ignora mayúsculas y espacios)
  const nombreNormalizado = nombre.toLowerCase().replace(/\s+/g, "");
  const existeDuplicado = insumos.some(
    (i: IInsumos) =>
      i.Nombre.toLowerCase().replace(/\s+/g, "") === nombreNormalizado &&
      i.IdInsumo !== formData.IdInsumo
  );

  if (existeDuplicado) {
    Swal.fire({
      icon: "warning",
      title: "Duplicado",
      text: "Ya existe un insumo con ese nombre.",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  // Validaciones de cantidad
  if (formData.Cantidad < 0 || formData.Cantidad > 9999) {
    Swal.fire({
      icon: "error",
      title: "❌ Cantidad inválida",
      text: "La cantidad debe estar entre 0 y 9999.",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  //  Validaciones de precio
  if (formData.PrecioUnitario <= 0 || formData.PrecioUnitario > 9999999) {
    Swal.fire({
      icon: "error",
      title: "❌ Precio inválido",
      text: "El precio debe estar entre 1 y 9.999.999.",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  // Unidad de medida
  if (!formData.UnidadesMedidas) {
    Swal.fire({
      icon: "error",
      title: "❌ Unidad de medida requerida",
      text: "Debes seleccionar una unidad de medida.",
      confirmButtonColor: "#f78fb3",
    });
    return;
  }

  //  Si pasa todas las validaciones, proceder con la actualización
  try {
    setIsSubmitting(true);
    const resp = await fetch(buildUrl(`Insumos/Actualizar/${formData.IdInsumo}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Insumo actualizado correctamente.",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    onEditar();
    onClose();
  } catch (err) {
    console.error("editarInsumo:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo editar el insumo.",
      confirmButtonColor: "#f78fb3",
    });
  }finally{
    setIsSubmitting(false);
  }
};


  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📝 Editar Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label">
                    📝 Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="IdCatInsumo"
                    value={formData.IdCatInsumo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecciona --</option>
                    {categorias.map((c) => (
                      <option key={c.IdCatInsumo} value={c.IdCatInsumo}>
                        {c.NombreCategoria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unidad medida */}
                <div className="col-md-6">
                  <label className="form-label">
                    ⚖ Unidad de Medida <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="UnidadesMedidas"
                    value={formData.UnidadesMedidas}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="L">Litros (L)</option>
                    <option value="mL">Mililitros (mL)</option>
                    <option value="m">Metros (m)</option>
                    <option value="cm">Centímetros (cm)</option>
                  </select>
                </div>

                {/* Cantidad */}
                <div className="col-md-6">
  <label className="form-label">
    🔢 Cantidad <span className="text-danger">*</span>
  </label>
  <input
    type="number"
    className="form-control"
    name="Cantidad"
    value={formData.Cantidad}
    min={0}   //  permite 0
    max={9999}
    required
    onKeyDown={(e) => {
      // Bloquea escribir "-", "+", "e", "E"
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }
    }}
    onPaste={(e) => {
      //  Bloquea pegar letras, signos o espacios
      const pastedData = e.clipboardData.getData("text");
      if (!/^\d*$/.test(pastedData)) {
        e.preventDefault();
      }
    }}
    onInput={(e) => {
      const input = e.currentTarget;
      const value = parseInt(input.value, 10);

      //  No permitir más de 9999
      if (value > 9999) {
        input.value = "9999";
      }

      // Si no es número (vacío o inválido), limpiar
      if (isNaN(value)) {
        input.value = "";
      }
    }}
    onChange={handleChange}
  />
</div>


                {/* Precio Unitario */}
                <div className="col-md-6">
                  <label className="form-label">
                    💲 Precio Unitario (COP) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      name="PrecioUnitario"
                      placeholder="Ej: 15.000"
                      value={precioTexto}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={isSubmitting} //  evita doble clic
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

export default EditarInsumoModal;
