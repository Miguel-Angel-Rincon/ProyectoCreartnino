import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/acciones.css";

// Interfaces
import type { IImagenesProductos } from "../../interfaces/IImagenesProductos";
import type { IProductos } from "../../interfaces/IProductos";
import type { ICatProductos } from "../../interfaces/ICatProductos";

interface Props {
  producto: IProductos;
  onClose: () => void;
  onEditar: (formData: IProductos) => void;
}

const EditarProductoModal: React.FC<Props> = ({ producto, onClose, onEditar }) => {
  // 📌 Estados
  const [nombre, setNombre] = useState(producto.Nombre);
  const [categoria, setCategoria] = useState<number | "">(producto.CategoriaProducto);
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const [cantidad, setCantidad] = useState(producto.Cantidad.toString());
  const [precio, setPrecio] = useState(producto.Precio.toString());
  const [precioValido, setPrecioValido] = useState(true);
  const [cantidadValida, setCantidadValida] = useState(true);

  const [imagenPersonalURL, setImagenPersonalURL] = useState("");
  const [imagenLocal, setImagenLocal] = useState<File | null>(null);
  const [urlValida, setUrlValida] = useState<boolean | null>(null);
  const [validandoURL, setValidandoURL] = useState(false);
  const [imagenActualURL, setImagenActualURL] = useState<string>("");

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

  // 🔹 Traer la URL de la imagen actual
  useEffect(() => {
    const fetchImagen = async () => {
      try {
        const res = await axios.get(
          `https://apicreartnino.somee.com/api/Imagenes_Productos/Obtener/${producto.Imagen}`
        );
        setImagenActualURL(res.data.Url);
      } catch (err) {
        console.error("Error obteniendo imagen actual", err);
      }
    };
    fetchImagen();
  }, [producto.Imagen]);

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

  // 🔹 Mostrar precio formateado en COP al abrir el modal
useEffect(() => {
  if (producto?.Precio) {
    const numero = Number(producto.Precio);
    if (!isNaN(numero)) {
      const formatoCOP = new Intl.NumberFormat("es-CO", {
        style: "decimal", // 👈 solo número, sin signo de moneda
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numero);
      setPrecio(formatoCOP.replace(/\s/g, "")); // 👈 elimina espacios extra
    }
  }
}, [producto.Precio]);



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
  // 🔹 Manejo de precio (máx. 7 dígitos y formateado en pesos)
const formatearPrecio = (valor: string) => {
  const limpio = valor.replace(/[^0-9]/g, "");
  if (!limpio) return "";
  const numero = parseInt(limpio.slice(0, 7)); // 👉 Máx. 7 dígitos
  return numero.toLocaleString("es-CO");
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
  // 🔹 Submit
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const cantidadNum = parseInt(cantidad);
  const precioNum = parseInt(precio.replace(/[.,\s]/g, ""));
  const nombreTrim = nombre.trim();

  // ==========================
  // 🔹 VALIDACIONES DEL NOMBRE
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
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombreTrim)) {
    Swal.fire({
      icon: "error",
      title: "Nombre inválido",
      text: "El nombre solo puede contener letras, números y espacios (sin caracteres especiales).",
    });
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
      text: "Debe tener entre 3 y 50 caracteres, sin repeticiones, sin exceso de símbolos ni baja variedad.",
    });
    return;
  }

  // ==================================
  // 🔹 VALIDAR NOMBRE DUPLICADO
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
      .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

    const existeDuplicado = productosExistentes.some(
      (p: any) =>
        p.IdProducto !== producto.IdProducto && // 👈 ignora el actual
        p.Nombre &&
        p.Nombre.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
          nombreNormalizado
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: "warning",
        title: "Nombre duplicado",
        text: "Ya existe otro producto con este nombre. Por favor, elige otro.",
      });
      return;
    }
  } catch (error) {
    console.warn("No se pudo validar duplicados:", error);
  }

  // ==========================
  // 🔹 VALIDACIONES NUMÉRICAS
  // ==========================
  const camposValidos =
    nombreTrim && categoria && cantidadNum >= 0 && precioNum > 0;

  setCantidadValida(!isNaN(cantidadNum) && cantidadNum >= 0);
  setPrecioValido(!isNaN(precioNum) && precioNum > 0);

  if (!camposValidos) {
    Swal.fire({
      icon: "error",
      title: "Datos inválidos",
      text: "Todos los campos deben estar completos y mayores a cero.",
    });
    return;
  }

  // ==========================
  // 🔹 IMAGEN Y ACTUALIZACIÓN
  // ==========================
  let urlImagen = imagenActualURL;
  let idImagen = producto.Imagen;

  // Subir imagen local a Cloudinary
  if (imagenLocal) {
    const formData = new FormData();
    formData.append("file", imagenLocal);
    formData.append("upload_preset", "CreartNino");
    formData.append("folder", "Productos");

    try {
      const resCloud = await axios.post(
        "https://api.cloudinary.com/v1_1/creartnino/image/upload",
        formData
      );
      urlImagen = resCloud.data.secure_url;
      console.log("Imagen subida:", urlImagen);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "No se pudo subir la imagen a Cloudinary.",
      });
      return;
    }
  }

  // ✅ Si cambió la imagen, actualizar en tabla Imagenes_Productos
  if (urlImagen !== imagenActualURL) {
    try {
      const imgActualizada: IImagenesProductos = {
        IdImagen: producto.Imagen,
        Url: urlImagen,
        Descripcion: nombreTrim,
      };

      await axios.put(
        `https://apicreartnino.somee.com/api/Imagenes_Productos/Actualizar/${producto.Imagen}`,
        imgActualizada
      );

      idImagen = producto.Imagen;
    } catch (err) {
      console.error("Error actualizando imagen", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la imagen.",
      });
      return;
    }
  }

  // ==========================
  // 🔹 ACTUALIZAR PRODUCTO
  // ==========================
  const productoEditado: IProductos = {
    ...producto,
    CategoriaProducto: Number(categoria),
    Nombre: nombreTrim,
    Imagen: idImagen,
    Cantidad: cantidadNum,
    Marca: producto.Marca ?? "CreartNino",
    Precio: precioNum,
    Estado: true,
  };

  try {
    await axios.put(
      `https://apicreartnino.somee.com/api/Productos/Actualizar/${producto.IdProducto}`,
      productoEditado
    );

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Producto actualizado correctamente.",
    });

    onEditar(productoEditado);
    onClose();
  } catch (err) {
    console.error("Error actualizando producto", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el producto.",
    });
  }
};



  const vistaPrevia =
    imagenLocal ? URL.createObjectURL(imagenLocal) : imagenPersonalURL || imagenActualURL;

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Producto</h5>
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
      const valor = e.target.value.replace(/^\s+/, ""); // 🚫 quita espacios solo al inicio
      setNombre(valor);
    }}
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
  const valor = e.target.value.replace(/\s+/g, ""); // 🚫 elimina todos los espacios
  setImagenPersonalURL(valor);
  setImagenLocal(null);
}}

onPaste={(e) => {
  // 🚫 evita pegar texto con espacios
  const pastedData = e.clipboardData.getData("text");
  if (/\s/.test(pastedData)) {
    e.preventDefault();
  }
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
              >
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProductoModal;
