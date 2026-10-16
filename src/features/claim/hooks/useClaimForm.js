import { useForm } from 'react-hook-form';
import { validateClaimAnswers } from '../schemas/claimValidation.js';

export function useClaimForm() {
  const form = useForm({ defaultValues: { answers: [] } });
  const validateAnswers = (answers) => validateClaimAnswers(answers) === true;
  return { ...form, validateAnswers };
}
