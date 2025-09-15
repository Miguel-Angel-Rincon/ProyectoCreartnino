export interface IPedido {
  IdPedido?: number;
  IdCliente?: number;
  MetodoPago?: string;
  FechaPedido?: string;
  FechaEntrega?: string;
  Descripcion?: string;
  ValorInicial?: number;
  ValorRestante?: number;
  ComprobantePago?: string;
  TotalPedido?: number;
  IdEstado?: number; // 5 = Entregado, 7 = Venta Directa, 6 = Anulado
}

export interface detallePedido {
  IdDetallePedido?: number;
  IdPedido: number;
  IdProducto?: number;
  Cantidad?: number;
  Subtotal?: number;
}