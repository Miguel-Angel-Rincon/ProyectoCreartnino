// src/web/components/CardProducto.tsx
import { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/categoriasproductos.css';

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
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const esAdmin = usuario?.rol === 'admin';

  const handleAgregar = () => {
    if (!usuario) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Inicia sesión para agregar productos al carrito.',
        icon: 'info',
        confirmButtonColor: '#f072d1',
        confirmButtonText: 'Ir al login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/ingresar');
        }
      });
      return;
    }

    if (esAdmin) {
      Swal.fire({
        title: 'Acceso restringido',
        text: 'El administrador no puede agregar productos al carrito.',
        icon: 'warning',
        confirmButtonColor: '#f072d1',
        confirmButtonText: 'OK'
      });
      return;
    }

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

      {/* Mostrar cantidad solo si no es admin y hay usuario */}
      {usuario && !esAdmin && (
        <div className="cantidad-container">
          <label>Cantidad:</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>
      )}

      {/* Mostrar botón solo si no es admin */}
      {!esAdmin && (
        <button className="btn-agregar" onClick={handleAgregar}>
          {usuario ? 'Agregar al Carrito' : 'Iniciar sesión para comprar'}
        </button>
      )}
    </div>
  );
};

export default CardProducto;
