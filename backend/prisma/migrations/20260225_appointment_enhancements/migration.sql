-- AlterTable AppointmentRequest: Add new fields for DSP assignment and enhanced scheduling
ALTER TABLE "appointment_requests" 
ADD COLUMN "assigned_dsp_id" TEXT,
ADD COLUMN "estimated_duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "actual_duration" INTEGER,
ADD COLUMN "check_in_time" TIMESTAMP(3),
ADD COLUMN "check_out_time" TIMESTAMP(3),
ADD COLUMN "transportation_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "transportation_assigned_to" TEXT,
ADD COLUMN "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reminder_sent_at" TIMESTAMP(3),
ADD COLUMN "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "follow_up_notes" TEXT,
ADD COLUMN "recurring_group_id" TEXT,
ADD COLUMN "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recurring_rule" JSONB,
ADD COLUMN "reminder_settings" JSONB;

-- CreateTable: DspAvailability
CREATE TABLE "dsp_availability" (
    "id" TEXT NOT NULL,
    "dsp_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dsp_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DspTimeOff
CREATE TABLE "dsp_time_off" (
    "id" TEXT NOT NULL,
    "dsp_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsp_time_off_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AppointmentReminder
CREATE TABLE "appointment_reminders" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "reminder_type" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dsp_availability_dsp_id_idx" ON "dsp_availability"("dsp_id");
CREATE INDEX "dsp_availability_day_of_week_idx" ON "dsp_availability"("day_of_week");

CREATE INDEX "dsp_time_off_dsp_id_idx" ON "dsp_time_off"("dsp_id");
CREATE INDEX "dsp_time_off_start_date_end_date_idx" ON "dsp_time_off"("start_date", "end_date");

CREATE INDEX "appointment_reminders_appointment_id_idx" ON "appointment_reminders"("appointment_id");
CREATE INDEX "appointment_reminders_scheduled_for_sent_idx" ON "appointment_reminders"("scheduled_for", "sent");

CREATE INDEX "appointment_requests_assigned_dsp_id_scheduled_date_idx" ON "appointment_requests"("assigned_dsp_id", "scheduled_date");
CREATE INDEX "appointment_requests_recurring_group_id_idx" ON "appointment_requests"("recurring_group_id");

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_assigned_dsp_id_fkey" FOREIGN KEY ("assigned_dsp_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "dsp_availability" ADD CONSTRAINT "dsp_availability_dsp_id_fkey" FOREIGN KEY ("dsp_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dsp_time_off" ADD CONSTRAINT "dsp_time_off_dsp_id_fkey" FOREIGN KEY ("dsp_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
