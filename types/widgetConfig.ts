import type { WidgetTypeKey } from '@/constants/WidgetTypes';

/** A dashboard is either the Home quick-stats row or a single board's page. */
export type WidgetScope = 'home' | 'board';

/** One widget placement on a dashboard. */
export interface WidgetConfig {
  id: string;
  userId: string;
  /** null = the Home dashboard. */
  boardId: string | null;
  scope: WidgetScope;
  widgetType: WidgetTypeKey;
  /** 0-based ordering, rendered low → high. */
  position: number;
  createdAt: string;
  updatedAt: string;
}

export type WidgetConfigDraft = {
  boardId: string | null;
  scope: WidgetScope;
  widgetType: WidgetTypeKey;
  position: number;
};
