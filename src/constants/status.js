export const ITEM_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  WAITING_AT_SECURITY: 'WAITING_AT_SECURITY',
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
  PENDING: 'Menunggu di Pos Satpam',
  SECURED: 'Tersedia di Lemari',
  CLAIMED: 'Diklaim',
  [ITEM_STATUS.AVAILABLE]: 'Tersedia di Lemari',
  [ITEM_STATUS.WAITING_AT_SECURITY]: 'Menunggu di Pos Satpam',
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
  [ITEM_STATUS.AVAILABLE]: 'success',
  [ITEM_STATUS.WAITING_AT_SECURITY]: 'warning',
  [ITEM_STATUS.CLAIMED]: 'info',
  [ITEM_STATUS.SCHEDULED]: 'violet',
  [ITEM_STATUS.REJECTED]: 'danger',
  [ITEM_STATUS.EXPIRED]: 'danger',
  [CLAIM_STATUS.PENDING]: 'warning',
  [CLAIM_STATUS.APPROVED]: 'success',
});
