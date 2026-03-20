/**
 * Wraps a promise (or thenable, like Supabase's PostgrestBuilder) with a
 * timeout that properly cleans up the timer.
 * Prevents timer leaks from bare Promise.race + setTimeout patterns.
 */
export async function withTimeout<T>(
    thenable: PromiseLike<T>,
    ms: number,
    label = 'Operation'
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>
    const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    })
    try {
        return await Promise.race([Promise.resolve(thenable), timeout])
    } finally {
        clearTimeout(timeoutId!)
    }
}
