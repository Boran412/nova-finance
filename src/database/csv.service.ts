import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class CsvService implements OnModuleInit {
  private pool: Pool;

  private readonly headers = {
    users: [
      'id',
      'email',
      'password',
      'premiumStatus',
      'defaultCurrency',
      'createdAt',
      'updatedAt',
    ],
    accounts: [
      'id',
      'userId',
      'name',
      'type',
      'balance',
      'currency',
      'createdAt',
      'updatedAt',
    ],
    transactions: [
      'id',
      'userId',
      'accountId',
      'category',
      'amount',
      'type',
      'description',
      'date',
      'toAccountId',
      'createdAt',
      'updatedAt',
    ],
    loans: [
      'id',
      'userId',
      'name',
      'totalAmount',
      'paidAmount',
      'interestRate',
      'termMonths',
      'startDate',
      'monthlyPayment',
      'remainingInstallments',
      'createdAt',
      'updatedAt',
    ],
    feedbacks: [
      'id',
      'userId',
      'rating',
      'comment',
      'createdAt',
    ],
    budgets: [
      'id',
      'userId',
      'category',
      'limitAmount',
      'createdAt',
      'updatedAt',
    ],
    goals: [
      'id',
      'userId',
      'name',
      'targetAmount',
      'currentAmount',
      'createdAt',
      'updatedAt',
    ],
    recurring: [
      'id',
      'userId',
      'accountId',
      'category',
      'amount',
      'type',
      'description',
      'interval',
      'nextExecutionDate',
      'createdAt',
      'updatedAt',
    ],
  };

  private lockPromise: Promise<void> = Promise.resolve();
  private readonly asyncLocalStorage = new AsyncLocalStorage<{ inTx: boolean }>();

  async onModuleInit() {
    // .env dosyasını manuel oku (NestJS'te dotenv kullanılmadığı durumlar için)
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || '').trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL bulunamadı! Lütfen .env dosyasını kontrol edin.',
      );
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Neon PostgreSQL için SSL zorunludur
      },
    });

    // Tünel dosyalarının saklanacağı tabloyu oluştur
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS file_store (
        filename VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);

    // Varsayılan dosyaları veritabanına ekle
    for (const key of Object.keys(this.headers) as Array<
      keyof typeof this.headers
    >) {
      await this.ensureFileInDb(key);
    }
  }

  private async ensureFileInDb(filename: string) {
    const res = await this.pool.query(
      'SELECT filename, content FROM file_store WHERE filename = $1',
      [filename],
    );
    
    const isDbEmpty =
      res.rows.length === 0 ||
      res.rows[0].content.split('\n').filter((l) => l.trim() !== '').length <= 1;

    if (isDbEmpty) {
      const localFilePath = path.join(process.cwd(), 'data', `${filename}.csv`);
      let contentStr = '';
      if (fs.existsSync(localFilePath)) {
        contentStr = fs.readFileSync(localFilePath, 'utf8');
      } else {
        contentStr =
          this.headers[filename as keyof typeof this.headers].join(',') + '\n';
      }

      await this.pool.query(
        'INSERT INTO file_store (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2',
        [filename, contentStr],
      );
    }
  }

  // Modeli oku
  async read<T>(model: keyof typeof this.headers): Promise<T[]> {
    return this.runTransaction(async () => {
      const res = await this.pool.query(
        'SELECT content FROM file_store WHERE filename = $1',
        [model],
      );
      if (res.rows.length === 0) return [];

      const content = res.rows[0].content;
      const lines = content.split('\n').filter((line) => line.trim() !== '');
      if (lines.length <= 1) return [];

      const headers = lines[0].split(',');
      const data: T[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCsvLine(lines[i]);
        if (values.length !== headers.length) continue;

        const obj: any = {};
        headers.forEach((header, index) => {
          const val = values[index];
          if (val === 'true') {
            obj[header] = true;
          } else if (val === 'false') {
            obj[header] = false;
          } else if (val === 'null' || val === '') {
            obj[header] = null;
          } else if (!isNaN(Number(val)) && val.trim() !== '') {
            obj[header] = Number(val);
          } else {
            obj[header] = val;
          }
        });
        data.push(obj);
      }
      return data;
    });
  }

  // Modeli tamamen yeniden yaz
  async write<T extends { id: number }>(
    model: keyof typeof this.headers,
    data: T[],
  ): Promise<void> {
    return this.runTransaction(async () => {
      const headers = this.headers[model];
      const lines = [headers.join(',')];

      data.forEach((item) => {
        const line = headers.map((header) => {
          const val = (item as any)[header];
          if (val === undefined || val === null) return 'null';
          if (val instanceof Date) return val.toISOString();
          let valStr = String(val);
          if (
            valStr.includes(',') ||
            valStr.includes('"') ||
            valStr.includes('\n')
          ) {
            valStr = '"' + valStr.replace(/"/g, '""') + '"';
          }
          return valStr;
        });
        lines.push(line.join(','));
      });

      const newContent = lines.join('\n') + '\n';
      await this.pool.query(
        'INSERT INTO file_store (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2',
        [model, newContent],
      );
    });
  }

  // Yeni satır ekle
  async append<T extends { id: number }>(
    model: keyof typeof this.headers,
    item: T,
  ): Promise<T> {
    const data = await this.read<T>(model);
    if (item.id === undefined || item.id === 0) {
      const maxId = data.reduce((max, u) => (u.id > max ? u.id : max), 0);
      item.id = maxId + 1;
    }
    data.push(item);
    await this.write(model, data);
    return item;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  async runTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const store = this.asyncLocalStorage.getStore();
    if (store?.inTx) {
      return await fn();
    }

    let resolveLock: () => void = () => {};
    const currentLock = this.lockPromise;
    this.lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    await currentLock;
    try {
      return await this.asyncLocalStorage.run({ inTx: true }, fn);
    } finally {
      resolveLock();
    }
  }
}
