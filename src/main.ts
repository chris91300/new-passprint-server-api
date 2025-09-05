import { NestFactory } from '@nestjs/core';
//import { WebSiteModule } from './web-site/web-site.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 5100);
}
void bootstrap();
