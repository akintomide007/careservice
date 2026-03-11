-- Add ISP Goal linkage to Tasks
ALTER TABLE "tasks" ADD COLUMN "isp_goal_id" TEXT;

-- Create index for better query performance
CREATE INDEX "tasks_isp_goal_id_idx" ON "tasks"("isp_goal_id");

-- Add foreign key constraint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_isp_goal_id_fkey" 
  FOREIGN KEY ("isp_goal_id") REFERENCES "isp_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
