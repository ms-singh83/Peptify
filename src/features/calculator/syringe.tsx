import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Units to draw (U-100 scale). */
  units: number;
  /** Syringe capacity in units: 30, 50 or 100. */
  capacity: number;
};

const W = 320;
const H = 84;
const BARREL_X = 28;
const BARREL_W = 252;
const BARREL_Y = 22;
const BARREL_H = 30;

/** Horizontal insulin-syringe drawing with tick marks and the liquid filled to `units`. */
export function Syringe({ units, capacity }: Props) {
  const theme = useTheme();
  const fraction = Math.max(0, Math.min(units / capacity, 1));
  const majorEvery = capacity === 100 ? 10 : 5;
  const minorEvery = capacity === 100 ? 2 : 1;

  const ticks = [];
  for (let u = 0; u <= capacity; u += minorEvery) {
    const x = BARREL_X + (u / capacity) * BARREL_W;
    const major = u % majorEvery === 0;
    ticks.push(
      <Line
        key={`t${u}`}
        x1={x}
        x2={x}
        y1={BARREL_Y}
        y2={BARREL_Y + (major ? 12 : 6)}
        stroke={theme.textSecondary}
        strokeWidth={major ? 1.2 : 0.6}
      />,
    );
    if (major) {
      ticks.push(
        <SvgText key={`l${u}`} x={x} y={BARREL_Y + BARREL_H + 14} fontSize={9} fill={theme.textSecondary} textAnchor="middle">
          {u}
        </SvgText>,
      );
    }
  }

  return (
    <Svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      accessible
      accessibilityLabel={`Syringe filled to ${Math.round(units * 10) / 10} of ${capacity} units`}>
      {/* needle */}
      <Line x1={0} x2={BARREL_X - 6} y1={BARREL_Y + BARREL_H / 2} y2={BARREL_Y + BARREL_H / 2} stroke={theme.textSecondary} strokeWidth={1.5} />
      <Rect x={BARREL_X - 8} y={BARREL_Y + 9} width={8} height={BARREL_H - 18} fill={theme.border} />
      {/* liquid */}
      <Rect x={BARREL_X} y={BARREL_Y} width={fraction * BARREL_W} height={BARREL_H} fill={theme.primary} opacity={0.35} />
      {/* barrel */}
      <Rect x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={4} fill="none" stroke={theme.text} strokeWidth={1.5} />
      {ticks}
      {/* plunger tip at the fill line */}
      <Rect x={BARREL_X + fraction * BARREL_W} y={BARREL_Y - 2} width={4} height={BARREL_H + 4} fill={theme.text} />
      <Line
        x1={BARREL_X + fraction * BARREL_W + 4}
        x2={W - 4}
        y1={BARREL_Y + BARREL_H / 2}
        y2={BARREL_Y + BARREL_H / 2}
        stroke={theme.text}
        strokeWidth={3}
      />
      <Rect x={W - 6} y={BARREL_Y - 4} width={4} height={BARREL_H + 8} fill={theme.text} />
    </Svg>
  );
}
