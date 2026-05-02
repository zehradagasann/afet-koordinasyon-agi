import { Text, View } from "react-native";
import type { RequestStatus, NeedType } from "@/src/types";

// ─── Status Badge ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string }> = {
  pending:   { label: "Bekliyor",  bg: "bg-status-pending/20", text: "text-status-pending" },
  active:    { label: "Aktif",     bg: "bg-status-active/20",  text: "text-status-active" },
  assigned:  { label: "Atandı",    bg: "bg-status-resolved/20", text: "text-status-resolved" },
  resolved:  { label: "Çözüldü",   bg: "bg-status-active/20",  text: "text-status-active" },
  cancelled: { label: "İptal",     bg: "bg-surface-muted",     text: "text-text-muted" },
};

interface StatusBadgeProps {
  status: RequestStatus;
}

/**
 * Colored pill badge showing request status in Turkish.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View className={`rounded-full px-2.5 py-1 ${cfg.bg}`}>
      <Text className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
}

// ─── Need Badge ────────────────────────────────────────────────────────────

const NEED_CONFIG: Record<NeedType, { label: string; icon: string; color: string }> = {
  rescue:   { label: "Kurtarma",     icon: "🚒", color: "#E63946" },
  medical:  { label: "Tıbbi Yardım", icon: "🏥", color: "#DC2626" },
  food:     { label: "Yiyecek",      icon: "🍞", color: "#F59E0B" },
  water:    { label: "Su",           icon: "💧", color: "#3B82F6" },
  shelter:  { label: "Barınak",      icon: "🏠", color: "#8B5CF6" },
  heating:  { label: "Isınma",       icon: "🔥", color: "#F97316" },
  clothing: { label: "Giyim",        icon: "👕", color: "#10B981" },
  hygiene:  { label: "Hijyen",       icon: "🧼", color: "#06B6D4" },
  other:    { label: "Diğer",        icon: "📦", color: "#6B7280" },
};

interface NeedBadgeProps {
  type: NeedType;
}

/**
 * Colored pill badge for need type with emoji icon.
 */
export function NeedBadge({ type }: NeedBadgeProps) {
  const cfg = NEED_CONFIG[type] ?? NEED_CONFIG.other;
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${cfg.color}20` }}
    >
      <Text className="text-xs">{cfg.icon}</Text>
      <Text className="text-xs font-semibold" style={{ color: cfg.color }}>
        {cfg.label}
      </Text>
    </View>
  );
}

/** Utility: get Turkish label for a need type */
export function getNeedLabel(type: NeedType): string {
  return NEED_CONFIG[type]?.label ?? type;
}

/** Utility: get emoji icon for a need type */
export function getNeedIcon(type: NeedType): string {
  return NEED_CONFIG[type]?.icon ?? "📦";
}

/** Utility: get Turkish label for a request status */
export function getStatusLabel(status: RequestStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
