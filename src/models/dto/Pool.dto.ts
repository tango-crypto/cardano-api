export interface PoolDto {
    id: string;
    pool_id: string;
    pledge: number;
    margin: number;
    fixed_cost: number;
    active_epoch_no: number;
    url: string;
    hash: string;
    ticker?: string;
    name?: string;
    description?: string;
    homepage?: string;
}