import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ BOARD QUERIES ============

// Get all boards for a user (owned + member of + organization boards)
export const getBoards = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    // Get boards owned by user
    const ownedBoards = await ctx.db
      .query("kanbanBoards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    // Get all boards (we'll filter by membership)
    const allBoards = await ctx.db
      .query("kanbanBoards")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    // Filter boards where user is a member (but not owner)
    const memberBoards = allBoards.filter(board => {
      if (board.userId === userId) return false; // Already in ownedBoards
      if (!board.members) return false;
      return board.members.some(m => m.userId === userId);
    });

    // Get organization memberships for the user
    const orgMemberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get organization boards (where visibility is "organization" or "team")
    const orgIds = orgMemberships.map(m => m.organizationId);
    const orgBoards = allBoards.filter(board => {
      if (board.userId === userId) return false;
      if (board.members?.some(m => m.userId === userId)) return false;
      if (!board.organizationId) return false;
      if (!orgIds.some(id => id === board.organizationId)) return false;
      return board.visibility === "organization" || board.visibility === "team";
    });

    // Combine and deduplicate
    const allUserBoards = [...ownedBoards, ...memberBoards, ...orgBoards];
    return allUserBoards.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get a single board with its columns and tasks
export const getBoard = query({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) return null;

    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    // Sort columns by order
    const sortedColumns = columns.sort((a, b) => a.order - b.order);

    // Group tasks by column and sort by order
    const columnTasks = sortedColumns.map((column) => ({
      ...column,
      tasks: tasks
        .filter((task) => task.columnId === column._id)
        .sort((a, b) => a.order - b.order),
    }));

    return {
      ...board,
      columns: columnTasks,
    };
  },
});

// ============ BOARD MUTATIONS ============

// Create a new board with default columns
export const createBoard = mutation({
  args: {
    name: v.string(),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
    userAvatar: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("organization"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const now = Date.now();
    
    // Create the board
    const boardId = await ctx.db.insert("kanbanBoards", {
      userId: userId,
      name: args.name,
      description: args.description,
      color: args.color || "#f43f5e", // Rose-500 default
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      organizationId: args.organizationId,
      visibility: args.visibility || "private",
      members: [{ 
        userId: userId, 
        email: identity.email || args.userEmail || "",
        name: args.userName,
        avatar: args.userAvatar,
        role: "owner", 
        addedAt: now 
      }],
    });

    // Create default columns
    const defaultColumns = [
      { name: "To Do", color: "#6b7280" },      // Gray
      { name: "In Progress", color: "#3b82f6" }, // Blue
      { name: "Done", color: "#22c55e" },        // Green
    ];

    for (let i = 0; i < defaultColumns.length; i++) {
      await ctx.db.insert("kanbanColumns", {
        boardId,
        name: defaultColumns[i].name,
        color: defaultColumns[i].color,
        order: i,
        createdAt: now,
      });
    }

    return boardId;
  },
});

// Update board details
export const updateBoard = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    scratchpad: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    if (board.userId !== identity.subject) throw new Error("Only the owner can update the board");

    const { boardId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    
    await ctx.db.patch(boardId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Archive a board
export const archiveBoard = mutation({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    // Only owner or admin can archive
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && member?.role !== "admin") {
      throw new Error("You don't have permission to archive this board");
    }

    await ctx.db.patch(args.boardId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

// Delete a board and all its contents
export const deleteBoard = mutation({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    if (board.userId !== identity.subject) throw new Error("Only the owner can delete the board");

    // Delete all tasks securely using Promise.all
    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();
    await Promise.all(tasks.map((task) => ctx.db.delete(task._id)));

    // Delete all columns securely using Promise.all
    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();
    await Promise.all(columns.map((column) => ctx.db.delete(column._id)));

    // Delete the board
    await ctx.db.delete(args.boardId);
  },
});

// ============ COLUMN MUTATIONS ============

// Create a new column
export const createColumn = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    
    // Only owner or admin can create columns
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && member?.role !== "admin") {
      throw new Error("You don't have permission to create columns");
    }

    // Get the highest order
    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();
    
    const maxOrder = columns.length > 0 
      ? Math.max(...columns.map((c) => c.order)) 
      : -1;

    const columnId = await ctx.db.insert("kanbanColumns", {
      boardId: args.boardId,
      name: args.name,
      color: args.color || "#6b7280",
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    // Update board timestamp
    await ctx.db.patch(args.boardId, { updatedAt: Date.now() });

    return columnId;
  },
});

// Update a column
export const updateColumn = mutation({
  args: {
    columnId: v.id("kanbanColumns"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const column = await ctx.db.get(args.columnId);
    if (!column) throw new Error("Column not found");

    const board = await ctx.db.get(column.boardId);
    if (!board) throw new Error("Board not found");

    // Only owner or admin can update columns
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && member?.role !== "admin") {
      throw new Error("You don't have permission to update columns");
    }

    const { columnId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    
    if (column) {
      await ctx.db.patch(columnId, filteredUpdates);
      await ctx.db.patch(column.boardId, { updatedAt: Date.now() });
    }
  },
});

// Delete a column and move tasks to another column (or delete them)
export const deleteColumn = mutation({
  args: {
    columnId: v.id("kanbanColumns"),
    moveTasksTo: v.optional(v.id("kanbanColumns")),
  },
  handler: async (ctx, args) => {
    const column = await ctx.db.get(args.columnId);
    if (!column) return;

    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_columnId", (q) => q.eq("columnId", args.columnId))
      .collect();

    if (args.moveTasksTo) {
      // Move tasks to another column
      const targetTasks = await ctx.db
        .query("kanbanTasks")
        .withIndex("by_columnId", (q) => q.eq("columnId", args.moveTasksTo!))
        .collect();
      const maxOrder = targetTasks.length > 0 
        ? Math.max(...targetTasks.map((t) => t.order)) 
        : -1;

      for (let i = 0; i < tasks.length; i++) {
        await ctx.db.patch(tasks[i]._id, {
          columnId: args.moveTasksTo,
          order: maxOrder + 1 + i,
          updatedAt: Date.now(),
        });
      }
    } else {
      // Delete all tasks in the column
      for (const task of tasks) {
        await ctx.db.delete(task._id);
      }
    }

    // Delete the column
    await ctx.db.delete(args.columnId);

    // Update remaining column orders
    const remainingColumns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_boardId", (q) => q.eq("boardId", column.boardId))
      .collect();
    
    const sortedColumns = remainingColumns.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedColumns.length; i++) {
      if (sortedColumns[i].order !== i) {
        await ctx.db.patch(sortedColumns[i]._id, { order: i });
      }
    }

    // Update board timestamp
    await ctx.db.patch(column.boardId, { updatedAt: Date.now() });
  },
});

// Reorder columns
export const reorderColumns = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    columnIds: v.array(v.id("kanbanColumns")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.columnIds.length; i++) {
      await ctx.db.patch(args.columnIds[i], { order: i });
    }
    await ctx.db.patch(args.boardId, { updatedAt: Date.now() });
  },
});

// ============ TASK MUTATIONS ============

// Create a new task
export const createTask = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    columnId: v.id("kanbanColumns"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    dueDate: v.optional(v.number()),
    labels: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    // Only members can create tasks
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && (!member || member.role === "viewer")) {
      throw new Error("You don't have permission to create tasks on this board");
    }

    const now = Date.now();

    // Get the highest order in the column
    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_columnId", (q) => q.eq("columnId", args.columnId))
      .collect();
    
    const maxOrder = tasks.length > 0 
      ? Math.max(...tasks.map((t) => t.order)) 
      : -1;

    const taskId = await ctx.db.insert("kanbanTasks", {
      boardId: args.boardId,
      columnId: args.columnId,
      title: args.title,
      description: args.description,
      order: maxOrder + 1,
      createdBy: identity.subject,
      assignedTo: args.assignedTo,
      priority: args.priority,
      dueDate: args.dueDate,
      labels: args.labels,
      createdAt: now,
      updatedAt: now,
    });

    // Update board timestamp
    await ctx.db.patch(args.boardId, { updatedAt: now });

    return taskId;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    dueDate: v.optional(v.number()),
    labels: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.array(v.string())),
    subtasks: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      isCompleted: v.boolean(),
    }))),
    estimatedMinutes: v.optional(v.number()),
    spentMinutes: v.optional(v.number()),
    pomodoroCount: v.optional(v.number()),
    isTodayFocus: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Board not found");

    // Only members can update tasks
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && (!member || member.role === "viewer")) {
      throw new Error("You don't have permission to update tasks on this board");
    }

    const { taskId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    
    await ctx.db.patch(taskId, {
        ...filteredUpdates,
        updatedAt: Date.now(),
      });
      await ctx.db.patch(task.boardId, { updatedAt: Date.now() });
  },
});

// Delete a task
export const deleteTask = mutation({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Board not found");

    // Only members can delete tasks
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && (!member || member.role === "viewer")) {
      throw new Error("You don't have permission to delete tasks on this board");
    }

    await ctx.db.delete(args.taskId);

    // Reorder remaining tasks in the column
    const remainingTasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_columnId", (q) => q.eq("columnId", task.columnId))
      .collect();
    
    const sortedTasks = remainingTasks.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedTasks.length; i++) {
      if (sortedTasks[i].order !== i) {
        await ctx.db.patch(sortedTasks[i]._id, { order: i });
      }
    }

    // Update board timestamp
    await ctx.db.patch(task.boardId, { updatedAt: Date.now() });
  },
});

// Move a task to a different column or reorder within the same column
export const moveTask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    targetColumnId: v.id("kanbanColumns"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Board not found");

    // Only members can move tasks
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && (!member || member.role === "viewer")) {
      throw new Error("You don't have permission to move tasks on this board");
    }

    const sourceColumnId = task.columnId;
    const now = Date.now();
    const patchPromises: Promise<any>[] = [];

    // If moving to a different column
    if (sourceColumnId !== args.targetColumnId) {
      // Update the task's column
      patchPromises.push(ctx.db.patch(args.taskId, {
        columnId: args.targetColumnId,
        order: args.newOrder,
        updatedAt: now,
      }));

      // Reorder source column tasks
      const sourceTasks = await ctx.db
        .query("kanbanTasks")
        .withIndex("by_columnId", (q) => q.eq("columnId", sourceColumnId))
        .collect();
      const sortedSourceTasks = sourceTasks.sort((a, b) => a.order - b.order);
      for (let i = 0; i < sortedSourceTasks.length; i++) {
        if (sortedSourceTasks[i].order !== i) {
          patchPromises.push(ctx.db.patch(sortedSourceTasks[i]._id, { order: i }));
        }
      }

      // Reorder target column tasks (shift tasks after the new position)
      const targetTasks = await ctx.db
        .query("kanbanTasks")
        .withIndex("by_columnId", (q) => q.eq("columnId", args.targetColumnId))
        .collect();
      const sortedTargetTasks = targetTasks
        .filter((t) => t._id !== args.taskId)
        .sort((a, b) => a.order - b.order);
      
      for (let i = 0; i < sortedTargetTasks.length; i++) {
        const newOrder = i >= args.newOrder ? i + 1 : i;
        if (sortedTargetTasks[i].order !== newOrder) {
          patchPromises.push(ctx.db.patch(sortedTargetTasks[i]._id, { order: newOrder }));
        }
      }
    } else {
      // Reordering within the same column
      const columnTasks = await ctx.db
        .query("kanbanTasks")
        .withIndex("by_columnId", (q) => q.eq("columnId", sourceColumnId))
        .collect();
      
      const oldOrder = task.order;
      const sortedTasks = columnTasks.sort((a, b) => a.order - b.order);
      
      for (const t of sortedTasks) {
        if (t._id === args.taskId) {
          patchPromises.push(ctx.db.patch(t._id, { order: args.newOrder, updatedAt: now }));
        } else if (oldOrder < args.newOrder) {
          // Moving down: shift tasks up
          if (t.order > oldOrder && t.order <= args.newOrder) {
            patchPromises.push(ctx.db.patch(t._id, { order: t.order - 1 }));
          }
        } else {
          // Moving up: shift tasks down
          if (t.order >= args.newOrder && t.order < oldOrder) {
            patchPromises.push(ctx.db.patch(t._id, { order: t.order + 1 }));
          }
        }
      }
    }

    await Promise.all(patchPromises);

    // Update board timestamp
    await ctx.db.patch(task.boardId, { updatedAt: now });
  },
});

// Mark task as complete (move to done column or set completedAt)
export const completeTask = mutation({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Board not found");

    // Only members can complete tasks
    const isOwner = board.userId === identity.subject;
    const member = board.members?.find(m => m.userId === identity.subject);
    if (!isOwner && (!member || member.role === "viewer")) {
      throw new Error("You don't have permission to complete tasks on this board");
    }

    await ctx.db.patch(args.taskId, {
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ============ TEAM / MEMBER MUTATIONS ============

// Add a member to a board
export const addBoardMember = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    // Check if adder has permission (owner or admin)
    const isOwner = board.userId === args.addedBy;
    const adderMember = board.members?.find(m => m.userId === args.addedBy);
    if (!isOwner && adderMember?.role !== "admin") {
      throw new Error("You don't have permission to add members");
    }

    // Check if user is already a member
    if (board.members?.some(m => m.userId === args.userId)) {
      throw new Error("User is already a member of this board");
    }

    const now = Date.now();
    const newMember = {
      userId: args.userId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      role: args.role,
      addedAt: now,
    };

    const members = [...(board.members || []), newMember];
    await ctx.db.patch(args.boardId, { members, updatedAt: now });

    return { success: true };
  },
});

// Remove a member from a board
export const removeBoardMember = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    targetUserId: v.string(),
    removedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    // Can't remove the owner
    if (args.targetUserId === board.userId) {
      throw new Error("Cannot remove the board owner");
    }

    // Check if remover has permission
    const isOwner = board.userId === args.removedBy;
    const removerMember = board.members?.find(m => m.userId === args.removedBy);
    if (!isOwner && removerMember?.role !== "admin") {
      throw new Error("You don't have permission to remove members");
    }

    const members = board.members?.filter(m => m.userId !== args.targetUserId) || [];
    await ctx.db.patch(args.boardId, { members, updatedAt: Date.now() });

    return { success: true };
  },
});

// Update a member's role
export const updateBoardMemberRole = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    targetUserId: v.string(),
    newRole: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    // Only owner can change roles
    if (board.userId !== args.updatedBy) {
      throw new Error("Only the board owner can change member roles");
    }

    // Can't change owner's role
    if (args.targetUserId === board.userId) {
      throw new Error("Cannot change the owner's role");
    }

    const members = board.members?.map(m => 
      m.userId === args.targetUserId ? { ...m, role: args.newRole } : m
    ) || [];

    await ctx.db.patch(args.boardId, { members, updatedAt: Date.now() });

    return { success: true };
  },
});

// Get board members with their details
export const getBoardMembers = query({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) return [];
    return board.members || [];
  },
});

// ============ COMMENT MUTATIONS ============

// Add a comment to a task
export const addComment = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    content: v.string(),
    mentions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();

    const commentId = await ctx.db.insert("kanbanComments", {
      taskId: args.taskId,
      boardId: task.boardId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      content: args.content,
      mentions: args.mentions,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
    });

    // Log activity
    await ctx.db.insert("kanbanActivity", {
      taskId: args.taskId,
      boardId: task.boardId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      action: "commented",
      createdAt: now,
    });

    // Update task timestamp
    await ctx.db.patch(args.taskId, { updatedAt: now });

    return commentId;
  },
});

// Get comments for a task
export const getTaskComments = query({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kanbanComments")
      .withIndex("by_taskId_createdAt", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("kanbanComments"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== args.userId) throw new Error("You can only edit your own comments");

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
      isEdited: true,
    });
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("kanbanComments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== args.userId) throw new Error("You can only delete your own comments");

    await ctx.db.delete(args.commentId);
  },
});

// ============ ACTIVITY QUERIES ============

// Get activity for a task
export const getTaskActivity = query({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kanbanActivity")
      .withIndex("by_taskId_createdAt", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Get recent activity for a board
export const getBoardActivity = query({
  args: { 
    boardId: v.id("kanbanBoards"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("kanbanActivity")
      .withIndex("by_boardId_createdAt", (q) => q.eq("boardId", args.boardId))
      .order("desc")
      .take(args.limit || 50);
    
    return activities;
  },
});

// ============ TASK ASSIGNMENT ============

// Assign users to a task
export const assignTask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    assignedTo: v.array(v.string()),
    assignedBy: v.string(),
    assignedByName: v.string(),
    assignedByAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();
    const oldAssignees = task.assignedTo || [];

    await ctx.db.patch(args.taskId, {
      assignedTo: args.assignedTo,
      updatedAt: now,
    });

    // Log activity for new assignees
    const newAssignees = args.assignedTo.filter(id => !oldAssignees.includes(id));
    const removedAssignees = oldAssignees.filter(id => !args.assignedTo.includes(id));

    if (newAssignees.length > 0) {
      await ctx.db.insert("kanbanActivity", {
        taskId: args.taskId,
        boardId: task.boardId,
        userId: args.assignedBy,
        userName: args.assignedByName,
        userAvatar: args.assignedByAvatar,
        action: "assigned",
        details: { newValue: newAssignees },
        createdAt: now,
      });
    }

    if (removedAssignees.length > 0) {
      await ctx.db.insert("kanbanActivity", {
        taskId: args.taskId,
        boardId: task.boardId,
        userId: args.assignedBy,
        userName: args.assignedByName,
        userAvatar: args.assignedByAvatar,
        action: "unassigned",
        details: { oldValue: removedAssignees },
        createdAt: now,
      });
    }

    // Update board timestamp
    await ctx.db.patch(task.boardId, { updatedAt: now });
  },
});

// Get tasks assigned to a user (across all their boards)
export const getMyTasks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Note: This is a simple implementation. For production,
    // you might want to add pagination and filtering
    const allTasks = await ctx.db
      .query("kanbanTasks")
      .collect();
    
    const myTasks = allTasks.filter(task => 
      task.assignedTo?.includes(args.userId)
    );

    // Get board and column info for each task
    const tasksWithContext = await Promise.all(
      myTasks.map(async (task) => {
        const board = await ctx.db.get(task.boardId);
        const column = await ctx.db.get(task.columnId);
        return {
          ...task,
          boardName: board?.name,
          boardColor: board?.color,
          columnName: column?.name,
        };
      })
    );

    return tasksWithContext.sort((a, b) => {
      // Sort by due date (if exists), then by updated date
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },
});

// ============ SUBTASKS / CHECKLIST ============

// Get subtasks for a task
export const getSubtasks = query({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kanbanSubtasks")
      .withIndex("by_taskId_order", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Add a subtask
export const addSubtask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Get highest order
    const subtasks = await ctx.db
      .query("kanbanSubtasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    const maxOrder = subtasks.length > 0 ? Math.max(...subtasks.map(s => s.order)) : -1;

    const now = Date.now();
    const subtaskId = await ctx.db.insert("kanbanSubtasks", {
      taskId: args.taskId,
      boardId: task.boardId,
      title: args.title,
      isCompleted: false,
      order: maxOrder + 1,
      createdAt: now,
      createdBy: userId,
    });

    // Update task timestamp
    await ctx.db.patch(args.taskId, { updatedAt: now });

    return subtaskId;
  },
});

// Toggle subtask completion
export const toggleSubtask = mutation({
  args: {
    subtaskId: v.id("kanbanSubtasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    const now = Date.now();
    await ctx.db.patch(args.subtaskId, {
      isCompleted: !subtask.isCompleted,
      completedAt: !subtask.isCompleted ? now : undefined,
      completedBy: !subtask.isCompleted ? args.userId : undefined,
    });

    // Update task timestamp
    await ctx.db.patch(subtask.taskId, { updatedAt: now });
  },
});

// Update subtask title
export const updateSubtask = mutation({
  args: {
    subtaskId: v.id("kanbanSubtasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    await ctx.db.patch(args.subtaskId, { title: args.title });
    await ctx.db.patch(subtask.taskId, { updatedAt: Date.now() });
  },
});

// Delete a subtask
export const deleteSubtask = mutation({
  args: { subtaskId: v.id("kanbanSubtasks") },
  handler: async (ctx, args) => {
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    await ctx.db.delete(args.subtaskId);
    await ctx.db.patch(subtask.taskId, { updatedAt: Date.now() });
  },
});

// Reorder subtasks
export const reorderSubtasks = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    subtaskIds: v.array(v.id("kanbanSubtasks")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.subtaskIds.length; i++) {
      await ctx.db.patch(args.subtaskIds[i], { order: i });
    }
    await ctx.db.patch(args.taskId, { updatedAt: Date.now() });
  },
});

// ============ BOARD INVITES ============

// Helper to generate invite code
function generateBoardInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a board invite
export const createBoardInvite = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    // Check if inviter has permission
    const isOwner = board.userId === args.invitedBy;
    const inviterMember = board.members?.find(m => m.userId === args.invitedBy);
    if (!isOwner && inviterMember?.role !== "admin") {
      throw new Error("You don't have permission to invite members");
    }

    // Check if already a member
    if (board.members?.some(m => m.email?.toLowerCase() === args.email.toLowerCase())) {
      throw new Error("This email is already a member of the board");
    }

    // Check for existing pending invite
    const existingInvite = await ctx.db
      .query("kanbanBoardInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.and(
        q.eq(q.field("boardId"), args.boardId),
        q.eq(q.field("status"), "pending")
      ))
      .first();

    if (existingInvite) {
      throw new Error("An invite is already pending for this email");
    }

    const now = Date.now();
    const inviteCode = generateBoardInviteCode();

    const inviteId = await ctx.db.insert("kanbanBoardInvites", {
      boardId: args.boardId,
      email: args.email.toLowerCase(),
      role: args.role,
      invitedBy: args.invitedBy,
      inviteCode,
      status: "pending",
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { inviteId, inviteCode };
  },
});

// Get board invite by code
export const getBoardInviteByCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("kanbanBoardInvites")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite) return null;

    const board = await ctx.db.get(invite.boardId);
    return { invite, board };
  },
});

// Accept a board invite
export const acceptBoardInvite = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("kanbanBoardInvites")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite) throw new Error("Invalid invite code");
    if (invite.status !== "pending") throw new Error("This invite is no longer valid");
    if (Date.now() > invite.expiresAt) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("This invite has expired");
    }

    // Verify email matches
    if (invite.email.toLowerCase() !== args.email.toLowerCase()) {
      throw new Error("This invite was sent to a different email address");
    }

    const board = await ctx.db.get(invite.boardId);
    if (!board) throw new Error("Board not found");

    const now = Date.now();

    // Add member to board
    const newMember = {
      userId: args.userId,
      email: args.email.toLowerCase(),
      name: args.name,
      avatar: args.avatar,
      role: invite.role,
      addedAt: now,
    };

    const members = [...(board.members || []), newMember];
    await ctx.db.patch(invite.boardId, { members, updatedAt: now });

    // Update invite status
    await ctx.db.patch(invite._id, { status: "accepted" });

    return { success: true, boardId: invite.boardId };
  },
});

// Get pending invites for a board
export const getBoardPendingInvites = query({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kanbanBoardInvites")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Revoke a board invite
export const revokeBoardInvite = mutation({
  args: {
    inviteId: v.id("kanbanBoardInvites"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    const board = await ctx.db.get(invite.boardId);
    if (!board) throw new Error("Board not found");

    // Check permission
    const isOwner = board.userId === args.userId;
    const member = board.members?.find(m => m.userId === args.userId);
    if (!isOwner && member?.role !== "admin") {
      throw new Error("You don't have permission to revoke invites");
    }

    await ctx.db.patch(args.inviteId, { status: "revoked" });
  },
});

// ============ BOARD STATISTICS ============

// Get board statistics
export const getBoardStats = query({
  args: { boardId: v.id("kanbanBoards") },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) return null;

    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completedAt).length;
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < now && !t.completedAt).length;
    const dueSoonTasks = tasks.filter(t => {
      if (!t.dueDate || t.completedAt) return false;
      const daysUntilDue = (t.dueDate - now) / (24 * 60 * 60 * 1000);
      return daysUntilDue >= 0 && daysUntilDue <= 3;
    }).length;

    // Tasks by priority
    const tasksByPriority = {
      urgent: tasks.filter(t => t.priority === "urgent" && !t.completedAt).length,
      high: tasks.filter(t => t.priority === "high" && !t.completedAt).length,
      medium: tasks.filter(t => t.priority === "medium" && !t.completedAt).length,
      low: tasks.filter(t => t.priority === "low" && !t.completedAt).length,
      none: tasks.filter(t => !t.priority && !t.completedAt).length,
    };

    // Tasks by column
    const tasksByColumn = columns.map(col => ({
      columnId: col._id,
      columnName: col.name,
      count: tasks.filter(t => t.columnId === col._id).length,
    }));

    // Recent activity
    const recentlyCreated = tasks.filter(t => t.createdAt > oneWeekAgo).length;
    const recentlyCompleted = tasks.filter(t => t.completedAt && t.completedAt > oneWeekAgo).length;

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      openTasks: totalTasks - completedTasks,
      overdueTasks,
      dueSoonTasks,
      tasksByPriority,
      tasksByColumn,
      recentlyCreated,
      recentlyCompleted,
      completionRate,
      memberCount: board.members?.length || 1,
    };
  },
});
