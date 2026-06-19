'use client';

import * as React from 'react';

/**
 * Selected + inline-editing element keys for the canvas surface.
 *
 * Two pieces of state live together because they're tightly coupled:
 *   - selecting a different element exits any in-flight inline edit
 *   - starting an inline edit forces selection on that element
 */
export interface UseElementSelectionApi {
  selectedKey: string | null;
  editingKey: string | null;
  selectKey: (key: string | null) => void;
  startInlineEdit: (key: string) => void;
  /** Caller passes the committed value; the hook just clears editing state.
   *  Content commit is handled by the caller (it owns the canvas data). */
  endInlineEdit: () => void;
}

export function useElementSelection(): UseElementSelectionApi {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [editingKey, setEditingKey] = React.useState<string | null>(null);

  const selectKey = React.useCallback((key: string | null) => {
    setEditingKey(null);
    setSelectedKey(key);
  }, []);

  const startInlineEdit = React.useCallback((key: string) => {
    setSelectedKey(key);
    setEditingKey(key);
  }, []);

  const endInlineEdit = React.useCallback(() => {
    setEditingKey(null);
  }, []);

  return {
    selectedKey,
    editingKey,
    selectKey,
    startInlineEdit,
    endInlineEdit,
  };
}
