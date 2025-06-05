// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import ListarProveedores from "./features/proveedores/pages/ListarProveedores";
import ListarProductos from "./features/productos/pages/Listar";
import Sidebar from "./shared/components/siderbar";
import ListarUsuarios from "./features/usuarios/pages/ListarUsuarios";
import ListarInsumos from "./features/insumo/pages/ListarInsumos";
import ListarPedidos from "./features/pedidos/pages/ListarPedidos";
import ListarCatProductos from "./features/categoria_productos/pages/ListarCatProductos";
import DashboardStats from "./features/dashboard/pages/Dashboard";
import ListarClientes from "./features/clientes/pages/ListarClientes";
import ListarCompras from "./features/compras/pages/ListarCompras";
import ListarRoles from "./features/roles/pages/ListarRoles";
import ListarCatInsumos from "./features/categoria_insumo/pages/ListarCatInsumos";
import ListarProduccion from "./features/produccion/pages/ListarProduccion";
export default function AppRoutes() {
  return (
    <Routes>
      



      //rutas del administrador
      <Route path="/dashboard" element={<><Sidebar /><DashboardStats  /></>} />
      <Route path="/usuario" element={<><Sidebar /><ListarUsuarios /></>} />
      <Route path="/roles" element={<><Sidebar /><ListarRoles /></>} />
      <Route path="/clientes" element={<><Sidebar /><ListarClientes /></>} />
      <Route path="/proveedores" element={<><Sidebar /><ListarProveedores /></>} />
      <Route path="/cate-insumo" element={<><Sidebar /><ListarCatInsumos /></>} />
      <Route path="/insumos" element={<><Sidebar /><ListarInsumos /></>} />
      <Route path="/compras" element={<><Sidebar /><ListarCompras /></>} />
      <Route path="/produccion" element={<><Sidebar /><ListarProduccion /></>} />
      <Route path="/cat-productos" element={<><Sidebar /><ListarCatProductos /></>} />
      <Route path="/productos" element={<><Sidebar /><ListarProductos /></>} />
      <Route path="/pedidos" element={<><Sidebar/><ListarPedidos /></>} />
    </Routes>
  );
}
