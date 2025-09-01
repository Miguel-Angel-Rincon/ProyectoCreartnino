import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/acciones.css";

// Interfaces
import type { IImagenesProductos } from "../../interfaces/IImagenesProductos";
import type { IProductos } from "../../interfaces/IProductos";
import type { ICatProductos } from "../../interfaces/ICatProductos";

interface Props {
  onClose: () => void;
  onCrear: (formData: IProductos) => void;
}

const CrearProductoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  // 📌 Estados
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<number | "">("");
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioValido, setPrecioValido] = useState(true);
  const [cantidadValida, setCantidadValida] = useState(true);

  const [imagenPersonalURL, setImagenPersonalURL] = useState("");
  const [imagenLocal, setImagenLocal] = useState<File | null>(null);
  const [urlValida, setUrlValida] = useState<boolean | null>(null);
  const [validandoURL, setValidandoURL] = useState(false);

  const [enviando, setEnviando] = useState(false); // ⬅️ Nuevo estado

  // 🔹 Traer categorías desde API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(
          "https://apicreartnino.somee.com/api/Categoria_Productos/Lista"
        );
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías", err);
      }
    };
    fetchCategorias();
  }, []);

  // 🔹 Validar URLs
  useEffect(() => {
    const validar = async () => {
      if (!imagenPersonalURL || imagenPersonalURL.startsWith("data:image")) {
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

  const validarURLImagen = (url: string): Promise<boolean> =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });

  // 🔹 Manejo de imágenes
  const handleArchivoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setImagenLocal(archivo);
      setImagenPersonalURL("");
    }
  };

  const limpiarImagen = () => {
    setImagenPersonalURL("");
    setImagenLocal(null);
    setUrlValida(null);
  };

  // 🔹 Manejo de precio/cantidad
  const formatearPrecio = (valor: string) => {
    const limpio = valor.replace(/[^0-9]/g, "");
    if (!limpio) return "";
    return parseInt(limpio).toLocaleString("es-CO");
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpio = e.target.value.replace(/[^0-9]/g, "");
    setPrecio(formatearPrecio(limpio));
  };

  // 🔹 Manejo de cantidad (simple con longitud)
const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const valor = e.target.value.replace(/[^0-9]/g, ""); // Solo números

  // 👉 Solo permite hasta 4 dígitos
  if (valor.length > 4) return;

  setCantidad(valor);
  setCantidadValida(!!valor && parseInt(valor) > 0);
};


  // 🔹 Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (enviando) return; // ⬅️ Evita doble click
    setEnviando(true);

    try {
      const cantidadNum = parseInt(cantidad);
      const precioNum = parseInt(precio.replace(/[.,\s]/g, ""));

      const camposValidos =
        nombre.trim() && categoria && cantidadNum > 0 && precioNum > 0;

      setCantidadValida(!isNaN(cantidadNum) && cantidadNum > 0);
      setPrecioValido(!isNaN(precioNum) && precioNum > 0);

      if (!camposValidos) {
        Swal.fire({
          icon: "error",
          title: "Datos inválidos",
          text: "Todos los campos deben estar completos y mayores a cero.",
        });
        return;
      }

      let urlImagen = imagenPersonalURL;

      // Subir imagen local a Cloudinary
      if (imagenLocal) {
        const formData = new FormData();
        formData.append("file", imagenLocal);
        formData.append("upload_preset", "Creartnino");

        try {
          const resCloud = await axios.post(
            "https://api.cloudinary.com/v1_1/angelr10/image/upload",
            formData
          );
          urlImagen = resCloud.data.secure_url;
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error al subir imagen",
            text: "No se pudo subir la imagen a Cloudinary",
          });
          return;
        }
      }

      if (!urlImagen) {
        Swal.fire({
          icon: "warning",
          title: "Imagen requerida",
          text: "Debe subir o ingresar la URL de una imagen.",
        });
        return;
      }

      // Guardar imagen en API
      let idImagen = 0;
      try {
        const nuevaImg: IImagenesProductos = {
          Url: urlImagen,
          Descripcion: nombre,
        };
        const resImg = await axios.post(
          "https://apicreartnino.somee.com/api/Imagenes_Productos/Crear",
          nuevaImg
        );
        idImagen = resImg.data.IdImagen;
      } catch (err) {
        console.error("Error guardando imagen", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo registrar la imagen",
        });
        return;
      }

      // Guardar producto en API
      const nuevoProducto: IProductos = {
        CategoriaProducto: Number(categoria),
        Nombre: nombre,
        Imagen: idImagen,
        Cantidad: cantidadNum,
        Marca: "CreartNino",
        Precio: precioNum,
        Estado: true,
      };

      await axios.post(
        "https://apicreartnino.somee.com/api/Productos/Crear",
        nuevoProducto
      );

      Swal.fire({
        icon: "success",
        title: "Producto creado con éxito",
        
      });

      onCrear(nuevoProducto);
      onClose();
    } catch (err) {
      console.error("Error creando producto", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar el producto",
      });
    } finally {
      setEnviando(false); // ⬅️ Volvemos a habilitar botón
    }
  };

  const vistaPrevia =
    imagenLocal ? URL.createObjectURL(imagenLocal) : imagenPersonalURL;

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🎨 Crear Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label">🛍️ Nombre <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="col-md-6">
                  <label className="form-label">📦 Categoría <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(Number(e.target.value))}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat) => (
                      <option
                        key={cat.IdCategoriaProducto}
                        value={cat.IdCategoriaProducto}
                      >
                        {cat.CategoriaProducto1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
<div className="col-md-6">
  <label className="form-label">
    🔢 Cantidad <span className="text-danger">*</span>
  </label>
  <input
    type="text"
    className={`form-control ${!cantidadValida ? "is-invalid" : ""}`}
    value={cantidad}
    onChange={handleCantidadChange}
    maxLength={4}   // 🔹 No deja escribir más de 4 dígitos
    required
  />
  <div className="form-text">Máximo 4 dígitos (hasta 9999)</div>
</div>


                
                {/* Precio */}
<div className="col-md-6">
  <label className="form-label">
    💲 Precio <span className="text-danger">*</span>
  </label>
  <input
    type="text"
    className={`form-control ${!precioValido ? "is-invalid" : ""}`}
    value={precio}
    onChange={handlePrecioChange}
    maxLength={8}
    required
  />
  <div className="form-text">Máximo 7 dígitos</div>
</div>

                {/* Imagen */}
                <div className="col-md-12">
                  <label className="form-label">🖼️ Imagen personalizada <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="url"
                      className={`form-control ${urlValida === false ? "is-invalid" : ""}`}
                      placeholder="https://tusitio.com/imagen.jpg"
                      value={
                        imagenPersonalURL.startsWith("data:image")
                          ? ""
                          : imagenPersonalURL
                      }
                      onChange={(e) => {
                        setImagenPersonalURL(e.target.value);
                        setImagenLocal(null);
                      }}
                      disabled={!!imagenLocal}
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

                  {validandoURL && (
                    <div className="form-text text-warning">
                      Validando URL de la imagen...
                    </div>
                  )}
                  {urlValida === false && !validandoURL && (
                    <div className="invalid-feedback d-block">
                      La URL no es válida o no se pudo cargar la imagen.
                    </div>
                  )}
                  {(imagenPersonalURL || imagenLocal) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger mt-2"
                      onClick={limpiarImagen}
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>

                {/* Vista previa */}
                {vistaPrevia && (
                  <div className="col-12 text-center mt-3">
                    <img
                      src={vistaPrevia}
                      alt="Vista previa"
                      className="img-thumbnail"
                      style={{
                        maxWidth: "180px",
                        maxHeight: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button
                type="button"
                className="btn pastel-btn-secondary"
                onClick={onClose}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn pastel-btn-primary"
                disabled={enviando}
              >
                {enviando ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearProductoModal;
