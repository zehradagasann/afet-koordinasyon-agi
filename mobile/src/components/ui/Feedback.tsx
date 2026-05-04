import { ActivityIndicator, View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { Button } from "./Button";

// ─── Loading Overlay ───────────────────────────────────────────────────────

interface LoadingOverlayProps {
  /** Message shown below the spinner */
  message?: string;
}

/**
 * Full-screen centered loading spinner.
 */
export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface-card">
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && (
        <Text className="text-text-secondary text-sm mt-3">{message}</Text>
      )}
    </View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  /** Optional CTA button */
  actionTitle?: string;
  onAction?: () => void;
}

/**
 * Centered empty-state placeholder with icon, title, description, and
 * optional action button.
 */
export function EmptyState({
  icon = "📋",
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Text className="text-4xl mb-3">{icon}</Text>
      <Text className="text-text-primary font-semibold text-base mb-1 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-text-secondary text-sm text-center mb-4">
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} size="md" onPress={onAction} />
      )}
    </View>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Centered error view with retry button.
 */
export function ErrorState({
  message = "Bir hata oluştu",
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-4xl mb-3">⚠️</Text>
      <Text className="text-text-secondary text-center mb-4">{message}</Text>
      {onRetry && <Button title="Tekrar Dene" size="md" onPress={onRetry} />}
    </View>
  );
}

// ─── Screen Header ─────────────────────────────────────────────────────────

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Right-side action content */
  right?: React.ReactNode;
}

/**
 * Standardized screen header bar with primary background, back button,
 * title/subtitle, and optional right action slot.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
      {onBack && (
        <Button
          title="←"
          variant="ghost"
          size="sm"
          style={{ paddingHorizontal: 0, paddingVertical: 0 }}
          onPress={onBack}
        />
      )}
      <View className="flex-1">
        <Text className="text-white font-bold text-lg">{title}</Text>
        {subtitle && (
          <Text className="text-white/70 text-xs">{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

// ─── Alert Banner ──────────────────────────────────────────────────────────

type AlertBannerVariant = "error" | "warning" | "info" | "success";

const ALERT_VARIANTS: Record<
  AlertBannerVariant,
  { bg: string; icon: string; textColor: string; border: string }
> = {
  error:   { bg: "bg-status-urgent/10",  icon: "⚠️", textColor: "text-status-urgent",  border: "border-status-urgent/40" },
  warning: { bg: "bg-status-pending/10", icon: "⚡", textColor: "text-status-pending", border: "border-transparent" },
  info:    { bg: "bg-status-info/10",    icon: "ℹ️", textColor: "text-status-info",    border: "border-transparent" },
  success: { bg: "bg-status-active/10",  icon: "✅", textColor: "text-status-active",  border: "border-transparent" },
};

interface AlertBannerProps {
  variant?: AlertBannerVariant;
  title: string;
  message?: string;
}

/**
 * Colored alert/notification banner with icon, title, and optional message.
 */
export function AlertBanner({
  variant = "error",
  title,
  message,
}: AlertBannerProps) {
  const v = ALERT_VARIANTS[variant];
  return (
    <View className={`${v.bg} border ${v.border} rounded-card p-3 mb-4`}>
      <Text className={`${v.textColor} font-semibold text-sm`}>
        {v.icon} {title}
      </Text>
      {message && (
        <Text className={`${v.textColor}/90 text-xs mt-1`}>{message}</Text>
      )}
    </View>
  );
}
