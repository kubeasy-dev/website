import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { env } from "@/env";

const { logger } = Sentry;

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);

/**
 * Create a contact in Resend and add to a specific audience
 */
export async function createResendContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
  audienceId: string;
  unsubscribed?: boolean;
}): Promise<{ contactId: string }> {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "Resend API - Create Contact",
    },
    async (span) => {
      span.setAttribute("audienceId", params.audienceId);
      span.setAttribute("userId", params.userId);
      span.setAttribute("unsubscribed", params.unsubscribed ?? false);

      try {
        // Create the contact
        const contact = await resend.contacts.create({
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          unsubscribed: params.unsubscribed ?? false,
          audienceId: params.audienceId,
        });

        if (!contact.data?.id) {
          throw new Error("Failed to create contact in Resend");
        }

        logger.info("Resend contact created", {
          userId: params.userId,
          contactId: contact.data.id,
          audienceId: params.audienceId,
          unsubscribed: params.unsubscribed ?? false,
        });

        return { contactId: contact.data.id };
      } catch (error) {
        logger.error("Failed to create Resend contact", {
          userId: params.userId,
          audienceId: params.audienceId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "resend.createContact" },
          contexts: {
            resend: {
              audienceId: params.audienceId,
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
 * Add a contact to an audience
 */
export async function addContactToAudience(params: {
  contactId: string;
  audienceId: string;
  unsubscribed?: boolean;
}): Promise<void> {
  try {
    await resend.contacts.update({
      id: params.contactId,
      audienceId: params.audienceId,
      unsubscribed: params.unsubscribed ?? false,
    });

    console.log(
      `[Resend] Contact ${params.contactId} added to audience ${params.audienceId}`,
    );
  } catch (error) {
    console.error(`[Resend] Failed to add contact to audience:`, error);
    throw error;
  }
}

/**
 * Update contact subscription status for an audience
 */
export async function updateContactSubscription(params: {
  contactId: string;
  audienceId: string;
  subscribed: boolean;
}): Promise<void> {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "Resend API - Update Subscription",
    },
    async (span) => {
      span.setAttribute("contactId", params.contactId);
      span.setAttribute("audienceId", params.audienceId);
      span.setAttribute("subscribed", params.subscribed);

      try {
        await resend.contacts.update({
          id: params.contactId,
          audienceId: params.audienceId,
          unsubscribed: !params.subscribed,
        });

        logger.info("Resend subscription updated", {
          contactId: params.contactId,
          audienceId: params.audienceId,
          subscribed: params.subscribed,
        });
      } catch (error) {
        logger.error("Failed to update Resend subscription", {
          contactId: params.contactId,
          audienceId: params.audienceId,
          subscribed: params.subscribed,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "resend.updateSubscription" },
          contexts: {
            resend: {
              contactId: params.contactId,
              audienceId: params.audienceId,
            },
          },
        });
        throw error;
      }
    },
  );
}

/**
 * Remove a contact from a specific audience in Resend
 */
export async function deleteResendContact(
  contactId: string,
  audienceId: string,
): Promise<void> {
  try {
    await resend.contacts.remove({
      id: contactId,
      audienceId: audienceId,
    });

    console.log(`[Resend] Contact ${contactId} deleted`);
  } catch (error) {
    console.error(`[Resend] Failed to delete contact:`, error);
    throw error;
  }
}
