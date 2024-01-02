import { Test, TestingModule } from '@nestjs/testing';
import { ServiceManageResolver } from './service-manage.resolver';

describe('ServiceManageResolver', () => {
  let resolver: ServiceManageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceManageResolver],
    }).compile();

    resolver = module.get<ServiceManageResolver>(ServiceManageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
