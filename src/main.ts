import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const logger = new Logger('Bootstrap');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(
    'Unhandled promise rejection',
    reason instanceof Error ? reason.stack : String(reason),
  );
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error.stack);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.enableCors(
    process.env.NODE_ENV === 'production'
      ? { origin: process.env.FRONTEND_URL, credentials: true }
      : { origin: true, credentials: true },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
