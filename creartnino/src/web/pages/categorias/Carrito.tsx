import { useState, useEffect } from "react";
import { useCarrito } from "../../../context/CarritoContext";
import "../../styles/carrito.css";
import { FaTrash, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import FinalizarCompraModal from "../categorias/FinalizarCompraModal";

interface Producto {
  IdProducto: number;
  uid?: number;
  Nombre: string;
  Precio: number;
  ImagenUrl: string;
  cantidad: number;
  tipo: string;
}

const Carrito = () => {
  const {
    carrito,
    total,
    eliminarProducto,
    limpiarCarrito,
    incrementarCantidad,
    disminuirCantidad,
  } = useCarrito();

  const [modalCompraVisible, setModalCompraVisible] = useState(false);
  const [stockProductos, setStockProductos] = useState<Record<number, number>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenesModal, setImagenesModal] = useState<string[]>([]);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const cargarStock = async () => {
      try {
        const res = await fetch("https://www.apicreartnino.somee.com/api/Productos/Lista");
        const data = await res.json();
        const stockMap: Record<number, number> = {};
        data.forEach((p: any) => {
          stockMap[p.IdProducto] = p.Cantidad;
        });
        setStockProductos(stockMap);
      } catch (error) {
        console.error("Error al cargar stock:", error);
      }
    };
    cargarStock();
  }, []);

  const abrirModalImagenes = (urls: string) => {
    const lista = urls
      .split("|||")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (lista.length > 0) {
      setImagenesModal(lista);
      setIndice(0);
      setModalVisible(true);
    }
  };

  const cerrarModal = () => setModalVisible(false);

  const siguiente = () => {
    setIndice((prev) => (prev + 1) % imagenesModal.length);
  };

  const anterior = () => {
    setIndice((prev) => (prev - 1 + imagenesModal.length) % imagenesModal.length);
  };

  const aumentar = (id: number) => {
    const producto = carrito.find((p: Producto) => p.IdProducto === id);
    if (!producto) return;
    const stockDisponible = stockProductos[id];
    if (stockDisponible !== undefined && producto.cantidad >= stockDisponible) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${stockDisponible} unidades disponibles de "${producto.Nombre}".`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    incrementarCantidad(id);
  };

  const disminuir = (id: number) => {
    const producto = carrito.find((p: Producto) => p.IdProducto === id);
    if (!producto) return;
    if (producto.cantidad > 1) {
      disminuirCantidad(id);
    }
  };

  const validarStockAntesDeFinalizar = () => {
    const productosConProblema = carrito.filter((p: Producto) => {
      const stock = stockProductos[p.IdProducto];
      return stock !== undefined && p.cantidad > stock;
    });

    if (productosConProblema.length > 0) {
      const lista = productosConProblema
        .map(
          (p) => `• ${p.Nombre}: solo ${stockProductos[p.IdProducto]} disponibles.`
        )
        .join("<br>");
      Swal.fire({
        icon: "error",
        title: "Stock insuficiente",
        html: `No puedes finalizar la compra:<br>${lista}`,
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    return true;
  };

  return (
    <div
  className={
    carrito.length === 0
      ? "carrito-container carrito-vacio-full"
      : "carrito-container"
  }
>
  <h2 className="titulo-carrito">🛒 Tu Carrito</h2>

  {carrito.length === 0 ? (
    <p className="carrito-vacio">Tu carrito está vacío.</p>
  ) : (
    <>
      <div className="tabla-carrito">
        <div className="encabezado">
          <span style={{ textAlign: "left", paddingLeft: "2rem" }}>Producto</span>
          <span>Precio</span>
          <span>Cantidad</span>
          <span>Disponibles</span>
          <span>Subtotal</span>
          <span>Tipo</span>
          <span>Acción</span>
        </div>

        {carrito.map((producto: Producto) => {
          const primeraImagen = producto.ImagenUrl?.includes("|||")
            ? producto.ImagenUrl.split("|||")[0].trim()
            : producto.ImagenUrl;

          return (
            <div className="fila-carrito" key={producto.uid || producto.IdProducto}>
              <div
                className="columna producto-info"
                onClick={() => abrirModalImagenes(producto.ImagenUrl)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={primeraImagen}
                  alt={producto.Nombre}
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <span>{producto.Nombre}</span>
              </div>

              <div className="columna carrito-precio">
                ${producto.Precio.toLocaleString()} COP
              </div>

              <div className="columna cantidad">
                <button
                  className="cantidad-btn"
                  onClick={() => disminuir(producto.uid || producto.IdProducto)}
                >
                  -
                </button>
                <span>{producto.cantidad}</span>
                <button
                  className="cantidad-btn"
                  onClick={() => aumentar(producto.uid || producto.IdProducto)}
                >
                  +
                </button>
              </div>

              <div className="columna stock">
                {stockProductos[producto.IdProducto] ?? "..."}
              </div>

              <div className="columna subtotal">
                ${(producto.Precio * producto.cantidad).toLocaleString()} COP
              </div>

              <div className="columna tipo">
                <span
                  className={
                    producto.tipo === "Personalizado"
                      ? "personalizado"
                      : "predisenado"
                  }
                >
                  {producto.tipo}
                </span>
              </div>

              <div className="columna accion">
                <FaTrash
                  className="icono-basura"
                  title="Eliminar del carrito"
                  onClick={() =>
                    eliminarProducto(producto.uid || producto.IdProducto)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-carrito">
        <strong>Total:</strong> ${total.toLocaleString()} COP
      </div>

      <div className="acciones-carrito">
        <button className="btn-vaciar" onClick={limpiarCarrito}>
          Vaciar Carrito
        </button>

        <button
          className="btn-finalizar"
          onClick={() => {
            if (validarStockAntesDeFinalizar()) {
              setModalCompraVisible(true);
            }
          }}
        >
          Finalizar Compra
        </button>
      </div>
    </>
  )}

  {/* MODAL CARRUSEL */}
  {modalVisible && (
    <div className="overlay-carrusel" onClick={cerrarModal}>
      <div className="carrusel" onClick={(e) => e.stopPropagation()}>
        <FaTimes className="cerrar" onClick={cerrarModal} />
        <img
          src={imagenesModal[indice]}
          alt="Vista producto"
          className="imagen-carrusel"
        />
        {imagenesModal.length > 1 && (
          <>
            <button className="btn-carrusel prev" onClick={anterior}>
              <FaChevronLeft />
            </button>
            <button className="btn-carrusel next" onClick={siguiente}>
              <FaChevronRight />
            </button>
          </>
        )}
      </div>
    </div>
  )}

  <FinalizarCompraModal
    visible={modalCompraVisible}
    onClose={() => setModalCompraVisible(false)}
    onEnviar={() => {
      limpiarCarrito();
      setModalCompraVisible(false);
    }}
  />
</div>

  );
};

export default Carrito;
