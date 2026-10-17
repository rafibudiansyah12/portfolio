import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdminExperiencesController,
  AdminProfileController,
  AdminProjectsController,
  AdminSkillsController,
} from './admin-content.controller';
import {
  AdminAuditLogsController,
  AdminAnalyticsController,
  AdminGuestbookController,
  AdminMediaController,
  AdminMessagesController,
  AdminPostsController,
  AdminSettingsController,
  AdminSubscribersController,
  AdminTestimonialsController,
} from './admin-management.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [
    AdminProjectsController,
    AdminSkillsController,
    AdminExperiencesController,
    AdminProfileController,
    AdminPostsController,
    AdminTestimonialsController,
    AdminGuestbookController,
    AdminMessagesController,
    AdminSettingsController,
    AdminSubscribersController,
    AdminAuditLogsController,
    AdminAnalyticsController,
    AdminMediaController,
  ],
  providers: [JwtAuthGuard, RolesGuard],
})
export class AdminApiModule {}
