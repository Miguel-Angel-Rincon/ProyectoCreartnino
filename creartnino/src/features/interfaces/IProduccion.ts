export interface IProduccion {
    IdProduccion?: number;
    NombreProduccion: string;
    TipoProduccion: string;
    FechaInicio: string;
    FechaFinal: string;

    IdEstado: number;
    IdPedido?: number;
}

export interface detalleProduccion {
    IdDetalleProduccion?: number;
    IdProduccion: number;
    IdInsumo: number;
    IdProducto: number;
    IdPedido?: number | null; 
    CantidadProducir: number;
    CantidadInsumo: number;
}