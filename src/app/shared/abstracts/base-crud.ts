import { inject, signal, WritableSignal } from "@angular/core";
import { Alert } from "../../core/service/alert-service/alert";
import { FormGroup } from "@angular/forms";
import { ApiResponse } from "../interface/abstracts-class";
import { debounceTime, distinctUntilChanged, Observable, skip } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

export abstract class BaseCrud<T> {

    alert = inject(Alert)
    search = signal('');
    data = signal<ApiResponse<T[]> | null>(null);
    dataById = signal<ApiResponse<T> | null>(null);
    abstract getService(): any;

    pagination = signal({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
    });

    constructor() {
        this.filterResults();
    }

    loadData(params?: any) {
        const queryParams = {
            page: this.pagination().currentPage,
            CantItems: this.pagination().pageSize,
            ...params
        };

        this.getService().getAll(queryParams).subscribe({
            next: (response: any) => {
                this.data.set(response);
                this.pagination.set({
                    currentPage: response.currentPage,
                    pageSize: response.cantItem,
                    totalPages: response.cantPage,
                    totalItems: response.totalItems,
                });
            },
            error: console.error
        });
    }

    loadDataPost(request: (body: any) => Observable<any>, body: any = {}) {

        const requestBody = {
            page: this.pagination().currentPage,
            CantItems: this.pagination().pageSize,
            ...body
        };

        request(requestBody).subscribe({
            next: (response: any) => {

                this.data.set(response);

                this.pagination.set({
                    currentPage: response.currentPage,
                    pageSize: response.cantItem,
                    totalPages: response.cantPage,
                    totalItems: response.totalItems,
                });
            },

            error: console.error
        });
    }

    loadById(id: number, callback?: (data: T) => void) {
        this.getService().getById(id).subscribe({
            next: (response: any) => {
                this.dataById.set(response);
                callback?.(response);
            },
            error: console.error
        });
    }

    loadSelect(request: () => any, target: any) {
        request()
            .subscribe({
                next: (res: any) =>
                    target.set(res.data),
                error: console.error
            });
    }

    filterResults() {
        toObservable(this.search)
            .pipe(
                skip(1),
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe((value: string) => {
                this.pagination.update(state => ({ ...state, currentPage: 1 }));
                this.loadData({ filter: value });
            });
    }

    setEditForm(form: FormGroup, data: any, afterEdit?: (data: any) => void) {
        form.reset();
        form.patchValue(data, { emitEvent: false });
        afterEdit?.(data);
    }

    save(form: FormGroup, trackField: string = 'id', callback?: () => void, body?: any,) {
        const data = body ?? form.getRawValue();

        const method = data[trackField] > 0
            ? this.getService().update(data)
            : this.getService().create(data);

        method.subscribe({
            next: () => {
                this.loadData();
                callback?.();
                form.reset()
                this.alert.success('Registro guardado')
            },
            error: console.error
        });
    }

    remove(id: number, callback?: () => void) {
        this.alert.confirmDelete()
            .then((result: any) => {
                if (result.isConfirmed) {

                    this.getService().delete(id)
                        .subscribe({
                            next: () => {
                                this.loadData();
                                callback?.();
                                this.alert.success('Registro eliminado')
                            },
                            error: console.error
                        });
                }
            })
    }

    setSelection(
        selectedSignal: WritableSignal<any>,
        form: FormGroup,
        controlName: string,
        item: any,
        valueField: string,
        objectOrID: boolean = false,
    ) {
        selectedSignal.set(item);

        if (objectOrID == false) {
            form.patchValue({
                [controlName]: item[valueField]
            });

        } else {
            form.patchValue({
                [controlName]: item
            });
        }

        form.markAsDirty();
    }

    changePage(page: number) {
        this.pagination.update(state => ({
            ...state,
            currentPage: page
        }));

        this.loadData();
    }

    changePageSize(size: number) {
        this.pagination.update(state => ({
            ...state,
            pageSize: size,
            currentPage: 1
        }));

        this.loadData();
    }
}