import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error state', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    // Use better selector - find the input element
    const input = document.querySelector('input');
    expect(input).toHaveClass('border-error');
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    const input = document.querySelector('input');
    expect(input).toBeDisabled();
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('renders with left and right icons', () => {
    const { rerender } = render(
      <Input leftIcon={<span data-testid="left-icon">@</span>} />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();

    rerender(
      <Input rightIcon={<span data-testid="right-icon">✓</span>} />
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(<Input type="text" />);
    const textInput = document.querySelector('input');
    expect(textInput).toHaveAttribute('type', 'text');

    rerender(<Input type="password" />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'email');

    rerender(<Input type="number" />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'number');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(document.querySelector('input')).toHaveClass('custom-class');
  });

  it('connects label with input via htmlFor', () => {
    render(<Input label="Username" id="username" />);
    const label = screen.getByText('Username');
    const input = document.querySelector('input');
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });

  // ============================================
  // Password Toggle Tests
  // ============================================

  it('shows password toggle button for password type with showPasswordToggle', () => {
    render(<Input type="password" showPasswordToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<Input type="password" showPasswordToggle />);
    
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
    
    // Click show password button
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    
    // Click hide password button
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('does not show password toggle without showPasswordToggle prop', () => {
    render(<Input type="password" />);
    expect(screen.queryByRole('button', { name: /password/i })).not.toBeInTheDocument();
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  it('has proper aria-invalid attribute when error is present', () => {
    render(<Input error="Invalid input" />);
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not have aria-invalid when no error', () => {
    render(<Input />);
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('associates error message with input via aria-describedby', () => {
    render(<Input error="This is an error" label="Email" />);
    
    const input = document.querySelector('input');
    const errorMessage = screen.getByText('This is an error');
    
    expect(input).toHaveAttribute('aria-describedby', expect.stringMatching(/input-/));
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('associates helper text with input via aria-describedby', () => {
    render(<Input helperText="Helper text" label="Email" />);
    
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', expect.stringMatching(/input-/));
  });

  it('renders required indicator on label', () => {
    render(<Input label="Email" required />);
    
    const label = screen.getByText(/email/i);
    expect(label.parentElement).toHaveTextContent(/\*/);
  });

  it('shows error border color', () => {
    render(<Input error="Error" />);
    const input = document.querySelector('input');
    expect(input).toHaveClass('border-error');
  });

  // ============================================
  // Additional Edge Cases
  // ============================================

  it('renders with left icon and password toggle (rightIcon hidden when password toggle shown)', () => {
    render(
      <Input 
        type="password" 
        showPasswordToggle 
        leftIcon={<span data-testid="left-icon">@</span>}
        rightIcon={<span data-testid="right-icon">✓</span>}
      />
    );
    
    // leftIcon always shows
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    // password toggle takes priority over rightIcon
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(
      <Input 
        error="Error message" 
        helperText="Helper text" 
      />
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('handles id generation when not provided', () => {
    render(<Input label="Email" />);
    
    const input = document.querySelector('input');
    const label = screen.getByText(/email/i);
    
    // Should have generated id and matching htmlFor
    expect(input?.id).toMatch(/^input-/);
    expect(label).toHaveAttribute('for', input?.id);
  });
});
