// src/interfaces/IUsuarios.ts
import type { IRol } from "./IRoles";

export interface IUsuarios {
  IdUsuarios: number;        // ID autoincremental en la BD
  NombreCompleto: string;    // Nombre completo del usuario
  TipoDocumento: string;     // CC, TI, CE...
  NumDocumento: string;      // Número de documento
  Celular: string;           // Celular en formato string
  Departamento: string;      // Nombre del departamento
  Ciudad: string;            // Nombre de la ciudad
  Direccion: string;         // Dirección completa
  Correo: string;            // Email
  Contrasena: string;        // Password
  IdRol: number;             // ID del rol (ej. 1=Admin, 4=Usuario)
  Estado: boolean;           // Activo / Inactivo
  IdRolNavigation?: IRol;    // Relación con el rol (opcional)
}
