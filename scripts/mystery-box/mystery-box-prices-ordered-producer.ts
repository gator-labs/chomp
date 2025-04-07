import { MysteryBoxPrize, PrismaClient } from "@prisma/client";


/**
 * Producer of MysteryBoxPrize
 * Get mysteryboxprize one by one ordered by id(uuid)
 * since there is no int id on table and createdAt is not indexed
 * we use the uuid of MysteryBoxPrize to get them in order by uuid
 * id is indexed automatically by prisma
 **/
export class MysteryBoxPrizeProducerOrdered {
  private prisma: PrismaClient;
  private lastId: string | null = null;
  private batchSize: number; // Adjust based on your needs
  private currentBatch: MysteryBoxPrize[] = [];
  private currentIndex: number = 0;

  constructor(prisma: PrismaClient, batchSize: number) {
    this.prisma = prisma;
    this.batchSize = batchSize;
  }

  async getNextPrize(): Promise<MysteryBoxPrize | null> {
    // If we've exhausted the current batch, fetch a new one
    if (this.currentIndex >= this.currentBatch.length) {
      this.currentBatch = await this.fetchNextBatch();
      this.currentIndex = 0;

      if (this.currentBatch.length === 0) {
        return null; // No more prizes
      }
    }

    // Get the next prize and move the index forward
    const prize = this.currentBatch[this.currentIndex];
    this.currentIndex++;
    this.lastId = prize.id;

    return prize;
  }

  private async fetchNextBatch(): Promise<MysteryBoxPrize[]> {
    const whereClause = this.lastId
      ? { id: { gt: this.lastId } }
      : {};

    return await this.prisma.mysteryBoxPrize.findMany({
      where: whereClause,
      orderBy: { id: 'asc' }, // Ordered by UUID
      take: this.batchSize,
    });
  }
}

