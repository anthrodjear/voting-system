# IEBC UI Component Library

A comprehensive, accessible, and themeable UI component library for the IEBC Blockchain Voting System. Built with React, TypeScript, and Tailwind CSS.

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Quick Start

Wrap your application with the ToastProvider for toast notifications:

```tsx
// app/layout.tsx or _app.tsx
import { ToastProvider } from '@/components/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

## Components

### Button

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading</Button>
<Button disabled>Disabled</Button>

// With icons
<Button leftIcon={<Icon />}>With Icon</Button>
<Button fullWidth>Full Width</Button>
```

### Input

```tsx
import { Input } from '@/components/ui';

<Input 
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email address"
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
  showPasswordToggle
/>
```

### Select

```tsx
import { Select } from '@/components/ui';

<Select
  label="Country"
  placeholder="Select a country"
  options={[
    { value: 'ke', label: 'Kenya' },
    { value: 'tz', label: 'Tanzania' },
  ]}
  onChange={(value) => console.log(value)}
/>
```

### Card

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader 
    title="Profile" 
    subtitle="Manage your account"
    action={<Button size="sm">Edit</Button>}
  />
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Modal

```tsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={() => setIsOpen(false)}>Confirm</Button>
    </>
  }
>
  Are you sure you want to proceed?
</Modal>
```

### Badge

```tsx
import { Badge } from '@/components/ui';

// Variants
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Default</Badge>

// With dot
<Badge showDot>New</Badge>
<Badge showDot pulse>Live</Badge>
```

### Alert

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success!">
  Your vote has been recorded.
</Alert>

<Alert variant="warning" dismissible>
  Please verify your identity.
</Alert>
```

### Progress

```tsx
import { Progress } from '@/components/ui';

<Progress value={75} label="Voter Turnout" showValue />
<Progress value={50} variant="success" animated />
```

### StepIndicator

```tsx
import { StepIndicator } from '@/components/ui';

const steps = [
  { id: 1, title: 'Verify Identity' },
  { id: 2, title: 'Cast Vote' },
  { id: 3, title: 'Confirmation' },
];

<StepIndicator 
  steps={steps} 
  currentStep={1} 
  showDescriptions
/>
```

### DataTable

```tsx
import { DataTable } from '@/components/ui';

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'county', header: 'County' },
  { 
    key: 'status', 
    header: 'Status',
    render: (item) => <Badge>{item.status}</Badge>
  },
];

<DataTable 
  columns={columns} 
  data={voters} 
  keyField="id"
  paginated
  selectable
  onSelectionChange={(selected) => console.log(selected)}
  actions={(item) => <Button size="sm">View</Button>}
/>
```

### StatCard

```tsx
import { StatCard } from '@/components/ui';

<StatCard
  title="Total Votes"
  value="450,234"
  change={8.3}
  trend="up"
  changeLabel="vs yesterday"
  icon={<VoteIcon />}
  variant="success"
/>
```

### Toast

```tsx
import { useToast } from '@/components/ui';

const { addToast } = useToast();

// Show toast
addToast({ 
  type: 'success', 
  title: 'Success!', 
  message: 'Your vote has been recorded.' 
});

addToast({ type: 'error', message: 'Something went wrong' });
addToast({ type: 'warning', message: 'Please verify your identity' });
addToast({ type: 'info', message: 'Election ends in 2 hours' });
```

### Skeleton

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui';

// Basic
<Skeleton width={200} height={20} />

// Variants
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" width="100%" height={100} />
<Skeleton lines={3} />

// Pre-built
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

### Avatar

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

// Basic
<Avatar alt="John Doe" />
<Avatar src="/image.jpg" alt="John Doe" />

// With status
<Avatar alt="John Doe" status="online" />

// Avatar group
<AvatarGroup max={4}>
  <Avatar alt="User 1" />
  <Avatar alt="User 2" />
  <Avatar alt="User 3" />
</AvatarGroup>
```

### Dropdown

```tsx
import { Dropdown, DropdownSearch } from '@/components/ui';

const items = [
  { id: 'profile', label: 'Profile', icon: <UserIcon />, onClick: () => {} },
  { id: 'settings', label: 'Settings', icon: <CogIcon />, onClick: () => {} },
  { id: 'divider' },
  { id: 'logout', label: 'Logout', icon: <LogoutIcon />, onClick: () => {}, variant: 'danger' },
];

<Dropdown
  trigger={<Button>Menu</Button>}
  items={items}
  dividers={['divider']}
  align="right"
/>

// With search
<DropdownSearch
  trigger={<Button>Search</Button>}
  items={items}
  searchPlaceholder="Search items..."
/>
```

## Dark Mode

All components support dark mode. Add the `dark` class to your HTML element:

```tsx
// For Next.js
<html className="dark">
  <body>
    {/* Your app */}
  </body>
</html>
```

Or use Tailwind's dark mode:

```tsx
<div className="dark:bg-neutral-900 dark:text-white">
  <Button className="dark:bg-primary-600">Dark Button</Button>
</div>
```

## Accessibility

All components follow WCAG 2.1 guidelines:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## Design Tokens

Components use the following design tokens from `tailwind.config.ts`:

### Colors
- **Primary**: Admin/dashboard theme (blue)
- **Success**: Positive states (green)
- **Warning**: Caution states (amber)
- **Error**: Error states (red)
- **Info**: Informational states (cyan)
- **Neutral**: Default states (gray)

### Role Colors
- **super-admin**: Purple theme
- **admin**: Blue theme
- **ro**: Green theme (Returning Officer)
- **voter**: Orange theme

### Sizes
- `xs`: 12px
- `sm`: 14px
- `md`: 16px
- `lg`: 18px
- `xl`: 20px

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import { 
  ButtonProps, 
  InputProps, 
  SelectProps,
  ModalProps,
  BadgeProps,
  DataTableProps,
  TableColumn
} from '@/components/ui';
```

## License

MIT License - IEBC Blockchain Voting System
