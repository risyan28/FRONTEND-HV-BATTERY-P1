// lib/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest'
import {
  SequenceSchema,
  DateRangeSchema,
  CreateSequenceSchema,
  validate,
  safeParse,
} from '../validation'

describe('Validation', () => {
  describe('SequenceSchema', () => {
    it('should validate correct sequence data', () => {
      const validSequence = {
        FID: 1,
        FID_ADJUST: 0,
        FSEQ_NO: 123,
        FBARCODE: 'PACK001',
        FMODEL_BATTERY: 'LI-688D',
        FTYPE_BATTERY: 'E',
        FSEQ_DATE: '2026-02-11T10:00:00Z',
        FSTATUS: 1, // number, not string
      }

      expect(() => validate(SequenceSchema, validSequence)).not.toThrow()
    })

    it('should reject invalid sequence data', () => {
      const invalidSequence = {
        FID: 'not-a-number', // Invalid type
        FBARCODE: 123, // Invalid type
      }

      expect(() => validate(SequenceSchema, invalidSequence)).toThrow()
    })
  })

  describe('DateRangeSchema', () => {
    it('should validate correct date range', () => {
      const validRange = {
        from: '2026-02-01',
        to: '2026-02-11',
      }

      expect(() => validate(DateRangeSchema, validRange)).not.toThrow()
    })

    it('should reject invalid date format', () => {
      const invalidRange = {
        from: '2026/02/01', // Wrong format
        to: '2026-02-11',
      }

      expect(() => validate(DateRangeSchema, invalidRange)).toThrow()
    })

    it('should reject date range where from > to', () => {
      const invalidRange = {
        from: '2026-02-11',
        to: '2026-02-01', // Earlier than from
      }

      expect(() => validate(DateRangeSchema, invalidRange)).toThrow()
    })
  })

  describe('CreateSequenceSchema', () => {
    it('should validate valid create sequence payload', () => {
      const valid = {
        FTYPE_BATTERY: 'E',
        FMODEL_BATTERY: 'LI-688D',
      }

      expect(() => validate(CreateSequenceSchema, valid)).not.toThrow()
    })

    it('should reject empty battery type', () => {
      const invalid = {
        FTYPE_BATTERY: '', // Empty string
        FMODEL_BATTERY: 'LI-688D',
      }

      expect(() => validate(CreateSequenceSchema, invalid)).toThrow()
    })
  })

  describe('safeParse', () => {
    it('should return success result for valid data', () => {
      const result = safeParse(DateRangeSchema, {
        from: '2026-02-01',
        to: '2026-02-11',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.from).toBe('2026-02-01')
      }
    })

    it('should return error result for invalid data', () => {
      const result = safeParse(DateRangeSchema, {
        from: 'invalid',
        to: '2026-02-11',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})
