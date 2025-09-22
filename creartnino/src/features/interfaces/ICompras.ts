export interface ICompras {
    DetallesCompras: never[];
    Detalle: never[];
    IdCompra: number;
    IdProveedor: number;
    MetodoPago: string;
    FechaCompra: Date;
    Total: number;
    IdEstado: number;
}

export interface IDetalleCompra {
    IdDetalleCompra: number;
    IdCompra: number;
    IdInsumo: number;
    Cantidad: number;
    PrecioUnitario: number;
    Subtotal: number;
}