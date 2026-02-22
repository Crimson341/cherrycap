import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

// Initialize Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Types for Kanban operations
export type KanbanAction = 
  | "getBoards"
  | "getBoard"
  | "createBoard"
  | "createTask"
  | "updateTask"
  | "deleteTask"
  | "moveTask"
  | "getMyTasks"
  | "completeTask"
  | "addSubtask"
  | "getBoardStats";

export interface KanbanRequest {
  action: KanbanAction;
  // Board operations
  boardId?: string;
  boardName?: string;
  boardDescription?: string;
  boardColor?: string;
  // Task operations
  taskId?: string;
  columnId?: string;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string; // ISO date string
  labels?: string[];
  assignedTo?: string[];
  // Move task
  targetColumnId?: string;
  newOrder?: number;
  // Subtask
  subtaskTitle?: string;
}

export interface KanbanResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<KanbanResponse>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to access Kanban." },
        { status: 401 }
      );
    }

    const body: KanbanRequest = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    let result: unknown;

    switch (action) {
      case "getBoards": {
        result = await convex.query(api.kanban.getBoards, {});
        return NextResponse.json({
          success: true,
          data: result,
          message: `Found ${Array.isArray(result) ? result.length : 0} board(s)`,
        });
      }

      case "getBoard": {
        if (!body.boardId) {
          return NextResponse.json(
            { success: false, error: "boardId is required" },
            { status: 400 }
          );
        }
        result = await convex.query(api.kanban.getBoard, {
          boardId: body.boardId as Id<"kanbanBoards">,
        });
        if (!result) {
          return NextResponse.json(
            { success: false, error: "Board not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: result,
          message: "Board retrieved successfully",
        });
      }

      case "createBoard": {
        if (!body.boardName) {
          return NextResponse.json(
            { success: false, error: "boardName is required" },
            { status: 400 }
          );
        }
        result = await convex.mutation(api.kanban.createBoard, {
          name: body.boardName,
          description: body.boardDescription,
          color: body.boardColor,
        });
        return NextResponse.json({
          success: true,
          data: { boardId: result },
          message: `Board "${body.boardName}" created successfully`,
        });
      }

      case "createTask": {
        if (!body.boardId || !body.columnId || !body.title) {
          return NextResponse.json(
            { success: false, error: "boardId, columnId, and title are required" },
            { status: 400 }
          );
        }
        result = await convex.mutation(api.kanban.createTask, {
          boardId: body.boardId as Id<"kanbanBoards">,
          columnId: body.columnId as Id<"kanbanColumns">,
          title: body.title,
          description: body.description,
          priority: body.priority,
          dueDate: body.dueDate ? new Date(body.dueDate).getTime() : undefined,
          labels: body.labels,
          assignedTo: body.assignedTo,
        });
        return NextResponse.json({
          success: true,
          data: { taskId: result },
          message: `Task "${body.title}" created successfully`,
        });
      }

      case "updateTask": {
        if (!body.taskId) {
          return NextResponse.json(
            { success: false, error: "taskId is required" },
            { status: 400 }
          );
        }
        await convex.mutation(api.kanban.updateTask, {
          taskId: body.taskId as Id<"kanbanTasks">,
          title: body.title,
          description: body.description,
          priority: body.priority,
          dueDate: body.dueDate ? new Date(body.dueDate).getTime() : undefined,
          labels: body.labels,
          assignedTo: body.assignedTo,
        });
        return NextResponse.json({
          success: true,
          message: "Task updated successfully",
        });
      }

      case "deleteTask": {
        if (!body.taskId) {
          return NextResponse.json(
            { success: false, error: "taskId is required" },
            { status: 400 }
          );
        }
        await convex.mutation(api.kanban.deleteTask, {
          taskId: body.taskId as Id<"kanbanTasks">,
        });
        return NextResponse.json({
          success: true,
          message: "Task deleted successfully",
        });
      }

      case "moveTask": {
        if (!body.taskId || !body.targetColumnId) {
          return NextResponse.json(
            { success: false, error: "taskId and targetColumnId are required" },
            { status: 400 }
          );
        }
        await convex.mutation(api.kanban.moveTask, {
          taskId: body.taskId as Id<"kanbanTasks">,
          targetColumnId: body.targetColumnId as Id<"kanbanColumns">,
          newOrder: body.newOrder ?? 0,
        });
        return NextResponse.json({
          success: true,
          message: "Task moved successfully",
        });
      }

      case "getMyTasks": {
        result = await convex.query(api.kanban.getMyTasks, { userId });
        return NextResponse.json({
          success: true,
          data: result,
          message: `Found ${Array.isArray(result) ? result.length : 0} task(s) assigned to you`,
        });
      }

      case "completeTask": {
        if (!body.taskId) {
          return NextResponse.json(
            { success: false, error: "taskId is required" },
            { status: 400 }
          );
        }
        // Get the board to find the "Done" column
        const task = await convex.query(api.kanban.getBoard, {
          boardId: body.boardId as Id<"kanbanBoards">,
        });
        if (!task) {
          return NextResponse.json(
            { success: false, error: "Task board not found" },
            { status: 404 }
          );
        }
        // Find the "Done" column
        const doneColumn = (task as { columns: Array<{ _id: string; name: string }> }).columns?.find(
          (col) => col.name.toLowerCase() === "done"
        );
        if (doneColumn) {
          await convex.mutation(api.kanban.moveTask, {
            taskId: body.taskId as Id<"kanbanTasks">,
            targetColumnId: doneColumn._id as Id<"kanbanColumns">,
            newOrder: 0,
          });
        }
        return NextResponse.json({
          success: true,
          message: "Task marked as complete",
        });
      }

      case "addSubtask": {
        if (!body.taskId || !body.subtaskTitle) {
          return NextResponse.json(
            { success: false, error: "taskId and subtaskTitle are required" },
            { status: 400 }
          );
        }
        result = await convex.mutation(api.kanban.addSubtask, {
          taskId: body.taskId as Id<"kanbanTasks">,
          title: body.subtaskTitle,
        });
        return NextResponse.json({
          success: true,
          data: { subtaskId: result },
          message: "Subtask added successfully",
        });
      }

      case "getBoardStats": {
        if (!body.boardId) {
          return NextResponse.json(
            { success: false, error: "boardId is required" },
            { status: 400 }
          );
        }
        result = await convex.query(api.kanban.getBoardStats, {
          boardId: body.boardId as Id<"kanbanBoards">,
        });
        return NextResponse.json({
          success: true,
          data: result,
          message: "Board statistics retrieved",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Kanban API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Kanban operation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET endpoint to get user's boards summary (for AI context)
export async function GET(_req: NextRequest): Promise<NextResponse<KanbanResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's boards with basic info
    const boards = await convex.query(api.kanban.getBoards, {});
    
    // Get summary for each board
    const boardSummaries = await Promise.all(
      (boards as Array<{ _id: string; name: string; description?: string; color?: string }>).slice(0, 5).map(async (board) => {
        const fullBoard = await convex.query(api.kanban.getBoard, {
          boardId: board._id as Id<"kanbanBoards">,
        }) as { columns: Array<{ name: string; tasks: Array<{ title: string; priority?: string; dueDate?: number }> }> } | null;
        
        if (!fullBoard) return null;
        
        const totalTasks = fullBoard.columns?.reduce((acc, col) => acc + col.tasks.length, 0) || 0;
        const columnSummary = fullBoard.columns?.map((col) => ({
          name: col.name,
          taskCount: col.tasks.length,
        }));
        
        return {
          id: board._id,
          name: board.name,
          description: board.description,
          totalTasks,
          columns: columnSummary,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalBoards: (boards as Array<unknown>).length,
        boards: boardSummaries.filter(Boolean),
      },
      message: "Kanban context retrieved",
    });
  } catch (error) {
    console.error("Kanban GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get Kanban context" },
      { status: 500 }
    );
  }
}
