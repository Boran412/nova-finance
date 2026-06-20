import { OnModuleInit } from '@nestjs/common';
export declare class CsvService implements OnModuleInit {
    private pool;
    private readonly headers;
    private lockPromise;
    private readonly asyncLocalStorage;
    onModuleInit(): Promise<void>;
    private ensureFileInDb;
    read<T>(model: keyof typeof this.headers): Promise<T[]>;
    write<T extends {
        id: number;
    }>(model: keyof typeof this.headers, data: T[]): Promise<void>;
    append<T extends {
        id: number;
    }>(model: keyof typeof this.headers, item: T): Promise<T>;
    private parseCsvLine;
    runTransaction<T>(fn: () => Promise<T>): Promise<T>;
}
