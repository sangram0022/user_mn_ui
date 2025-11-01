/**
 * React 19: useOptimistic for instant UI updates
 * 
 * Form submission with optimistic updates example
 * Shows how to use React 19's useOptimistic hook
 */

import { useOptimistic, useState, useActionState } from 'react';
import { Button, Input } from '../../components';

type FormState = {
  error?: string;
  success?: boolean;
};

type Comment = {
  id: string;
  text: string;
  author: string;
  isPending?: boolean;
};

export function OptimisticFormExample() {
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', text: 'Great post!', author: 'John' },
    { id: '2', text: 'Very helpful', author: 'Jane' },
  ]);

  // React 19: useOptimistic for instant UI updates
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, { ...newComment, isPending: true }]
  );

  // React 19: useActionState for form handling
  async function submitComment(_prevState: FormState, formData: FormData): Promise<FormState> {
    const text = formData.get('comment') as string;
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: 'Current User',
    };

    // Optimistic update
    addOptimisticComment(newComment);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Add to real state
      setComments((prev) => [...prev, newComment]);
      return { success: true };
    } catch (error) {
      return { error: 'Failed to post comment' };
    }
  }

  const [state, formAction, isPending] = useActionState(submitComment, {});

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Comments (Optimistic Updates)</h2>

      {/* Comments List */}
      <div className="space-y-3 mb-6">
        {optimisticComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-4 rounded-lg border ${
              comment.isPending
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : 'bg-white border-gray-300'
            }`}
          >
            <p className="text-sm font-semibold">{comment.author}</p>
            <p className="text-gray-700">{comment.text}</p>
            {comment.isPending && (
              <span className="text-xs text-gray-500 italic">Posting...</span>
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <Input
          name="comment"
          placeholder="Add a comment..."
          disabled={isPending}
          required
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
}

/**
 * Key React 19 Features Demonstrated:
 * 
 * 1. useOptimistic: Instant UI feedback before server confirms
 * 2. useActionState: Modern form handling with pending states
 * 3. action prop: Use action= instead of onSubmit for forms
 * 4. Automatic pending states: isPending from useActionState
 * 5. No useCallback needed: React Compiler optimizes automatically
 */
