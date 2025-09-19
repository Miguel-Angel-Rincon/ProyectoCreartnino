import { useAuth } from "../../context/AuthContext";
import { menuItems, type MenuItem } from "../config/menuConfig";

export const useMenuFiltrado = () => {
  const { permisos } = useAuth();

  const filtrarMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // Si el item no tiene permiso requerido, se muestra siempre
        if (!item.permiso) return true;

        // Comparamos con lista de permisos cargados
        return permisos.includes(item.permiso);
      })
      .map((item) => ({
        ...item,
        children: item.children ? filtrarMenu(item.children) : undefined,
      }))
      .filter(
        (item) => !item.children || item.children.length > 0 // elimina padres sin hijos visibles
      );
  };

  return filtrarMenu(menuItems);
};
