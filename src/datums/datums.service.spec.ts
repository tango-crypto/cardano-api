import { Test, TestingModule } from '@nestjs/testing';
import { DatumsService } from './datums.service';

describe('DatumsService', () => {
  let service: DatumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatumsService],
    }).compile();

    service = module.get<DatumsService>(DatumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
