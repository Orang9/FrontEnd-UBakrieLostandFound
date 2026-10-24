export const ITEM_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  AVAILABLE: 'AVAILABLE',
  CLAIMED: 'CLAIMED',
  SCHEDULED: 'SCHEDULED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});

export const CLAIM_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  CLAIMED: 'CLAIMED',
  REJECTED: 'REJECTED',
});

export const STATUS_LABELS = Object.freeze({
  PENDING: 'Menunggu Persetujuan',
  SECURED: 'Tersedia',
  CLAIMED: 'Diklaim',
  [ITEM_STATUS.ACTIVE]: 'Laporan aktif',
  [ITEM_STATUS.AVAILABLE]: 'Tersedia',
  [ITEM_STATUS.CLAIMED]: 'Diklaim',
  [ITEM_STATUS.SCHEDULED]: 'Terjadwal',
  [ITEM_STATUS.REJECTED]: 'Ditolak',
  [ITEM_STATUS.EXPIRED]: 'Kedaluwarsa',
  [CLAIM_STATUS.PENDING]: 'Menunggu Persetujuan',
  [CLAIM_STATUS.APPROVED]: 'Disetujui',
});

export const STATUS_TONES = Object.freeze({
  PENDING: 'warning',
  SECURED: 'success',
  CLAIMED: 'info',
  [ITEM_STATUS.ACTIVE]: 'info',
  [ITEM_STATUS.AVAILABLE]: 'success',
  [ITEM_STATUS.CLAIMED]: 'info',
  [ITEM_STATUS.SCHEDULED]: 'violet',
  [ITEM_STATUS.REJECTED]: 'danger',
  [ITEM_STATUS.EXPIRED]: 'danger',
  [CLAIM_STATUS.PENDING]: 'warning',
  [CLAIM_STATUS.APPROVED]: 'success',
});
