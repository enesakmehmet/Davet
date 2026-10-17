-- Match the filters used by invitation analytics and the asset metadata list.
CREATE INDEX "AnalyticsEvent_invitationId_viewedAt_idx" ON "AnalyticsEvent"("invitationId", "viewedAt");
CREATE INDEX "Analytics_invitationId_idx" ON "Analytics"("invitationId");
CREATE INDEX "Asset_userId_deletedAt_idx" ON "Asset"("userId", "deletedAt");
