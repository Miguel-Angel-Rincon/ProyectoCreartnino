// IRoles.ts

// 👉 Permisos
export interface IPermiso {
  IdPermisos: number;
  RolPermisos: string;
  RolPermiso: IRolPermiso[]; // relación con Roles-Permisos
}

// 👉 Relación Rol-Permisos (tabla intermedia)
export interface IRolPermiso {
  IdRol: number;
  IdPermisos: number;
  Rol?: IRol;          // opcional: referencia a un Rol
  Permiso?: IPermiso;  // opcional: referencia a un Permiso
}

// 👉 Roles
export interface IRol {
  IdRol: number;
  Rol: string;
  Descripcion: string;
  Estado: boolean;
  Usuarios: any[];         // si luego defines IUsuario lo reemplazas
  RolPermisos: IRolPermiso[];
}
