import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LearningMaterialsModule } from './modules/learning-materials/learning-materials.module';
import { ClassSessionsModule } from './modules/class-sessions/class-sessions.module';
import { AttendancesModule } from './modules/attendances/attendances.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    LearningMaterialsModule,
    ClassSessionsModule,
    AttendancesModule,
    AssignmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
