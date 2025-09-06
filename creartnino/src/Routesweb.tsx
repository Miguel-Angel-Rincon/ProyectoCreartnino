// src/Routesweb.tsx
import { Route, Routes } from "react-router-dom";
import Inicio from "./web/pages/Inicio";
import Quienes from "./web/pages/Qsomos";
import Ingresar from "./web/pages/Acceso/Ingresar";
import RutaPrivada from './web/components/RutaPrivada';
import Registrar from "./web/pages/Acceso/Registar";
import PublicLayout from './web/layouts/PublicLayouts';
import Perfil from "./web/pages/Acceso/perfil";
import ProductosPorCategoria from "./web/pages/categorias/ProductosPorCategoria.tsx";
import Carrito from './web/pages/categorias/Carrito';
import MisCompras from "./web/pages/Acceso/MisCompras";

export default function Routesweb() {
  return (
    <Routes>
      {/* ✅ Rutas públicas */}
      <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
      <Route path="/ingresar" element={<PublicLayout><Ingresar /></PublicLayout>} />
      <Route path="/registrar" element={<PublicLayout><Registrar/></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><Quienes /></PublicLayout>} />
      <Route path="/productos/:categoria" element={<PublicLayout><ProductosPorCategoria /></PublicLayout>} />

      {/* 🔒 Rutas privadas SOLO clientes autenticados */}
      <Route
        path="/perfil"
        element={
          <RutaPrivada>
            <PublicLayout><Perfil /></PublicLayout>
          </RutaPrivada>
        }
      />
      <Route
        path="/carrito"
        element={
          <RutaPrivada>
            <PublicLayout><Carrito /></PublicLayout>
          </RutaPrivada>
        }
      />
      <Route
        path="/miscompras"
        element={
          <RutaPrivada>
            <PublicLayout><MisCompras /></PublicLayout>
          </RutaPrivada>
        }
      />
    </Routes>
  );
}
