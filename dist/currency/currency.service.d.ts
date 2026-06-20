export declare class CurrencyService {
    private cachedRates;
    private lastFetched;
    private readonly CACHE_DURATION;
    private readonly fallbackRates;
    getRates(): Promise<Record<string, number>>;
}
