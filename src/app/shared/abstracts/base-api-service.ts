import { HttpClient, HttpParams } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../interface/abstracts-class";

export class BaseApiService<T> {

    protected http = inject(HttpClient)
    constructor(protected endpoint: string) { }

    getAll(params?: any): Observable<ApiResponse<T[]>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }
        return this.http.get<ApiResponse<T[]>>(this.endpoint, { params: httpParams });
    }

    getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
}

    create(body: T): Observable<T> {
        return this.http.post<T>(this.endpoint, body);
    }

    update(body: T): Observable<T> {
        return this.http.put<T>(this.endpoint, body);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    protected get<R>(path: string) {
        return this.http.get<R>(`${this.endpoint}/${path}`);
    }
}