
export enum Status {
    ROUBADO = 'ROUBADO',
    RECUPERADO = 'RECUPERADO',
}

export interface Veiculo {
    id: string;
    placa: string;
    tipo: string;
    modelo: string;
    cor?: string;
    local: string;
    observacoes: string;
    status: Status;
    timestamp: any; 
}

export type Notification = {
    message: string;
    type: 'success' | 'error';
} | null;
