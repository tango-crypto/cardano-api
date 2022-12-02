import { Test, TestingModule } from '@nestjs/testing';
import { DatumsController } from './datums.controller';

describe('DatumsController', () => {
  let controller: DatumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatumsController],
    }).compile();

    controller = module.get<DatumsController>(DatumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
