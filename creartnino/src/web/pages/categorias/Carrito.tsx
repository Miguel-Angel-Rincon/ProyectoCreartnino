import { useState, useEffect } from 'react';
import { useCarrito } from '../../../context/CarritoContext';
import '../../styles/carrito.css';
import { FaTrash, FaPen } from 'react-icons/fa';
import '../../styles/personalizar.css';
import Swal from 'sweetalert2';
import PersonalizarProductoModal from '../categorias/PersonalizarProductoModal';
import FinalizarCompraModal from '../categorias/FinalizarCompraModal';

const Carrito = () => {
  const { carrito, total, eliminarProducto, limpiarCarrito, agregarProducto, incrementarCantidad, disminuirCantidad } = useCarrito();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<any>(null);
  const [mensajeTemp, setMensajeTemp] = useState('');
  const [modalCompraVisible, setModalCompraVisible] = useState(false);

  const [stockProductos, setStockProductos] = useState<Record<number, number>>({});

  // 🟢 Cargar stock de productos desde la API
  useEffect(() => {
    const cargarStock = async () => {
      try {
        const res = await fetch('https://www.apicreartnino.somee.com/api/Productos/Lista');
        const data = await res.json();

        const stockMap: Record<number, number> = {};
        data.forEach((p: any) => {
          stockMap[p.IdProducto] = p.Cantidad;
        });
        setStockProductos(stockMap);
      } catch (error) {
        console.error('Error al cargar stock:', error);
      }
    };

    cargarStock();
  }, []);

  // 🟡 Abrir modal de personalización
  const abrirModal = (id: number, mensaje: string) => {
    const prod = carrito.find(p => p.IdProducto === id);
    if (prod) {
      setProductoEditar(prod);
      setMensajeTemp(mensaje || '');
      setModalAbierto(true);
    }
  };

  const guardarPersonalizacion = () => {
    if (productoEditar) {
      eliminarProducto(productoEditar.IdProducto);
      agregarProducto({
        ...productoEditar,
        tipo: 'Personalizado',
        mensaje: mensajeTemp
      });
      setModalAbierto(false);
    }
  };

  // 🧩 Aumentar cantidad con validación de stock
  // 🧩 Aumentar cantidad con validación de stock (sin cambiar orden)
const aumentar = (id: number) => {
  const producto = carrito.find(p => p.IdProducto === id);
  if (!producto) return;

  const stockDisponible = stockProductos[id];

  if (stockDisponible !== undefined && producto.cantidad >= stockDisponible) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `Solo hay ${stockDisponible} unidades disponibles de "${producto.Nombre}".`,
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // usa la función del contexto que sólo incrementa cantidad (mantiene orden)
  incrementarCantidad(id);
};

// 🧩 Disminuir cantidad (sin cambiar orden)
const disminuir = (id: number) => {
  const producto = carrito.find(p => p.IdProducto === id);
  if (!producto) return;

  // si quieres impedir que llegue a 0 (como antes)
  if (producto.cantidad > 1) {
    disminuirCantidad(id); // función del contexto que sólo decrementa
  } else {
    // si quieres que al llegar a 0 se elimine, descomenta:
    // eliminarProducto(id);
  }
};


  // 🟠 Validar stock antes de finalizar compra
  const validarStockAntesDeFinalizar = () => {
    const productosConProblema = carrito.filter(p => {
      const stock = stockProductos[p.IdProducto];
      return stock !== undefined && p.cantidad > stock;
    });

    if (productosConProblema.length > 0) {
      const lista = productosConProblema
        .map(p => `• ${p.Nombre}: solo ${stockProductos[p.IdProducto]} disponibles.`)
        .join('<br>');

      Swal.fire({
        icon: 'error',
        title: 'Stock insuficiente',
        html: `No puedes finalizar la compra:<br>${lista}`,
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
    return true;
  };

  return (
    <div className="carrito-container">
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
              <span>Disponibles</span> {/* 🟢 Nueva columna para stock */}
              <span>Subtotal</span>
              <span>Tipo</span>
              <span>Acción</span>
            </div>

            {carrito.map(producto => (
              <div className="fila-carrito" key={producto.IdProducto}>
                <div className="columna producto-info">
                  <FaTrash className="icono-basura" onClick={() => eliminarProducto(producto.IdProducto)} />
                  <img src={producto.ImagenUrl} alt={producto.Nombre} />
                  <span>{producto.Nombre}</span>
                </div>

                <div className="columna precio">
                  ${producto.Precio.toLocaleString()} COP
                </div>

                <div className="columna cantidad">
                  <button className="cantidad-btn" onClick={() => disminuir(producto.IdProducto)}>-</button>
                  <span>{producto.cantidad}</span>
                  <button className="cantidad-btn" onClick={() => aumentar(producto.IdProducto)}>+</button>
                </div>

                {/* 🟢 Nueva columna separada para stock */}
                <div className="columna stock">
                  {stockProductos[producto.IdProducto] !== undefined
                    ? stockProductos[producto.IdProducto]
                    : '...'}
                </div>

                <div className="columna subtotal">
                  ${(producto.Precio * producto.cantidad).toLocaleString()} COP
                </div>

                <div className="columna tipo">
                  <span className={producto.tipo === 'Personalizado' ? 'personalizado' : 'predisenado'}>
                    {producto.tipo}
                  </span>
                </div>

                <div className="columna accion">
                  {producto.tipo === 'Personalizado' ? (
                    <div className="acciones-personalizado">
                      <FaPen
                        className="editar-mensaje"
                        title="Editar personalización"
                        onClick={() => abrirModal(producto.IdProducto, producto.mensaje || '')}
                      />
                      <span
                        className="quitar-personalizado"
                        title="Quitar personalizado"
                        onClick={() => {
                          eliminarProducto(producto.IdProducto);
                          agregarProducto({ ...producto, tipo: 'Prediseñado', mensaje: '' });
                        }}
                      >
                        ❌
                      </span>
                    </div>
                  ) : (
                    <button
                      className="btn-personalizar"
                      onClick={() => abrirModal(producto.IdProducto, producto.mensaje || '')}
                    >
                      Personalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="total-carrito">
            <strong>Total:</strong> ${total.toLocaleString()} COP
          </div>

          <div className="acciones-carrito">
            <button className="btn-vaciar" onClick={limpiarCarrito}>Vaciar Carrito</button>

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

      {/* Modal de Personalización */}
      <PersonalizarProductoModal
        visible={modalAbierto}
        mensajeTemp={mensajeTemp}
        setMensajeTemp={setMensajeTemp}
        onGuardar={guardarPersonalizacion}
        onCancelar={() => {
          setModalAbierto(false);
          setMensajeTemp('');
        }}
      />

      {/* Modal de Finalizar Compra */}
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
