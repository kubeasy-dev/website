import { Resend } from "resend";
import { env } from "@/env";
import { captureServerException } from "@/lib/analytics-server";
import { EMAIL_TEMPLATES } from "./email/templates";

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
  try {
    const contact = await resend.contacts.create({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
    });

    if (!contact.data?.id) {
      throw new Error("Failed to create contact in Resend");
    }

    return { contactId: contact.data.id };
  } catch (error) {
    await captureServerException(error, params.userId, {
      operation: "resend.createContact",
    });
    throw error;
  }
}

/**
 * Update contact topic subscriptions
 */
export async function updateContactTopics(params: {
  contactIdOrEmail: string;
  topics: Array<{ id: string; subscription: "opt_in" | "opt_out" }>;
}): Promise<void> {
  try {
    // Determine if we're using ID or email
    const isEmail = params.contactIdOrEmail.includes("@");
    const updateParams = isEmail
      ? { email: params.contactIdOrEmail, topics: params.topics }
      : { id: params.contactIdOrEmail, topics: params.topics };

    await resend.contacts.topics.update(updateParams);
  } catch (error) {
    await captureServerException(error, undefined, {
      operation: "resend.updateContactTopics",
      isEmail: params.contactIdOrEmail.includes("@"),
    });
    throw error;
  }
}

/**
 * Get contact's topic subscriptions from Resend
 */
export async function getContactSubscriptions(
  contactId: string,
): Promise<Array<{ topicId: string; subscribed: boolean }>> {
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

    return subscriptions;
  } catch (error) {
    await captureServerException(error, undefined, {
      operation: "resend.getContactSubscriptions",
      contactId,
    });
    throw error;
  }
}

/**
 * Send an email using a Resend template
 */
export async function sendTemplateEmail(params: {
  to: string;
  templateId: string;
  data: Record<string, string>;
  userId?: string;
}): Promise<{ emailId: string }> {
  try {
    const response = await resend.emails.send({
      from: "Kubeasy <noreply@kubeasy.dev>",
      to: params.to,
      subject: "", // Subject is defined in the template
      react: undefined,
      html: undefined,
      // @ts-expect-error - Resend SDK types don't include template yet
      template_id: params.templateId,
      template_data: params.data,
    });

    if (!response.data?.id) {
      throw new Error("Failed to send email via Resend");
    }

    return { emailId: response.data.id };
  } catch (error) {
    await captureServerException(error, params.userId, {
      operation: "resend.sendTemplateEmail",
      templateId: params.templateId,
    });
    throw error;
  }
}

/**
 * Send onboarding CLI reminder email (Day 1)
 * Sent to users who signed up but haven't installed/configured the CLI
 */
export async function sendOnboardingCliReminderEmail(params: {
  to: string;
  firstName: string;
  userId: string;
}): Promise<{ emailId: string }> {
  return sendTemplateEmail({
    to: params.to,
    templateId: EMAIL_TEMPLATES.onboardingCliReminder,
    data: {
      firstName: params.firstName,
      dashboardUrl: "https://kubeasy.dev/dashboard",
    },
    userId: params.userId,
  });
}

/**
 * Send onboarding challenge reminder email (Day 3)
 * Sent to users who have CLI setup but haven't started a challenge
 */
export async function sendOnboardingChallengeReminderEmail(params: {
  to: string;
  firstName: string;
  userId: string;
}): Promise<{ emailId: string }> {
  return sendTemplateEmail({
    to: params.to,
    templateId: EMAIL_TEMPLATES.onboardingChallengeReminder,
    data: {
      firstName: params.firstName,
      challengeUrl: "https://kubeasy.dev/challenges/pod-evicted",
    },
    userId: params.userId,
  });
}

/**
 * Send onboarding completion reminder email (Day 7)
 * Sent to users who started but haven't completed their first challenge
 */
export async function sendOnboardingCompletionReminderEmail(params: {
  to: string;
  firstName: string;
  userId: string;
}): Promise<{ emailId: string }> {
  return sendTemplateEmail({
    to: params.to,
    templateId: EMAIL_TEMPLATES.onboardingCompletionReminder,
    data: {
      firstName: params.firstName,
      challengeUrl: "https://kubeasy.dev/challenges/pod-evicted",
    },
    userId: params.userId,
  });
}
