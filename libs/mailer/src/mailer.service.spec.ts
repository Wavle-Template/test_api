import { Test, TestingModule } from '@nestjs/testing';
import { WavleMailerService } from './mailer.service';

describe('MailerService', () => {
  let service: WavleMailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WavleMailerService],
    }).compile();

    service = module.get<WavleMailerService>(WavleMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
