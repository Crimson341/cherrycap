/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as appointments from "../appointments.js";
import type * as blog from "../blog.js";
import type * as blogPosts from "../blogPosts.js";
import type * as businessContext from "../businessContext.js";
import type * as chat from "../chat.js";
import type * as credits from "../credits.js";
import type * as http from "../http.js";
import type * as kanban from "../kanban.js";
import type * as newsletter from "../newsletter.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as seed from "../seed.js";
import type * as sites from "../sites.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tracking from "../tracking.js";
import type * as userProfiles from "../userProfiles.js";
import type * as userStats from "../userStats.js";
import type * as usernames from "../usernames.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  appointments: typeof appointments;
  blog: typeof blog;
  blogPosts: typeof blogPosts;
  businessContext: typeof businessContext;
  chat: typeof chat;
  credits: typeof credits;
  http: typeof http;
  kanban: typeof kanban;
  newsletter: typeof newsletter;
  notifications: typeof notifications;
  organizations: typeof organizations;
  seed: typeof seed;
  sites: typeof sites;
  subscriptions: typeof subscriptions;
  tracking: typeof tracking;
  userProfiles: typeof userProfiles;
  userStats: typeof userStats;
  usernames: typeof usernames;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
