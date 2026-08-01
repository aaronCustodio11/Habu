import { useRef, useState } from 'react';
import { FlatList, Text, useWindowDimensions, View, type ViewToken } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { onboardingStore } from '@/store/onboardingStore';
import { spacing, typography } from '@/constants/Colors';

interface Slide {
  key: string;
  icon: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    icon: 'fire',
    title: 'Welcome to Habu',
    body: 'Track daily habits with a heatmap, one board at a time.',
  },
  {
    key: 'one-at-a-time',
    icon: 'calendar-blank',
    title: 'One habit at a time',
    body: 'Every board is a single habit. Check in each day to keep it alive.',
  },
  {
    key: 'streak',
    icon: 'trophy',
    title: 'Keep the streak alive',
    body: 'Your heatmap and streaks build the moment you start. Small wins add up.',
  },
];

/** Swipeable intro screens (design doc §10 - full-bleed, no glass, pre-auth). */
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const finish = () => {
    onboardingStore.getState().completeOnboarding();
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setIndex(first.index);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(slide) => slide.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.lg,
              paddingHorizontal: spacing.xl,
            }}
          >
            <MaterialCommunityIcons name={item.icon as never} size={88} color={colors.textTertiary} />
            <Text style={{ color: colors.textPrimary, fontSize: typography.display, fontWeight: '800', textAlign: 'center' }}>
              {item.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 17, textAlign: 'center', maxWidth: 300 }}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.key}
              style={{
                width: dotIndex === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotIndex === index ? colors.textPrimary : colors.borderSubtle,
              }}
            />
          ))}
        </View>
        <Button label={isLast ? 'Get Started' : 'Next'} onPress={next} />
        <Button variant="ghost" label="Skip" onPress={finish} />
      </View>
    </View>
  );
}
