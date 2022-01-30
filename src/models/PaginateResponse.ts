export class PaginateResponse<T> {
    data: T[];
    cursor?: string;
}