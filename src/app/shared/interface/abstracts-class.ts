export interface ApiResponse<T> {
    cantItem: number
    cantPage: number
    currentPage: number
    data: T
    dateNow : string
    message : string
    success : boolean
}