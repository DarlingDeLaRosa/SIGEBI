export interface CreateProductDto {
    idCatalogo: number,
    nombre: string,
    descripcion: string,
    precio: number,
    itbis: number,
    stockMinimo: number,
    idUnidadMe: number,
    idTipoArt: number
}

export interface UpdateProductDto extends CreateProductDto  {
    idProducto: number,
}