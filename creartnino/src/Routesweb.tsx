// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import Inicio from "./web/pages/Inicio";
import Ingresar from "./web/pages/Ingresar";
import Registrar from "./web/pages/Registar";
import PublicLayout from './web/layouts/PublicLayouts';


export default function Routesweb() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
      <Route path="/ingresar" element={<PublicLayout><Ingresar /></PublicLayout>} />
      <Route path="/Registrar" element={<PublicLayout><Registrar/></PublicLayout>} />
      {/* <Route path="/nosotros" element={<PublicLayout><Nosotros /></PublicLayout>} />
      <Route path="/servicios" element={<PublicLayout><Servicios /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} /> */}



      
    </Routes>
  );
}
