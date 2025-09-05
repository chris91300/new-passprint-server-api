import { Test, TestingModule } from '@nestjs/testing';
import { WebSiteService } from './web-site.service';

describe('WebSiteService', () => {
  let service: WebSiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSiteService],
    }).compile();

    service = module.get<WebSiteService>(WebSiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
