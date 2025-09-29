// components/VerProduccionVista.tsx
import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
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

        // 1) Obtener Producción
        const respProd = await fetch(`${APP_SETTINGS.apiUrl}Produccion/Obtener/${idProduccion}`);
        if (!respProd.ok) throw new Error("No se pudo obtener la producción");
        const prod: IProduccion = await respProd.json();
        setProduccion(prod);

        // 2) Obtener Catálogo de Estados
        const respEstados = await fetch(`${APP_SETTINGS.apiUrl}Estados_Produccion/Lista`);
        if (!respEstados.ok) throw new Error("No se pudo obtener el catálogo de estados");
        const estados = await respEstados.json();

        const estado = estados.find((e: any) => e.IdEstadoProduccion === prod.IdEstado);
        const nombreEstado = estado?.NombreEstado?.toLowerCase() ?? "";

        // 3) Obtener Detalles de Producción
        const respDet = await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Lista`);
        if (!respDet.ok) throw new Error("No se pudieron obtener detalles de producción");
        const detalles: detalleProduccion[] = await respDet.json();
        const detallesProd = detalles.filter((d) => d.IdProduccion === idProduccion);

        // 4) Obtener Productos e Insumos
        const [respProdList, respIns] = await Promise.all([
          fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
        ]);
        const productos: IProductos[] = await respProdList.json();
        const insumos: IInsumos[] = await respIns.json();

        // 5) AGRUPAR por IdProducto
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

        // 6) Validar estado y fechas
        switch (nombreEstado) {
          case "en proceso":
            if (prod.FechaFinal) {
              const fechaFinal = new Date(prod.FechaFinal);
              const hoy = new Date();
              const diff = fechaFinal.getTime() - hoy.getTime();
              const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));

              if (diasRestantes >= 0) {
                Swal.fire({
                  icon: "info",
                  title: "⏳ Tiempo restante",
                  text: `Faltan ${diasRestantes} día(s) para finalizar esta producción.`,
                  confirmButtonColor: "#a58cf0",
                });
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "⚠️ Fecha expirada",
                  text: "La fecha de finalización ya pasó. ¿Deseas cambiarla?",
                  confirmButtonText: "Cambiar fecha",
                  showCancelButton: true,
                  cancelButtonText: "Cerrar",
                  confirmButtonColor: "#f08c8c",
                });
              }
            }
            break;

          case "anulada":
            Swal.fire({
              icon: "error",
              title: "🛑 Producción anulada",
              text: "Esta producción fue anulada y no se puede modificar.",
              confirmButtonColor: "#f08c8c",
            });
            break;

          case "completado":
            Swal.fire({
              icon: "success",
              title: "✅ Producción completada",
              text: "La producción se completó con éxito.",
              confirmButtonColor: "#8cf0a5",
            });
            break;

          default:
            console.log("Estado no reconocido:", nombreEstado);
            break;
        }
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

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Cargando producción...</p>
      </div>
    );
  }

  if (!produccion) return <p className="text-center">No se encontró la producción.</p>;

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">🔍 Detalle de Producción</h2>

      {/* Info general */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre</label>
          <input type="text" className="form-control" value={produccion.NombreProduccion ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción</label>
          <input type="text" className="form-control" value={produccion.TipoProduccion ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📅 Fecha Inicio</label>
          <input type="date" className="form-control" value={produccion.FechaInicio ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha Finalización</label>
          <input type="date" className="form-control" value={produccion.FechaFinal ?? ""} disabled />
        </div>
      </div>

      {/* Detalles de productos */}
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
                Gasto de insumos🧪
              </button>

              {/* Modal de insumos */}
              <Modal
                show={mostrarSubmodal === index}
                onHide={() => setMostrarSubmodal(null)}
                centered
                className="pastel-modal"
              >
                <Modal.Header closeButton className="pastel-header">
                  <Modal.Title>🧪 Insumos Usados</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {item.insumos && item.insumos.length > 0 ? (
                    <>
                      {item.insumos.map((insumo, i) => (
                        <div key={i} className="row align-items-center mb-2">
                          <div className="col-md-6">
                            <input type="text" className="form-control" value={insumo.insumo} disabled />
                          </div>
                          <div className="col-md-6">
                            <input type="number" className="form-control" value={insumo.cantidadUsada} disabled />
                          </div>
                        </div>
                      ))}
                      {resumenInsumos(item.insumos)}
                    </>
                  ) : (
                    <p className="text-muted">Sin insumos registrados.</p>
                  )}
                  <div className="text-end mt-3">
                    <button className="btn pastel-btn-primary btn-sm" onClick={() => setMostrarSubmodal(null)}>
                      ✔ Cerrar
                    </button>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default VerProduccionVista;
