import { Response } from 'express';
import { AuthRequest } from '../types';
import { taskService } from '../services/task.service';

export const taskController = {
  // Create new task
  async createTask(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      
      // Only managers and admins can create tasks
      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to create tasks' });
      }

      const task = await taskService.createTask({
        organizationId,
        assignedBy: userId,
        ...req.body
      });

      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get user's tasks
  async getUserTasks(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        taskType: req.query.taskType as string,
        clientId: req.query.clientId as string,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined
      };

      const tasks = await taskService.getUserTasks(userId, organizationId, filters);
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get tasks assigned by manager
  async getAssignedTasks(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const filters = {
        status: req.query.status as string,
        assignedTo: req.query.assignedTo as string
      };

      const tasks = await taskService.getAssignedTasks(userId, organizationId, filters);
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get task by ID
  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const task = await taskService.getTaskById(id, organizationId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.json(task);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update task
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const { id } = req.params;

      // Check if user has permission to update
      const task = await taskService.getTaskById(id, organizationId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Only assigner (manager) can update certain fields
      if (task.assignedBy !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this task' });
      }

      const updatedTask = await taskService.updateTask(id, req.body);
      return res.json(updatedTask);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Start task
  async startTask(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const { id } = req.params;

      const task = await taskService.startTask(id, userId);
      return res.json(task);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Complete task
  async completeTask(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const { id } = req.params;

      const task = await taskService.completeTask(id, userId, req.body);
      return res.json(task);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Toggle checklist item
  async toggleChecklistItem(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const { isCompleted } = req.body;

      const item = await taskService.toggleChecklistItem(itemId, isCompleted);
      return res.json(item);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Add checklist item
  async addChecklistItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const item = await taskService.addChecklistItem(id, title);
      return res.json(item);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete checklist item
  async deleteChecklistItem(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params;

      await taskService.deleteChecklistItem(itemId);
      return res.json({ message: 'Checklist item deleted' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Add task result
  async addTaskResult(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await taskService.addTaskResult(id, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Verify task result
  async verifyTaskResult(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { resultId } = req.params;
      const { notes } = req.body;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to verify results' });
      }

      const result = await taskService.verifyTaskResult(resultId, userId, notes);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get task statistics
  async getTaskStatistics(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;

      const stats = await taskService.getTaskStatistics(organizationId, userId, role);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
