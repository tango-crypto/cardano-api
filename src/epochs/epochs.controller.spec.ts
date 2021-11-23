import { Test, TestingModule } from '@nestjs/testing';
import { EpochsController } from './epochs.controller';

describe('EpochsController', () => {
  let controller: EpochsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpochsController],
    }).compile();

    controller = module.get<EpochsController>(EpochsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
