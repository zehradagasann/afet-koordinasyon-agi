import { useState, useEffect, useCallback } from 'react';

const NEED_TYPE_LABELS = {
  arama_kurtarma: 'Arama Kurtarma',
  medikal: 'Medikal',
  yangin: 'Yangın',
  enkaz: 'Enkaz',
  su: 'Su',
  barinma: 'Barınma',
  gida: 'Gıda',
  is_makinesi: 'İş Makinesi',
  ulasim: 'Ulaşım',
};

const POLL_INTERVAL_MS = 10000;

export default function OverrideAlertPanel({ onOverrideExecuted, onLocate }) {
  const [overrides, setOverrides] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [executing, setExecuting] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchOverrides = useCallback(async () => {
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/requests/task-packages/override-alerts'
      );
      if (res.ok) {
        const data = await res.json();
        setOverrides(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // Sessiz başarısızlık — bir sonraki polling denemesi düzeltebilir
    }
  }, []);

  useEffect(() => {
    fetchOverrides();
    const interval = setInterval(fetchOverrides, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOverrides]);

  const keyFor = (o) => `${o.vehicle_id}-${o.new_cluster_id}`;

  const dismiss = (override) => {
    setDismissed((prev) => new Set([...prev, keyFor(override)]));
  };

  const executeOverride = async (override) => {
    const key = keyFor(override);
    setExecuting(key);
    setFeedback(null);
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/requests/task-packages/execute-override',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_id: override.vehicle_id,
            new_cluster_id: override.new_cluster_id,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDismissed((prev) => new Set([...prev, key]));
        setFeedback({
          type: 'success',
          message: `✅ ${override.vehicle_type} → ${data.new_cluster_name} yönlendirildi`,
        });
        if (onOverrideExecuted) onOverrideExecuted();
        // Listeyi yenile
        fetchOverrides();
      } else {
        const err = await res.json();
        setFeedback({
          type: 'error',
          message: `❌ Hata: ${err.detail || 'Yönlendirme başarısız'}`,
        });
      }
    } catch (e) {
      setFeedback({ type: 'error', message: '❌ Bağlantı hatası' });
    } finally {
      setExecuting(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const visible = overrides.filter((o) => !dismissed.has(keyFor(o)));

  if (visible.length === 0 && !feedback) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-orange-500 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          AI ROTA KAYDIRMA UYARISI
          {visible.length > 0 && (
            <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {visible.length}
            </span>
          )}
        </h3>
      </div>

      {feedback && (
        <div
          className={`text-xs font-medium px-3 py-2 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {visible.map((override) => {
        const key = keyFor(override);
        const isExecuting = executing === key;
        const isCritical = ['medikal', 'arama_kurtarma'].includes(
          override.new_need_type
        );

        return (
          <div
            key={key}
            className={`rounded-xl p-4 border-l-[6px] shadow-lg transition-all ${
              isCritical
                ? 'border-red-500 bg-gradient-to-r from-red-900/30 to-orange-900/20'
                : 'border-orange-500 bg-gradient-to-r from-orange-900/30 to-amber-900/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-300 font-black text-xs uppercase tracking-wider">
                  ⚡ Override Fırsatı
                </span>
                {isCritical && (
                  <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                    KRİTİK
                  </span>
                )}
              </div>
              <button
                onClick={() => dismiss(override)}
                className="text-slate-500 hover:text-slate-200 text-base leading-none"
                title="Yoksay"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <p className="text-white text-sm font-semibold">
                🚐 {override.vehicle_type} → {override.new_cluster_name}
              </p>
              <p className="text-slate-300 text-xs">
                <span className="text-slate-500">Şu anki hedef:</span>{' '}
                {override.current_cluster_name}{' '}
                <span className="text-slate-500">
                  ({NEED_TYPE_LABELS[override.current_need_type] ||
                    override.current_need_type}
                  , {override.current_cluster_score} puan)
                </span>
              </p>
              <div className="bg-black/30 rounded p-2 text-xs text-orange-200 font-medium border border-orange-500/20">
                ⚠️ {override.reason}
                <div className="text-[10px] text-slate-400 mt-1 flex gap-3">
                  <span>
                    🆕 Yeni:{' '}
                    <strong className="text-orange-300">
                      {override.new_cluster_score} puan
                    </strong>
                  </span>
                  <span>📍 {override.distance_to_new_km} km uzakta</span>
                  <span>
                    📊 Fark:{' '}
                    <strong className="text-orange-300">
                      +{override.score_difference}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => executeOverride(override)}
                disabled={isExecuting}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-700 disabled:cursor-not-allowed text-white text-xs font-black py-2 px-4 rounded transition-all shadow-md"
              >
                {isExecuting ? '⏳ KAYDIRILIYOR...' : '🔄 ARACI KAYDIR'}
              </button>
              {onLocate && (
                <button
                  onClick={() =>
                    onLocate(override.new_cluster_lat, override.new_cluster_lon)
                  }
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2 px-3 rounded transition-all"
                  title="Haritada göster"
                >
                  🗺️
                </button>
              )}
              <button
                onClick={() => dismiss(override)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold py-2 px-3 rounded transition-all"
              >
                Yoksay
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
