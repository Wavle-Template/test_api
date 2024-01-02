import { Test, TestingModule } from '@nestjs/testing';
import { FindAccountService } from './find-account.service';

describe('FindAccountService', () => {
  let service: FindAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindAccountService],
    }).compile();

    service = module.get<FindAccountService>(FindAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
