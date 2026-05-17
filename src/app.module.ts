import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LearningMaterialsModule } from './modules/learning-materials/learning-materials.module';
import { ClassSessionsModule } from './modules/class-sessions/class-sessions.module';
import { AttendancesModule } from './modules/attendances/attendances.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { ProgramCertificatesModule } from './modules/program-certificates/program-certificates.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { envValidationSchema } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'short',   ttl: 10000, limit: 5  },
    ]),
    JwtModule.register({}),
    DatabaseModule,
    UsersModule,
    ProgramsModule,
    CoursesModule,
    EnrollmentsModule,
    LearningMaterialsModule,
    ClassSessionsModule,
    AttendancesModule,
    AssignmentsModule,
    SubmissionsModule,
    ProgramCertificatesModule,
    ProfilesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
