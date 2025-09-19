// src/AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import AdminLayout from "./shared/components/AdminLayout";
import RutaAdminPrivada from "./web/components/RutaAdminPrivada";
import { menuItems } from "./shared/config/menuConfig";

import DashboardStats from "./features/dashboard/pages/Dashboard";
import ListarUsuarios from "./features/usuarios/pages/ListarUsuarios";
import ListarRoles from "./features/roles/pages/ListarRoles";
import ListarClientes from "./features/clientes/pages/ListarClientes";
import ListarProveedores from "./features/proveedores/pages/ListarProveedores";
import ListarCatInsumos from "./features/categoria_insumo/pages/ListarCatInsumos";
import ListarInsumos from "./features/insumo/pages/ListarInsumos";
import ListarCompras from "./features/compras/pages/ListarCompras";
import ListarCatProductos from "./features/categoria_productos/pages/ListarCatProductos";
import ListarProductos from "./features/productos/pages/Listar";
import ListarProduccion from "./features/produccion/pages/ListarProduccion";
import ListarPedidos from "./features/pedidos/pages/ListarPedidos";
import React from "react";

// 👉 Mapear permisos → componente real
const componentMap: Record<string, React.ReactElement> = {
  Dashboard: <DashboardStats />,
  Usuarios: <ListarUsuarios />,
  Roles: <ListarRoles />,
  Clientes: <ListarClientes />,
  Proveedores: <ListarProveedores />,
  "Categoria Insumos": <ListarCatInsumos />,
  Insumos: <ListarInsumos />,
  Compras: <ListarCompras />,
  "Categoria Productos": <ListarCatProductos />,
  Productos: <ListarProductos />,
  Producción: <ListarProduccion />,
  Pedidos: <ListarPedidos />,
};

// 👉 Función para recorrer menú y sacar rutas con permisos
const generarRutas = (items: typeof menuItems) => {
  const rutas: { path: string; element: React.ReactElement; permiso: string }[] = [];

  const recorrer = (menu: typeof menuItems) => {
    for (const item of menu) {
      if (item.path && item.permiso) {
        const componente = componentMap[item.permiso];
        if (componente) {
          rutas.push({
            path: item.path,
            element: componente,
            permiso: item.permiso,
          });
        }
      }
      if (item.children) recorrer(item.children);
    }
  };

  recorrer(items);
  return rutas;
};

export default function AppRoutes() {
  const rutas = generarRutas(menuItems);

  return (
    <Routes>
      {rutas.map(({ path, element, permiso }) => (
        <Route
          key={path}
          path={path}
          element={
            <RutaAdminPrivada permisosRequeridos={[permiso]}>
              <AdminLayout>{element}</AdminLayout>
            </RutaAdminPrivada>
          }
        />
      ))}
    </Routes>
  );
}
