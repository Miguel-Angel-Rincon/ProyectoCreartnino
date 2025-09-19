// src/shared/config/menuConfig.ts
import { type ReactNode } from "react";
import {
  FaChartBar,
  FaUserShield,
  FaUser,
  FaUsers,
  FaTruck,
  FaCogs,
  FaBox,
  FaShoppingCart,
  FaBoxes,
  FaChartLine,
  FaTasks,
} from "react-icons/fa";

export interface MenuItem {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  permiso?: string; // 👈 Debe coincidir con el nombre de la API
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <FaChartBar />,
    permiso: "Dashboard"
  },
  {
    key: "config",
    label: "Configuración",
    children: [
      { key: "roles", label: "Roles", path: "/roles", icon: <FaUserShield />, permiso: "Roles" },
      { key: "usuario", label: "Usuario", path: "/usuario", icon: <FaUser />, permiso: "Usuarios" },
      { key: "clientes", label: "Clientes", path: "/clientes", icon: <FaUsers />, permiso: "Clientes" }
    ]
  },
  {
    key: "material",
    label: "Gestión de Materiales",
    children: [
      { key: "proveedores", label: "Proveedores", path: "/proveedores", icon: <FaTruck />, permiso: "Proveedores" },
      { key: "cate-insumo", label: "Categoría Insumo", path: "/cate-insumo", icon: <FaCogs />, permiso: "Categoria Insumos" },
      { key: "insumos", label: "Insumos", path: "/insumos", icon: <FaBox />, permiso: "Insumos" },
      { key: "compras", label: "Compras", path: "/compras", icon: <FaShoppingCart />, permiso: "Compras" }
    ]
  },
  {
    key: "produccion",
    label: "Gestión de Producción",
    children: [
      { key: "cat-productos", label: "Categoría Productos", path: "/cat-productos", icon: <FaBoxes />, permiso: "Categoria Productos" },
      { key: "productos", label: "Productos", path: "/productos", icon: <FaBox />, permiso: "Productos" },
      { key: "produccion", label: "Producción", path: "/produccion", icon: <FaChartLine />, permiso: "Producción" }
    ]
  },
  {
    key: "procesos",
    label: "Gestión de Pedidos",
    children: [
      { key: "pedidos", label: "Pedidos", path: "/pedidos", icon: <FaTasks />, permiso: "Pedidos" }
    ]
  }
];

