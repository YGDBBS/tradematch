/**
 * Re-export shared types from the backend.
 * This ensures a single source of truth for all types.
 *
 * When adding new types, add them to /lib/types/ (not here).
 */

export type { Profile, ProfileRole, ProfileUpdate, BusinessType } from "../../lib/types/profile"

export type { Job, JobStatus, JobInsert, JobUpdate } from "../../lib/types/job"

export type { Customer, CustomerInsert, CustomerUpdate } from "../../lib/types/customer"

export type {
  Quote,
  QuoteStatus,
  QuoteLineItem,
  QuoteInsert,
  QuoteUpdate,
} from "../../lib/types/quote"

export type { Request, RequestStatus, RequestInsert, RequestUpdate } from "../../lib/types/request"
