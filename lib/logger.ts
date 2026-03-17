/**
 * Server-side structured logging with PostHog via OpenTelemetry
 *
 * Sends logs to PostHog on Vercel deployments (preview + production).
 * Falls back to console.* in local development.
 */
import "server-only";

import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";

const isVercel = !!process.env.VERCEL;
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * OpenTelemetry LoggerProvider — only created on Vercel deployments
 * Exported for use in instrumentation.ts (register + forceFlush)
 */
export const loggerProvider =
  isVercel && posthogKey
    ? new LoggerProvider({
        resource: resourceFromAttributes({
          "service.name": "kubeasy",
          "deployment.environment": process.env.VERCEL_ENV ?? "unknown",
        }),
        processors: [
          new BatchLogRecordProcessor(
            new OTLPLogExporter({
              url: "https://eu.i.posthog.com/i/v1/logs",
              headers: {
                Authorization: `Bearer ${posthogKey}`,
                "Content-Type": "application/json",
              },
            }),
          ),
        ],
      })
    : null;

const otelLogger = loggerProvider?.getLogger("kubeasy");

type LogAttributes = Record<string, string | number | boolean | undefined>;

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attributes?: LogAttributes,
) {
  if (!otelLogger) {
    // Fallback to console in local dev
    const consoleFn =
      severityNumber >= SeverityNumber.ERROR
        ? console.error
        : severityNumber >= SeverityNumber.WARN
          ? console.warn
          : severityNumber >= SeverityNumber.INFO
            ? console.info
            : console.debug;
    consoleFn(message, attributes ?? "");
    return;
  }

  otelLogger.emit({
    body: message,
    severityNumber,
    severityText,
    attributes: attributes as Record<string, string | number | boolean>,
  });
}

export const logger = {
  debug: (message: string, attributes?: LogAttributes) =>
    emit(SeverityNumber.DEBUG, "DEBUG", message, attributes),
  info: (message: string, attributes?: LogAttributes) =>
    emit(SeverityNumber.INFO, "INFO", message, attributes),
  warn: (message: string, attributes?: LogAttributes) =>
    emit(SeverityNumber.WARN, "WARN", message, attributes),
  error: (message: string, attributes?: LogAttributes) =>
    emit(SeverityNumber.ERROR, "ERROR", message, attributes),
};
