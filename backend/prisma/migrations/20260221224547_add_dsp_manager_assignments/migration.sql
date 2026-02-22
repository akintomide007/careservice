-- CreateTable
CREATE TABLE "dsp_manager_assignments" (
    "id" TEXT NOT NULL,
    "dsp_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsp_manager_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dsp_manager_assignments_dsp_id_idx" ON "dsp_manager_assignments"("dsp_id");

-- CreateIndex
CREATE INDEX "dsp_manager_assignments_manager_id_idx" ON "dsp_manager_assignments"("manager_id");

-- CreateIndex
CREATE INDEX "dsp_manager_assignments_is_active_idx" ON "dsp_manager_assignments"("is_active");
