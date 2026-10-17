import { AnalyticsService } from './analytics.service';

describe('AnalyticsService aggregated queries', () => {
  it('returns serializable totals and a zero-filled daily series from aggregated rows', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const prisma: any = {
      $queryRaw: jest.fn()
        .mockResolvedValueOnce([{ total: 100000n, uniqueVisitors: 1200n }])
        .mockResolvedValueOnce([{ date, views: 25000n }]),
      pageView: { groupBy: jest.fn().mockResolvedValue([{ path: '/', _count: { path: 100000 } }]) },
    };
    const result = await new AnalyticsService(prisma).getPageViewStats();
    expect(result.total).toBe(100000);
    expect(result.uniqueVisitors).toBe(1200);
    expect(Object.keys(result.daily)).toHaveLength(14);
    expect(result.daily[date]).toBe(25000);
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('checks ownership before querying invitation history', async () => {
    const prisma: any = { invitation: { findFirst: jest.fn().mockResolvedValue({ userId: 'other' }) }, $queryRaw: jest.fn() };
    await expect(new AnalyticsService(prisma).getStatsByInvitation('inv', 'owner')).rejects.toThrow();
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('binds invitation ids as query parameters and preserves daily/event response shape', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const prisma: any = {
      invitation: { findFirst: jest.fn().mockResolvedValue({ userId: 'owner', analytics: [{ views: 42 }], analyticsEvents: [{ id: 'event' }] }) },
      $queryRaw: jest.fn().mockResolvedValue([{ date, views: 42n }]),
    };
    const result = await new AnalyticsService(prisma).getStatsByInvitation("inv'quoted", 'owner');
    expect(prisma.$queryRaw.mock.calls[0][1]).toBe("inv'quoted");
    expect(result.daily).toHaveLength(14);
    expect(result.daily.find(r => r.date === date)?.views).toBe(42);
    expect(result.events).toEqual([{ id: 'event' }]);
  });
});
