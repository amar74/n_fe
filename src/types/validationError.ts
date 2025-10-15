import { z } from 'zod';
import { HTTPValidationError, ValidationError } from './generated/common';

// @author harsh.pawar
export type HTTPValidationError = z.infer<typeof HTTPValidationError>
export type ValidationError = z.infer<typeof ValidationError>
