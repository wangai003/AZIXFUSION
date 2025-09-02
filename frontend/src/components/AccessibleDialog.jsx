import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

/**
 * AccessibleDialog - A wrapper around Material-UI Dialog that fixes aria-hidden issues
 * 
 * This component addresses the common accessibility warning:
 * "Blocked aria-hidden on an element because its descendant retained focus"
 * 
 * Props:
 * - open: boolean - controls dialog visibility
 * - onClose: function - called when dialog should close
 * - title: string - dialog title
 * - children: ReactNode - dialog content
 * - actions: ReactNode - dialog actions (buttons)
 * - maxWidth: string - dialog max width
 * - fullWidth: boolean - whether dialog should be full width
 * - id: string - unique identifier for the dialog
 */
const AccessibleDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = false,
  id,
  ...props
}) => {
  const dialogId = id || `dialog-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${dialogId}-title`;
  const contentId = `${dialogId}-content`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={titleId}
      aria-describedby={contentId}
      disableRestoreFocus
      keepMounted={false}
      {...props}
    >
      {title && (
        <DialogTitle id={titleId}>
          {title}
        </DialogTitle>
      )}
      <DialogContent id={contentId}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AccessibleDialog;
