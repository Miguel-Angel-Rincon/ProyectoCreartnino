import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";

// 🔹 Estructura del producto en el carrito
export interface ProductoCarrito {
  IdProducto: number;
  uid?: number;
  Nombre: string;
  Precio: number;
  ImagenUrl: string;
  cantidad: number;
  stock: number;
  CategoriaProducto: number;
  tipo: "Prediseñado" | "Personalizado";
  mensaje?: string;
  nombre?: string;
  tamaño?: string;
  color?: string;
  otraCosa?: string;
  imagenPersonalizada?: string | File | null; // ✅ Actualizado

}

// 🔹 Tipado del contexto
interface CarritoContextType {
  carrito: ProductoCarrito[];
  incrementarCantidad: (IdProducto: number) => void;
  disminuirCantidad: (IdProducto: number) => void;
  agregarProducto: (producto: ProductoCarrito) => void;
  actualizarProducto: (producto: ProductoCarrito) => void; // ✅ Nueva función
  eliminarProducto: (IdProducto: number) => void;
  limpiarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// 🪣 Hook personalizado
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
  return context;
};

// 💾 Provider
export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  // 🔑 Clave única según usuario
  const getCarritoKey = () =>
    usuario?.IdUsuarios ? `carrito_usuario_${usuario.IdUsuarios}` : "carrito_invitado";

  // 📦 Cargar carrito del localStorage
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

  // 💾 Guardar carrito cada vez que cambie
  useEffect(() => {
    const clave = getCarritoKey();
    localStorage.setItem(clave, JSON.stringify(carrito));
  }, [carrito, usuario]);

  // ------------------------------
  // 🧩 Funciones del carrito
  // ------------------------------

  const agregarProducto = (nuevo: ProductoCarrito) => {
  setCarrito((prev) => {
    const indexExistente = prev.findIndex((p) => p.IdProducto === nuevo.IdProducto);

    // 🔹 Si ya existe
    if (indexExistente !== -1) {
      const existente = prev[indexExistente];
      const nuevaCantidad = existente.cantidad + nuevo.cantidad;

      if (nuevaCantidad > existente.stock) {
        Swal.fire({
          icon: "warning",
          title: "Stock insuficiente",
          text: `Solo hay ${existente.stock} unidades disponibles.`,
          confirmButtonColor: "#f78fb3",
        });
        return prev;
      }

      const actualizado = [...prev];
      actualizado[indexExistente] = {
        ...existente,
        cantidad: nuevaCantidad,

        // ✅ Si el nuevo es personalizado, actualiza toda la info
        tipo:
          nuevo.tipo === "Personalizado" || existente.tipo === "Personalizado"
            ? "Personalizado"
            : "Prediseñado",

        // ✅ Si el nuevo es personalizado, reemplaza valores personalizados
        mensaje: nuevo.tipo === "Personalizado" ? nuevo.mensaje : existente.mensaje,
        nombre: nuevo.tipo === "Personalizado" ? nuevo.nombre : existente.nombre,
        tamaño: nuevo.tipo === "Personalizado" ? nuevo.tamaño : existente.tamaño,
        color: nuevo.tipo === "Personalizado" ? nuevo.color : existente.color,
        otraCosa: nuevo.tipo === "Personalizado" ? nuevo.otraCosa : existente.otraCosa,
        imagenPersonalizada:
          nuevo.tipo === "Personalizado"
            ? nuevo.imagenPersonalizada
            : existente.imagenPersonalizada,
      };
      return actualizado;
    }

    // 🔹 Si no existe, agregar nuevo
    if (nuevo.cantidad > nuevo.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${nuevo.stock} unidades disponibles.`,
        confirmButtonColor: "#f78fb3",
      });
      return prev;
    }

    return [...prev, nuevo];
  });
};


  // ✅ Actualiza un producto existente sin cambiar su posición
  const actualizarProducto = (productoActualizado: ProductoCarrito) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.IdProducto === productoActualizado.IdProducto ? productoActualizado : p
      )
    );
  };

  const incrementarCantidad = (IdProducto: number) => {
    setCarrito((prev) =>
      prev.map((p) => {
        if (p.IdProducto === IdProducto) {
          if (p.cantidad >= p.stock) {
            Swal.fire({
              icon: "warning",
              title: "Stock insuficiente",
              text: `Solo hay ${p.stock} unidades disponibles.`,
              confirmButtonColor: "#f78fb3",
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
    setCarrito((prev) =>
      prev
        .map((p) =>
          p.IdProducto === IdProducto ? { ...p, cantidad: p.cantidad - 1 } : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminarProducto = (IdProducto: number) => {
    setCarrito((prev) => prev.filter((p) => p.IdProducto !== IdProducto));
  };

  const limpiarCarrito = () => {
    const clave = getCarritoKey();
    setCarrito([]);
    localStorage.removeItem(clave);
  };

  const total = carrito.reduce((sum, p) => sum + p.Precio * p.cantidad, 0);

  // 🧹 Limpiar carrito al cerrar sesión
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
        actualizarProducto, // ✅ agregado
        eliminarProducto,
        limpiarCarrito,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
