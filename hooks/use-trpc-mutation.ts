import { useQueryClient } from "@tanstack/react-query";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";

/**
 * Enhanced tRPC mutation hook with automatic query invalidation
 *
 * This hook wraps tRPC mutations and provides automatic cache invalidation
 * for specified queries after successful mutations, eliminating the need for
 * manual router.refresh() or refetch() calls.
 *
 * @template TInput - The input type for the mutation
 * @template TOutput - The output type from the mutation
 * @template TError - The error type (defaults to Error)
 *
 * @param mutation - The tRPC mutation object (must have useMutation method)
 * @param options - Configuration options
 * @param options.invalidateQueries - Array of query keys to invalidate on success
 * @param options.onSuccess - Optional callback after successful mutation
 * @param options.onError - Optional error handler callback
 *
 * @example
 * // Basic usage with automatic invalidation
 * const updateName = useTRPCMutation(trpc.user.updateName, {
 *   invalidateQueries: [
 *     trpc.user.getCurrent.getQueryKey(),
 *   ],
 *   onSuccess: () => toast.success('Name updated!'),
 * })
 *
 * @example
 * // Multiple query invalidations
 * const submitChallenge = useTRPCMutation(trpc.userProgress.submitChallenge, {
 *   invalidateQueries: [
 *     trpc.userProgress.getStatus.getQueryKey({ slug }),
 *     trpc.userProgress.getCompletionPercentage.getQueryKey(),
 *     trpc.challenge.list.getQueryKey(),
 *   ],
 *   onSuccess: (data) => {
 *     toast.success(`Challenge completed! +${data.xpGained} XP`)
 *   },
 * })
 */
export function useTRPCMutation<
  TInput = unknown,
  TOutput = unknown,
  TError = Error,
>(
  mutation: {
    useMutation: (
      opts?: UseTRPCMutationOptions<TInput, TError, TOutput, unknown>,
    ) => any;
  },
  options?: {
    invalidateQueries?: unknown[][];
    onSuccess?: (data: TOutput) => void;
    onError?: (error: TError) => void;
  },
) {
  const queryClient = useQueryClient();

  return mutation.useMutation({
    onSuccess: async (data) => {
      // Invalidate specified queries to trigger refetch
      if (options?.invalidateQueries) {
        for (const queryKey of options.invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey });
        }
      }

      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
