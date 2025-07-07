// components/VerProduccionVista.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../styles/style.css';

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
  insumos?: InsumoGasto[];
}

interface Produccion {
  IdProduccion: number;
  Nombre: string;
  TipoProduccion: string;
  FechaRegistro: string;
  FechaFinal: string;
  EstadosPedido: string;
  Estado: string;
  Productos: DetalleProduccion[];
}

interface Props {
  produccion: Produccion;
  onClose: () => void;
}

const VerProduccionVista: React.FC<Props> = ({ produccion, onClose }) => {
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  useEffect(() => {
    const fechaFinal = new Date(produccion.FechaFinal);
    const hoy = new Date();
    const diferenciaTiempo = fechaFinal.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diasRestantes >= 0) {
      Swal.fire({
        icon: 'info',
        title: '⏳ Tiempo restante',
        text: `Faltan ${diasRestantes} día(s) para finalizar esta producción.`,
        confirmButtonColor: '#a58cf0',
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Producción finalizada',
        text: 'La fecha de finalización ya pasó.',
        confirmButtonColor: '#f08c8c',
      });
    }
  }, []);

  const resumenInsumos = (insumos?: InsumoGasto[]) => {
    if (!insumos || insumos.length === 0) return null;
    const totales: Record<string, { usado: number; disponible: number }> = {};
    insumos.forEach(ins => {
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
              {nombre}: Usado {datos.usado} / Disponible {datos.disponible}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">🔍 Detalle de Producción</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre </label>
          <input type="text" className="form-control" value={produccion.Nombre} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción </label>
          <input type="text" className="form-control" value={produccion.TipoProduccion} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio </label>
          <input type="date" className="form-control" value={produccion.FechaRegistro} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización </label>
          <input type="date" className="form-control" value={produccion.FechaFinal} disabled />
        </div>
      </div>

      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto</div>
          <div className="col-md-4">Cantidad</div>
          <div className="col-md-3">Insumos</div>
        </div>

        {produccion.Productos.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-5">
              <input type="text" className="form-control" value={item.producto} disabled />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" value={item.cantidad} disabled />
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarSubmodal(index)}>🧪</button>

              <Modal show={mostrarSubmodal === index} onHide={() => setMostrarSubmodal(null)} centered className="pastel-modal">
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
                    <p className="text-muted">Sin insumos registrados para este producto.</p>
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

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary" onClick={onClose}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default VerProduccionVista;
