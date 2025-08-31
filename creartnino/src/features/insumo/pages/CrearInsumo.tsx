// src/components/CrearInsumo.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { ICatInsumos } from "../../interfaces/ICatInsumos";

interface Props {
  onClose: () => void;
  onCrear: () => void; // 👈 refresca lista
}

const CrearInsumoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [precioTexto, setPrecioTexto] = useState("");
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Crear insumo ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const cantidad = parseInt(form.cantidad.value.replace(/[^\d]/g, ""));
    const precioLimpio = form.precioUnitario.value.replace(/[^\d]/g, "");
    const precioUnitario = parseFloat(precioLimpio);
    const unidadMedida = form.unidadMedida.value;
    const idCatInsumo = parseInt(form.categoria.value);

    // ✅ Validaciones de cantidad
    if (isNaN(cantidad) || cantidad <= 0) {
      Swal.fire({
        icon: "error",
        title: "❌ Cantidad inválida",
        text: "La cantidad debe ser mayor a cero.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (cantidad > 9999) {
      Swal.fire({
        icon: "error",
        title: "❌ Cantidad inválida",
        text: "La cantidad no puede superar 9999.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // ✅ Validaciones de precio
    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      Swal.fire({
        icon: "error",
        title: "❌ Precio inválido",
        text: "El precio unitario debe ser mayor a cero.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (precioUnitario > 9999999) {
      Swal.fire({
        icon: "error",
        title: "❌ Precio inválido",
        text: "El precio no puede superar 9.999.999.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    if (!unidadMedida) {
      Swal.fire({
        icon: "error",
        title: "❌ Unidad de medida requerida",
        text: "Debes seleccionar una unidad de medida.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    const nuevoInsumo = {
      IdCatInsumo: idCatInsumo,
      Nombre: form.nombre.value,
      UnidadesMedidas: unidadMedida,
      Cantidad: cantidad,
      PrecioUnitario: precioUnitario,
      Estado: form.estado?.checked ?? true, // 👈 por defecto activo
    };

    try {
      const resp = await fetch(buildUrl("Insumos/Crear"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoInsumo),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      Swal.fire({
        icon: "success",
        title: "✅ Insumo creado correctamente",
        confirmButtonColor: "#f78fb3",
      });

      onCrear(); // refresca lista en el padre
    } catch (err) {
      console.error("crearInsumo:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el insumo.",
        confirmButtonColor: "#f78fb3",
      });
    }
  };

  const formatearCOPInput = (valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num)) return "";
    return num.toLocaleString("es-CO");
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🧰 Crear Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
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

                {/* Cantidad */}
                <div className="col-md-6">
                  <label className="form-label">
                    🔢 Cantidad <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantidad"
                    required
                    min={1}
                    max={9999} // 👈 límite de 4 cifras
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      if (parseInt(input.value) < 1) input.value = "";
                      if (parseInt(input.value) > 9999) input.value = "9999"; // 👈 límite
                    }}
                  />
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
                        if (soloNumeros.length > 7) return; // 👈 máximo 7 cifras
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

export default CrearInsumoModal;
