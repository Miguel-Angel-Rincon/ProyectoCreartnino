// src/Routesweb.tsx
import { Route, Routes } from "react-router-dom";
import Inicio from "./web/pages/Inicio";
import Quienes from "./web/pages/Qsomos";
import Ingresar from "./web/pages/Acceso/Ingresar";
import Registrar from "./web/pages/Acceso/Registar";
import PublicLayout from "./web/layouts/PublicLayouts";
import Perfil from "./web/pages/Acceso/perfil.tsx";

import ProductosPorCategoria from "./web/pages/categorias/ProductosPorCategoria.tsx";
import Carrito from "./web/pages/categorias/Carrito";
import MisCompras from "./web/pages/Acceso/MisCompras";

// 🔒 Importar rutas protegidas
import RutaPrivada from "./web/components/RutaPrivada";         // solo clientes
import RutaPerfilPrivada from "./web/components/RutaPerfilPrivada"; // todos los autenticados

export default function Routesweb() {
  return (
    <Routes>
      {/* ✅ Rutas públicas */}
      <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
      <Route path="/ingresar" element={<PublicLayout><Ingresar /></PublicLayout>} />
      <Route path="/registrar" element={<PublicLayout><Registrar/></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><Quienes /></PublicLayout>} />
      <Route path="/productos/:categoria" element={<PublicLayout><ProductosPorCategoria /></PublicLayout>} />

      {/* 🔒 Perfil accesible a admin y clientes */}
      <Route
        path="/perfil"
        element={
          <RutaPerfilPrivada>
            <PublicLayout><Perfil /></PublicLayout>
          </RutaPerfilPrivada>
        }
      />

      {/* 🔒 Solo clientes */}
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
