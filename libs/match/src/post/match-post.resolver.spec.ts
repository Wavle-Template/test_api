import { Test, TestingModule } from '@nestjs/testing';
import { MatchPostResolver } from './match-post.resolver';

describe('MatchPostResolver', () => {
  let resolver: MatchPostResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchPostResolver],
    }).compile();

    resolver = module.get<MatchPostResolver>(MatchPostResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
