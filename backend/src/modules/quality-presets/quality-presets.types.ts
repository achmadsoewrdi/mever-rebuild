// ============================================
// INTERFACES (Untuk Output/Response & Filter)
// ============================================

export interface QualityPresetResponse {
  id: string;
  name: string;
  codec: string | null;
  format: string | null;
  resolution: string | null;
  bitrateKbps: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityPresetFilter {
  isActive?: boolean;
}
