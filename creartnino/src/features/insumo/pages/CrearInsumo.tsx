    // components/CrearInsumoModal.tsx
    import React from 'react';
    import Swal from 'sweetalert2';


    // Variable externa para manejar el ID incremental
    let idInsumoActual = 409; // Comenzamos desde 209 para evitar conflictos con los insumos iniciales

    interface Props {
    onClose: () => void;
    onCrear: (formData: any) => void;
    }

    const CrearInsumoModal: React.FC<Props> = ({ onClose, onCrear }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        const cantidad = parseInt(form.cantidad.value);
        const precioUnitario = parseFloat(form.precioUnitario.value);

        // Validaciones con SweetAlert
        if (cantidad < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Cantidad inválida',
            text: 'La cantidad no puede ser un número negativo.',
            confirmButtonColor: '#e83e8c',
        });
        return;
        }

        if (precioUnitario < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Precio inválido',
            text: 'El precio no puede ser un número negativo.',
            confirmButtonColor: '#e83e8c',
        });
        return;
        }

        const nuevoInsumo = {
        IdInsumos: idInsumoActual++,
        IdCatInsumo: form.categoria.value,
        Nombre: form.nombre.value,
        Descripcion: form.descripcion.value,
        marca: form.marca.value,
        cantidad,
        precioUnitario,
        estado: form.estado.checked,
        };

        onCrear(nuevoInsumo);
    };

    return (
        <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
            <form onSubmit={handleSubmit}>
                <div className="modal-header bg-pink text-white">
                <h5 className="modal-title">Crear Insumo</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select className="form-select" name="categoria">
                    {Array.from({ length: 8 }, (_, i) => (
                        <option key={i}>Categoría {i + 1}</option>
                    ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" name="nombre" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input className="form-control" name="descripcion" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input className="form-control" name="marca" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input type="number" className="form-control" name="cantidad" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Precio Unitario</label>
                    <input type="number" className="form-control" name="precioUnitario" step="0.01" required />
                </div>
                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" name="estado" defaultChecked />
                    <label className="form-check-label">Activo</label>
                </div>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-pink">Crear</button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
    };

    export default CrearInsumoModal;
