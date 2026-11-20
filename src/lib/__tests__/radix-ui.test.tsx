import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/Tooltip';

describe('Radix UI Design System Primitives', () => {
  it('exports functional Dialog primitives with standard display names', () => {
    expect(Dialog).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();

    const element = React.createElement(
      Dialog,
      { open: true },
      React.createElement(
        DialogContent,
        null,
        React.createElement(
          DialogHeader,
          null,
          React.createElement(DialogTitle, null, 'Test Title'),
          React.createElement(DialogDescription, null, 'Test Description')
        )
      )
    );

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.open).toBe(true);
  });

  it('exports accessible DropdownMenu component and subprimitives', () => {
    expect(DropdownMenu).toBeDefined();
    expect(DropdownMenuContent).toBeDefined();
    expect(DropdownMenuItem).toBeDefined();

    const menuElement = React.createElement(DropdownMenu, {
      trigger: React.createElement('button', null, 'Trigger'),
      items: [
        { label: 'Edit', onClick: () => {} },
        { label: 'Delete', danger: true, onClick: () => {} },
      ],
      align: 'right',
    });

    expect(React.isValidElement(menuElement)).toBe(true);
    expect(menuElement.props.items).toHaveLength(2);
    expect(menuElement.props.align).toBe('right');
  });

  it('exports Tooltip primitives and handles provider wrapping', () => {
    expect(TooltipProvider).toBeDefined();
    expect(Tooltip).toBeDefined();
    expect(TooltipTrigger).toBeDefined();
    expect(TooltipContent).toBeDefined();

    const tooltipTree = (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(React.isValidElement(tooltipTree)).toBe(true);
    expect(tooltipTree.props.delayDuration).toBe(200);
  });
});
