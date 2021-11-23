import { Test, TestingModule } from '@nestjs/testing';
import { StakesService } from './stakes.service';

describe('StakesService', () => {
  let service: StakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StakesService],
    }).compile();

    service = module.get<StakesService>(StakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
