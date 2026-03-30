import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Button } from './Button';

describe('Card', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  it('renders card with children', () => {
    render(
      <Card data-testid="card">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Card data-testid="card">Default Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
  });

  it('renders with elevated variant', () => {
    render(<Card data-testid="card" variant="elevated">Elevated Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-lg');
  });

  it('renders with outlined variant', () => {
    render(<Card data-testid="card" variant="outlined">Outlined Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-2');
  });

  it('renders with interactive variant', () => {
    render(
      <Card data-testid="card" isInteractive onClick={() => {}}>
        Interactive Card
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-md');
  });

  // ============================================
  // Padding Variant Tests
  // ============================================

  it('renders with no padding', () => {
    render(<Card data-testid="card" padding="none">No Padding</Card>);
    const card = screen.getByTestId('card');
    expect(card).not.toHaveClass('p-3');
    expect(card).not.toHaveClass('p-5');
    expect(card).not.toHaveClass('p-6');
  });

  it('renders with small padding', () => {
    render(<Card data-testid="card" padding="sm">Small Padding</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-3');
  });

  it('renders with medium padding', () => {
    render(<Card data-testid="card" padding="md">Medium Padding</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-5');
  });

  it('renders with large padding', () => {
    render(<Card data-testid="card" padding="lg">Large Padding</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6');
  });

  // ============================================
  // Interactive State Tests
  // ============================================

  it('handles click events on interactive card', () => {
    const handleClick = jest.fn();
    render(
      <Card isInteractive onClick={handleClick}>
        Click me
      </Card>
    );

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies hover styles when isInteractive is true', () => {
    render(
      <Card data-testid="card" isInteractive onClick={() => {}}>
        Interactive
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('hover:border-primary-300');
  });

  it('applies focus styles for accessibility', () => {
    render(
      <Card data-testid="card" isInteractive onClick={() => {}}>
        Focusable
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('focus:outline-none');
    expect(card).toHaveClass('focus:ring-2');
    expect(card).toHaveClass('focus:ring-primary-500');
  });

  // ============================================
  // CardHeader Tests
  // ============================================

  it('renders card header with title', () => {
    render(
      <Card>
        <CardHeader title="Card Title" />
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders card header with subtitle', () => {
    render(
      <Card>
        <CardHeader title="Title" subtitle="Card subtitle" />
      </Card>
    );
    expect(screen.getByText('Card subtitle')).toBeInTheDocument();
  });

  it('renders card header with action', () => {
    render(
      <Card>
        <CardHeader
          title="With Action"
          action={<button>Edit</button>}
        />
      </Card>
    );
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('renders card header with children', () => {
    render(
      <Card>
        <CardHeader>
          <span data-testid="custom-header">Custom Header</span>
        </CardHeader>
      </Card>
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  // ============================================
  // CardBody Tests
  // ============================================

  it('renders card body with children', () => {
    render(
      <Card>
        <CardBody>Body Content</CardBody>
      </Card>
    );
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('renders card body without padding when noPadding is true', () => {
    render(
      <Card>
        <CardBody data-testid="card-body" noPadding>No Padding Body</CardBody>
      </Card>
    );
    const body = screen.getByTestId('card-body');
    expect(body).not.toHaveClass('px-1');
  });

  // ============================================
  // CardFooter Tests
  // ============================================

  it('renders card footer with children', () => {
    render(
      <Card>
        <CardFooter>Footer Content</CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders card footer with left alignment', () => {
    render(
      <Card>
        <CardFooter data-testid="footer" align="left">Aligned Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-start');
  });

  it('renders card footer with center alignment', () => {
    render(
      <Card>
        <CardFooter data-testid="footer" align="center">Centered Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-center');
  });

  it('renders card footer with right alignment', () => {
    render(
      <Card>
        <CardFooter data-testid="footer" align="right">Right Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-end');
  });

  it('renders card footer with between alignment', () => {
    render(
      <Card>
        <CardFooter data-testid="footer" align="between">Between Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-between');
  });

  // ============================================
  // Composite Card Tests
  // ============================================

  it('renders complete card with all subcomponents', () => {
    render(
      <Card data-testid="card" variant="elevated" padding="lg">
        <CardHeader
          title="Complete Card"
          subtitle="A card with all parts"
          action={<button>Action</button>}
        />
        <CardBody>
          <p>Main content goes here</p>
        </CardBody>
        <CardFooter>
          <button>Cancel</button>
          <button>Submit</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('A card with all parts')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  // ============================================
  // Custom ClassName Tests
  // ============================================

  it('applies custom className to card', () => {
    render(<Card data-testid="card" className="custom-card-class">Custom</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card-class');
  });

  it('applies custom className to card header', () => {
    render(
      <Card>
        <CardHeader title="Title" className="custom-header-class" />
      </Card>
    );
    const title = screen.getByText('Title');
    expect(title.closest('.custom-header-class')).toBeInTheDocument();
  });

  it('applies custom className to card body', () => {
    render(
      <Card>
        <CardBody className="custom-body-class">Body</CardBody>
      </Card>
    );
    const body = screen.getByText('Body');
    expect(body).toHaveClass('custom-body-class');
  });

  it('applies custom className to card footer', () => {
    render(
      <Card>
        <CardFooter className="custom-footer-class">Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-footer-class');
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  it('renders as a div element', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').tagName).toBe('DIV');
  });

  it('renders interactive card as div with click handler', () => {
    render(
      <Card isInteractive onClick={() => {}}>
        Clickable
      </Card>
    );
    expect(screen.getByText('Clickable').tagName).toBe('DIV');
  });
});
