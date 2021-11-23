import { Test, TestingModule } from '@nestjs/testing';
import { TangoLedgerService } from './tango-ledger.service';

describe('TangoLedgerService', () => {
  let service: TangoLedgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TangoLedgerService],
    }).compile();

    service = module.get<TangoLedgerService>(TangoLedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
