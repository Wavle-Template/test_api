import { Test, TestingModule } from '@nestjs/testing';
import { NotificationStorageResolver } from './storage.resolver';

describe('StorageResolver', () => {
  let resolver: NotificationStorageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationStorageResolver],
    }).compile();

    resolver = module.get<NotificationStorageResolver>(NotificationStorageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
