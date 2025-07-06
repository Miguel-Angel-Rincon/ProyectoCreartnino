import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

let idProductoActual = 209;

interface Props {
  onClose: () => void;
  onCrear: (formData: any) => void;
}

const CrearProductoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioValido, setPrecioValido] = useState(true);
  const [cantidadValida, setCantidadValida] = useState(true);
  const [imagenPersonalURL, setImagenPersonalURL] = useState('');
  const [imagenLocal, setImagenLocal] = useState('');
  const [urlValida, setUrlValida] = useState<boolean | null>(null);
  const [validandoURL, setValidandoURL] = useState(false);

  useEffect(() => {
    const validar = async () => {
      if (!imagenPersonalURL || imagenPersonalURL.startsWith('data:image')) {
        setUrlValida(null);
        return;
      }

      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlRegex.test(imagenPersonalURL)) {
        setUrlValida(false);
        return;
      }

      setValidandoURL(true);
      const esValida = await validarURLImagen(imagenPersonalURL);
      setUrlValida(esValida);
      setValidandoURL(false);
    };

    const delay = setTimeout(validar, 500);
    return () => clearTimeout(delay);
  }, [imagenPersonalURL]);

  const validarURLImagen = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const handleArchivoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagenLocal(result);
        setImagenPersonalURL(result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const limpiarImagen = () => {
    setImagenPersonalURL('');
    setImagenLocal('');
    setUrlValida(null);
  };

  const formatearPrecio = (valor: string) => {
    const limpio = valor.replace(/[^0-9]/g, '');
    if (!limpio) return '';
    return parseInt(limpio).toLocaleString('es-CO');
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const limpio = raw.replace(/[^0-9]/g, '');
    setPrecio(formatearPrecio(limpio));
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const numero = parseInt(valor);
    const esEntero = /^\d+$/.test(valor);
    setCantidadValida(esEntero && numero > 0);
    setCantidad(valor);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseInt(precio.replace(/[.,\s]/g, ''));

    const camposValidos = nombre.trim() && categoria && cantidadNum > 0 && precioNum > 0;

    setCantidadValida(!isNaN(cantidadNum) && cantidadNum > 0);
    setPrecioValido(!isNaN(precioNum) && precioNum > 0);

    if (!camposValidos) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'Todos los campos deben estar completos y los valores deben ser mayores a cero.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const imagenFinal = imagenPersonalURL || imagenLocal;

    if (!imagenFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debe subir o ingresar la URL de una imagen.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (imagenFinal.startsWith('http')) {
      const esValida = await validarURLImagen(imagenFinal);
      if (!esValida) {
        Swal.fire({
          icon: 'error',
          title: 'URL inválida',
          text: 'La imagen no se puede cargar desde la URL proporcionada.',
          confirmButtonColor: '#f78fb3',
        });
        return;
      }
    }

    const nuevoProducto = {
      IdProducto: idProductoActual++,
      IdCatProductos: categoria,
      Nombre: nombre,
      Imagen: imagenFinal,
      cantidad: cantidadNum,
      marca: 'CreartNino',
      precio: precioNum,
    };

    onCrear(nuevoProducto);
    onClose();
  };

  const vistaPrevia = imagenLocal || imagenPersonalURL;

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
                  <label className="form-label">
                    🛍️ Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`Categoría ${i + 1}`}>
                        Categoría {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    🔢 Cantidad <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${!cantidadValida ? 'is-invalid' : ''}`}
                    value={cantidad}
                    onChange={handleCantidadChange}
                    step="1"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    💲 Precio <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${!precioValido ? 'is-invalid' : ''}`}
                    value={precio}
                    onChange={handlePrecioChange}
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    🖼️ Imagen personalizada <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="url"
                      className={`form-control ${urlValida === false ? 'is-invalid' : ''}`}
                      placeholder="https://tusitio.com/imagen.jpg"
                      value={imagenPersonalURL.startsWith('data:image') ? '' : imagenPersonalURL}
                      onChange={(e) => {
                        setImagenPersonalURL(e.target.value);
                        setImagenLocal('');
                      }}
                      disabled={!!imagenLocal}
                    />
                    <label className="btn btn-outline-secondary btn-sm mb-0">
                      📁
                      <input type="file" accept="image/*" hidden onChange={handleArchivoLocal} />
                    </label>
                  </div>
                  {validandoURL && (
                    <div className="form-text text-warning">Validando URL de la imagen...</div>
                  )}
                  {urlValida === false && !validandoURL && (
                    <div className="invalid-feedback d-block">
                      La URL proporcionada no es válida o no se pudo cargar la imagen.
                    </div>
                  )}
                  {(imagenPersonalURL || imagenLocal) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger mt-2"
                      onClick={limpiarImagen}
                    >
                      Quitar imagen seleccionada
                    </button>
                  )}
                </div>

                {vistaPrevia && (
                  <div className="col-12 text-center mt-3">
                    <img
                      src={vistaPrevia}
                      alt="Vista previa"
                      className="img-thumbnail"
                      style={{
                        maxWidth: '180px',
                        maxHeight: '180px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
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
                Crear 
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearProductoModal;
