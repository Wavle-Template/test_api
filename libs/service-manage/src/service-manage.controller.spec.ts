import { Test, TestingModule } from '@nestjs/testing';
import { ServiceManageController } from './service-manage.controller';

describe('ServiceManageController', () => {
  let controller: ServiceManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceManageController],
    }).compile();

    controller = module.get<ServiceManageController>(ServiceManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
