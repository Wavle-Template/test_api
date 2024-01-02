import { Test, TestingModule } from '@nestjs/testing';
import { ServiceManageService } from './service-manage.service';

describe('ServiceManageService', () => {
  let service: ServiceManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceManageService],
    }).compile();

    service = module.get<ServiceManageService>(ServiceManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
