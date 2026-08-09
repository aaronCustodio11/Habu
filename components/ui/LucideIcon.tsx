import type { LucideProps } from 'lucide-react-native';
import { LUCIDE_ICONS, type LucideIconName } from '@/components/ui/LucideIconMap';

export type { LucideIconName } from '@/components/ui/LucideIconMap';

export interface LucideIconProps extends LucideProps {
  name: LucideIconName;
}

/** Renders a curated lucide icon by name — for data-driven icon strings. */
export function LucideIcon({ name, ...props }: LucideIconProps) {
  const Icon = LUCIDE_ICONS[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
