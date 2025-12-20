import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new conversation
export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const id = await ctx.db.insert("conversations", {
      userId: identity.tokenIdentifier,
      title: args.title || "New Chat",
      model: args.model,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });

    return id;
  },
});

// Get all conversations for the current user
export const getConversations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_updatedAt", (q) => 
        q.eq("userId", identity.tokenIdentifier)
      )
      .order("desc")
      .take(args.limit || 50);

    // Get the last message for each conversation to show preview
    const conversationsWithPreview = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId_createdAt", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();

        return {
          ...conv,
          lastMessage: lastMessage?.content.slice(0, 100) || "",
          messageCount: await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
            .collect()
            .then((msgs) => msgs.length),
        };
      })
    );

    return conversationsWithPreview;
  },
});

// Get a single conversation with all messages
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return null;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return {
      ...conversation,
      messages,
    };
  },
});

// Add a message to a conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();

    // Add the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      model: args.model,
      createdAt: now,
    });

    // Update conversation's updatedAt timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
    });

    // Auto-generate title from first user message if title is "New Chat"
    if (conversation.title === "New Chat" && args.role === "user") {
      const newTitle = args.content.slice(0, 50) + (args.content.length > 50 ? "..." : "");
      await ctx.db.patch(args.conversationId, {
        title: newTitle,
      });
    }

    return messageId;
  },
});

// Update a message (for streaming updates)
export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership through conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

// Update conversation title
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// Archive a conversation (soft delete)
export const archiveConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

// Delete a conversation permanently
export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    // Delete all messages first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Then delete the conversation
    await ctx.db.delete(args.conversationId);
  },
});

// Update the model used for a conversation
export const updateConversationModel = mutation({
  args: {
    conversationId: v.id("conversations"),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, {
      model: args.model,
      updatedAt: Date.now(),
    });
  },
});
