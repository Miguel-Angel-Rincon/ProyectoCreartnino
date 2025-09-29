import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FaMoneyBillWave,
  FaPercent,
  FaCalculator,
  FaTrash,
} from "react-icons/fa";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProveedores } from "../../interfaces/IProveedores";
import type { IInsumos } from "../../interfaces/IInsumos";
import "../styles/style.css";

interface CrearCompraProps {
  onClose: () => void;
  onCrear: (compra: any) => void;
}

interface CompraDetalle {
  idInsumo?: number;
  insumo: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
}

const getToday = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const CrearCompra: React.FC<CrearCompraProps> = ({ onClose, onCrear }) => {
  const [proveedores, setProveedores] = useState<IProveedores[]>([]);
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [proveedorIdSeleccionado, setProveedorIdSeleccionado] = useState<
    number | null
  >(null);
  const [proveedorBusqueda, setProveedorBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [detalleCompra, setDetalleCompra] = useState<CompraDetalle[]>([]);
  const [insumoQuery, setInsumoQuery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fechaCompra = getToday();

  const buildApiUrl = (path: string) => {
    const base = (APP_SETTINGS.apiUrl || "").replace(/\/+$/, "");
    const p = path.replace(/^\/+/, "");
    return `${base}/${p}`;
  };

  const normalizarTexto = (valor: string) => valor.replace(/\s+/g, " ").trim();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provRes, insuRes] = await Promise.all([
          fetch(buildApiUrl("Proveedores/Lista")),
          fetch(buildApiUrl("Insumos/Lista")),
        ]);
        if (!provRes.ok) throw new Error(`Proveedor: ${provRes.status}`);
        if (!insuRes.ok) throw new Error(`Insumo: ${insuRes.status}`);

        setProveedores(await provRes.json());
        setInsumos(await insuRes.json());
      } catch (err: any) {
        console.error("❌ Error al cargar datos:", err);
        Swal.fire("Error", "No se pudieron cargar proveedores o insumos.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const proveedoresFiltrados = proveedorBusqueda
    ? proveedores.filter((p) =>
        (p.NombreCompleto ?? "")
          .toLowerCase()
          .includes(proveedorBusqueda.toLowerCase())
      )
    : [];

  const handleProveedorSelect = (p: IProveedores) => {
    setProveedorIdSeleccionado(p.IdProveedor!);
    setProveedorBusqueda(p.NombreCompleto ?? "");
  };

  const agregarDetalle = () => {
    setDetalleCompra((prev) => [
      ...prev,
      { insumo: "", cantidad: 1, precio: 0, subtotal: 0 },
    ]);
    setInsumoQuery((prev) => [...prev, ""]);
  };

  const calcularSubtotalFila = (cantidad: number, precio: number) =>
    Math.round(cantidad * precio * 100) / 100;

  const actualizarDetalle = (
    index: number,
    campo: keyof CompraDetalle,
    valor: string | number
  ) => {
    const copia = [...detalleCompra];
    if (!copia[index]) return;

    if (campo === "cantidad") copia[index].cantidad = Number(valor) || 0;
    else if (campo === "precio") copia[index].precio = Number(valor) || 0;
    else if (campo === "insumo") {
      const insu = insumos.find((i) => i.Nombre === valor);
      copia[index].insumo = insu?.Nombre ?? (valor as string);
      copia[index].precio = insu?.PrecioUnitario ?? copia[index].precio;
      copia[index].idInsumo = insu?.IdInsumo;
      setInsumoQuery((prev) => {
        const copy = [...prev];
        copy[index] = "";
        return copy;
      });
    }

    copia[index].subtotal = calcularSubtotalFila(
      copia[index].cantidad,
      copia[index].precio
    );
    setDetalleCompra(copia);
  };

  const seleccionarInsumo = (index: number, nombre: string) => {
    const insu = insumos.find((i) => i.Nombre === nombre);
    if (!insu) return;
    actualizarDetalle(index, "insumo", insu.Nombre);
  };

  const handleInsumoQueryChange = (index: number, value: string) => {
    setInsumoQuery((prev) => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
    setDetalleCompra((prev) => {
      const copia = [...prev];
      if (copia[index])
        copia[index] = { ...copia[index], insumo: "", idInsumo: undefined };
      return copia;
    });
  };

  const eliminarDetalle = (index: number) => {
    setDetalleCompra((prev) => prev.filter((_, i) => i !== index));
    setInsumoQuery((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularSubtotal = () =>
    detalleCompra.reduce(
      (acc, item) =>
        acc + (item.subtotal ?? calcularSubtotalFila(item.cantidad, item.precio)),
      0
    );
  const calcularIVA = () => {
  const subtotal = calcularSubtotal();
  return subtotal >= 300000 ? Math.round(subtotal * 0.19 * 100) / 100 : 0;
};

  const calcularTotal = () =>
    Math.round((calcularSubtotal() + calcularIVA()) * 100) / 100;

  // === Guardar compra y actualizar stock de insumos ===
  const handleSubmit = async () => {
    if (submitting) return;
    if (!proveedorIdSeleccionado) {
      Swal.fire("⚠ Atención", "Debes seleccionar un proveedor válido.", "warning");
      return;
    }
    if (!metodoPago) {
      Swal.fire("⚠ Atención", "Selecciona un método de pago.", "warning");
      return;
    }
    if (detalleCompra.length === 0) {
      Swal.fire("⚠ Atención", "Debes agregar al menos un insumo.", "warning");
      return;
    }

    for (let i = 0; i < detalleCompra.length; i++) {
      const item = detalleCompra[i];
      const existe = insumos.some((ins) => ins.Nombre === item.insumo);
      if (!item.insumo || !existe || item.cantidad <= 0 || item.precio <= 0) {
        Swal.fire(
          "⚠ Error",
          `Fila #${i + 1}: debes completar insumo, cantidad y precio válidos.`,
          "warning"
        );
        return;
      }
    }

    const payload = {
      IdCompra: 0,
      IdProveedor: proveedorIdSeleccionado,
      MetodoPago: metodoPago,
      FechaCompra: fechaCompra,
      Total: calcularTotal(),
      IdEstado: 1,
      DetallesCompras: detalleCompra.map((d) => ({
        IdDetalleCompra: 0,
        IdCompra: 0,
        IdInsumo: d.idInsumo,
        Cantidad: d.cantidad,
        PrecioUnitario: d.precio,
        Subtotal: d.subtotal,
      })),
    };

    setSubmitting(true);
    try {
      // Crear compra
      const resp = await fetch(buildApiUrl("Compras/Crear"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Error al crear la compra");

      const compraCreada = await resp.json();

      // Actualizar stock de insumos
      for (let detalle of detalleCompra) {
        if (!detalle.idInsumo) continue;
        const insumo = insumos.find((i) => i.IdInsumo === detalle.idInsumo);
        if (!insumo) continue;

        const nuevaCantidad = (insumo.Cantidad ?? 0) + detalle.cantidad;

        await fetch(buildApiUrl(`Insumos/Actualizar/${detalle.idInsumo}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...insumo, Cantidad: nuevaCantidad }),
        });
      }

      Swal.fire(
        "Éxito",
        "La compra y el stock de insumos se actualizaron correctamente.",
        "success"
      );
      onCrear(compraCreada);
      onClose();
    } catch (err: any) {
      console.error(err);
      Swal.fire(
        "❌ Error",
        err.message || "No se pudo guardar la compra.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Compra</h2>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 180 }}
        >
          <div className="spinner-border" role="status" aria-hidden="true" />
          <span className="ms-2">Cargando datos...</span>
        </div>
      ) : (
        <>
          {/* Proveedor y método */}
          <div className="row mb-3">
            <div className="col-md-4 position-relative">
              <label className="form-label">🧑 Proveedor *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar proveedor..."
                value={proveedorBusqueda}
                onChange={(e) => {
                  setProveedorBusqueda(normalizarTexto(e.target.value));
                  setProveedorIdSeleccionado(null);
                }}
              />
              {!proveedorIdSeleccionado &&
                proveedorBusqueda &&
                proveedoresFiltrados.length > 0 && (
                  <ul
                    className="list-group position-absolute w-100"
                    style={{ zIndex: 1000 }}
                  >
                    {proveedoresFiltrados.map((p) => (
                      <li
                        key={p.IdProveedor}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleProveedorSelect(p)}
                      >
                        {p.NombreCompleto}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div className="col-md-4">
              <label className="form-label">💳 Método de Pago *</label>
              <select
                className="form-select"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">📅 Fecha de Compra</label>
              <input
                type="date"
                className="form-control"
                value={fechaCompra}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Detalle compra */}
          <div className="mb-3">
            <h5 className="mb-3">📦 Detalle de la compra</h5>
            <div className="row fw-bold text-secondary mb-1">
              <div className="col-md-3">Insumo</div>
              <div className="col-md-2">Cantidad</div>
              <div className="col-md-2">Precio</div>
              <div className="col-md-3">Subtotal</div>
              <div className="col-md-2 text-end">Acción</div>
            </div>

            {detalleCompra.map((item, index) => {
              const query = insumoQuery[index] ?? "";
              const sugerencias =
                query.length > 0
                  ? insumos.filter((i) =>
                      i.Nombre.toLowerCase().includes(query.toLowerCase())
                    )
                  : [];

              return (
                <div
                  key={index}
                  className="row align-items-center mb-2 position-relative"
                >
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Buscar insumo..."
                      value={query !== "" ? query : item.insumo}
                      onChange={(e) =>
                        handleInsumoQueryChange(index,normalizarTexto (e.target.value))
                      }
                    />
                    {query && sugerencias.length > 0 && (
                      <ul
                        className="list-group position-absolute w-100"
                        style={{ zIndex: 1000, top: "38px" }}
                      >
                        {sugerencias.map((i) => (
                          <li
                            key={i.IdInsumo}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: "pointer" }}
                            onClick={() => seleccionarInsumo(index, i.Nombre)}
                          >
                            {i.Nombre} - $
                            {(
                              (i as any).PrecioUnitario ?? (i as any).Precio
                            ).toLocaleString("es-CO")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-md-2">
                    <input
    type="number"
    className="form-control form-control-sm"
    min={1}
    step={1}
    value={item.cantidad}
    onChange={(e) => actualizarDetalle(index, "cantidad", e.target.value)}
    onKeyDown={(e) => {
      if (["e", "E", "+", "-", "."].includes(e.key)) {
        e.preventDefault();
      }
    }}
  />

                  </div>
                  <div className="col-md-2">
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.precio}
          readOnly
        />
      </div>
                  <div className="col-md-3">
                    <input
                      className="form-control form-control-sm"
                      value={`$${Math.round(
                        (item.subtotal ?? item.cantidad * item.precio) || 0
                      ).toLocaleString("es-CO")}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-2 text-end">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarDetalle(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="btn btn-sm pastel-btn-secondary mt-2"
              onClick={agregarDetalle}
            >
              + Agregar Insumo
            </button>
          </div>

          {/* Resumen */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="pastel-card text-center">
                <FaMoneyBillWave size={18} className="mb-1" />
                <small className="d-block">Subtotal</small>
                <small>
                  ${Math.round(calcularSubtotal()).toLocaleString("es-CO")}
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pastel-card text-center">
                <FaPercent size={18} className="mb-1" />
                <small className="d-block">IVA (19%)</small>
                <small>
                  ${Math.round(calcularIVA()).toLocaleString("es-CO")}
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="pastel-card text-center">
                <FaCalculator size={18} className="mb-1" />
                <small className="d-block">Total</small>
                <small>
                  ${Math.round(calcularTotal()).toLocaleString("es-CO")}
                </small>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="text-end">
            <button
              type="button"
              className="btn pastel-btn-secondary me-2"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn pastel-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CrearCompra;
