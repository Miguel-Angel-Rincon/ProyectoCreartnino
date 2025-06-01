// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";

import ListarProductos from "./features/productos/pages/Listar";
import Sidebar from "./shared/components/siderbar";

export default function AppRoutes() {
  return (
    <Routes>
      



      //rutas del administrador
      <Route path="/dashboard" element={<><Sidebar /><h1>Dashboard</h1></>} />
      <Route path="/usuario" element={<><Sidebar /><h1>Usuario</h1></>} />
      <Route path="/roles" element={<><Sidebar /><h1>Roles</h1></>} />
      <Route path="/clientes" element={<><Sidebar /><h1>Clientes</h1></>} />
      <Route path="/proveedores" element={<><Sidebar /><h1>Proveedores</h1></>} />
      <Route path="/cate-insumo" element={<><Sidebar /><h1>Categoría Insumo</h1></>} />
      <Route path="/insumos" element={<><Sidebar /><h1>Insumos</h1></>} />
      <Route path="/compras" element={<><Sidebar /><h1>Compras</h1></>} />
      <Route path="/produccion" element={<><Sidebar /><h1>Producción</h1></>} />
      <Route path="/cat-productos" element={<><Sidebar /><h1>Cat. Productos</h1></>} />
      <Route path="/productos" element={<><Sidebar /><ListarProductos /></>} />
      <Route path="/pedidos" element={<><Sidebar/><h1>Pedidos</h1></>} />
    </Routes>
  );
}
