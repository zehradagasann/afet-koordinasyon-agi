import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  /** Button label text */
  title: string;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Prepend emoji/icon before label */
  icon?: string;
  /** Override container style */
  style?: ViewStyle;
}

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary",
    text: "text-white",
  },
  secondary: {
    container: "bg-white border-2 border-primary",
    text: "text-primary",
  },
  outline: {
    container: "bg-white border border-border",
    text: "text-text-primary",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-primary",
  },
  danger: {
    container: "bg-status-urgent",
    text: "text-white",
  },
};

const SIZE_CLASSES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "py-2.5 px-4 rounded-button", text: "text-xs" },
  md: { container: "py-3.5 px-6 rounded-button", text: "text-sm" },
  lg: { container: "py-4 px-8 rounded-button", text: "text-base" },
};

/**
 * RESQ Design System — Primary button component.
 *
 * Supports 5 visual variants (primary, secondary, outline, ghost, danger),
 * 3 sizes, loading state, and optional left-icon.
 */
export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      title,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      style,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const v = VARIANT_CLASSES[variant];
    const s = SIZE_CLASSES[size];

    return (
      <Pressable
        ref={ref}
        className={`items-center justify-center flex-row gap-2 ${s.container} ${v.container} ${
          isDisabled ? "opacity-50" : ""
        }`}
        style={style}
        disabled={isDisabled}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" || variant === "danger" ? "#fff" : "#E63946"}
            size="small"
          />
        ) : (
          <>
            {icon && <Text className="text-base">{icon}</Text>}
            <Text className={`font-bold ${s.text} ${v.text}`}>{title}</Text>
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";
