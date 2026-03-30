import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders alert with title', () => {
    render(<Alert title="Success">Operation completed successfully</Alert>);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Alert variant="success" title="Success" />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-success-light');

    rerender(<Alert variant="error" title="Error" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-error-light');

    rerender(<Alert variant="warning" title="Warning" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-warning-light');

    rerender(<Alert variant="info" title="Info" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-info-light');
  });

  it('renders with icon when provided', () => {
    render(<Alert title="With Icon" icon={<svg data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('can be dismissible', () => {
    const handleDismiss = jest.fn();
    render(
      <Alert title="Dismissible" onDismiss={handleDismiss} dismissible />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<Alert title="Custom" className="custom-alert" />);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  it('renders without title', () => {
    render(<Alert>Just description</Alert>);
    expect(screen.getByText('Just description')).toBeInTheDocument();
  });
});
