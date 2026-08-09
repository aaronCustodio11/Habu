import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchX from 'lucide-react-native/icons/search-x';
import { useTheme } from '@/hooks/useTheme';
import { UnitPicker } from '@/components/board/UnitPicker';
import { TextField } from '@/components/ui/TextField';
import { BackButton } from '@/components/ui/BackButton';
import { CheckButton } from '@/components/ui/CheckButton';
import { unitPickStore } from '@/store/unitPickStore';
import { BOARD_UNITS, type UnitOption } from '@/constants/Units';
import { spacing, typography } from '@/constants/Colors';

/** English plural/quantity suffixes, stripped so "millilitres" → "millilitre". */
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

function matchUnit(query: string, option: UnitOption): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const corpus = [option.label, option.key, option.abbr, option.category]
    .join(' ')
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);
  return tokens.every((t) => corpus.some((word) => matchTerm(t, word)));
}

/** Full-screen unit picker — pick to highlight, then confirm with the header check. */
export default function PickUnitScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { current = 'count' } = useLocalSearchParams<{ current?: string }>();
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState(current);

  const navigation = useNavigation();
  // Keep the latest highlight in a ref so the removal listener always sees it.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  // Commit the highlighted unit whenever this screen goes away — confirm check,
  // back swipe, or back button — so the board form never silently keeps the
  // previous unit.
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      unitPickStore.getState().setPicked(selectionRef.current);
    });
  }, [navigation]);

  const options = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return BOARD_UNITS;
    return BOARD_UNITS.filter((option) => matchUnit(trimmed, option));
  }, [query]);

  const confirm = () => {
    unitPickStore.getState().setPicked(selection);
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
              Unit type
            </Text>
          </View>
          <CheckButton label="Confirm unit" onPress={confirm} />
        </View>

        <TextField
          placeholder="Search units"
          icon="Search"
          iconPosition="left"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {options.length === 0 ? (
        <View style={styles.empty}>
          <SearchX size={44} color={colors.textTertiary} />
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>No units match “{query.trim()}”.</Text>
        </View>
      ) : (
        <UnitPicker value={selection} onChange={setSelection} options={options} />
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