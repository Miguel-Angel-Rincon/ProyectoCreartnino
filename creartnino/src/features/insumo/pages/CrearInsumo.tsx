import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";
import type { IInsumos } from "../../interfaces/IInsumos";

interface Props {
  onClose: () => void;
  onCrear: () => void; 
  insumos: IInsumos[];
}

const CrearInsumoModal: React.FC<Props> = ({ onClose, onCrear, insumos }) => {
  const [precioTexto, setPrecioTexto] = useState("");
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); //  evita doble clic

  // --- API Base URL ---
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

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
  }, []);

  //para manejar el formulario 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // ✅ evita doble clic

    setIsSubmitting(true);
    const form = e.currentTarget;

    const nombre = form.nombre.value.trim();
    const precioLimpio = form.precioUnitario.value.replace(/[^\d]/g, "");
    const precioUnitario = parseFloat(precioLimpio);
    const unidadMedida = form.unidadMedida.value;
    const idCatInsumo = parseInt(form.categoria.value);

    // --- Validaciones ---
    const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
    const hasLongRepeatSequence = (s: string, n = 4) => new RegExp(`(.)\\1{${n - 1},}`).test(s);
    const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
    const hasTooManySpecialChars = (s: string, maxPercent = 0.4) => {
      const specials = (s.match(/[^a-zA-Z0-9]/g) || []).length;
      return specials / s.length > maxPercent;
    };
    const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

    if (!nombre) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Campo requerido",
        text: "El nombre del insumo no puede estar vacío.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }
// validaciones nombre
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombre)) {
      Swal.fire({
        icon: "error",
        title: "❌ Nombre inválido",
        text: "El nombre solo puede contener letras, números y espacios (sin caracteres especiales).",
        confirmButtonColor: "#f78fb3",
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
        title: "❌ Nombre inválido",
        text: "Debe tener entre 3 y 50 caracteres, sin repeticiones excesivas ni baja variedad.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }

    const nombreNormalizado = nombre.toLowerCase().replace(/\s+/g, "");
    const existeDuplicado = insumos.some(
      (i) => i.Nombre.toLowerCase().replace(/\s+/g, "") === nombreNormalizado
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: "error",
        title: "❌ Nombre duplicado",
        text: "Ya existe un insumo con ese nombre.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }

    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      Swal.fire({
        icon: "error",
        title: "❌ Precio inválido",
        text: "El precio unitario debe ser mayor a cero.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }
// Validar precio máximo
    if (precioUnitario > 9999999) {
      Swal.fire({
        icon: "error",
        title: "❌ Precio inválido",
        text: "El precio no puede superar 9.999.999.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }
//validacion unidad de medida
    if (!unidadMedida) {
      Swal.fire({
        icon: "error",
        title: "❌ Unidad de medida requerida",
        text: "Debes seleccionar una unidad de medida.",
        confirmButtonColor: "#f78fb3",
      });
      setIsSubmitting(false);
      return;
    }

    // --- Crear objeto final ---
    const nuevoInsumo = {
      IdCatInsumo: idCatInsumo,
      Nombre: nombre,
      UnidadesMedidas: unidadMedida,
      Cantidad: 0,
      PrecioUnitario: precioUnitario,
      Estado: form.estado?.checked ?? true,
    };
// --- Enviar a API ---
    try {
      const resp = await fetch(buildUrl("Insumos/Crear"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoInsumo),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Insumo creado correctamente.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onCrear();
    } catch (err) {
      console.error("crearInsumo:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el insumo.",
        confirmButtonColor: "#f78fb3",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
// --- Formatear input COP ---
  const formatearCOPInput = (valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num)) return "";
    return num.toLocaleString("es-CO");
  };

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🧰 Crear Insumo</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label">
                    📝 Nombre <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" name="nombre" required />
                </div>

                {/* Categoría */}
                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" name="categoria" required>
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
                  <select className="form-select" name="unidadMedida" required>
                    <option value="">-- Selecciona --</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="L">Litros (L)</option>
                    <option value="mL">Mililitros (mL)</option>
                    <option value="m">Metros (m)</option>
                    <option value="cm">Centímetros (cm)</option>
                  </select>
                </div>

                {/* Precio */}
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
                      name="precioUnitario"
                      required
                      placeholder="Ej: 15000"
                      value={precioTexto}
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/[^\d]/g, "");
                        if (soloNumeros.length > 7) return; //  máximo 7 cifras
                        if (soloNumeros === "" || parseInt(soloNumeros) === 0) {
                          setPrecioTexto("");
                        } else {
                          setPrecioTexto(formatearCOPInput(soloNumeros));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con control de doble clic */}
            <div className="modal-footer pastel-footer">
              <button
                type="button"
                className="btn pastel-btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn pastel-btn-primary d-flex align-items-center justify-content-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearInsumoModal;
