// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import AdminLayout from "./shared/components/AdminLayout";

import ListarProveedores from "./features/proveedores/pages/ListarProveedores";
import ListarProductos from "./features/productos/pages/Listar";
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

import RutaAdminPrivada from "./web/components/RutaAdminPrivada";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <RutaAdminPrivada>
            <AdminLayout><DashboardStats /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/usuario"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarUsuarios /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/roles"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarRoles /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/clientes"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarClientes /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/proveedores"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarProveedores /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/cate-insumo"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarCatInsumos /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/insumos"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarInsumos /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/compras"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarCompras /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/produccion"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarProduccion /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/cat-productos"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarCatProductos /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/productos"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarProductos /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
      <Route
        path="/pedidos"
        element={
          <RutaAdminPrivada>
            <AdminLayout><ListarPedidos /></AdminLayout>
          </RutaAdminPrivada>
        }
      />
    </Routes>
  );
}
