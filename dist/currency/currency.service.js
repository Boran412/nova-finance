"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
let CurrencyService = class CurrencyService {
    cachedRates = null;
    lastFetched = null;
    CACHE_DURATION = 60 * 60 * 1000;
    fallbackRates = {
        TRY: 1,
        USD: 33.00,
        EUR: 36.00,
        GBP: 42.00,
        XAU: 2500.00,
    };
    async getRates() {
        const now = new Date();
        if (this.cachedRates &&
            this.lastFetched &&
            now.getTime() - this.lastFetched.getTime() < this.CACHE_DURATION) {
            return this.cachedRates;
        }
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            if (!response.ok) {
                throw new Error('Kur servisi hatası');
            }
            const data = await response.json();
            const rates = data.rates;
            if (!rates || !rates.TRY) {
                throw new Error('Geçersiz kur verisi');
            }
            const tryRate = rates.TRY;
            const calculatedRates = {
                TRY: 1,
                USD: Number(tryRate),
                EUR: rates.EUR ? Number((tryRate / rates.EUR).toFixed(4)) : this.fallbackRates.EUR,
                GBP: rates.GBP ? Number((tryRate / rates.GBP).toFixed(4)) : this.fallbackRates.GBP,
            };
            if (rates.XAU) {
                const xauUsdPrice = 1 / rates.XAU;
                const xauTryPrice = xauUsdPrice * tryRate;
                calculatedRates.XAU = Number((xauTryPrice / 31.1034768).toFixed(2));
            }
            else {
                calculatedRates.XAU = this.fallbackRates.XAU;
            }
            this.cachedRates = calculatedRates;
            this.lastFetched = now;
            console.log('Canlı döviz kurları başarıyla güncellendi:', calculatedRates);
            return calculatedRates;
        }
        catch (error) {
            console.error('Döviz kurları çekilirken hata oluştu, yedek kurlar kullanılacak:', error.message);
            return this.cachedRates || this.fallbackRates;
        }
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)()
], CurrencyService);
//# sourceMappingURL=currency.service.js.map