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

interface ImagenItem {
  id: string;
  url: string;
  archivo: File | null;
  urlValida: boolean | null;
  validando: boolean;
}

const CrearProductoModal: React.FC<Props> = ({ onClose, onCrear }) => {
  // Estados
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<number | "">("");
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioValido, setPrecioValido] = useState(true);
  
  //  Array de imágenes
  const [imagenes, setImagenes] = useState<ImagenItem[]>([
    { id: crypto.randomUUID(), url: "", archivo: null, urlValida: null, validando: false }
  ]);

  const [enviando, setEnviando] = useState(false);

  //  Traer categorías desde API
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

  // 🔹 Validar URLs de imágenes
  useEffect(() => {
    imagenes.forEach((img, index) => {
      if (!img.url || img.url.startsWith("data:image") || img.archivo) {
        return;
      }
// Validar formato básico de URL
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlRegex.test(img.url)) {
        actualizarImagen(index, { urlValida: false, validando: false });
        return;
      }

      const delay = setTimeout(async () => {
        actualizarImagen(index, { validando: true });
        const esValida = await validarURLImagen(img.url);
        actualizarImagen(index, { urlValida: esValida, validando: false });
      }, 500);

      return () => clearTimeout(delay);
    });
  }, [imagenes.map(img => img.url).join(",")]);
// Función para validar si una imagen carga correctamente
  const validarURLImagen = (url: string): Promise<boolean> =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });

  //  Funciones para manejar imágenes
  const agregarImagen = () => {
    if (imagenes.length >= 4) {
      Swal.fire({
        icon: "warning",
        title: "Límite alcanzado",
        text: "Máximo 4 imágenes por producto",
      });
      return;
    }
    setImagenes([...imagenes, { 
      id: crypto.randomUUID(), 
      url: "", 
      archivo: null, 
      urlValida: null, 
      validando: false 
    }]);
  };
// Eliminar imagen por índice
  const eliminarImagen = (index: number) => {
    if (imagenes.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Imagen requerida",
        text: "Debe tener al menos una imagen",
      });
      return;
    }
    setImagenes(imagenes.filter((_, i) => i !== index));
  };
// Actualizar propiedades de una imagen por índice
  const actualizarImagen = (index: number, cambios: Partial<ImagenItem>) => {
    setImagenes(imagenes.map((img, i) => 
      i === index ? { ...img, ...cambios } : img
    ));
  };
// Manejar cambio de URL
  const handleURLChange = (index: number, valor: string) => {
    const valorLimpio = valor.replace(/\s+/g, "");
    actualizarImagen(index, { 
      url: valorLimpio, 
      archivo: null,
      urlValida: null 
    });
  };
// Manejar selección de archivo local
  const handleArchivoLocal = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      actualizarImagen(index, { 
        archivo, 
        url: "", 
        urlValida: true 
      });
    }
  };
// Limpiar imagen (quitar URL y archivo)
  const limpiarImagen = (index: number) => {
    actualizarImagen(index, { 
      url: "", 
      archivo: null, 
      urlValida: null 
    });
  };

  //  Manejo de precio
  const formatearPrecio = (valor: string) => {
    const limpio = valor.replace(/[^0-9]/g, "");
    if (!limpio) return "";
    return parseInt(limpio).toLocaleString("es-CO");
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpio = e.target.value.replace(/[^0-9]/g, "");
    setPrecio(formatearPrecio(limpio));
  };

  // para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (enviando) return;
    setEnviando(true);

    try {
      const precioNum = parseInt(precio.replace(/[.,\s]/g, ""));
      const nombreTrim = nombre.trim();

      // ==========================
      //  VALIDACIONES DEL NOMBRE
      // ==========================
      const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
      const hasLongRepeatSequence = (s: string, n = 4) =>
        new RegExp(`(.)\\1{${n - 1},}`).test(s);
      const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
      const hasTooManySpecialChars = (s: string, maxPercent = 0.5) => {
        const specials = (s.match(/[^a-zA-Z0-9]/g) || []).length;
        return specials / s.length > maxPercent;
      };
      const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

      if (!nombreTrim) {
        Swal.fire({
          icon: "warning",
          title: "Nombre requerido",
          text: "El nombre del producto no puede estar vacío.",
        });
        setEnviando(false);
        return;
      }

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombreTrim)) {
        Swal.fire({
          icon: "error",
          title: "Nombre inválido",
          text: "El nombre solo puede contener letras, números y espacios.",
        });
        setEnviando(false);
        return;
      }

      if (
        nombreTrim.length < 3 ||
        nombreTrim.length > 50 ||
        isAllSameChar(nombreTrim) ||
        hasLongRepeatSequence(nombreTrim) ||
        isOnlySpecialChars(nombreTrim) ||
        hasTooManySpecialChars(nombreTrim) ||
        hasLowVariety(nombreTrim)
      ) {
        Swal.fire({
          icon: "error",
          title: "Nombre inválido",
          text: "Debe tener entre 3 y 50 caracteres, sin repeticiones excesivas.",
        });
        setEnviando(false);
        return;
      }

      // ==================================
      // VALIDACIÓN DE NOMBRE DUPLICADO
      // ==================================
      try {
        const resp = await axios.get(
          "https://apicreartnino.somee.com/api/Productos/Lista"
        );

        const productosExistentes = resp.data || [];
        const nombreNormalizado = nombreTrim
          .toLowerCase()
          .replace(/\s+/g, "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const existeDuplicado = productosExistentes.some(
          (p: any) =>
            p.Nombre &&
            p.Nombre.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
              nombreNormalizado
        );

        if (existeDuplicado) {
          Swal.fire({
            icon: "warning",
            title: "Nombre duplicado",
            text: "Ya existe un producto con este nombre.",
          });
          setEnviando(false);
          return;
        }
      } catch (error) {
        console.warn("No se pudo validar duplicados:", error);
      }

      // ===========================
      //  VALIDACIONES NUMÉRICAS
      // ===========================
      const camposValidos = nombreTrim && categoria && precioNum > 0;
      setPrecioValido(!isNaN(precioNum) && precioNum > 0);

      if (!camposValidos) {
        Swal.fire({
          icon: "error",
          title: "Datos inválidos",
          text: "Todos los campos deben estar completos y mayores a cero.",
        });
        setEnviando(false);
        return;
      }

      if (!descripcion.trim() || descripcion.length < 5) {
        Swal.fire({
          icon: "warning",
          title: "Descripción inválida",
          text: "La descripción debe tener al menos 5 caracteres.",
        });
        setEnviando(false);
        return;
      }

      // ===========================
      //  VALIDAR Y SUBIR IMÁGENES
      // ===========================
      const imagenesValidas = imagenes.filter(img => img.url || img.archivo);
      
      if (imagenesValidas.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Imagen requerida",
          text: "Debe agregar al menos una imagen.",
        });
        setEnviando(false);
        return;
      }

      const urlsImagenes: string[] = [];

      for (const img of imagenesValidas) {
        let urlImagen = img.url;

        // Subir archivo local a Cloudinary
        if (img.archivo) {
          const formData = new FormData();
          formData.append("file", img.archivo);
          formData.append("upload_preset", "CreartNino");
          formData.append("folder", "Productos");

          try {
            const resCloud = await axios.post(
              "https://api.cloudinary.com/v1_1/creartnino/image/upload",
              formData
            );
            urlImagen = resCloud.data.secure_url;
          } catch {
            Swal.fire({
              icon: "error",
              title: "Error al subir imagen",
              text: "No se pudo subir una de las imágenes a Cloudinary",
            });
            setEnviando(false);
            return;
          }
        }
        urlsImagenes.push(urlImagen);
      }
      // ===========================
      //  GUARDAR IMÁGENES EN API
      // ===========================
      // Concatenar todas las URLs separadas por |||
      const urlsConcatenadas = urlsImagenes.join("|||");
      
      let idImagen = 0;
      try {
        const nuevaImg: IImagenesProductos = {
          Url: urlsConcatenadas, // Todas las URLs en un solo campo
          Descripcion: nombreTrim,
        };
        const resImg = await axios.post(
          "https://apicreartnino.somee.com/api/Imagenes_Productos/Crear",
          nuevaImg
        );
        idImagen = resImg.data.IdImagen;
      } catch (err) {
        console.error("Error guardando imágenes", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo registrar las imágenes",
        });
        setEnviando(false);
        return;
      }

      // ===========================
      //  GUARDAR PRODUCTO EN API
      // ===========================
      const nuevoProducto: IProductos = {
        CategoriaProducto: Number(categoria),
        Nombre: nombreTrim,
        Imagen: idImagen, //  Un solo ID que contiene todas las URLs
        Descripcion: descripcion.trim(),
        Cantidad: 0,
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
        title: "Éxito",
        text: `Producto creado con ${urlsImagenes.length} imagen(es)`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
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
      setEnviando(false);
    }
  };

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
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
                  <label className="form-label">
                    🛍️ Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/^\s+/, "");
                      setNombre(valor);
                    }}
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="col-md-6">
                  <label className="form-label">
                    📦 Categoría <span className="text-danger">*</span>
                  </label>
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

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label">
                    📝 Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Escribe una descripción detallada del producto..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  ></textarea>
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

                {/* Imágenes */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">
                      🖼️ Imágenes <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={agregarImagen}
                      disabled={imagenes.length >= 4}
                    >
                      ➕ Agregar imagen
                    </button>
                  </div>
                  <div className="form-text mb-3">
                    {imagenes.length}/4 imágenes (mínimo 1, máximo 4)
                  </div>

                  <div className="row">
  {imagenes.map((img, index) => (
    <div key={img.id} className="col-md-6 mb-3">
      <div className="card p-3 h-100">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Imagen {index + 1}</small>
          {imagenes.length > 1 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => eliminarImagen(index)}
            >
              🗑️
            </button>
          )}
        </div>

        <div className="input-group">
          <input
            type="url"
            className={`form-control ${img.urlValida === false ? "is-invalid" : ""}`}
            placeholder="https://tusitio.com/imagen.jpg"
            value={img.url}
            onChange={(e) => handleURLChange(index, e.target.value)}
            disabled={!!img.archivo}
          />
          <label className="btn btn-outline-secondary btn-sm mb-0">
            📁
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleArchivoLocal(index, e)}
            />
          </label>
        </div>

        {img.validando && (
          <div className="form-text text-warning">
            Validando URL...
          </div>
        )}
        {img.urlValida === false && !img.validando && (
          <div className="invalid-feedback d-block">
            URL inválida o imagen no encontrada.
          </div>
        )}
        {(img.url || img.archivo) && (
          <>
            <img
              src={img.archivo ? URL.createObjectURL(img.archivo) : img.url}
              alt={`Vista previa ${index + 1}`}
              className="img-thumbnail mt-2"
              style={{
                maxWidth: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-danger mt-2"
              onClick={() => limpiarImagen(index)}
            >
              Quitar
            </button>
          </>
        )}
      </div>
    </div>
  ))}
</div>

                </div>
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