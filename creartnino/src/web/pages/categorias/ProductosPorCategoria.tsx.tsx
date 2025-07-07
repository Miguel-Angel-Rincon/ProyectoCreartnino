// src/web/pages/ProductosPorCategoria.tsx
import { useParams } from 'react-router-dom';
import { productosMock } from '../../../data/ProductosMock';
import { categorias } from '../../../data/categorias';
import CardProducto from '../../components/CardProducto';
import '../../styles/categoriasproductos.css';

const ProductosPorCategoria = () => {
  const { categoria } = useParams();
  const categoriaActual = categoria?.toLowerCase() || 'todos';

  const categoriaEncontrada = categorias.find(cat => cat.nombre === categoriaActual);
  const productosFiltrados = categoriaActual === 'todos'
    ? productosMock
    : productosMock.filter(p => p.CategoriaProducto === categoriaEncontrada?.id);

  const capitalizar = (texto: string) => {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  return (
    <div className="categorias-container">
      <h2 className="titulo">
        {categoriaActual === 'todos'
          ? 'Todos los Productos'
          : capitalizar(categoriaActual)}
      </h2>
      <div className="categorias-grid">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <CardProducto key={producto.IdProducto} producto={producto} />
          ))
        ) : (
          <p>No hay productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
};

export default ProductosPorCategoria;
