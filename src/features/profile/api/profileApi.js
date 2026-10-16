import { getMyClaims } from '../../claim/api/claimApi.js';

export async function getProfile() {
  return getMyClaims();
}
