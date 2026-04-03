import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/lib/theme';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface Props {
  data: DonutSlice[];
  total: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({ data, total }: Props) {
  const cx = 70;
  const cy = 70;
  const r = 55;
  const strokeWidth = 22;

  const filtered = data.filter((d) => d.value > 0);

  let currentAngle = 0;
  const arcs = filtered.map((slice) => {
    const angle = total > 0 ? (slice.value / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + Math.max(angle, 1);
    currentAngle += angle;
    return { ...slice, startAngle, endAngle };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={140} height={140}>
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.surface} strokeWidth={strokeWidth} />
          {arcs.map((arc, i) => (
            <Path
              key={i}
              d={arcPath(cx, cy, r, arc.startAngle, arc.endAngle)}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ))}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.centerAmount}>฿{total.toLocaleString()}</Text>
          <Text style={styles.centerText}>ทั้งหมด</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {filtered.map((slice, i) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
              <Text style={styles.legendLabel}>{slice.icon} {slice.label}</Text>
              <Text style={styles.legendPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  chartWrapper: { position: 'relative', width: 140, height: 140 },
  centerLabel: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerAmount: { fontSize: 13, fontWeight: '700', color: colors.text },
  centerText: { fontSize: 9, color: colors.textSecondary },
  legend: { gap: 8, flex: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 3 },
  legendLabel: { fontSize: 11, color: colors.text, flex: 1 },
  legendPct: { fontSize: 11, color: colors.textSecondary },
});
