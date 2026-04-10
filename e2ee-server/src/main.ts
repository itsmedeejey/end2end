import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path'
import cookieParser from 'cookie-parser';

async function bootstrap() {
  let app;

  if (process.env.NODE_ENV === 'production') {
    app = await NestFactory.create(AppModule);
  } else {
    const httpsOptions = {
      key: fs.readFileSync(path.join(process.cwd(), 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(process.cwd(), 'localhost+2.pem')),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  }
  app.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
