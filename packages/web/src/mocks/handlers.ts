import { http, HttpResponse } from 'msw';

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

interface MockCampaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  recipients_count: number;
  send_rate: number;
  created_at: string;
}

export const mockCampaigns: MockCampaign[] = [
  {
    id: 'c1',
    name: 'Q4 Newsletter',
    subject: 'Big news for you',
    status: 'draft',
    recipients_count: 50,
    send_rate: 0,
    created_at: '2026-04-26T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Black Friday',
    subject: 'Save big',
    status: 'scheduled',
    recipients_count: 100,
    send_rate: 0,
    created_at: '2026-04-25T10:00:00Z',
  },
  {
    id: 'c3',
    name: 'Welcome Series',
    subject: 'Hi there',
    status: 'sending',
    recipients_count: 30,
    send_rate: 0.4,
    created_at: '2026-04-24T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'Holiday Promo',
    subject: 'Holidays!',
    status: 'sent',
    recipients_count: 200,
    send_rate: 0.94,
    created_at: '2026-04-23T10:00:00Z',
  },
  {
    id: 'c5',
    name: 'Failed Test',
    subject: 'Oops',
    status: 'failed',
    recipients_count: 5,
    send_rate: 0,
    created_at: '2026-04-22T10:00:00Z',
  },
];

export const handlers = [
  http.post('/auth/login', () =>
    HttpResponse.json({
      user: { id: 'u1', email: 'demo@example.com', name: 'Demo User' },
      token: 'mock-jwt-token',
    }),
  ),

  http.get('/campaigns', () =>
    HttpResponse.json({
      data: mockCampaigns,
      page: 1,
      limit: 20,
      total: mockCampaigns.length,
    }),
  ),

  http.get('/campaigns/:id', ({ params }) => {
    const c = mockCampaigns.find((x) => x.id === params.id);
    if (!c) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 },
      );
    }
    const sent = Math.floor(c.recipients_count * c.send_rate);
    return HttpResponse.json({
      ...c,
      body: 'Mock body content...',
      scheduled_at: null,
      updated_at: c.created_at,
      stats: {
        total: c.recipients_count,
        sent,
        failed: 0,
        opened: Math.floor(sent * 0.4),
        send_rate: c.send_rate,
        open_rate: sent > 0 ? 0.4 : 0,
      },
      recipients: [],
    });
  }),

  http.post('/campaigns/:id/send', ({ params }) =>
    HttpResponse.json({ id: params.id, status: 'sending' }, { status: 202 }),
  ),
];
