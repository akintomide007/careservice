# Quick Guide: Add "Create Task" Button to ISP Goals

## What You Need

Add a "Create Task from Goal" button to each goal card in `/web-dashboard/app/dashboard/manager/goals/page.tsx`

## Step 1: Add Button to Goal Card

Find this section in the goal card (around line 500):

```tsx
<div className="flex items-center justify-end gap-2 mt-4">
  <button onClick={() => { setSelectedGoal(goal); setShowDetailsModal(true); }}>
    View Details
  </button>
  <button onClick={() => { setSelectedGoal(goal); setShowActivityModal(true); }}>
    Add Activity
  </button>
  <button onClick={() => { setSelectedGoal(goal); setShowMilestonesModal(true); }}>
    Milestones
  </button>
</div>
```

**ADD THIS BUTTON:**
```tsx
<button 
  onClick={() => {
    setSelectedGoal(goal);
    setTaskForm({
      assignedTo: '',
      title: `Work on: ${goal.title}`,
      description: goal.description || '',
      priority: goal.priority,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 1,
      checklistItems: ['Practice goal activities', 'Document progress']
    });
    setShowCreateTaskModal(true);
  }}
  className="px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors flex items-center gap-1"
>
  <Plus className="w-4 h-4" />
  Create Task
</button>
```

## Step 2: Add Create Task Handler

Add this function before the return statement:

```tsx
const handleCreateTask = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedGoal || !user) return;

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        organizationId: user.organizationId,
        assignedTo: taskForm.assignedTo,
        assignedBy: user.id,
        clientId: selectedGoal.outcome.client.id,
        ispGoalId: selectedGoal.id,  // THIS LINKS TO ISP GOAL!
        taskType: 'isp_goal_activity',
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        estimatedHours: taskForm.estimatedHours,
        checklistItems: taskForm.checklistItems.filter(item => item.trim())
      })
    });

    if (!response.ok) throw new Error('Failed to create task');

    setShowCreateTaskModal(false);
    alert('Task created successfully! DSP will see ISP goal context.');
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task. Please try again.');
  }
};
```

## Step 3: Add Create Task Modal

Add this modal after the Milestones Modal (around line 1300):

```tsx
{/* Create Task Modal */}
{showCreateTaskModal && selectedGoal && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    onClick={() => setShowCreateTaskModal(false)}
  >
    <div 
      className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center space-x-3">
          <Plus className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Task from Goal</h2>
            <p className="text-sm text-gray-600">{selectedGoal.title}</p>
          </div>
        </div>
        <button onClick={() => setShowCreateTaskModal(false)} className="text-gray-400 hover:text-gray-600">
          <Plus className="w-6 h-6 rotate-45" />
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900 mb-1">🎯 ISP Goal Context</p>
          <p className="text-sm text-blue-800">
            <strong>Goal:</strong> {selectedGoal.title}<br/>
            <strong>Client:</strong> {selectedGoal.outcome.client.firstName} {selectedGoal.outcome.client.lastName}<br/>
            <strong>Outcome:</strong> {selectedGoal.outcome.outcomeDescription}
          </p>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to DSP *</label>
            <select 
              required
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select DSP...</option>
              {dsps.map(dsp => (
                <option key={dsp.id} value={dsp.id}>
                  {dsp.firstName} {dsp.lastName} ({dsp.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select 
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateTaskModal(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
```

## What DSPs Will See

When you create a task this way:
- ✅ Task automatically linked to ISP goal (`ispGoalId` is set)
- ✅ DSP sees goal title, outcome, and progress in task view
- ✅ Works in both web dashboard and mobile app
- ✅ Task completion contributes to ISP goal progress

## Test It

1. Refresh ISP Goals page
2. Click "Create Task" button on any goal
3. Select a DSP and fill in details
4. Submit
5. DSP will see the task with full ISP context!

---

## For Appointment Request Calendar Feature

That's a separate feature. Here's what's needed:

1. **Calendar component** needs to fetch appointment requests
2. **Highlight days** with pending requests
3. **Click day** to see requests
4. **Approve/Deny buttons** call API endpoints

Would you like me to implement that next?
