import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ProductoCarrito {
  IdProducto: number;
  Nombre: string;
  Precio: number;
  ImagenUrl: string;
  cantidad: number;
  CategoriaProducto: number;
  tipo: 'Prediseñado' | 'Personalizado';
  mensaje?: string
  
}


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

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  return context;
};

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  const agregarProducto = (nuevo: ProductoCarrito) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.IdProducto === nuevo.IdProducto);
      if (existe) {
        return prev.map(p =>
          p.IdProducto === nuevo.IdProducto ? { ...p, cantidad: p.cantidad + nuevo.cantidad } : p
        );
      } else {
        return [...prev, nuevo];
      }
    });
  };

  const incrementarCantidad = (IdProducto: number) => {
    setCarrito(prev =>
      prev.map(p =>
        p.IdProducto === IdProducto ? { ...p, cantidad: p.cantidad + 1 } : p
      )
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

  const limpiarCarrito = () => setCarrito([]);

  const total = carrito.reduce((sum, p) => sum + p.Precio * p.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ carrito, incrementarCantidad, disminuirCantidad, agregarProducto, eliminarProducto, limpiarCarrito, total }}>
      {children}
    </CarritoContext.Provider>
  );
};
