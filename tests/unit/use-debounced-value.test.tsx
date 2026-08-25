// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from '@/shared/lib/use-debounced-value';

describe('useDebouncedValue', () => {
  it('commits the latest value after 300 ms', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: '' } });

    rerender({ value: 'п' });
    rerender({ value: 'план' });
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('план');
    vi.useRealTimers();
  });
});
