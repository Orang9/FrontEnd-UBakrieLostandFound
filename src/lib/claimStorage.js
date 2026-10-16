const STORAGE_KEY = 'ubakrie-lf-preview-claims';

export function getStoredClaims() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const claims = JSON.parse(stored);
  if (
    !Array.isArray(claims) ||
    claims.some(
      (claim) =>
        typeof claim.id !== 'string' ||
        typeof claim.item?.id !== 'string' ||
        typeof claim.item?.name !== 'string' ||
        typeof claim.status !== 'string',
    )
  ) {
    throw new Error('Stored preview claim history has an invalid format.');
  }
  return claims;
}

export function hasActiveClaimForItem(itemId) {
  return getStoredClaims().some(
    (claim) =>
      claim.item.id === itemId &&
      ['PENDING', 'APPROVED', 'SCHEDULED'].includes(claim.status),
  );
}

export function savePreviewClaim(claim) {
  const claims = getStoredClaims();
  if (claims.some((existing) => existing.id === claim.id)) {
    throw new Error(`A claim with ID ${claim.id} already exists.`);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([claim, ...claims]));
}

export function upsertPreviewClaim(claim) {
  const claims = getStoredClaims();
  const existingIndex = claims.findIndex(
    (existing) => existing.id === claim.id,
  );
  if (existingIndex === -1) {
    claims.unshift(claim);
  } else {
    claims[existingIndex] = { ...claims[existingIndex], ...claim };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}
