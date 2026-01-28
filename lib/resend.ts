import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { env } from "@/env";

const { logger } = Sentry;

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);

/**
 * Create a contact in Resend
 * New contacts are automatically subscribed to topics with default_subscription: opt_in
 */
export async function createResendContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
}): Promise<{ contactId: string }> {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "Resend API - Create Contact",
    },
    async (span) => {
      span.setAttribute("userId", params.userId);

      try {
        const contact = await resend.contacts.create({
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
        });

        if (!contact.data?.id) {
          throw new Error("Failed to create contact in Resend");
        }

        logger.info("Resend contact created", {
          userId: params.userId,
          contactId: contact.data.id,
        });

        return { contactId: contact.data.id };
      } catch (error) {
        logger.error("Failed to create Resend contact", {
          userId: params.userId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "resend.createContact" },
          contexts: {
            resend: {
              userId: params.userId,
            },
          },
        });
        throw error;
      }
    },
  );
}

/**
 * Update contact topic subscriptions
 */
export async function updateContactTopics(params: {
  contactIdOrEmail: string;
  topics: Array<{ id: string; subscription: "opt_in" | "opt_out" }>;
}): Promise<void> {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "Resend API - Update Contact Topics",
    },
    async (span) => {
      span.setAttribute("contactIdOrEmail", params.contactIdOrEmail);
      span.setAttribute("topicsCount", params.topics.length);

      try {
        // Determine if we're using ID or email
        const isEmail = params.contactIdOrEmail.includes("@");
        const updateParams = isEmail
          ? { email: params.contactIdOrEmail, topics: params.topics }
          : { id: params.contactIdOrEmail, topics: params.topics };

        await resend.contacts.topics.update(updateParams);

        logger.info("Resend contact topics updated", {
          contactIdOrEmail: params.contactIdOrEmail,
          topics: params.topics,
        });
      } catch (error) {
        logger.error("Failed to update Resend contact topics", {
          contactIdOrEmail: params.contactIdOrEmail,
          topics: params.topics,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "resend.updateContactTopics" },
          contexts: {
            resend: {
              contactIdOrEmail: params.contactIdOrEmail,
            },
          },
        });
        throw error;
      }
    },
  );
}

/**
 * Get contact's topic subscriptions from Resend
 */
export async function getContactSubscriptions(
  contactId: string,
): Promise<Array<{ topicId: string; subscribed: boolean }>> {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "Resend API - Get Contact Subscriptions",
    },
    async (span) => {
      span.setAttribute("contactId", contactId);

      try {
        // Use the dedicated topics list endpoint to get topic subscriptions
        const response = await resend.contacts.topics.list({ id: contactId });

        // Response is { data: PaginatedData<ContactTopic[]> | null, error: ... }
        // PaginatedData = { object: 'list', data: ContactTopic[], has_more: boolean }
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error("Failed to get contact topics from Resend");
        }

        // Map topic subscriptions to our format
        // Each item has id (topic ID) and subscription ("opt_in" | "opt_out")
        const subscriptions: Array<{ topicId: string; subscribed: boolean }> =
          response.data.data.map((topic) => ({
            topicId: topic.id,
            subscribed: topic.subscription === "opt_in",
          }));

        logger.debug(
          logger.fmt`Fetched subscriptions for contact ${contactId}`,
          {
            subscriptionsCount: subscriptions.length,
          },
        );

        return subscriptions;
      } catch (error) {
        logger.error("Failed to get Resend contact subscriptions", {
          contactId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "resend.getContactSubscriptions" },
          contexts: {
            resend: {
              contactId,
            },
          },
        });
        throw error;
      }
    },
  );
}
