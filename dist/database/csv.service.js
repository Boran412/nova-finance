"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const async_hooks_1 = require("async_hooks");
let CsvService = class CsvService {
    pool;
    headers = {
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
    lockPromise = Promise.resolve();
    asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
    async onModuleInit() {
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
                    }
                    else if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.substring(1, value.length - 1);
                    }
                    process.env[key] = value;
                }
            });
        }
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL bulunamadı! Lütfen .env dosyasını kontrol edin.');
        }
        this.pool = new pg_1.Pool({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false,
            },
        });
        await this.pool.query(`
      CREATE TABLE IF NOT EXISTS file_store (
        filename VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);
        for (const key of Object.keys(this.headers)) {
            await this.ensureFileInDb(key);
        }
    }
    async ensureFileInDb(filename) {
        const res = await this.pool.query('SELECT filename, content FROM file_store WHERE filename = $1', [filename]);
        const isDbEmpty = res.rows.length === 0 ||
            res.rows[0].content.split('\n').filter((l) => l.trim() !== '').length <= 1;
        if (isDbEmpty) {
            const localFilePath = path.join(process.cwd(), 'data', `${filename}.csv`);
            let contentStr = '';
            if (fs.existsSync(localFilePath)) {
                contentStr = fs.readFileSync(localFilePath, 'utf8');
            }
            else {
                contentStr =
                    this.headers[filename].join(',') + '\n';
            }
            await this.pool.query('INSERT INTO file_store (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2', [filename, contentStr]);
        }
    }
    async read(model) {
        return this.runTransaction(async () => {
            const res = await this.pool.query('SELECT content FROM file_store WHERE filename = $1', [model]);
            if (res.rows.length === 0)
                return [];
            const content = res.rows[0].content;
            const lines = content.split('\n').filter((line) => line.trim() !== '');
            if (lines.length <= 1)
                return [];
            const headers = lines[0].split(',');
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCsvLine(lines[i]);
                if (values.length !== headers.length)
                    continue;
                const obj = {};
                headers.forEach((header, index) => {
                    const val = values[index];
                    if (val === 'true') {
                        obj[header] = true;
                    }
                    else if (val === 'false') {
                        obj[header] = false;
                    }
                    else if (val === 'null' || val === '') {
                        obj[header] = null;
                    }
                    else if (!isNaN(Number(val)) && val.trim() !== '') {
                        obj[header] = Number(val);
                    }
                    else {
                        obj[header] = val;
                    }
                });
                data.push(obj);
            }
            return data;
        });
    }
    async write(model, data) {
        return this.runTransaction(async () => {
            const headers = this.headers[model];
            const lines = [headers.join(',')];
            data.forEach((item) => {
                const line = headers.map((header) => {
                    const val = item[header];
                    if (val === undefined || val === null)
                        return 'null';
                    if (val instanceof Date)
                        return val.toISOString();
                    let valStr = String(val);
                    if (valStr.includes(',') ||
                        valStr.includes('"') ||
                        valStr.includes('\n')) {
                        valStr = '"' + valStr.replace(/"/g, '""') + '"';
                    }
                    return valStr;
                });
                lines.push(line.join(','));
            });
            const newContent = lines.join('\n') + '\n';
            await this.pool.query('INSERT INTO file_store (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2', [model, newContent]);
        });
    }
    async append(model, item) {
        const data = await this.read(model);
        if (item.id === undefined || item.id === 0) {
            const maxId = data.reduce((max, u) => (u.id > max ? u.id : max), 0);
            item.id = maxId + 1;
        }
        data.push(item);
        await this.write(model, data);
        return item;
    }
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
    async runTransaction(fn) {
        const store = this.asyncLocalStorage.getStore();
        if (store?.inTx) {
            return await fn();
        }
        let resolveLock = () => { };
        const currentLock = this.lockPromise;
        this.lockPromise = new Promise((resolve) => {
            resolveLock = resolve;
        });
        await currentLock;
        try {
            return await this.asyncLocalStorage.run({ inTx: true }, fn);
        }
        finally {
            resolveLock();
        }
    }
};
exports.CsvService = CsvService;
exports.CsvService = CsvService = __decorate([
    (0, common_1.Injectable)()
], CsvService);
//# sourceMappingURL=csv.service.js.map