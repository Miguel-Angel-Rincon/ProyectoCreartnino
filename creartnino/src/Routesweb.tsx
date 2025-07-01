// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import Inicio from "./web/pages/Inicio";
import Quienes from "./web/pages/Qsomos";
import Ingresar from "./web/pages/Acceso/Ingresar";
import RutaPrivada from './web/components/RutaPrivada';
import Registrar from "./web/pages/Acceso/Registar";
import PublicLayout from './web/layouts/PublicLayouts';
import Perfil from "./web/pages/Acceso/perfil";


export default function Routesweb() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
      <Route path="/ingresar" element={<PublicLayout><Ingresar /></PublicLayout>} />
      <Route path="/Registrar" element={<PublicLayout><Registrar/></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><Quienes /></PublicLayout>} />
      <Route path="/perfil" element={<PublicLayout><RutaPrivada><Perfil /></RutaPrivada></PublicLayout>} />
      



      
    </Routes>
  );
}
