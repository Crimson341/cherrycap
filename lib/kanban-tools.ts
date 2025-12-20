// Kanban Tool Definitions for AI Function Calling
// These tools allow the AI to interact with the Kanban board

export interface KanbanTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, {
        type: string;
        description: string;
        enum?: string[];
        items?: { type: string };
      }>;
      required: string[];
    };
  };
}

// Tool definitions for OpenRouter/OpenAI function calling format
export const KANBAN_TOOLS: KanbanTool[] = [
  {
    type: "function",
    function: {
      name: "kanban_get_boards",
      description: "Get all Kanban boards for the current user. Use this to see what projects/boards exist.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_get_board",
      description: "Get detailed information about a specific Kanban board including all columns and tasks. Use this to see the full state of a project.",
      parameters: {
        type: "object",
        properties: {
          boardId: {
            type: "string",
            description: "The ID of the board to retrieve",
          },
        },
        required: ["boardId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_create_board",
      description: "Create a new Kanban board/project. This automatically creates default columns: To Do, In Progress, Done.",
      parameters: {
        type: "object",
        properties: {
          boardName: {
            type: "string",
            description: "Name of the new board",
          },
          boardDescription: {
            type: "string",
            description: "Optional description of the board",
          },
          boardColor: {
            type: "string",
            description: "Optional hex color for the board (e.g., #f43f5e)",
          },
        },
        required: ["boardName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_create_task",
      description: "Create a new task in a Kanban board. Requires the board ID and column ID.",
      parameters: {
        type: "object",
        properties: {
          boardId: {
            type: "string",
            description: "The ID of the board",
          },
          columnId: {
            type: "string",
            description: "The ID of the column to add the task to (e.g., To Do column)",
          },
          title: {
            type: "string",
            description: "Title of the task",
          },
          description: {
            type: "string",
            description: "Optional detailed description of the task",
          },
          priority: {
            type: "string",
            description: "Priority level of the task",
            enum: ["low", "medium", "high", "urgent"],
          },
          dueDate: {
            type: "string",
            description: "Optional due date in ISO format (e.g., 2024-12-25)",
          },
          labels: {
            type: "array",
            description: "Optional labels/tags for the task",
            items: { type: "string" },
          },
        },
        required: ["boardId", "columnId", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_update_task",
      description: "Update an existing task's properties like title, description, priority, or due date.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the task to update",
          },
          title: {
            type: "string",
            description: "New title for the task",
          },
          description: {
            type: "string",
            description: "New description for the task",
          },
          priority: {
            type: "string",
            description: "New priority level",
            enum: ["low", "medium", "high", "urgent"],
          },
          dueDate: {
            type: "string",
            description: "New due date in ISO format",
          },
          labels: {
            type: "array",
            description: "New labels for the task",
            items: { type: "string" },
          },
        },
        required: ["taskId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_delete_task",
      description: "Delete a task from the Kanban board. This action is permanent.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the task to delete",
          },
        },
        required: ["taskId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_move_task",
      description: "Move a task to a different column (e.g., from 'To Do' to 'In Progress' or 'Done').",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the task to move",
          },
          targetColumnId: {
            type: "string",
            description: "The ID of the destination column",
          },
        },
        required: ["taskId", "targetColumnId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_get_my_tasks",
      description: "Get all tasks assigned to the current user across all boards. Useful for seeing personal workload.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_complete_task",
      description: "Mark a task as complete by moving it to the 'Done' column.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the task to complete",
          },
          boardId: {
            type: "string",
            description: "The ID of the board containing the task",
          },
        },
        required: ["taskId", "boardId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kanban_add_subtask",
      description: "Add a subtask/checklist item to an existing task.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the parent task",
          },
          subtaskTitle: {
            type: "string",
            description: "Title of the subtask",
          },
        },
        required: ["taskId", "subtaskTitle"],
      },
    },
  },
];

// Map function names to Kanban API actions
export const KANBAN_FUNCTION_TO_ACTION: Record<string, string> = {
  kanban_get_boards: "getBoards",
  kanban_get_board: "getBoard",
  kanban_create_board: "createBoard",
  kanban_create_task: "createTask",
  kanban_update_task: "updateTask",
  kanban_delete_task: "deleteTask",
  kanban_move_task: "moveTask",
  kanban_get_my_tasks: "getMyTasks",
  kanban_complete_task: "completeTask",
  kanban_add_subtask: "addSubtask",
};

// System prompt addition for Kanban-aware conversations
export const KANBAN_SYSTEM_PROMPT = `
## Kanban Board Access

You have access to the user's Kanban project management board. You can:
- View all their boards and projects
- See tasks in each column (To Do, In Progress, Done)
- Create new tasks with titles, descriptions, priorities, and due dates
- Update existing tasks
- Move tasks between columns (e.g., mark as in progress or complete)
- Delete tasks
- Add subtasks/checklist items to tasks

When the user asks about their tasks, projects, or wants to manage their work:
1. First, get their boards to understand what projects exist
2. Get specific board details to see current tasks
3. Perform requested actions (create, update, move, delete tasks)

Priority levels: low, medium, high, urgent
Default columns: To Do, In Progress, Done

Always confirm actions before executing them if they are destructive (like deleting).
After creating or modifying tasks, summarize what was done.
`;

// Helper to format board/task data for display
export function formatBoardSummary(board: {
  name: string;
  description?: string;
  columns?: Array<{
    name: string;
    tasks: Array<{
      title: string;
      priority?: string;
      dueDate?: number;
    }>;
  }>;
}): string {
  let summary = `**${board.name}**`;
  if (board.description) {
    summary += `\n${board.description}`;
  }
  
  if (board.columns) {
    summary += "\n\n";
    for (const column of board.columns) {
      summary += `### ${column.name} (${column.tasks.length} tasks)\n`;
      if (column.tasks.length > 0) {
        for (const task of column.tasks.slice(0, 5)) {
          const priority = task.priority ? ` [${task.priority}]` : "";
          const dueDate = task.dueDate 
            ? ` - Due: ${new Date(task.dueDate).toLocaleDateString()}`
            : "";
          summary += `- ${task.title}${priority}${dueDate}\n`;
        }
        if (column.tasks.length > 5) {
          summary += `  _...and ${column.tasks.length - 5} more_\n`;
        }
      }
    }
  }
  
  return summary;
}

export function formatTaskList(tasks: Array<{
  title: string;
  boardName?: string;
  columnName?: string;
  priority?: string;
  dueDate?: number;
}>): string {
  if (tasks.length === 0) {
    return "No tasks found.";
  }
  
  let list = "";
  for (const task of tasks) {
    const board = task.boardName ? ` (${task.boardName})` : "";
    const column = task.columnName ? ` [${task.columnName}]` : "";
    const priority = task.priority ? ` Priority: ${task.priority}` : "";
    const dueDate = task.dueDate 
      ? ` Due: ${new Date(task.dueDate).toLocaleDateString()}`
      : "";
    list += `- ${task.title}${board}${column}${priority}${dueDate}\n`;
  }
  
  return list;
}
