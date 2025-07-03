// src/web/components/CardProducto.tsx
import { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext';
import '../styles/categoriasproductos.css';
import Swal from 'sweetalert2';

interface Props {
  producto: {
    IdProducto: number;
    Nombre: string;
    Precio: number;
    ImagenUrl: string;
    CategoriaProducto: number;
  };
}

const CardProducto = ({ producto }: Props) => {
  const [cantidad, setCantidad] = useState(1);
  const { agregarProducto } = useCarrito();

  const handleAgregar = () => {
  agregarProducto({
    IdProducto: producto.IdProducto,
    Nombre: producto.Nombre,
    Precio: producto.Precio,
    ImagenUrl: producto.ImagenUrl,
    cantidad,
    CategoriaProducto: producto.CategoriaProducto,
    tipo: 'Prediseñado'
  });

  Swal.fire({
    title: '¡Agregado al carrito!',
    text: `Has agregado ${producto.Nombre}`,
    icon: 'success',
    confirmButtonColor: '#f072d1',
    confirmButtonText: 'OK'
  });
};

  return (
    <div className="categoria-card">
      <img src={producto.ImagenUrl} alt={producto.Nombre} />
      <h3>{producto.Nombre}</h3>
      <p className="precio">${producto.Precio.toLocaleString()} COP</p>

      <div className="cantidad-container">
        <label>Cantidad:</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
      </div>

      <button className="btn-agregar" onClick={handleAgregar}>
        Agregar al Carrito
      </button>
    </div>
  );
};

export default CardProducto;
