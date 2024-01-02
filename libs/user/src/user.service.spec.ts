import { Test, TestingModule } from '@nestjs/testing';
import { BaseUserService } from './user.service';

describe('BaseUserService', () => {
  let service: BaseUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseUserService],
    }).compile();

    service = module.get<BaseUserService>(BaseUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
