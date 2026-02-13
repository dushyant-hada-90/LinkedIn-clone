import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 5000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API ready on http://localhost:${port}`);
}

bootstrap();
