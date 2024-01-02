import { Test, TestingModule } from '@nestjs/testing';
import { MatchPostService } from './match-post.service';

describe('MatchPostService', () => {
  let service: MatchPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchPostService],
    }).compile();

    service = module.get<MatchPostService>(MatchPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
