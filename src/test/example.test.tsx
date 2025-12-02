/**
 * Example test file demonstrating React component testing pattern
 * 
 * To use this pattern:
 * 1. Create your component (e.g., MyComponent.tsx)
 * 2. Create a test file next to it (e.g., MyComponent.test.tsx)
 * 3. Follow the patterns shown below
 */
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example: Simple utility function test
describe('Example Test Suite', () => {
  test('basic assertion works', () => {
    expect(1 + 1).toBe(2);
  });

  test('can render a simple element', () => {
    render(<button>Click me</button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('can handle user interactions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <button onClick={handleClick}>Click me</button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

