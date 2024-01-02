import { Test, TestingModule } from '@nestjs/testing';
import { InquireResolver } from './inquire.resolver';

describe('InquireResolver', () => {
  let resolver: InquireResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquireResolver],
    }).compile();

    resolver = module.get<InquireResolver>(InquireResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
