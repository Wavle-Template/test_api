import { Test, TestingModule } from '@nestjs/testing';
import { UserSocialNaverLoginService } from './naver-login.service';

describe('NaverLoginService', () => {
  let service: UserSocialNaverLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSocialNaverLoginService],
    }).compile();

    service = module.get<UserSocialNaverLoginService>(UserSocialNaverLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
