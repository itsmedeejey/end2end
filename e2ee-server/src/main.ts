import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  let app: NestExpressApplication;

  if (process.env.NODE_ENV === 'production') {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  } else {
    const httpsOptions = {
      key: fs.readFileSync(path.join(process.cwd(), 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(process.cwd(), 'localhost+2.pem')),
    };

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      httpsOptions,
    });
  }

  // needed for proxies Render, Vercel 
  app.set('trust proxy', 1);

  const origins = process.env.CORS_ORIGINS
    ?.split(',')
    .map(o => o.trim()) || [];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
