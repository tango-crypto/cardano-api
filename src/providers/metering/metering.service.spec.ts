import { Test, TestingModule } from '@nestjs/testing';
import { MeteringService } from './metering.service';

describe('MeteringService', () => {
  let service: MeteringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeteringService],
    }).compile();

    service = module.get<MeteringService>(MeteringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
