// ✅ src/web/pages/DetalleProducto.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { useCarrito } from "../../../context/CarritoContext";
import type { IProductos } from "../../../features/interfaces/IProductos";
import PersonalizarProductoModal from "../categorias/PersonalizarProductoModal";
import "../../styles/detalleproducto.css";

interface IImagenProducto {
  IdImagen: number;
  Url: string;
}

const DetalleProducto = () => {
  const { nombreProducto } = useParams<{ nombreProducto: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { agregarProducto, actualizarProducto, carrito } = useCarrito();

  const esAdmin = usuario?.IdRol === 1;
  const esCliente = usuario?.IdRol === 4;

  const [producto, setProducto] = useState<IProductos | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenUrl, setImagenUrl] = useState("/placeholder.png");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [modalPersonalizar, setModalPersonalizar] = useState(false);
  const [, setPersonalizacionesPrevias] = useState<
    { descripcion: string; imagen: File | null }[]
  >([]);
  const [urlsTemporales, setUrlsTemporales] = useState<string[]>([]);
  const [modalCarrusel, setModalCarrusel] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);

  //Manejar el modal de carrusel
  const abrirCarruselCompleto = (index: number) => {
  setIndiceActual(index);
  setModalCarrusel(true);
};

const cambiarImagen = (direccion: "prev" | "next") => {
  if (!imagenes.length) return;
  setIndiceActual((prev) => {
    if (direccion === "prev")
      return prev === 0 ? imagenes.length - 1 : prev - 1;
    else
      return prev === imagenes.length - 1 ? 0 : prev + 1;
  });
};
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (!modalCarrusel) return;
    if (e.key === "ArrowLeft") cambiarImagen("prev");
    if (e.key === "ArrowRight") cambiarImagen("next");
    if (e.key === "Escape") setModalCarrusel(false);
  };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [modalCarrusel, cambiarImagen]);

  // Manejar cambio de cantidad con validación
  const handleCantidadChange = (valor: number) => {
    if (!producto) return;
    
    const stockDisponible = producto.Cantidad ?? 1;
    
    if (valor < 1) {
      setCantidad(1);
      Swal.fire({
        icon: "warning",
        title: "Cantidad mínima",
        text: "La cantidad mínima es 1",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } else if (valor > stockDisponible) {
      setCantidad(stockDisponible);
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${stockDisponible} unidades disponibles`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      setCantidad(valor);
    }
  };

  // 🧠 Cargar producto y sus imágenes (con soporte para múltiples URLs)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resp = await fetch(
          "https://www.apicreartnino.somee.com/api/Productos/Lista"
        );
        const productos = (await resp.json()) as IProductos[];
        const encontrado = productos.find(
          (p) => p.Nombre.toLowerCase() === nombreProducto?.toLowerCase()
        );

        if (!encontrado) {
          Swal.fire("Producto no encontrado", "", "error");
          navigate(-1);
          return;
        }

        setProducto(encontrado);

        const respImg = await fetch(
          "https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista"
        );
        const data = (await respImg.json()) as IImagenProducto[];

        // 🔍 Buscar el registro de imagen que coincida con el IdImagen del producto
        const imagenRegistro = data.find(
          (img) => Number(encontrado.Imagen) === img.IdImagen
        );

        let imagenesProcesadas: string[] = [];

        if (imagenRegistro) {
          // 📸 Separar las URLs por el delimitador |||
          const urlsSeparadas = imagenRegistro.Url.split("|||").map((url) =>
            url.trim().startsWith("http")
              ? url.trim()
              : `https://www.apicreartnino.somee.com/${url.trim()}`
          );
          imagenesProcesadas = urlsSeparadas;
        }

        // Si no hay imágenes, usar placeholder
        const imagenesFinales =
          imagenesProcesadas.length > 0
            ? imagenesProcesadas
            : ["/placeholder.png"];

        setImagenes(imagenesFinales);
        setImagenUrl(imagenesFinales[0]);
      } catch (err) {
        console.error("Error cargando producto:", err);
      }
    };

    cargarDatos();
  }, [nombreProducto, navigate]);

  // 🧹 Limpiar URLs temporales al desmontar
  useEffect(() => {
    return () => {
      urlsTemporales.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urlsTemporales]);

  if (!producto) return <p>Cargando...</p>;

  // 🔍 Verificar si ya existe una personalización para este producto
  const personalizacionExistente = carrito.find(
    (item) =>
      item.IdProducto === producto.IdProducto &&
      item.tipo === "Personalizado"
  );

  // 🛒 Agregar producto prediseñado
  const handleAgregar = () => {
    if (!usuario) {
      Swal.fire({
        title: "Inicia sesión para comprar",
        icon: "info",
        confirmButtonColor: "#f072d1",
      }).then(() => navigate("/ingresar"));
      return;
    }

    if (esAdmin) {
      Swal.fire("Solo los clientes pueden comprar", "", "warning");
      return;
    }

    agregarProducto({
      IdProducto: producto.IdProducto!,
      Nombre: producto.Nombre,
      Precio: producto.Precio,
      ImagenUrl: imagenUrl,
      cantidad,
      stock: producto.Cantidad ?? 1,
      CategoriaProducto: producto.CategoriaProducto,
      tipo: "Prediseñado",
    });

    Swal.fire("Producto agregado ✅", producto.Nombre, "success");
  };

  // 🎨 Guardar o actualizar producto personalizado
  const handleGuardarPersonalizado = (
    descripciones: string[],
    imagenes: (string | File | null)[]
  ) => {
    if (!usuario) {
      Swal.fire("Inicia sesión para personalizar", "", "info");
      navigate("/ingresar");
      return;
    }

    const descripcion = descripciones[0];
    const partes = descripcion.split(" | ").reduce((acc: any, parte) => {
      if (
        parte.startsWith("Nombre personalizado:") ||
        parte.startsWith("Nombres personalizados:")
      )
        acc.nombre = parte.replace(/Nombres? personalizados?:/, "").trim();
      if (parte.startsWith("Tamaño:") || parte.startsWith("Tamaños:"))
        acc.tamaño = parte.replace(/Tamaños?:/, "").trim();
      if (parte.startsWith("Color:") || parte.startsWith("Colores:"))
        acc.color = parte.replace(/Colores?:/, "").trim();
      if (parte.startsWith("Mensaje:") || parte.startsWith("Mensajes:"))
        acc.mensaje = parte.replace(/Mensajes?:/, "").trim();
      if (parte.startsWith("Otra cosa:") || parte.startsWith("Otras cosas:"))
        acc.otraCosa = parte.replace(/Otras cosas?:/, "").trim();
      return acc;
    }, {});

    // 🖼️ Validar imagen correctamente
    let imagenValida: string | null = null;
    if (imagenes && imagenes.length > 0) {
      const primera = imagenes[0];
      
      // Si ya es una URL string, usarla directamente
      if (typeof primera === "string") {
        imagenValida = primera;
      }
      // Si es un archivo, crear Object URL
      else if (
        primera &&
        typeof primera === "object" &&
        ("size" in primera || "type" in primera)
      ) {
        const nuevaUrl = URL.createObjectURL(primera as File | Blob);
        imagenValida = nuevaUrl;
        // Guardar URL para limpieza posterior
        setUrlsTemporales(prev => [...prev, nuevaUrl]);
      }
    }

    const productoPersonalizado = {
      IdProducto: producto!.IdProducto!,
      Nombre: producto!.Nombre,
      Precio: producto!.Precio,
      ImagenUrl: imagenUrl,
      cantidad,
      stock: producto!.Cantidad ?? 1,
      CategoriaProducto: producto!.CategoriaProducto,
      tipo: "Personalizado" as const,
      mensaje: descripcion,
      nombre: partes.nombre || "",
      tamaño: partes.tamaño || "Mediano",
      color: partes.color || "#000000",
      otraCosa: partes.otraCosa || "",
      imagenPersonalizada: imagenValida,
    };

    const existente = carrito.find(
      (p) =>
        p.IdProducto === productoPersonalizado.IdProducto &&
        p.tipo === "Personalizado"
    );

    if (existente) {
      actualizarProducto({
        ...existente,
        ...productoPersonalizado,
      });
      Swal.fire("Personalización actualizada ✅", "", "success");
    } else {
      agregarProducto(productoPersonalizado);
      Swal.fire("Producto personalizado agregado ✅", "", "success");
    }

    setPersonalizacionesPrevias((prev) => [
      ...prev,
      { descripcion, imagen: imagenes[0] as File || null },
    ]);

    setModalPersonalizar(false);
  };

  // 🗑️ Quitar personalización y volver a prediseñado
  const handleEliminarPersonalizacion = () => {
    if (!personalizacionExistente) return;

    Swal.fire({
      title: "¿Quitar personalización?",
      text: "El producto volverá a su estado prediseñado original",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Convertir a prediseñado
        const productoRevertido = {
          IdProducto: producto.IdProducto!,
          Nombre: producto.Nombre,
          Precio: producto.Precio,
          ImagenUrl: imagenUrl,
          cantidad: personalizacionExistente.cantidad,
          stock: producto.Cantidad ?? 1,
          CategoriaProducto: producto.CategoriaProducto,
          tipo: "Prediseñado" as const,
        };

        actualizarProducto(productoRevertido);
        
        Swal.fire(
          "¡Listo!",
          "La personalización ha sido eliminada. El producto volvió a su estado original.",
          "success"
        );
      }
    });
  };

  return (
    <div className="detalle-page">
      <button className="volver-btn" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="detalle-layout">
        {/* Miniaturas */}
        <div className="detalle-miniaturas">
  {imagenes.map((url, i) => (
    <img
      key={i}
      src={url}
      alt={`Imagen ${i + 1}`}
      onClick={() => setImagenUrl(url)} // seguir permitiendo click
      onMouseEnter={() => setImagenUrl(url)} // 👈 cambio importante
      className={url === imagenUrl ? "img-mini activa" : "img-mini"}
    />
  ))}
</div>


        {/* Imagen principal */}
        <div className="detalle-imagen" onClick={() => abrirCarruselCompleto(imagenes.indexOf(imagenUrl))}>
  <img src={imagenUrl} alt={producto.Nombre} className="clickable-imagen" />
</div>


        {/* Información */}
        <div className="detalle-info">
          <h2>{producto.Nombre}</h2>
          <p className="detalle-precio">
            ${producto.Precio.toLocaleString()} COP
          </p>
          <p className="stock">disponibles: {producto.Cantidad}</p>

          {/* Descripción del producto */}
          <div className="descripcion-producto">
            <h3>Descripción</h3>
            <p>{producto.Descripcion || "Sin descripción disponible"}</p>
          </div>

         {/* 🔢 Cantidad y acciones */}
{(esCliente || !usuario) && (
  <>
    {producto.Cantidad && producto.Cantidad > 0 ? (
      <>
        {/* Cantidad */}
        {esCliente && (
          <div className="cantidad-area">
            <label>Cantidad:</label>
            <div className="cantidad-control">
              <button
                className="btn-cantidad"
                onClick={() => handleCantidadChange(cantidad - 1)}
                disabled={cantidad <= 1}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={producto.Cantidad ?? 1}
                value={cantidad}
                onChange={(e) =>
                  handleCantidadChange(Number(e.target.value))
                }
                className="input-cantidad"
              />
              <button
                className="btn-cantidad"
                onClick={() => handleCantidadChange(cantidad + 1)}
                disabled={cantidad >= (producto.Cantidad ?? 1)}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="botones-acciones">
          <button className="btn-agregar" onClick={handleAgregar}>
            🛒 Agregar al carrito
          </button>

          {personalizacionExistente ? (
            <button
              className="btn-eliminar-personalizado"
              onClick={handleEliminarPersonalizacion}
            >
              🔄 Quitar personalización
            </button>
          ) : (
            <button
              className="btn-personalizar-detalle"
              onClick={() => setModalPersonalizar(true)}
            >
              🎨 Personalizar producto
            </button>
          )}
        </div>
      </>
    ) : (
      <p className="mensaje-agotado">🚫 Producto agotado</p>
    )}
  </>
)}

        </div>
      </div>
      {modalCarrusel && (
  <div
    className="carrusel-overlay"
    onClick={() => setModalCarrusel(false)}
  >
    <div
      className="carrusel-contenedor"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón cerrar */}
      <button
        className="carrusel-cerrar"
        onClick={() => setModalCarrusel(false)}
      >
        ✕
      </button>

      {/* Flechas navegación */}
      <button
        className="carrusel-flecha izquierda"
        onClick={() => cambiarImagen("prev")}
      >
        ❮
      </button>

      {/* Imagen principal */}
      <img
        src={imagenes[indiceActual]}
        alt={`Imagen ${indiceActual + 1}`}
        className="carrusel-imagen"
      />

      <button
        className="carrusel-flecha derecha"
        onClick={() => cambiarImagen("next")}
      >
        ❯
      </button>

      {/* Indicadores */}
      <div className="carrusel-indicadores">
        {imagenes.map((_, i) => (
          <span
            key={i}
            className={`indicador ${i === indiceActual ? "activo" : ""}`}
            onClick={() => setIndiceActual(i)}
          />
        ))}
      </div>
    </div>
  </div>
)}

      <PersonalizarProductoModal
        visible={modalPersonalizar}
        onGuardar={handleGuardarPersonalizado}
        onCancelar={() => setModalPersonalizar(false)}
        cantidad={cantidad}
        valoresIniciales={{
          nombre: "",
          tamaño: "Mediano",
          color: "#000000",
          mensaje: "",
          otraCosa: "",
          imagenNombre: null,
        }}
      />
    </div>
  );
};

export default DetalleProducto;