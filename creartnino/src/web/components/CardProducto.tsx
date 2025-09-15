// src/web/components/CardProducto.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";

import "../styles/categoriasproductos.css";
import type { IProductos } from "../../features/interfaces/IProductos";

interface Props {
  producto: IProductos;
}

interface IImagenProducto {
  IdImagen: number;
  Url: string;
  Estado: boolean;
}

const CardProducto = ({ producto }: Props) => {
  const [cantidad, setCantidad] = useState(1);
  const [imagenUrl, setImagenUrl] = useState<string>("/placeholder.png");

  const { agregarProducto } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const esAdmin = usuario?.IdRol === 1;
  const esCliente = usuario?.IdRol === 4;

  // 📷 Obtener imagen del producto
  useEffect(() => {
  const fetchImagen = async () => {
    try {
      if (!producto.Imagen) return;

      const resp = await fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista");
      if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
      const data: IImagenProducto[] = await resp.json();

      console.table(data);
      console.log("Producto.Imagen:", producto.Imagen);

      const idImagen = Number(producto.Imagen);
      const imagenEncontrada = data.find((img) => img.IdImagen === idImagen);

      if (imagenEncontrada) {
        const urlFinal = imagenEncontrada.Url.startsWith("http")
          ? imagenEncontrada.Url
          : `https://www.apicreartnino.somee.com/${imagenEncontrada.Url}`;
        setImagenUrl(urlFinal);
      } else {
        console.warn(`⚠️ No se encontró imagen para IdImagen ${idImagen}`);
      }
    } catch (err) {
      console.error("Error al cargar imagen:", err);
    }
  };

  fetchImagen();
}, [producto.Imagen]);


  // 🛒 Agregar producto al carrito
  const handleAgregar = () => {
    if (!usuario) {
      Swal.fire({
        title: "Debes iniciar sesión",
        text: "Inicia sesión para agregar productos al carrito.",
        icon: "info",
        confirmButtonColor: "#f072d1",
        confirmButtonText: "Ir al login",
      }).then((result) => {
        if (result.isConfirmed) navigate("/ingresar");
      });
      return;
    }

    if (esAdmin) {
      Swal.fire({
        title: "Acceso restringido",
        text: "El administrador no puede agregar productos al carrito.",
        icon: "warning",
        confirmButtonColor: "#f072d1",
      });
      return;
    }

    if (esCliente) {
      agregarProducto({
        IdProducto: producto.IdProducto!,
        Nombre: producto.Nombre,
        Precio: producto.Precio,
        ImagenUrl: imagenUrl,
        cantidad,
        CategoriaProducto: producto.CategoriaProducto,
        tipo: "Prediseñado",
      });

      Swal.fire({
        title: "¡Agregado al carrito!",
        text: `Has agregado ${producto.Nombre}`,
        icon: "success",
        confirmButtonColor: "#f072d1",
      });
    }
  };

  return (
    <div className="categoria-card">
      <img
        src={imagenUrl}
        alt={producto.Nombre}
        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
      />
      <h3>{producto.Nombre}</h3>
      <p className="precio">${producto.Precio.toLocaleString()} COP</p>

      {esCliente && (
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

      {(esCliente || !usuario) && (
        <button className="btn-agregar" onClick={handleAgregar}>
          {usuario ? "Agregar al Carrito" : "Iniciar sesión para comprar"}
        </button>
      )}

      {esAdmin && <small style={{ color: "gray" }}>Vista de administrador</small>}
    </div>
  );
};

export default CardProducto;
