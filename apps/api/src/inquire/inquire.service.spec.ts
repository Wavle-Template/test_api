import { Test, TestingModule } from '@nestjs/testing';
import { InquireService } from './inquire.service';

describe('InquireService', () => {
  let service: InquireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquireService],
    }).compile();

    service = module.get<InquireService>(InquireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
