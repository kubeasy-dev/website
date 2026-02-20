import { createDocument } from "zod-openapi";
import {
  challengeResetResponseSchema,
  challengeResponseSchema,
  challengeStartResponseSchema,
  challengeStatusResponseSchema,
  challengeSubmitFailureResponseSchema,
  challengeSubmitRequestSchema,
  challengeSubmitSuccessResponseSchema,
  cliDifficultiesResponseSchema,
  cliMetadataSchema,
  cliThemesResponseSchema,
  cliTypesResponseSchema,
  errorResponseSchema,
  slugParamSchema,
  trackSetupResponseSchema,
  userLoginResponseSchema,
  userResponseSchema,
} from "@/schemas/cli-api";

const bearerAuth = {
  type: "http" as const,
  scheme: "bearer",
  description: "API key obtained via `kubeasy login`",
};

const security = [{ BearerAuth: [] }];

const errorResponses = {
  "401": {
    description: "Unauthorized",
    content: { "application/json": { schema: errorResponseSchema } },
  },
  "500": {
    description: "Internal server error",
    content: { "application/json": { schema: errorResponseSchema } },
  },
};

const notFoundResponse = {
  "404": {
    description: "Challenge not found",
    content: { "application/json": { schema: errorResponseSchema } },
  },
};

const badRequestResponse = {
  "400": {
    description: "Bad request",
    content: { "application/json": { schema: errorResponseSchema } },
  },
};

export function generateOpenApiDocument() {
  return createDocument({
    openapi: "3.0.3",
    info: {
      title: "Kubeasy CLI API",
      version: "1.0.0",
      description:
        "API consumed by the Kubeasy CLI (`kubeasy-cli`) and challenge sync scripts.",
    },
    servers: [
      { url: "https://kubeasy.dev", description: "Production" },
      { url: "http://localhost:3000", description: "Development" },
    ],
    components: {
      securitySchemes: { BearerAuth: bearerAuth },
    },
    paths: {
      // ---- User ----
      "/api/cli/user": {
        get: {
          operationId: "getUser",
          summary: "Get current user (deprecated)",
          deprecated: true,
          tags: ["User"],
          security,
          responses: {
            "200": {
              description: "User profile",
              content: {
                "application/json": { schema: userResponseSchema },
              },
            },
            ...errorResponses,
          },
        },
        post: {
          operationId: "loginUser",
          summary: "Login user and track CLI metadata",
          tags: ["User"],
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: cliMetadataSchema },
            },
          },
          responses: {
            "200": {
              description: "User profile with first-login flag",
              content: {
                "application/json": { schema: userLoginResponseSchema },
              },
            },
            ...badRequestResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Challenge details ----
      "/api/cli/challenge/{slug}": {
        get: {
          operationId: "getChallenge",
          summary: "Get challenge details",
          tags: ["Challenge"],
          security,
          requestParams: { path: slugParamSchema },
          responses: {
            "200": {
              description: "Challenge details",
              content: {
                "application/json": { schema: challengeResponseSchema },
              },
            },
            ...notFoundResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Challenge status ----
      "/api/cli/challenge/{slug}/status": {
        get: {
          operationId: "getChallengeStatus",
          summary: "Get challenge progress status",
          tags: ["Challenge"],
          security,
          requestParams: { path: slugParamSchema },
          responses: {
            "200": {
              description: "Challenge status",
              content: {
                "application/json": { schema: challengeStatusResponseSchema },
              },
            },
            ...notFoundResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Challenge start ----
      "/api/cli/challenge/{slug}/start": {
        post: {
          operationId: "startChallenge",
          summary: "Start a challenge",
          tags: ["Challenge"],
          security,
          requestParams: { path: slugParamSchema },
          responses: {
            "200": {
              description: "Challenge started",
              content: {
                "application/json": { schema: challengeStartResponseSchema },
              },
            },
            ...notFoundResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Challenge submit ----
      "/api/cli/challenge/{slug}/submit": {
        post: {
          operationId: "submitChallenge",
          summary: "Submit challenge validation results",
          tags: ["Challenge"],
          security,
          requestParams: { path: slugParamSchema },
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: challengeSubmitRequestSchema },
            },
          },
          responses: {
            "200": {
              description: "Submission accepted, all validations passed",
              content: {
                "application/json": {
                  schema: challengeSubmitSuccessResponseSchema,
                },
              },
            },
            "422": {
              description: "Validation failed (some objectives did not pass)",
              content: {
                "application/json": {
                  schema: challengeSubmitFailureResponseSchema,
                },
              },
            },
            ...badRequestResponse,
            ...notFoundResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Challenge reset ----
      "/api/cli/challenge/{slug}/reset": {
        post: {
          operationId: "resetChallenge",
          summary: "Reset challenge progress",
          tags: ["Challenge"],
          security,
          requestParams: { path: slugParamSchema },
          responses: {
            "200": {
              description: "Challenge reset",
              content: {
                "application/json": { schema: challengeResetResponseSchema },
              },
            },
            ...notFoundResponse,
            ...errorResponses,
          },
        },
      },

      // ---- Metadata (public) ----
      "/api/types": {
        get: {
          operationId: "getTypes",
          summary: "List available challenge types",
          tags: ["Metadata"],
          responses: {
            "200": {
              description: "List of challenge types",
              content: {
                "application/json": { schema: cliTypesResponseSchema },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },

      "/api/themes": {
        get: {
          operationId: "getThemes",
          summary: "List available challenge themes",
          tags: ["Metadata"],
          responses: {
            "200": {
              description: "List of challenge themes",
              content: {
                "application/json": { schema: cliThemesResponseSchema },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },

      "/api/difficulties": {
        get: {
          operationId: "getDifficulties",
          summary: "List available difficulty levels",
          tags: ["Metadata"],
          responses: {
            "200": {
              description: "List of difficulty levels",
              content: {
                "application/json": { schema: cliDifficultiesResponseSchema },
              },
            },
          },
        },
      },

      // ---- Track setup ----
      "/api/cli/track/setup": {
        post: {
          operationId: "trackSetup",
          summary: "Track CLI cluster setup",
          tags: ["Tracking"],
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: cliMetadataSchema },
            },
          },
          responses: {
            "200": {
              description: "Setup tracked",
              content: {
                "application/json": { schema: trackSetupResponseSchema },
              },
            },
            ...badRequestResponse,
            ...errorResponses,
          },
        },
      },
    },
  });
}
