import { Test, TestingModule } from '@nestjs/testing';
import { WebSiteController } from './web-site.controller';

describe('WebSiteController', () => {
  let controller: WebSiteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebSiteController],
    }).compile();

    controller = module.get<WebSiteController>(WebSiteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
