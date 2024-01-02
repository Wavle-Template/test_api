import { Test, TestingModule } from '@nestjs/testing';
import { UserSocialNaverLoginResolver } from './naver-login.resolver';

describe('NaverLoginResolver', () => {
  let resolver: UserSocialNaverLoginResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSocialNaverLoginResolver],
    }).compile();

    resolver = module.get<UserSocialNaverLoginResolver>(UserSocialNaverLoginResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
