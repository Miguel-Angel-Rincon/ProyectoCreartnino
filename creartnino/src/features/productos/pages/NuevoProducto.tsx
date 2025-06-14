import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

let idProductoActual = 209;

interface Props {
  onClose: () => void;
  onCrear: (formData: any) => void;
}

const CrearProductoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string>('');
  const [imagenPersonalURL, setImagenPersonalURL] = useState<string>('');
  const [archivoLocal, setArchivoLocal] = useState<File | null>(null);

  const imagenesDisponibles = [
    'https://via.placeholder.com/300x200.png?text=Imagen+1',
    'https://via.placeholder.com/300x200.png?text=Imagen+2',
    'https://via.placeholder.com/300x200.png?text=Imagen+3',
  ];

  const handleArchivoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPersonalURL(reader.result as string);
        setImagenSeleccionada('');
      };
      reader.readAsDataURL(archivo);
      setArchivoLocal(archivo);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const cantidad = parseInt(form.cantidad.value);
    const precio = parseFloat(form.precio.value);

    if (cantidad < 0 || precio < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'La cantidad y el precio deben ser positivos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const imagenFinal = imagenSeleccionada || imagenPersonalURL;

    if (!imagenFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debe seleccionar o ingresar la URL de una imagen.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const nuevoProducto = {
      IdProducto: idProductoActual++,
      IdCatProductos: form.categoria.value,
      Nombre: form.nombre.value,
      Imagen: imagenFinal,
      cantidad,
      marca: 'Creartnino',
      precio,
    };

    onCrear(nuevoProducto);
  };

  const vistaPrevia = imagenSeleccionada || imagenPersonalURL;

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🎨 Crear Nuevo Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                <div className="col-md-6">
                  <label className="form-label">🛍️ Nombre</label>
                  <input className="form-control" name="nombre" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📦 Categoría</label>
                  <select className="form-select" name="categoria">
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`Categoría ${i + 1}`}>Categoría {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🔢 Cantidad</label>
                  <input type="number" className="form-control" name="cantidad" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">💲 Precio</label>
                  <input type="number" className="form-control" name="precio" step="0.01" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🖼️ Imagen desde lista</label>
                  <select
                    className="form-select"
                    value={imagenSeleccionada}
                    onChange={(e) => {
                      setImagenSeleccionada(e.target.value);
                      setImagenPersonalURL('');
                    }}
                  >
                    <option value="">Seleccione una imagen</option>
                    {imagenesDisponibles.map((img, i) => (
                      <option key={i} value={img}>Imagen {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🔗 URL de imagen personalizada</label>
                  <div className="input-group">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://tusitio.com/imagen.jpg"
                      value={imagenPersonalURL.startsWith('data:image') ? '' : imagenPersonalURL}
                      onChange={(e) => {
                        setImagenPersonalURL(e.target.value);
                        setImagenSeleccionada('');
                      }}
                    />
                    <label className="btn btn-outline-secondary btn-sm mb-0">
                      📁
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleArchivoLocal}
                      />
                    </label>
                  </div>
                </div>

                {vistaPrevia && (
                  <div className="col-12 text-center mt-3">
                    <img
                      src={vistaPrevia}
                      alt="Vista previa"
                      className="img-thumbnail"
                      style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}

              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Crear Producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearProductoModal;
