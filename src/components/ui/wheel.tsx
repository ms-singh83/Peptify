import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Radius, TabularNums } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

export const WHEEL_ITEM_HEIGHT = 44;
const VISIBLE = 5;
const PAD = WHEEL_ITEM_HEIGHT * Math.floor(VISIBLE / 2);

type Props = {
  items: readonly string[];
  index: number;
  onChange: (index: number) => void;
  /** Spoken name, e.g. "Hour". */
  label: string;
  width?: number;
};

/** Snapping scroll column (pure JS — no native picker needed). Adjustable for screen readers. */
export function Wheel({ items, index, onChange, label, width = 72 }: Props) {
  const theme = useTheme();
  const ref = useRef<ScrollView>(null);
  const last = useRef(index);

  const scrollTo = (i: number, animated: boolean) => ref.current?.scrollTo({ y: i * WHEEL_ITEM_HEIGHT, animated });

  // Keep the wheel in place when the value changes from outside (e.g. screen reader).
  useEffect(() => {
    if (index !== last.current) {
      last.current = index;
      scrollTo(index, true);
    }
  }, [index]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT)));
    if (i !== last.current) {
      last.current = i;
      onChange(i);
    }
  };

  const select = (i: number) => {
    last.current = i;
    onChange(i);
    scrollTo(i, true);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && index < items.length - 1) select(index + 1);
        if (e.nativeEvent.actionName === 'decrement' && index > 0) select(index - 1);
      }}
      style={[styles.wrap, { width }]}>
      <View
        pointerEvents="none"
        style={[styles.band, { backgroundColor: theme.surface, borderColor: theme.border }]}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onLayout={() => scrollTo(index, false)}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={(e) => {
          // No momentum (slow drag): settle immediately.
          if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.y) < 0.05) settle(e);
        }}
        nestedScrollEnabled>
        {items.map((item, i) => (
          <Pressable key={item} onPress={() => select(i)} style={styles.item} importantForAccessibility="no">
            <Text variant="title2" color={i === index ? 'text' : 'textSecondary'} style={TabularNums}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: WHEEL_ITEM_HEIGHT * VISIBLE, overflow: 'hidden' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  item: { height: WHEEL_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
