import { AppService } from './app.service';

describe('public stats cache', () => {
  let prisma: any;
  let service: AppService;
  beforeEach(() => {
    jest.useFakeTimers();
    prisma = { invitation: { count: jest.fn().mockResolvedValue(10) }, guest: { count: jest.fn().mockResolvedValue(20) } };
    service = new AppService(prisma);
  });
  afterEach(() => jest.useRealTimers());

  it('coalesces concurrent calls, caches for 60 seconds and then refreshes', async () => {
    const results = await Promise.all(Array.from({ length: 100 }, () => service.getPublicStats()));
    expect(results.every(r => r.totalGuests === 20 && r.totalInvitations === 10)).toBe(true);
    expect(prisma.invitation.count).toHaveBeenCalledTimes(1);
    await service.getPublicStats();
    expect(prisma.invitation.count).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(60_001);
    await service.getPublicStats();
    expect(prisma.invitation.count).toHaveBeenCalledTimes(2);
  });

  it('allows retry after a failed query', async () => {
    prisma.invitation.count.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(service.getPublicStats()).rejects.toThrow('database unavailable');
    await expect(service.getPublicStats()).resolves.toEqual({ totalInvitations: 10, totalGuests: 20 });
  });
});
