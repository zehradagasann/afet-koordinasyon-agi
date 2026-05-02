import { Pressable, View, type PressableProps, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  /** Add subtle shadow to the card */
  elevated?: boolean;
}

/**
 * Static card container with RESQ rounded-card, border, and optional shadow.
 */
export function Card({ elevated = false, className = "", children, ...rest }: CardProps) {
  return (
    <View
      className={`bg-white rounded-card border border-border p-4 ${
        elevated ? "shadow-sm" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

interface PressableCardProps extends Omit<PressableProps, "children"> {
  /** Add subtle shadow */
  elevated?: boolean;
  children: React.ReactNode;
}

/**
 * Pressable card — same styling as Card but responds to taps.
 */
export function PressableCard({
  elevated = false,
  children,
  ...rest
}: PressableCardProps) {
  return (
    <Pressable
      className={`bg-white rounded-card border border-border p-4 ${
        elevated ? "shadow-sm" : ""
      }`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
