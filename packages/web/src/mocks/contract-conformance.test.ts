// T1.6 contract-conformance test: §6 wire format ↔ UI lib Campaign type.
//
// What it guards: the single transformResponse adapter (adaptCampaignRow in
// src/api.ts) must produce a valid UiCampaign for *both* MSW handler data and
// real-BE responses. If §6 changes (a field renamed, a status enum value
// added/removed) and only one source updates, this test fails before the
// drift hits production.
//
// Fixture-capture workflow (refresh real-be-list.json against a live BE):
//
//   yarn workspace @campaign-manager/api seed   # T3.3 demo data
//   curl -H "Authorization: Bearer <jwt-from-/auth/login>" \
//        http://localhost:4000/campaigns \
//      | jq > packages/web/src/mocks/__fixtures__/real-be-list.json
//
// Per work-plan §9 DoD item 7 + §15 row 8: any PR that changes a §6 response
// shape must regenerate this fixture and rerun this test in the same PR.

import { describe, expect, it } from 'vitest';
import realBeList from './__fixtures__/real-be-list.json';
import { mockCampaigns } from './handlers.js';
import { adaptCampaignRow, type BeCampaignListRow } from '../api.js';

const VALID_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'failed'] as const;

function assertWireRowShape(row: BeCampaignListRow): void {
  expect(typeof row.id).toBe('string');
  expect(typeof row.name).toBe('string');
  expect(typeof row.subject).toBe('string');
  expect(VALID_STATUSES).toContain(row.status);
  expect(typeof row.recipients_count).toBe('number');
  expect(row.recipients_count).toBeGreaterThanOrEqual(0);
  expect(typeof row.send_rate).toBe('number');
  expect(row.send_rate).toBeGreaterThanOrEqual(0);
  expect(row.send_rate).toBeLessThanOrEqual(1);
  expect(typeof row.created_at).toBe('string');
}

describe('§6 ↔ UI lib adapter conformance (T1.6)', () => {
  describe('source shape', () => {
    it('every MSW mock campaign matches §6 BeCampaignListRow', () => {
      expect(mockCampaigns.length).toBeGreaterThan(0);
      for (const row of mockCampaigns) {
        assertWireRowShape(row as BeCampaignListRow);
      }
    });

    it('the real-BE fixture matches §6 BeCampaignListRow', () => {
      expect(realBeList.data.length).toBeGreaterThan(0);
      for (const row of realBeList.data) {
        assertWireRowShape(row as BeCampaignListRow);
      }
    });
  });

  describe('adapter output', () => {
    const allInputs: BeCampaignListRow[] = [
      ...(mockCampaigns as BeCampaignListRow[]),
      ...(realBeList.data as BeCampaignListRow[]),
    ];

    it('produces UiCampaign objects with the required field set', () => {
      for (const row of allInputs) {
        const out = adaptCampaignRow(row);
        expect(typeof out.id).toBe('string');
        expect(typeof out.name).toBe('string');
        expect(typeof out.subject).toBe('string');
        expect(VALID_STATUSES).toContain(out.status);
        expect(typeof out.recipients).toBe('number');
        expect(out.recipients).toBeGreaterThanOrEqual(0);
        expect(typeof out.sentRate).toBe('number');
        expect(out.sentRate).toBeGreaterThanOrEqual(0);
        expect(out.sentRate).toBeLessThanOrEqual(1);
        expect(typeof out.created).toBe('string');
      }
    });

    it('emits the same key set for MSW and real-BE inputs', () => {
      const mswFirst = mockCampaigns[0];
      const realFirst = realBeList.data[0];
      expect(mswFirst).toBeDefined();
      expect(realFirst).toBeDefined();
      const mswKeys = Object.keys(adaptCampaignRow(mswFirst as BeCampaignListRow)).sort();
      const realKeys = Object.keys(adaptCampaignRow(realFirst as BeCampaignListRow)).sort();
      expect(mswKeys).toEqual(realKeys);
    });

    it('renames every snake_case field to camelCase, no leakage', () => {
      const row: BeCampaignListRow = {
        id: 'test-id',
        name: 'Test',
        subject: 'Hi',
        status: 'sent',
        recipients_count: 42,
        send_rate: 0.83,
        created_at: '2026-04-26T10:00:00Z',
      };
      const out = adaptCampaignRow(row);
      // Renames preserve values
      expect(out.recipients).toBe(42);
      expect(out.sentRate).toBe(0.83);
      // Identity fields pass through unchanged
      expect(out.id).toBe('test-id');
      expect(out.name).toBe('Test');
      expect(out.subject).toBe('Hi');
      expect(out.status).toBe('sent');
      // created becomes a relative-time string (exact value depends on Date.now)
      expect(typeof out.created).toBe('string');
      expect(out.created.length).toBeGreaterThan(0);
      // No snake_case keys leak through
      expect(out).not.toHaveProperty('recipients_count');
      expect(out).not.toHaveProperty('send_rate');
      expect(out).not.toHaveProperty('created_at');
    });
  });
});
