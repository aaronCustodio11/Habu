import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';
import type { BoardLayout } from '@/constants/BoardLayouts';

const MAX_PREVIEW_CELLS = 7;

export interface AmountPreviewProps {
  /** The board's color - the only hue allowed in this preview. */
  color: string;
  layout: BoardLayout;
  /** Amount added per log (unitless). */
  amountPerLog: number;
  /** Daily goal amount (unitless). */
  dailyTarget: number;
  /** When false, cells past the daily target are hidden (no exceeded shade). */
  allowExceeding?: boolean;
}

interface PreviewCell {
  ratio: number;
  exceeded: boolean;
}

/** Parses '#RRGGBB' into [r, g, b] 0..255. */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Returns a more saturated version of `hex` by pushing channels away from gray. */
function saturate(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  // Push each channel away from the neutral midpoint by `amount` (0..1).
  const push = (c: number) => 127 + (c - 127) * (1 + amount);
  return `#${toHex(push(r))}${toHex(push(g))}${toHex(push(b))}`;
}

/**
 * Builds the preview cell array shared by every layout (amount-based color
 * intensity preview). See design spec: cells count up to the daily target,
 * plus one bonus cell past completion to show the exceeded shade.
 */
function buildCells(
  amountPerLog: number,
  dailyTarget: number,
  allowExceeding: boolean,
): PreviewCell[] {
  if (!amountPerLog || amountPerLog <= 0) {
    return [0, 0, 0].map((ratio) => ({ ratio, exceeded: false }));
  }
  const logsToReachTarget = Math.ceil(dailyTarget / amountPerLog);
  const total = logsToReachTarget + 2;
  let built: PreviewCell[];
  if (total <= MAX_PREVIEW_CELLS) {
    built = Array.from({ length: total }, (_, i) => {
      const ratio = (i * amountPerLog) / dailyTarget;
      return { ratio, exceeded: ratio > 1.0 };
    });
  } else {
    const checkpoints = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.3];
    built = checkpoints.map((ratio) => ({ ratio, exceeded: ratio > 1.0 }));
  }
  return allowExceeding ? built : built.filter((c) => !c.exceeded);
}

/**
 * Live color-intensity preview for the create/edit board flow. Consumes the
 * same cell array as every layout, reshaped per layout: squares for heatmap,
 * thick rounded pills with log labels for the pill strip, mini progress rings
 * for the ring. Disabled (neutral) state when no daily target is set.
 */
export function AmountPreview({
  color,
  layout,
  amountPerLog,
  dailyTarget,
  allowExceeding = false,
}: AmountPreviewProps) {
  const { colors } = useTheme();

  const neutral = colors.borderSubtle;

  // Opacity ramps 0 → 1 as the ratio grows; once past 100% the same color is
  // shown at full opacity but boosted in saturation.
  const fillOpacity = (ratio: number): number => Math.max(0, Math.min(1, ratio));
  const fillColor = (ratio: number): string => (ratio > 1.0 ? saturate(color, 0.55) : color);

  const cells = useMemo(
    () => buildCells(amountPerLog, dailyTarget, allowExceeding),
    [amountPerLog, dailyTarget, allowExceeding],
  );
  const logsToReachTarget = useMemo(() => {
    if (!amountPerLog || amountPerLog <= 0) return 0;
    return Math.ceil(dailyTarget / amountPerLog);
  }, [amountPerLog, dailyTarget]);

  const valid = dailyTarget > 0;
  const literalMode = valid && logsToReachTarget + 2 <= MAX_PREVIEW_CELLS;

  if (!valid) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
          Enter a daily target to see your preview
        </Text>
      </View>
    );
  }

  const cellLabel = (cell: PreviewCell, index: number): string => {
    if (layout === 'pill' && literalMode) return String(index);
    if (layout === 'pill') return `${Math.round(cell.ratio * 100)}%`;
    return '';
  };

  const renderCell = (cell: PreviewCell, index: number) => {
    const colorNow = fillColor(cell.ratio);
    const opacity = fillOpacity(cell.ratio);
    const label = cellLabel(cell, index);

    if (layout === 'ring') {
      const size = 24;
      const stroke = 4;
      const radius = (size - stroke) / 2;
      const circumference = 2 * Math.PI * radius;
      const pct = Math.min(cell.ratio, 1.0);
      const offset = circumference * (1 - pct);
      const center = size / 2;
      return (
        <View key={index} style={{ alignItems: 'center', gap: 4 }}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={neutral}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colorNow}
              strokeOpacity={opacity}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
        </View>
      );
    }

    const cellStyle =
      layout === 'heatmap'
        ? { width: 18, height: 18, borderRadius: 4 }
        : { width: 20, height: 34, borderRadius: 10 };

    return (
      <View key={index} style={{ alignItems: 'center', gap: 4 }}>
        <View style={{ ...cellStyle, backgroundColor: neutral, overflow: 'hidden' }}>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: colorNow,
              opacity,
            }}
          />
        </View>
        {label ? (
          <Text style={{ color: colors.textTertiary, fontSize: 9, minHeight: 12 }}>{label}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {cells.map(renderCell)}
    </View>
  );
}