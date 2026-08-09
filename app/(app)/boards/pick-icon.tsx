import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchX from 'lucide-react-native/icons/search-x';
import { useTheme } from '@/hooks/useTheme';
import { IconPicker } from '@/components/board/IconPicker';
import { TextField } from '@/components/ui/TextField';
import { BackButton } from '@/components/ui/BackButton';
import { CheckButton } from '@/components/ui/CheckButton';
import { iconPickStore } from '@/store/iconPickStore';
import { BOARD_ICONS, type BoardIconOption } from '@/constants/Icons';
import { spacing, typography } from '@/constants/Colors';

/** English plural/verb suffixes, stripped so "running" → "run" and "books" → "book". */
const STEM_SUFFIXES: [RegExp, string][] = [
  [/ies$/i, 'y'],
  [/ing$/i, ''],
  [/ed$/i, ''],
  [/es$/i, ''],
  [/s$/i, ''],
];

function stem(word: string): string {
  let out = word;
  for (const [pattern, replacement] of STEM_SUFFIXES) {
    const candidate = word.replace(pattern, replacement);
    if (candidate !== word && candidate.length >= 3) {
      out = candidate;
      break;
    }
  }
  return out;
}

function matchTerm(queryToken: string, candidate: string): boolean {
  const q = stem(queryToken.toLowerCase());
  const c = stem(candidate.toLowerCase());
  return (
    c === q ||
    (c.startsWith(q) && q.length >= 3) ||
    (q.startsWith(c) && c.length >= 3)
  );
}

function matchIcon(query: string, option: BoardIconOption): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const corpus = [option.label, option.key, option.category, option.icon]
    .join(' ')
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);
  return tokens.every((t) => corpus.some((word) => matchTerm(t, word)));
}

/** Sort matches so prefix/label hits rank above loose stem hits. */
function scoreIcon(query: string, option: BoardIconOption): number {
  const q = query.trim().toLowerCase();
  const label = option.label.toLowerCase();
  if (label === q) return 0;
  if (label.startsWith(q)) return 1;
  if (option.key.toLowerCase() === q || option.category.toLowerCase() === q) return 2;
  return 3;
}

/** Full-screen, searchable icon picker — hands the picked icon back to the board form. */
export default function PickIconScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { current = 'fire', color = '#43A047' } = useLocalSearchParams<{
    current?: string;
    color?: string;
  }>();
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState(current);

  const navigation = useNavigation();
  // Keep the latest highlight in a ref so the removal listener always sees it.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  // Commit the highlighted icon whenever this screen goes away — confirm check,
  // back swipe, or back button — so the board form never silently keeps the
  // previous icon.
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      iconPickStore.getState().setPicked(selectionRef.current);
    });
  }, [navigation]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return BOARD_ICONS;
    return BOARD_ICONS.filter((option) => matchIcon(trimmed, option))
      .sort((a, b) => scoreIcon(trimmed, a) - scoreIcon(trimmed, b));
  }, [query]);

  const confirm = () => {
    iconPickStore.getState().setPicked(selection);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <BackButton />
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              Pick an icon
            </Text>
          </View>
          <CheckButton label="Confirm icon" onPress={confirm} />
        </View>

        <TextField
          placeholder="Search icons"
          icon="Search"
          iconPosition="left"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <SearchX size={44} color={colors.textTertiary} />
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>No icons match “{query.trim()}”.</Text>
        </View>
      ) : (
        <IconPicker
          value={selection}
          color={color}
          icons={results}
          onChange={setSelection}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});