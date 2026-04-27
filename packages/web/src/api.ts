import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Campaign as UiCampaign, CampaignStatus } from '@campaign-manager/ui';
import { formatRelativeTime } from './lib/format.js';

// BE wire types (snake_case, per work-plan §6)

export interface BeUser {
  id: string;
  email: string;
  name: string;
}

export interface BeAuthResponse {
  user: BeUser;
  token: string;
}

export interface BeCampaignListRow {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  recipients_count: number;
  send_rate: number;
  created_at: string;
}

export interface BeCampaignList {
  data: BeCampaignListRow[];
  page: number;
  limit: number;
  total: number;
}

export interface BeCampaignCreateResponse {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  recipients_count: number;
}

export interface BeCampaignDetail extends BeCampaignListRow {
  body: string;
  scheduled_at: string | null;
  updated_at: string;
  stats: {
    total: number;
    sent: number;
    failed: number;
    opened: number;
    send_rate: number;
    open_rate: number;
  };
  recipients: Array<{
    id: string;
    email: string;
    name: string | null;
    status: 'pending' | 'sent' | 'failed';
    sent_at: string | null;
    opened_at: string | null;
  }>;
}

// Adapter: BE wire format (snake_case) -> UI lib Campaign (camelCase + simplified).
// THE single transform point per CLAUDE.md hard rule #1; T1.6 will assert MSW
// responses and real-BE responses produce identical UiCampaign through this fn.
export function adaptCampaignRow(row: BeCampaignListRow): UiCampaign {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    status: row.status,
    recipients: row.recipients_count,
    sentRate: row.send_rate,
    created: formatRelativeTime(row.created_at),
  };
}

interface AuthRoot {
  auth: { token: string | null };
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as AuthRoot).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Campaigns'],
  endpoints: (builder) => ({
    login: builder.mutation<BeAuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<
      BeAuthResponse,
      { email: string; password: string; name: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    listCampaigns: builder.query<
      { data: UiCampaign[]; page: number; limit: number; total: number },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/campaigns',
        params: params ?? undefined,
      }),
      transformResponse: (raw: BeCampaignList) => ({
        data: raw.data.map(adaptCampaignRow),
        page: raw.page,
        limit: raw.limit,
        total: raw.total,
      }),
      providesTags: ['Campaigns'],
    }),
    createCampaign: builder.mutation<
      BeCampaignCreateResponse,
      { name: string; subject: string; body: string; recipient_emails: string[] }
    >({
      query: (body) => ({ url: '/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaigns'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useListCampaignsQuery,
  useCreateCampaignMutation,
} = baseApi;
