    // components/VerProductoModal.tsx
    import React from 'react';

    interface Insumos {
    IdInsumos: number;
    IdCatInsumo: string;
    Nombre: string;
    Descripcion: string;
    marca: string;
    cantidad: number;
    precioUnitario: number;
    estado: boolean;
    }

    interface Props {
    insumo: Insumos;
    onClose: () => void;
    }

    const VisualizarInsumoModal: React.FC<Props> = ({ insumo, onClose }) => {
    return (
        <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
            <div className="modal-header bg-pink text-white">
                <h5 className="modal-title">Detalle del Insumo</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <div className="mb-3">
                <label className="form-label">ID Insumo</label>
                <input
                    className="form-control"
                    value={insumo.IdInsumos}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">ID Categoría de Insumo</label>
                <input
                    className="form-control"
                    value={insumo.IdCatInsumo}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                    className="form-control"
                    value={insumo.Nombre}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Descripción</label>
                <input
                    className="form-control"
                    value={insumo.Descripcion}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Marca</label>
                <input
                    className="form-control"
                    value={insumo.marca}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input
                    className="form-control"
                    value={insumo.cantidad}
                    disabled
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Precio Unitario</label>
                <input
                    className="form-control"
                    value={insumo.precioUnitario}
                    disabled
                />
                </div>
                <div className="form-check form-switch mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={insumo.estado}
                    disabled
                />
                <label className="form-check-label">Activo</label>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default VisualizarInsumoModal;
