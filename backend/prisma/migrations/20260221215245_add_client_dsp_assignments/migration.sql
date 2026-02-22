-- CreateTable
CREATE TABLE "client_dsp_assignments" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "dsp_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_dsp_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_dsp_assignments_client_id_idx" ON "client_dsp_assignments"("client_id");

-- CreateIndex
CREATE INDEX "client_dsp_assignments_dsp_id_idx" ON "client_dsp_assignments"("dsp_id");

-- CreateIndex
CREATE INDEX "client_dsp_assignments_is_active_idx" ON "client_dsp_assignments"("is_active");

-- AddForeignKey
ALTER TABLE "client_dsp_assignments" ADD CONSTRAINT "client_dsp_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
