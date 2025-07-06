// src/context/ComprasContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ProductoCompra {
  nombre: string;
  cantidad: number;
  tipo: string;
  mensaje?: string;
  precio: number;
}

export interface Compra {
  id: number;
  fecha: string;
  metodoPago: string;
  total: number;
  inicial: number;
  restante: number;
  estado: string;
  productos: ProductoCompra[];
}

interface ComprasContextProps {
  compras: Compra[];
  agregarCompra: (compra: Omit<Compra, 'id'>) => void;
  anularCompra: (id: number) => void;
}

const ComprasContext = createContext<ComprasContextProps | undefined>(undefined);

export const ComprasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compras, setCompras] = useState<Compra[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('compras');
    if (stored) setCompras(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('compras', JSON.stringify(compras));
  }, [compras]);

  const agregarCompra = (compra: Omit<Compra, 'id'>) => {
    const nuevaCompra = { ...compra, id: Date.now() };
    setCompras(prev => [nuevaCompra, ...prev]); // orden descendente
  };

  const anularCompra = (id: number) => {
    setCompras(prev =>
      prev.map(c => (c.id === id ? { ...c, estado: 'Anulado' } : c))
    );
  };

  return (
    <ComprasContext.Provider value={{ compras, agregarCompra, anularCompra }}>
      {children}
    </ComprasContext.Provider>
  );
};

export const useCompras = () => {
  const context = useContext(ComprasContext);
  if (!context) {
    throw new Error('useCompras debe usarse dentro de ComprasProvider');
  }
  return context;
};
