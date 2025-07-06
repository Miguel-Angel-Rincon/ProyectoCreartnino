import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

interface Producto {
  IdProducto: number;
  IdCatProductos: string;
  Nombre: string;
  Imagen: string;
  cantidad: number;
  marca: string;
  precio: number;
  estado: boolean;
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onEditar: (formData: Producto) => void;
}

const EditarProductoModal: React.FC<Props> = ({ producto, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Producto>(producto);
  const [imagenPersonalURL, setImagenPersonalURL] = useState<string>('');
  const [imagenLocal, setImagenLocal] = useState<string>('');
  const [urlValida, setUrlValida] = useState<boolean | null>(null);
  const [validandoURL, setValidandoURL] = useState(false);
  const [cantidadValida, setCantidadValida] = useState(true);
  const [precioValido, setPrecioValido] = useState(true);
  const [precioFormateado, setPrecioFormateado] = useState('');
  const [nombreValido, setNombreValido] = useState(true);
  const [categoriaValida, setCategoriaValida] = useState(true);

  useEffect(() => {
    setFormData({ ...producto, marca: 'CreartNino' });
    setPrecioFormateado(producto.precio.toLocaleString('es-CO'));
    setImagenPersonalURL(producto.Imagen.startsWith('http') ? producto.Imagen : '');
  }, [producto]);

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

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const numero = parseInt(valor);
    const esNumeroValido = /^\d+$/.test(valor) && numero >= 0;
    setCantidadValida(esNumeroValido);
    setFormData((prev) => ({ ...prev, cantidad: isNaN(numero) ? 0 : numero }));
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[.,\s]/g, '');
    const numero = parseInt(valor);
    const esNumeroValido = !isNaN(numero) && numero > 0;
    setPrecioValido(esNumeroValido);
    setFormData((prev) => ({ ...prev, precio: numero }));
    setPrecioFormateado(esNumeroValido ? numero.toLocaleString('es-CO') : '');
  };

  const handleArchivoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const extensionesValidas = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!extensionesValidas.includes(archivo.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo no válido',
        text: 'Solo se permiten imágenes JPG, PNG, GIF o WebP.',
        confirmButtonColor: '#f78fb3',
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagenLocal(base64);
      setImagenPersonalURL(base64);
    };
    reader.readAsDataURL(archivo);
  };

  const limpiarImagen = () => {
    setImagenLocal('');
    setImagenPersonalURL('');
    setUrlValida(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nombreVal = formData.Nombre.trim();
    const categoriaVal = formData.IdCatProductos.trim();
    setNombreValido(nombreVal.length > 2);
    setCategoriaValida(categoriaVal.length > 0);

    if (!cantidadValida || !precioValido || !nombreValido || !categoriaValida) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'Corrige todos los campos obligatorios antes de continuar.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const imagenFinal = imagenLocal || imagenPersonalURL || producto.Imagen;

    if (!imagenFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debe seleccionar o ingresar una imagen.',
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

    try {
      onEditar({
        ...formData,
        marca: 'CreartNino',
        Imagen: imagenFinal,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#f78fb3',
      });

      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al editar',
        text: 'Ocurrió un error inesperado al guardar los cambios.',
        confirmButtonColor: '#f78fb3',
      });
    }
  };

  const vistaPrevia = imagenLocal || imagenPersonalURL || producto.Imagen;

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    🛍️ Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${!nombreValido ? 'is-invalid' : ''}`}
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${!categoriaValida ? 'is-invalid' : ''}`}
                    name="IdCatProductos"
                    value={formData.IdCatProductos}
                    onChange={(e) => setFormData({ ...formData, IdCatProductos: e.target.value })}
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
                    value={formData.cantidad}
                    onChange={handleCantidadChange}
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
                    value={precioFormateado}
                    onChange={handlePrecioChange}
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    🔗 URL o archivo de imagen <span className="text-danger">*</span>
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
                  {validandoURL && <div className="form-text text-warning">Validando URL de la imagen...</div>}
                  {urlValida === false && !validandoURL && (
                    <div className="invalid-feedback d-block">
                      La URL proporcionada no es válida o no se pudo cargar la imagen.
                    </div>
                  )}
                  {(imagenPersonalURL || imagenLocal) && (
                    <button type="button" className="btn btn-sm btn-danger mt-2" onClick={limpiarImagen}>
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
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProductoModal;
