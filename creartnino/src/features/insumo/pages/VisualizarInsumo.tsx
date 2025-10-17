// components/VisualizarInsumoModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import '../styles/acciones.css';

import type { IInsumos } from '../../interfaces/IInsumos';
import type { ICatInsumos } from '../../interfaces/ICatInsumos';
import { APP_SETTINGS } from '../../../settings/appsettings';

interface Props {
  insumo: IInsumos;
  onClose: () => void;
}

const VisualizarInsumoModal: React.FC<Props> = ({ insumo, onClose }) => {
  const descripcionRef = useRef<HTMLTextAreaElement>(null);
  const [categoriaNombre, setCategoriaNombre] = useState<string>("");

  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // Ajustar alto de textarea
  useEffect(() => {
    if (descripcionRef.current) {
      descripcionRef.current.style.height = 'auto';
      descripcionRef.current.style.height = `${descripcionRef.current.scrollHeight}px`;
    }
  }, []);

  // Buscar el nombre de la categoría
  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const resp = await fetch(buildUrl("Categoria_Insumos/Lista"));
        if (!resp.ok) throw new Error("Error al cargar categorías");
        const data: ICatInsumos[] = await resp.json();

        const categoria = data.find(c => c.IdCatInsumo === insumo.IdCatInsumo);
        setCategoriaNombre(categoria ? categoria.NombreCategoria : "Desconocida");
      } catch (err) {
        console.error(err);
        setCategoriaNombre("Error al cargar");
      }
    };
    fetchCategoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insumo.IdCatInsumo]);

  // Formato COP para precio
  const precioFormateado = insumo.PrecioUnitario.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🔍 Detalle del Insumo</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              {/* Nombre y Categoría */}
              <div className="col-md-6">
                <label className="form-label">📝 Nombre</label>
                <input className="form-control" value={insumo.Nombre} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Categoría</label>
                <input className="form-control" value={categoriaNombre} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">⚖ Unidad de Medida</label>
                <input
                  className="form-control"
                  value={insumo.UnidadesMedidas}
                  disabled
                  title={insumo.UnidadesMedidas || 'No especificada'}
                />
              </div> 

              {/* Cantidad y Precio */}
              <div className="col-md-6">
                <label className="form-label">🔢 Cantidad</label>
                <input className="form-control" value={insumo.Cantidad} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">💲 Precio Unitario</label>
                <input className="form-control" value={precioFormateado} disabled />
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarInsumoModal;
