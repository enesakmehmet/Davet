import { AssetsService } from './assets.service';

describe('AssetsService memory usage', () => {
  const metadata = { id: 'asset-1', url: '/api/assets/file/asset-1', filename: 'photo.webp' };
  let prisma: any;
  let service: AssetsService;

  beforeEach(() => {
    prisma = { asset: {
      findMany: jest.fn().mockResolvedValue([metadata]),
      findUnique: jest.fn().mockResolvedValue({ userId: 'owner' }),
      findFirst: jest.fn().mockResolvedValue({ data: Buffer.from('image'), mime: 'image/webp' }),
      update: jest.fn().mockResolvedValue({ id: 'asset-1' }),
    } };
    service = new AssetsService(prisma, {} as any);
  });

  it('lists metadata without fetching binary contents from the database', async () => {
    expect(await service.findAllByUser('owner')).toEqual([metadata]);
    const query = prisma.asset.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ userId: 'owner', deletedAt: null });
    expect(query.select).toBeDefined();
    expect(query.select.data).toBeUndefined();
    expect(query.select.url).toBe(true);
  });

  it('deletes using ownership metadata, without reading or returning the blob', async () => {
    await service.remove('asset-1', 'owner');
    expect(prisma.asset.findUnique.mock.calls[0][0].select).toEqual({ userId: true });
    expect(prisma.asset.update.mock.calls[0][0].select).toEqual({ id: true });
    prisma.asset.findUnique.mockResolvedValue({ userId: 'other' });
    await expect(service.remove('asset-1', 'owner')).rejects.toThrow('Bu dosyayı silemezsiniz');
    expect(prisma.asset.update).toHaveBeenCalledTimes(1);
  });

  it('still fetches binary contents for the dedicated file endpoint', async () => {
    const file = await service.getFile('asset-1');
    expect(file?.data).toEqual(Buffer.from('image'));
    expect(prisma.asset.findFirst.mock.calls[0][0].select.data).toBe(true);
  });
});
