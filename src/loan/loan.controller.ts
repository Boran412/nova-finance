import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { PayLoanDto } from './dto/pay-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: CreateLoanDto) {
    return this.loanService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.loanService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.loanService.findOne(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/pay')
  payInstallment(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayLoanDto,
  ) {
    return this.loanService.payInstallment(userId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.loanService.remove(userId, id);
  }
}
