import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { LoanModule } from './loan/loan.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BudgetModule } from './budget/budget.module';
import { GoalModule } from './goal/goal.module';
import { RecurringModule } from './recurring/recurring.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AccountModule,
    TransactionModule,
    LoanModule,
    FeedbackModule,
    BudgetModule,
    GoalModule,
    RecurringModule,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
