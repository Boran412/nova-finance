import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private cachedRates: Record<string, number> | null = null;
  private lastFetched: Date | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 saat (milisaniye)

  // Varsayılan/Yedek kurlar (API çökerse kullanılacak)
  private readonly fallbackRates: Record<string, number> = {
    TRY: 1,
    USD: 33.00,
    EUR: 36.00,
    GBP: 42.00,
    XAU: 2500.00, // Gram altın fiyatı
  };

  async getRates(): Promise<Record<string, number>> {
    const now = new Date();

    if (
      this.cachedRates &&
      this.lastFetched &&
      now.getTime() - this.lastFetched.getTime() < this.CACHE_DURATION
    ) {
      return this.cachedRates;
    }

    try {
      // open.er-api.com ücretsiz ve key gerektirmeyen kur servisidir
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) {
        throw new Error('Kur servisi hatası');
      }

      const data = await response.json();
      const rates = data.rates;

      if (!rates || !rates.TRY) {
        throw new Error('Geçersiz kur verisi');
      }

      const tryRate = rates.TRY; // 1 USD kaç TRY?

      const calculatedRates: Record<string, number> = {
        TRY: 1,
        USD: Number(tryRate),
        EUR: rates.EUR ? Number((tryRate / rates.EUR).toFixed(4)) : this.fallbackRates.EUR,
        GBP: rates.GBP ? Number((tryRate / rates.GBP).toFixed(4)) : this.fallbackRates.GBP,
      };

      // Altın Ons (XAU) -> Gram Altın (TRY) çevrimi
      // 1 Ons = 31.1034768 gram
      if (rates.XAU) {
        const xauUsdPrice = 1 / rates.XAU; // 1 Ons kaç USD?
        const xauTryPrice = xauUsdPrice * tryRate; // 1 Ons kaç TRY?
        calculatedRates.XAU = Number((xauTryPrice / 31.1034768).toFixed(2)); // 1 Gram kaç TRY?
      } else {
        calculatedRates.XAU = this.fallbackRates.XAU;
      }

      this.cachedRates = calculatedRates;
      this.lastFetched = now;
      console.log('Canlı döviz kurları başarıyla güncellendi:', calculatedRates);
      return calculatedRates;
    } catch (error) {
      console.error('Döviz kurları çekilirken hata oluştu, yedek kurlar kullanılacak:', error.message);
      // Hata durumunda önbellekte eski kur varsa onu dön, yoksa yedekleri dön
      return this.cachedRates || this.fallbackRates;
    }
  }
}
