-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "messageId" TEXT,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "fromMe" BOOLEAN NOT NULL,
    "sendType" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "primaryService" TEXT NOT NULL,
    "secondaryServices" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "userProfile" TEXT NOT NULL,
    "frustrationLevel" INTEGER NOT NULL,
    "keyPhrases" TEXT NOT NULL,
    "userIntent" TEXT NOT NULL,
    "wasResolved" BOOLEAN NOT NULL,
    "resolutionStage" TEXT,
    "abandonmentReason" TEXT,
    "opportunities" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "dropoffPoint" TEXT,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConversationAnalysis_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "resolvedConversations" INTEGER NOT NULL DEFAULT 0,
    "abandonedConversations" INTEGER NOT NULL DEFAULT 0,
    "growthRate" REAL NOT NULL DEFAULT 0,
    "previousPeriodTotal" INTEGER NOT NULL DEFAULT 0,
    "averageSatisfaction" REAL NOT NULL DEFAULT 0,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "frustratedCount" INTEGER NOT NULL DEFAULT 0,
    "topQuestions" TEXT NOT NULL,
    "topProblems" TEXT NOT NULL,
    "topOpportunities" TEXT NOT NULL,
    "userProfiles" TEXT NOT NULL,
    "funnelMetrics" TEXT NOT NULL,
    "economicImpact" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "conversationId" TEXT,
    "service" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "affectedCount" INTEGER NOT NULL DEFAULT 1,
    "impactScore" REAL NOT NULL DEFAULT 0,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_ticketId_key" ON "Conversation"("ticketId");

-- CreateIndex
CREATE INDEX "Conversation_ticketId_idx" ON "Conversation"("ticketId");

-- CreateIndex
CREATE INDEX "Conversation_phoneNumber_idx" ON "Conversation"("phoneNumber");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_externalId_idx" ON "Message"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationAnalysis_conversationId_key" ON "ConversationAnalysis"("conversationId");

-- CreateIndex
CREATE INDEX "ServiceMetrics_service_date_idx" ON "ServiceMetrics"("service", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceMetrics_service_date_key" ON "ServiceMetrics"("service", "date");

-- CreateIndex
CREATE INDEX "Alert_severity_status_idx" ON "Alert"("severity", "status");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_service_idx" ON "Alert"("service");
