import React from "react";
import { FaMoneyBillWave, FaPercent, FaCalculator } from "react-icons/fa";
import type { ICompras, IDetalleCompra } from "../../interfaces/Icompras";
import type { IProveedores } from "../../interfaces/IProveedores";
import type { IInsumos } from "../../interfaces/IInsumos";
import "../styles/style.css";

interface Props {
  compra: ICompras & { Detalle?: IDetalleCompra[] };
  proveedores: IProveedores[];
  detalles?: IDetalleCompra[];
  insumos?: IInsumos[];
  onClose: () => void;
}

const VerCompra: React.FC<Props> = ({
  compra,
  proveedores,
  detalles = [],
  insumos = [],
  onClose,
}) => {
  const detallesCompra = detalles.length > 0 ? detalles : compra.Detalle ?? [];

  const getInsumoNombre = (id: number | string) => {
    if (!insumos || insumos.length === 0) return `Insumo ${id}`;
    const idStr = String(id);
    const found = insumos.find((i) => String(i.IdInsumo) === idStr);
    return found?.Nombre || `Insumo ${id}`;
  };

  const subtotalDetalles = detallesCompra.reduce(
    (acc, d) => acc + Number(d.Subtotal ?? 0),
    0
  );
  const ivaDetalles = subtotalDetalles * 0.19;
  const totalDetalles = subtotalDetalles + ivaDetalles;

  const subtotal =
    subtotalDetalles > 0 ? subtotalDetalles : (compra.Total ?? 0) / 1.19;
  const iva =
    subtotalDetalles > 0
      ? ivaDetalles
      : (compra.Total ?? 0) - (compra.Total ?? 0) / 1.19;
  const total = compra.Total ?? totalDetalles;

  const proveedor =
    proveedores.find((p) => p.IdProveedor === compra.IdProveedor)
      ?.NombreCompleto || "Desconocido";

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Visualizar la compra #{compra.IdCompra}</h2>

      {/* Proveedor, Método de Pago y Fecha */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">🧑 Proveedor</label>
          <input className="form-control" value={proveedor} disabled />
        </div>
        <div className="col-md-4">
          <label className="form-label">💳 Método de Pago</label>
          <input
            className="form-control"
            value={compra.MetodoPago ?? "N/A"}
            disabled
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">📅 Fecha de Compra</label>
          <input
            className="form-control"
            value={new Date(compra.FechaCompra).toLocaleDateString("es-CO")}
            disabled
          />
        </div>
      </div>

      {/* Detalles */}
      <div className="mb-3">
        <h5 className="mb-3">📦 Productos</h5>
        {detallesCompra.length > 0 ? (
          <>
            <div className="row fw-bold text-secondary mb-1">
              <div className="col-md-4">Insumo</div>
              <div className="col-md-2">Cantidad</div>
              <div className="col-md-3">Precio</div>
              <div className="col-md-3">Subtotal</div>
            </div>

            {detallesCompra.map((d) => (
              <div
                key={d.IdDetalleCompra}
                className="row align-items-center mb-2"
              >
                <div className="col-md-4">
                  <input
                    className="form-control form-control-sm"
                    value={getInsumoNombre(d.IdInsumo)}
                    disabled
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    value={d.Cantidad}
                    disabled
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={`$${Number(d.PrecioUnitario).toLocaleString("es-CO")}`}
                    disabled
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={`$${Number(d.Subtotal).toLocaleString("es-CO")}`}
                    disabled
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>No hay detalles para esta compra.</p>
        )}
      </div>

      {/* Totales */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaMoneyBillWave size={18} className="mb-1 text-success" />
            <small className="d-block">Subtotal</small>
            <small>${Math.round(subtotal).toLocaleString("es-CO")}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaPercent size={18} className="mb-1 text-warning" />
            <small className="d-block">IVA (19%)</small>
            <small>${Math.round(iva).toLocaleString("es-CO")}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaCalculator size={18} className="mb-1 text-primary" />
            <small className="d-block">Total</small>
            <small>${Math.round(total).toLocaleString("es-CO")}</small>
          </div>
        </div>
      </div>

      {/* Botón */}
      <div className="text-end">
        <button className="btn pastel-btn-secondary" onClick={onClose}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default VerCompra;
