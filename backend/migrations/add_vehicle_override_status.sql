-- Sprint 5.5: Dinamik Rota Kaydırma (Override) için gerekli alanlar
-- relief_vehicles tablosuna durum ve atanmış küme alanları

ALTER TABLE relief_vehicles
ADD COLUMN IF NOT EXISTS vehicle_status VARCHAR(20) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS assigned_cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON relief_vehicles(vehicle_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_cluster ON relief_vehicles(assigned_cluster_id);

-- Mevcut kayıtları varsayılan duruma çek
UPDATE relief_vehicles
SET vehicle_status = 'available'
WHERE vehicle_status IS NULL;

-- ENUM tipini güncelle (YENI EKLENDI)
ALTER TYPE clusterstatus ADD VALUE IF NOT EXISTS 'en_route';

COMMENT ON COLUMN relief_vehicles.vehicle_status IS 'Araç durumu: available (müsait), en_route (yolda), on_site (sahada)';
COMMENT ON COLUMN relief_vehicles.assigned_cluster_id IS 'Aracın yönlendirildiği küme (en_route iken)';
