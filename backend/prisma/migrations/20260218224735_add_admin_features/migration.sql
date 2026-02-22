/*
  Warnings:

  - You are about to drop the column `primary_color` on the `organizations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clients_ddd_id_key";

-- DropIndex
DROP INDEX "users_azure_ad_id_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "isp_outcomes" ADD COLUMN     "last_review_date" TIMESTAMP(3),
ADD COLUMN     "next_review_date" TIMESTAMP(3),
ADD COLUMN     "overall_progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review_frequency" TEXT;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "primary_color",
ADD COLUMN     "billing_email" TEXT,
ADD COLUMN     "billing_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "last_activity_at" TIMESTAMP(3),
ADD COLUMN     "primaryColor" TEXT DEFAULT '#3B82F6',
ADD COLUMN     "storage_used_mb" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscription_end" TIMESTAMP(3),
ADD COLUMN     "subscription_start" TIMESTAMP(3),
ADD COLUMN     "total_clients" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_users" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "progress_notes" ADD COLUMN     "isp_goal_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "isp_goals" (
    "id" TEXT NOT NULL,
    "outcome_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal_type" TEXT NOT NULL,
    "measurement_criteria" JSONB,
    "target_date" TIMESTAMP(3),
    "frequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "isp_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "isp_milestones" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_date" TIMESTAMP(3) NOT NULL,
    "completion_criteria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "achieved_date" TIMESTAMP(3),
    "notes" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "isp_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "isp_activities" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "progress_note_id" TEXT,
    "staff_id" TEXT NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER,
    "prompts" JSONB,
    "success_level" TEXT,
    "observations" TEXT,
    "barriers" TEXT,
    "modifications" TEXT,
    "progress_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "isp_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "assigned_to" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "client_id" TEXT,
    "task_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "completion_notes" TEXT,
    "attachments" JSONB,
    "reminders" JSONB,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_results" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "result_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metrics" JSONB,
    "evidence" JSONB,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_checklist" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "order_index" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "task_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "violation_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "incident_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "client_id" TEXT,
    "task_id" TEXT,
    "corrective_action" TEXT,
    "resolution" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_appealed" BOOLEAN NOT NULL DEFAULT false,
    "appeal_notes" TEXT,
    "appeal_resolved_by" TEXT,
    "appeal_resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_strategies" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT,
    "title" TEXT NOT NULL,
    "shift_type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "recurrence" TEXT,
    "recurrence_end" TIMESTAMP(3),
    "color" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_requests" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "appointment_type" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'routine',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "preferred_dates" JSONB NOT NULL,
    "preferred_times" JSONB,
    "location" TEXT,
    "provider" TEXT,
    "provider_phone" TEXT,
    "transportation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "schedule_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "resolution" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "isp_goals_outcome_id_idx" ON "isp_goals"("outcome_id");

-- CreateIndex
CREATE INDEX "isp_goals_status_idx" ON "isp_goals"("status");

-- CreateIndex
CREATE INDEX "isp_milestones_goal_id_idx" ON "isp_milestones"("goal_id");

-- CreateIndex
CREATE INDEX "isp_milestones_status_idx" ON "isp_milestones"("status");

-- CreateIndex
CREATE INDEX "isp_activities_goal_id_idx" ON "isp_activities"("goal_id");

-- CreateIndex
CREATE INDEX "isp_activities_staff_id_idx" ON "isp_activities"("staff_id");

-- CreateIndex
CREATE INDEX "isp_activities_activity_date_idx" ON "isp_activities"("activity_date");

-- CreateIndex
CREATE INDEX "tasks_organization_id_idx" ON "tasks"("organization_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "task_results_task_id_idx" ON "task_results"("task_id");

-- CreateIndex
CREATE INDEX "violations_organization_id_idx" ON "violations"("organization_id");

-- CreateIndex
CREATE INDEX "violations_user_id_idx" ON "violations"("user_id");

-- CreateIndex
CREATE INDEX "violations_status_idx" ON "violations"("status");

-- CreateIndex
CREATE INDEX "violations_severity_idx" ON "violations"("severity");

-- CreateIndex
CREATE INDEX "service_strategies_organization_id_idx" ON "service_strategies"("organization_id");

-- CreateIndex
CREATE INDEX "service_strategies_category_idx" ON "service_strategies"("category");

-- CreateIndex
CREATE INDEX "schedules_organization_id_idx" ON "schedules"("organization_id");

-- CreateIndex
CREATE INDEX "schedules_user_id_idx" ON "schedules"("user_id");

-- CreateIndex
CREATE INDEX "schedules_start_time_idx" ON "schedules"("start_time");

-- CreateIndex
CREATE INDEX "schedules_end_time_idx" ON "schedules"("end_time");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_requests_schedule_id_key" ON "appointment_requests"("schedule_id");

-- CreateIndex
CREATE INDEX "appointment_requests_organization_id_idx" ON "appointment_requests"("organization_id");

-- CreateIndex
CREATE INDEX "appointment_requests_client_id_idx" ON "appointment_requests"("client_id");

-- CreateIndex
CREATE INDEX "appointment_requests_requested_by_idx" ON "appointment_requests"("requested_by");

-- CreateIndex
CREATE INDEX "appointment_requests_status_idx" ON "appointment_requests"("status");

-- CreateIndex
CREATE INDEX "appointment_requests_urgency_idx" ON "appointment_requests"("urgency");

-- CreateIndex
CREATE INDEX "support_tickets_organization_id_idx" ON "support_tickets"("organization_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "ticket_comments_ticket_id_idx" ON "ticket_comments"("ticket_id");

-- CreateIndex
CREATE INDEX "usage_metrics_organization_id_idx" ON "usage_metrics"("organization_id");

-- CreateIndex
CREATE INDEX "usage_metrics_metric_type_idx" ON "usage_metrics"("metric_type");

-- CreateIndex
CREATE INDEX "usage_metrics_recorded_at_idx" ON "usage_metrics"("recorded_at");

-- AddForeignKey
ALTER TABLE "isp_goals" ADD CONSTRAINT "isp_goals_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "isp_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_milestones" ADD CONSTRAINT "isp_milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "isp_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_activities" ADD CONSTRAINT "isp_activities_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "isp_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_activities" ADD CONSTRAINT "isp_activities_progress_note_id_fkey" FOREIGN KEY ("progress_note_id") REFERENCES "progress_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_activities" ADD CONSTRAINT "isp_activities_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_notes" ADD CONSTRAINT "progress_notes_isp_goal_id_fkey" FOREIGN KEY ("isp_goal_id") REFERENCES "isp_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_checklist" ADD CONSTRAINT "task_checklist_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
