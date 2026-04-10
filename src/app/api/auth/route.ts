import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

type CookieConfig = {
  maxAge: number | null;
};

type AuthAction = "auth:signIn" | "auth:signOut";

type AuthRequestPayload = {
  action: AuthAction;
  args: Record<string, unknown>;
  redirectTo?: string;
  responseType: "json" | "redirect";
};

function isLocalHost(host: string | null) {
  return /(localhost|127\.0\.0\.1):\d+/.test(host ?? "");
}

function isCorsRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  return (
    originUrl.host !== request.headers.get("host") ||
    originUrl.protocol !== requestUrl.protocol
  );
}

function getCookieNames(host: string | null) {
  const prefix = isLocalHost(host) ? "" : "__Host-";
  return {
    token: `${prefix}__convexAuthJWT`,
    refreshToken: `${prefix}__convexAuthRefreshToken`,
    verifier: `${prefix}__convexAuthOAuthVerifier`,
  };
}

function setCookie(
  response: NextResponse,
  name: string,
  value: string | null,
  cookieConfig: CookieConfig,
  host: string | null,
) {
  const secure = !isLocalHost(host);

  if (value === null) {
    response.cookies.set(name, "", {
      expires: 0,
      httpOnly: true,
      maxAge: undefined,
      path: "/",
      sameSite: "lax",
      secure,
    });
    return;
  }

  response.cookies.set(name, value, {
    httpOnly: true,
    maxAge: cookieConfig.maxAge ?? undefined,
    path: "/",
    sameSite: "lax",
    secure,
  });
}

function setAuthCookies(
  response: NextResponse,
  tokens: { token: string; refreshToken: string } | null,
  cookieConfig: CookieConfig,
  host: string | null,
) {
  const names = getCookieNames(host);

  setCookie(response, names.token, tokens?.token ?? null, cookieConfig, host);
  setCookie(
    response,
    names.refreshToken,
    tokens?.refreshToken ?? null,
    cookieConfig,
    host,
  );
  setCookie(response, names.verifier, null, cookieConfig, host);
}

function json(body: unknown, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : undefined;
}

function normalizeRedirectPath(
  request: NextRequest,
  value: string | undefined,
  fallback: string,
) {
  if (!value) {
    return fallback;
  }

  try {
    const requestUrl = new URL(request.url);
    const redirectUrl = new URL(value, requestUrl);

    if (redirectUrl.origin !== requestUrl.origin) {
      return fallback;
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return fallback;
  }
}

function redirect(request: NextRequest, location: string) {
  return NextResponse.redirect(new URL(location, request.url), { status: 303 });
}

function redirectToSignIn(
  request: NextRequest,
  error: string | undefined,
) {
  const url = new URL("/signin", request.url);

  if (error) {
    url.searchParams.set("error", error);
  }

  return NextResponse.redirect(url, { status: 303 });
}

function getConvexOptions() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    return { url: process.env.NEXT_PUBLIC_CONVEX_URL };
  }

  return {};
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed";
}

function getPublicErrorMessage(error: unknown) {
  const message = getErrorMessage(error);

  if (message.includes("Invalid credentials")) {
    return "Invalid credentials";
  }

  if (message.includes("Email and password are required")) {
    return "Email and password are required";
  }

  if (message.includes("Dashboard owner password is not configured")) {
    return "Dashboard owner password is not configured";
  }

  return "Could not complete authentication.";
}

function isInvalidAuthHeaderError(error: unknown) {
  const message = getErrorMessage(error);

  if (message.includes("InvalidAuthHeader")) {
    return true;
  }

  try {
    const parsed = JSON.parse(message) as { code?: unknown; message?: unknown };
    return (
      parsed.code === "InvalidAuthHeader" ||
      (typeof parsed.message === "string" &&
        parsed.message.includes("Could not decode token"))
    );
  } catch {
    return message.includes("Could not decode token");
  }
}

async function fetchSignInAction(
  args: Record<string, unknown>,
  token: string | undefined,
) {
  return fetchAction(
    "auth:signIn" as unknown as Parameters<typeof fetchAction>[0],
    args as Parameters<typeof fetchAction>[1],
    {
      ...getConvexOptions(),
      ...(token ? { token } : {}),
    },
  );
}

async function parseRequestPayload(
  request: NextRequest,
): Promise<AuthRequestPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as {
      action?: unknown;
      args?: Record<string, unknown>;
    };

    return {
      action: payload.action as AuthAction,
      args: payload.args ?? {},
      responseType: "json",
    };
  }

  const formData = await request.formData();
  const action = getStringValue(formData.get("action")) as AuthAction;
  const redirectTo = getStringValue(formData.get("redirectTo"));

  if (action === "auth:signIn") {
    const provider = getStringValue(formData.get("provider"));
    const refreshToken = getStringValue(formData.get("refreshToken"));
    const params = Object.fromEntries(
      [
        ["email", getStringValue(formData.get("email"))],
        ["password", getStringValue(formData.get("password"))],
        ["code", getStringValue(formData.get("code"))],
        ["redirectTo", redirectTo],
      ].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );

    return {
      action,
      args: {
        ...(provider ? { provider } : {}),
        ...(refreshToken ? { refreshToken } : {}),
        ...(Object.keys(params).length > 0 ? { params } : {}),
      },
      redirectTo,
      responseType: "redirect",
    };
  }

  return {
    action,
    args: {},
    redirectTo,
    responseType: "redirect",
  };
}

export async function POST(request: NextRequest) {
  const cookieConfig = { maxAge: null } satisfies CookieConfig;
  const host = request.headers.get("host");

  if (isCorsRequest(request)) {
    return new NextResponse("Invalid origin", { status: 403 });
  }

  const payload = await parseRequestPayload(request);
  const { action, args } = payload;

  if (action !== "auth:signIn" && action !== "auth:signOut") {
    return new NextResponse("Invalid action", { status: 400 });
  }

  let token: string | undefined;

  if (action === "auth:signIn" && args?.refreshToken !== undefined) {
    const refreshToken = request.cookies.get(
      getCookieNames(host).refreshToken,
    )?.value;

    if (!refreshToken) {
      if (payload.responseType === "redirect") {
        return redirectToSignIn(request, "Session expired");
      }

      return json({ tokens: null });
    }

    args.refreshToken = refreshToken;
  } else {
    token = request.cookies.get(getCookieNames(host).token)?.value;
  }

  if (action === "auth:signIn") {
    try {
      const signInArgs = args as {
        refreshToken?: unknown;
        params?: { code?: unknown };
      };
      const shouldAuthenticateRequest =
        signInArgs.refreshToken === undefined &&
        signInArgs.params?.code === undefined;

      let result: Awaited<ReturnType<typeof fetchSignInAction>>;

      try {
        result = await fetchSignInAction(
          args as Record<string, unknown>,
          shouldAuthenticateRequest ? token : undefined,
        );
      } catch (error) {
        // A stale or foreign JWT cookie should not block a fresh credentials login.
        if (
          shouldAuthenticateRequest &&
          token &&
          isInvalidAuthHeaderError(error)
        ) {
          result = await fetchSignInAction(args as Record<string, unknown>, undefined);
        } else {
          throw error;
        }
      }

      if (
        typeof result === "object" &&
        result !== null &&
        "redirect" in result &&
        typeof result.redirect === "string"
      ) {
        const response =
          payload.responseType === "redirect"
            ? redirect(request, result.redirect)
            : json({ redirect: result.redirect });

        if ("verifier" in result && typeof result.verifier === "string") {
          setCookie(
            response,
            getCookieNames(host).verifier,
            result.verifier,
            cookieConfig,
            host,
          );
        }
        return response;
      }

      if (
        typeof result === "object" &&
        result !== null &&
        "tokens" in result
      ) {
        const response =
          payload.responseType === "redirect"
            ? redirect(
                request,
                normalizeRedirectPath(
                  request,
                  payload.redirectTo,
                  "/dashboard",
                ),
              )
            : json({
                tokens:
                  result.tokens !== null
                    ? { token: result.tokens.token, refreshToken: "dummy" }
                    : null,
              });

        setAuthCookies(response, result.tokens, cookieConfig, host);
        return response;
      }

      return json(result);
    } catch (error) {
      const response =
        payload.responseType === "redirect"
          ? redirectToSignIn(request, getPublicErrorMessage(error))
          : json(
              {
                error: getErrorMessage(error),
              },
              400,
            );

      setAuthCookies(response, null, cookieConfig, host);
      return response;
    }
  }

  try {
    await fetchAction(
      action as unknown as Parameters<typeof fetchAction>[0],
      args as Parameters<typeof fetchAction>[1],
      {
        ...getConvexOptions(),
        token,
      },
    );
  } catch {}

  const response =
    payload.responseType === "redirect"
      ? redirect(
          request,
          normalizeRedirectPath(request, payload.redirectTo, "/signin"),
        )
      : json(null);

  setAuthCookies(response, null, cookieConfig, host);
  return response;
}
