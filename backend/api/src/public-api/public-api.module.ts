import { Module } from '@nestjs/common';
import { PublicContentController } from './public-content.controller';
import { PublicInteractionController } from './public-interaction.controller';
import { ResendNotificationService } from '../notifications/resend-notification.service';
import { GithubSummaryService } from './github-summary.service';
import { AssistantController } from './assistant.controller';

@Module({
  controllers: [PublicContentController, PublicInteractionController, AssistantController],
  providers: [ResendNotificationService, GithubSummaryService],
})
export class PublicApiModule {}
