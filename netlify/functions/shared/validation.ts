/**
 * WHAT: Shared validation schemas with Zod
 * WHY: Consistent validation across all functions
 * HOW: Reusable Zod schemas for common types
 */

import { z } from 'zod';

// Player name validation with content filtering
export const PlayerNameSchema = z.string()
  .min(1, 'Name required')
  .max(50, 'Name too long')
  .regex(
    /^[a-zA-Z0-9\s\-_']+$/,
    'Name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes'
  )
  .transform(name => name.trim())
  .refine(name => name.length > 0, 'Name cannot be only whitespace');

// Room code validation
export const RoomCodeSchema = z.string()
  .length(6, 'Room code must be 6 characters')
  .regex(/^[A-Z]+$/, 'Room code must be uppercase letters');

// UUID validation
export const UuidSchema = z.string().uuid('Invalid ID format');

// Game step enum
export const GameStepSchema = z.enum([
  'Lobby',
  'CategorySelection',
  'SpicyLevel',
  'Question',
  'Reveal',
  'Summary'
]);

// Spicy level enum
export const SpicyLevelSchema = z.enum(['Mild', 'Medium', 'Hot', 'Extra-Hot']);

// Play mode enum
export const PlayModeSchema = z.enum(['multi-device', 'same-device']);
