import { Test, TestingModule } from '@nestjs/testing';
import { FollowCommonService } from './follow-common.service';

describe('FollowFacadeService', () => {
  let service: FollowCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowCommonService],
    }).compile();

    service = module.get<FollowCommonService>(FollowCommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
