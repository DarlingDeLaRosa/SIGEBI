export interface ProductModel {

    idProducto: number,
    nombre: string,
    descripcion: string,
    precio: number,
    fechaCreacion: Date,
    creadoPor: null,
    estado: boolean,
    stock: number,
    idUnidadMe: number,
    fechaModif: Date | null,
    idTipoArt: number,
    itbis: number,
    idRecinto: number,
    stockMinimo: number,
    codInstitucional: number,
    idCatalogo: number,

    unidadMedidaObj: {
        idUnidadMe: number,
        descripcion: string
    },

    tipoArticuloObj: {
        idTipoArt: number,
        nombre: string
    },

    catalogoObj: {
        id: number,
        nombre: string,
        definicionProducto: string,
        sinonimos: string,
        auxiliar: string | null
    },

    stockPorAlmacen: {
        idTipoAlmacen: number,
        tipoAlmacenObj: {
            idTipoAlm: number,
            nombre: string
        },
        idProducto: number,
        cantidad: number
    }[]
}