import { Test, TestingModule } from '@nestjs/testing';
import { NotificationStorageService } from './storage.service';

describe('StorageService', () => {
  let service: NotificationStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationStorageService],
    }).compile();

    service = module.get<NotificationStorageService>(NotificationStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
