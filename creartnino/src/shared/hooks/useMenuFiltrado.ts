// src/shared/hooks/useMenuFiltrado.ts
import { useAuth } from "../../context/AuthContext";
import { menuItems, type MenuItem } from "../config/menuConfig";
import { useMemo } from "react";

export const useMenuFiltrado = () => {
  const { permisos } = useAuth();

  const filtrarMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (!item.permiso) return true;
        return permisos.includes(item.permiso);
      })
      .map((item) => ({
        ...item,
        children: item.children ? filtrarMenu(item.children) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  };

  // ✅ recalcular menú SOLO cuando permisos cambien
  return useMemo(() => filtrarMenu(menuItems), [permisos]);
};
