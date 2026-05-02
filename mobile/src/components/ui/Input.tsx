import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  /** Label shown above the input */
  label?: string;
  /** Error message shown below the input */
  error?: string;
  /** Helper text shown below the input (hidden when error is present) */
  hint?: string;
}

/**
 * RESQ Design System — Text input with label, error, and hint support.
 *
 * Automatically highlights the border red when `error` is truthy.
 * Consistent padding, border-radius, and placeholder styling.
 */
export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, className = "", style, ...rest }, ref) => {
    const borderColor = error ? "border-primary" : "border-border";

    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-text-primary mb-2">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`border rounded-input px-4 py-3.5 text-text-primary text-base ${borderColor} ${className}`}
          placeholderTextColor="#9CA3AF"
          style={style}
          {...rest}
        />
        {error ? (
          <Text className="text-primary text-xs mt-1">{error}</Text>
        ) : hint ? (
          <Text className="text-text-muted text-xs mt-1">{hint}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";
