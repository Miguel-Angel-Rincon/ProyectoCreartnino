// src/web/pages/Carrito.tsx
import { useState } from 'react';
import { useCarrito } from '../../../context/CarritoContext';
import '../../styles/carrito.css';
import { FaTrash, FaPen } from 'react-icons/fa';
import '../../styles/personalizar.css';
import PersonalizarProductoModal from '../categorias/PersonalizarProductoModal';
import FinalizarCompraModal from '../categorias/FinalizarCompraModal'; // NUEVO

const Carrito = () => {
  const { carrito, total, eliminarProducto, limpiarCarrito, agregarProducto } = useCarrito();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<any>(null);
  const [mensajeTemp, setMensajeTemp] = useState('');

  const [modalCompraVisible, setModalCompraVisible] = useState(false); // NUEVO

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

  const aumentar = (id: number) => {
    const producto = carrito.find(p => p.IdProducto === id);
    if (producto) {
      eliminarProducto(id);
      agregarProducto({ ...producto, cantidad: producto.cantidad + 1 });
    }
  };

  const disminuir = (id: number) => {
    const producto = carrito.find(p => p.IdProducto === id);
    if (producto && producto.cantidad > 1) {
      eliminarProducto(id);
      agregarProducto({ ...producto, cantidad: producto.cantidad - 1 });
    }
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
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
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
                  ${producto.Precio.toLocaleString()} cop
                </div>

                <div className="columna cantidad">
                  <button className="cantidad-btn" onClick={() => disminuir(producto.IdProducto)}>-</button>
                  <span>{producto.cantidad}</span>
                  <button className="cantidad-btn" onClick={() => aumentar(producto.IdProducto)}>+</button>
                </div>

                <div className="columna subtotal">
                  ${(producto.Precio * producto.cantidad).toLocaleString()} cop
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
            <button className="btn-finalizar" onClick={() => setModalCompraVisible(true)}>
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
