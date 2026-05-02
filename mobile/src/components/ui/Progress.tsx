import { View, Text, type ViewProps } from "react-native";

interface ProgressBarProps extends ViewProps {
  /** Current step (1-indexed) */
  current: number;
  /** Total steps */
  total: number;
}

/**
 * Horizontal step progress bar used in multi-step request wizard.
 */
export function ProgressBar({ current, total, ...rest }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100);

  return (
    <View {...rest}>
      <View className="h-1.5 bg-border">
        <View className="h-1.5 bg-primary" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

interface StepIndicatorProps {
  /** Current step (1-indexed) */
  current: number;
  /** Total steps */
  total: number;
  /** Optional step labels */
  labels?: string[];
}

/**
 * Horizontal dot-based step indicator showing current progress through
 * a multi-step wizard.
 */
export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-3">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;

        return (
          <View key={step} className="items-center">
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                isActive
                  ? "bg-primary"
                  : isDone
                    ? "bg-primary/30"
                    : "bg-border"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive || isDone ? "text-white" : "text-text-muted"
                }`}
              >
                {isDone ? "✓" : step}
              </Text>
            </View>
            {labels?.[i] && (
              <Text
                className={`text-[10px] mt-1 ${
                  isActive ? "text-primary font-semibold" : "text-text-muted"
                }`}
              >
                {labels[i]}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
