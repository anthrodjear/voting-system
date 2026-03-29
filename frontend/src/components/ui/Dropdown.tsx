'use client';

import React, { useState, useRef, useEffect } from 'react';

// ============================================
// Types
// ============================================

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
  dividers?: string[];
}

// ============================================
// Width Configuration
// ============================================

const widthStyles = {
  auto: 'w-auto',
  sm: 'w-40',
  md: 'w-48',
  lg: 'w-56',
};

// ============================================
// Component
// ============================================

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  width = 'auto',
  dividers = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isOpen ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-dropdown mt-2
            ${widthStyles[width]}
            ${align === 'right' ? 'right-0' : 'left-0'}
            bg-white dark:bg-neutral-800
            rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700
            py-1 overflow-hidden
            animate-scale-in
          `}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  transition-colors duration-150
                  ${item.variant === 'danger'
                    ? 'text-error hover:bg-error-light dark:hover:bg-error/10'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                role="menuitem"
                disabled={item.disabled}
              >
                {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
              </button>

              {/* Divider */}
              {dividers.includes(item.id) && (
                <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

// ============================================
// Dropdown with Search
// ============================================

export interface DropdownSearchProps extends Omit<DropdownProps, 'items'> {
  items: DropdownItem[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  trigger,
  items,
  align = 'left',
  width = 'auto',
  dividers = [],
  searchPlaceholder = 'Search...',
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isOpen ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-dropdown mt-2
            ${widthStyles[width]}
            ${align === 'right' ? 'right-0' : 'left-0'}
            bg-white dark:bg-neutral-800
            rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700
            py-1 overflow-hidden
            animate-scale-in
          `}
          role="menu"
        >
          {/* Search Input */}
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 border-0 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Items */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                No results found
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-sm
                      transition-colors duration-150
                      ${item.variant === 'danger'
                        ? 'text-error hover:bg-error-light dark:hover:bg-error/10'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    role="menuitem"
                  >
                    {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>

                  {dividers.includes(item.id) && (
                    <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DropdownSearch.displayName = 'DropdownSearch';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Dropdown Component Usage:
 * 
 * // Basic usage
 * const items = [
 *   { id: '1', label: 'Profile', onClick: () => {} },
 *   { id: '2', label: 'Settings', onClick: () => {} },
 *   { id: '3', label: 'Logout', onClick: () => {}, variant: 'danger' },
 * ];
 * 
 * <Dropdown 
 *   trigger={<Button>Menu</Button>}
 *   items={items}
 * />
 * 
 * // With icons
 * <Dropdown
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { 
 *       id: 'edit', 
 *       label: 'Edit', 
 *       icon: <EditIcon />, 
 *       onClick: () => {} 
 *     },
 *     { 
 *       id: 'delete', 
 *       label: 'Delete', 
 *       icon: <TrashIcon />, 
 *       onClick: () => {},
 *       variant: 'danger'
 *     },
 *   ]}
 * />
 * 
 * // With dividers
 * <Dropdown
 *   trigger={<Button>Menu</Button>}
 *   items={items}
 *   dividers={['2']}
 * />
 * 
 * // Right aligned
 * <Dropdown trigger={<Button>Menu</Button>} items={items} align="right" />
 * 
 * // With search
 * <DropdownSearch
 *   trigger={<Button>Search</Button>}
 *   items={items}
 *   searchPlaceholder="Search items..."
 * />
 */
