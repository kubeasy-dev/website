import { logs } from "@opentelemetry/api-logs";
import type { Instrumentation } from "next";
import { getPostHogClient } from "@/lib/analytics-server";
import { loggerProvider } from "@/lib/logger";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && loggerProvider) {
    logs.setGlobalLoggerProvider(loggerProvider);
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.captureException(error, undefined, {
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routerKind: context.routerKind,
    });
    await client.flush();
  } catch {
    // Silently fail - error tracking should never break the app
  }
};
