import { Test, TestingModule } from '@nestjs/testing';
import { EpochsService } from './epochs.service';

describe('EpochsService', () => {
  let service: EpochsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpochsService],
    }).compile();

    service = module.get<EpochsService>(EpochsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
