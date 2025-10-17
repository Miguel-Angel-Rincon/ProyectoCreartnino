import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/style.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProduccion, detalleProduccion } from "../../interfaces/IProduccion";
import type { IProductos } from "../../interfaces/IProductos";
import type { IInsumos } from "../../interfaces/IInsumos";

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleUI {
  producto: string;
  cantidad: number;
  insumos: InsumoGasto[];
}

interface Props {
  idProduccion: number;
  onClose: () => void;
}

const VerProduccionVista: React.FC<Props> = ({ idProduccion, onClose }) => {
  const [produccion, setProduccion] = useState<IProduccion | null>(null);
  const [productosDetalle, setProductosDetalle] = useState<DetalleUI[]>([]);
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const respProd = await fetch(`${APP_SETTINGS.apiUrl}Produccion/Obtener/${idProduccion}`);
        if (!respProd.ok) throw new Error("No se pudo obtener la producción");
        const prod: IProduccion = await respProd.json();
        setProduccion(prod);

        const respDet = await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Lista`);
        const detalles: detalleProduccion[] = await respDet.json();
        const detallesProd = detalles.filter((d) => d.IdProduccion === idProduccion);

        const [respProdList, respIns] = await Promise.all([
          fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
        ]);
        const productos: IProductos[] = await respProdList.json();
        const insumos: IInsumos[] = await respIns.json();

        const agrupados: Record<number, DetalleUI> = {};
        for (const d of detallesProd) {
          const producto = productos.find((p) => p.IdProducto === d.IdProducto);
          const insumo = insumos.find((i) => i.IdInsumo === d.IdInsumo);

          if (!agrupados[d.IdProducto]) {
            agrupados[d.IdProducto] = {
              producto: producto?.Nombre ?? `Producto #${d.IdProducto}`,
              cantidad: 0,
              insumos: [],
            };
          }

          agrupados[d.IdProducto].cantidad += d.CantidadProducir ?? 0;

          if (insumo) {
            agrupados[d.IdProducto].insumos.push({
              insumo: insumo.Nombre,
              cantidadUsada: d.CantidadInsumo ?? 0,
              disponible: insumo.Cantidad ?? 0,
            });
          }
        }

        setProductosDetalle(Object.values(agrupados));
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los datos de la producción", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idProduccion]);

  const resumenInsumos = (insumos: InsumoGasto[]) => {
    if (!insumos || insumos.length === 0) return null;
    const totales: Record<string, { usado: number; disponible: number }> = {};
    insumos.forEach((ins) => {
      if (!totales[ins.insumo]) {
        totales[ins.insumo] = { usado: 0, disponible: ins.disponible };
      }
      totales[ins.insumo].usado += ins.cantidadUsada;
    });

    return (
      <div className="mt-3">
        <h6 className="text-secondary">Resumen de Insumos:</h6>
        <ul className="mb-0 ps-3">
          {Object.entries(totales).map(([nombre, datos], i) => (
            <li key={i}>
              {nombre}: Usado {datos.usado}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) return <p className="text-center my-5">Cargando producción...</p>;
  if (!produccion) return <p className="text-center">No se encontró la producción.</p>;

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">🔍 Detalle de Producción</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre</label>
          <input type="text" className="form-control" value={produccion.NombreProduccion ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción</label>
          <input type="text" className="form-control" value={produccion.TipoProduccion ?? ""} disabled />
        </div>
      </div><br />

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio</label>
          <input type="text" className="form-control" value={produccion.FechaInicio ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización</label>
          <input type="text" className="form-control" value={produccion.FechaFinal ?? ""} disabled />
        </div>
      </div>

      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto</div>
          <div className="col-md-4">Cantidad</div>
          <div className="col-md-3">Insumos</div>
        </div>

        {productosDetalle.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-5">
              <input type="text" className="form-control" value={item.producto} disabled />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" value={item.cantidad} disabled />
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setMostrarSubmodal(index)}
              >
                Gasto de insumos 🧪
              </button>

              {/* Modal CSS personalizado */}
              {mostrarSubmodal === index && (
  <div className="modal-overlay" onClick={() => setMostrarSubmodal(null)}>
    <div className="modal-box-pastel" onClick={(e) => e.stopPropagation()}>
      {/* Encabezado con degradado rosado */}
      <div className="modal-header-pastel">
        <h5>Gasto Insumos 🧪</h5>
        <button className="close-btn" onClick={() => setMostrarSubmodal(null)}>
          ✖
        </button>
      </div>

      {/* Cuerpo del modal */}
      <div className="modal-body">
        {item.insumos.length > 0 ? (
          <>
            {item.insumos.map((insumo, i) => (
              <div key={i} className="row align-items-center mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control pastel-input"
                    value={insumo.insumo}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control pastel-input"
                    value={insumo.cantidadUsada}
                    disabled
                  />
                </div>
              </div>
            ))}
            {resumenInsumos(item.insumos)}
          </>
        ) : (
          <p className="text-muted">Sin insumos registrados.</p>
        )}
      </div>

      {/* Botón de cierre */}
      <div className="text-end mt-3">
        <button
          className="btn pastel-btn-listo btn-sm"
          onClick={() => setMostrarSubmodal(null)}
        >
          ✓ Listo
        </button>
      </div>
    </div>
  </div>
)}

            </div>
          </div>
        ))}
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default VerProduccionVista;
