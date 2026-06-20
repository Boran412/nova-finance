import { Strategy } from 'passport-jwt';
import { CsvService } from '../../database/csv.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private csvService;
    constructor(csvService: CsvService);
    validate(payload: {
        sub: number;
        email: string;
    }): Promise<any>;
}
export {};
