export class PaginateResponse<T> {
    result: T[];
    nextPageToken?: string;
}