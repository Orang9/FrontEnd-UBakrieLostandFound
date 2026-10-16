import {
  getStoredClaims,
  upsertPreviewClaim,
} from '../../../lib/claimStorage.js';

const QR_VALIDITY_MS = 30 * 60 * 1000;
const AUDIT_STORAGE_KEY = 'ubakrie-lf-preview-audit';

function normalizeToken(value) {
  return typeof value === 'string'
    ? value.trim().replace(/^UBLF-PREVIEW:/i, '')
    : '';
}

export function validatePreviewTicket(qrValue) {
  const token = normalizeToken(qrValue);
  if (!/^[a-z0-9]+$/i.test(token)) {
    return { valid: false, reason: 'INVALID', token };
  }

  const claims = getStoredClaims();
  const claim = claims.find(
    (candidate) => candidate.schedule?.qrToken === token,
  );
  if (!claim) return { valid: false, reason: 'INVALID', token };

  if (claim.schedule.qrUsedAt || claim.status === 'CLAIMED') {
    return { valid: false, reason: 'USED', token, claim };
  }
  if (claim.status !== 'SCHEDULED') {
    return { valid: false, reason: 'INVALID', token, claim };
  }

  const duplicateClaim = claims.find(
    (candidate) =>
      candidate.id !== claim.id &&
      candidate.item.id === claim.item.id &&
      ['PENDING', 'APPROVED', 'SCHEDULED'].includes(candidate.status),
  );
  if (duplicateClaim) {
    return {
      valid: false,
      reason: 'DUPLICATE',
      token,
      claim,
      duplicateClaim,
    };
  }

  const generatedAt = Date.parse(claim.schedule.qrGeneratedAt);
  if (
    !Number.isFinite(generatedAt) ||
    generatedAt + QR_VALIDITY_MS <= Date.now()
  ) {
    return { valid: false, reason: 'EXPIRED', token, claim };
  }

  return { valid: true, reason: 'VALID', token, claim };
}

export function confirmPreviewHandover(validation, actorId) {
  const latestValidation = validatePreviewTicket(validation.token);
  if (!latestValidation.valid) return latestValidation;

  const claim = latestValidation.claim;
  const now = new Date().toISOString();
  const updatedClaim = {
    ...claim,
    status: 'CLAIMED',
    schedule: { ...claim.schedule, qrUsedAt: now },
    steps: claim.steps?.map((step) =>
      step.key === 'CLAIMED' ? { ...step, time: now, complete: true } : step,
    ),
  };
  upsertPreviewClaim(updatedClaim);
  let auditError;
  try {
    recordPreviewAudit('HANDOVER_CONFIRMED', actorId, claim.id);
  } catch (error) {
    auditError =
      error instanceof Error ? error.message : 'Audit preview gagal disimpan.';
  }
  return {
    valid: true,
    reason: 'CLAIMED',
    token: validation.token,
    claim: updatedClaim,
    auditError,
  };
}

export function recordPreviewAudit(eventType, actorId, claimId) {
  const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
  const events = stored ? JSON.parse(stored) : [];
  if (!Array.isArray(events)) {
    throw new Error('Stored preview audit history has an invalid format.');
  }
  events.unshift({
    actor_id: actorId || 'ADMIN_BEM_PREVIEW',
    event_type: eventType,
    claim_id: claimId ?? null,
    ip: null,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(events));
}
