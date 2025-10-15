import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext'; // 👈 Importa tu contexto de autenticación

// 🔹 Estructura del producto en el carrito
export interface ProductoCarrito {
  IdProducto: number;
  Nombre: string;
  Precio: number;
  ImagenUrl: string;
  cantidad: number;
  stock: number; // 🟢 Nuevo campo para validar stock
  CategoriaProducto: number;
  tipo: 'Prediseñado' | 'Personalizado';
  mensaje?: string;
}

// 🔹 Tipado del contexto
interface CarritoContextType {
  carrito: ProductoCarrito[];
  incrementarCantidad: (IdProducto: number) => void;
  disminuirCantidad: (IdProducto: number) => void;
  agregarProducto: (producto: ProductoCarrito) => void;
  eliminarProducto: (IdProducto: number) => void;
  limpiarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// 🪣 Hook personalizado
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  return context;
};

// 💾 Provider
export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  // Clave única según usuario
  const getCarritoKey = () =>
    usuario?.IdUsuarios ? `carrito_usuario_${usuario.IdUsuarios}` : 'carrito_invitado';

  // Cargar carrito del localStorage
  useEffect(() => {
    const clave = getCarritoKey();
    const guardado = localStorage.getItem(clave);
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch {
        localStorage.removeItem(clave);
        setCarrito([]);
      }
    } else setCarrito([]);
  }, [usuario]);

  // Guardar carrito cada vez que cambie
  useEffect(() => {
    const clave = getCarritoKey();
    localStorage.setItem(clave, JSON.stringify(carrito));
  }, [carrito, usuario]);

  // ------------------------------
  // 🧩 Funciones del carrito
  // ------------------------------

  const agregarProducto = (nuevo: ProductoCarrito) => {
    setCarrito(prev => {
      const existente = prev.find(
        p => p.IdProducto === nuevo.IdProducto && p.tipo === nuevo.tipo
      );

      if (existente) {
        const nuevaCantidad = existente.cantidad + nuevo.cantidad;

        if (nuevaCantidad > existente.stock) {
          Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${existente.stock} unidades disponibles.`,
            confirmButtonColor: '#f78fb3',
          });
          return prev;
        }

        return prev.map(p =>
          p.IdProducto === nuevo.IdProducto && p.tipo === nuevo.tipo
            ? { ...p, cantidad: nuevaCantidad }
            : p
        );
      } else {
        if (nuevo.cantidad > nuevo.stock) {
          Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${nuevo.stock} unidades disponibles.`,
            confirmButtonColor: '#f78fb3',
          });
          return prev;
        }
        return [...prev, nuevo];
      }
    });
  };

  const incrementarCantidad = (IdProducto: number) => {
    setCarrito(prev =>
      prev.map(p => {
        if (p.IdProducto === IdProducto) {
          if (p.cantidad >= p.stock) {
            Swal.fire({
              icon: 'warning',
              title: 'Stock insuficiente',
              text: `Solo hay ${p.stock} unidades disponibles.`,
              confirmButtonColor: '#f78fb3',
            });
            return p;
          }
          return { ...p, cantidad: p.cantidad + 1 };
        }
        return p;
      })
    );
  };

  const disminuirCantidad = (IdProducto: number) => {
    setCarrito(prev =>
      prev
        .map(p =>
          p.IdProducto === IdProducto ? { ...p, cantidad: p.cantidad - 1 } : p
        )
        .filter(p => p.cantidad > 0)
    );
  };

  const eliminarProducto = (IdProducto: number) => {
    setCarrito(prev => prev.filter(p => p.IdProducto !== IdProducto));
  };

  const limpiarCarrito = () => {
    const clave = getCarritoKey();
    setCarrito([]);
    localStorage.removeItem(clave);
  };

  const total = carrito.reduce((sum, p) => sum + p.Precio * p.cantidad, 0);

  // Limpiar carrito si el usuario cierra sesión
  useEffect(() => {
    if (!usuario) setCarrito([]);
  }, [usuario]);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        incrementarCantidad,
        disminuirCantidad,
        agregarProducto,
        eliminarProducto,
        limpiarCarrito,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
