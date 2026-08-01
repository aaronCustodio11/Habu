import { type PropsWithChildren } from 'react';
import { Modal, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Glass } from '@/components/Glass';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface SheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bottom sheet (design doc §7.3): glass backing on iOS 26+, solid
 * `bg-surface-raised` card everywhere else. All editable content sits on the
 * solid card, never directly on glass.
 */
export function Sheet({ visible, title, onClose, style, children }: PropsWithChildren<SheetProps>) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlayScrim,
          justifyContent: 'flex-end',
        }}
      >
        <Glass
          fallbackStyle={{ backgroundColor: colors.bgSurfaceRaised }}
          style={{
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          <View
            style={[
              {
                backgroundColor: colors.bgSurfaceRaised,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                padding: spacing.lg,
                paddingBottom: spacing.xxl,
                gap: spacing.md,
              },
              style,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {title ? (
                <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700', flex: 1 }}>
                  {title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.textSecondary}
                onPress={onClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              />
            </View>
            {children}
          </View>
        </Glass>
      </View>
    </Modal>
  );
}
