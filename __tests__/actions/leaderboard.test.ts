import { getTotalBonkClaimed } from '@/app/actions/leaderboard';
import { getCurrentUser } from '@/app/queries/user';
import prisma from '@/app/services/prisma';
import { ResultType, Prisma, User, Question, Stack, ChompResult, MysteryBox, MysteryBoxTrigger, MysteryBoxPrize, QuestionType, TransactionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

// Mock an arbitrary BONK token address, ensure it matches the one in the implementation or make it configurable
const BONK_TOKEN_ADDRESS = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";

// Keep this mock for getCurrentUser
jest.mock('@/app/queries/user', () => ({
  getCurrentUser: jest.fn(),
}));

// --- Test Data Management ---
let createdUserIds: string[] = [];
let createdQuestionIds: number[] = [];
let createdStackIds: number[] = [];
let createdDeckIds: number[] = [];
let createdChompResultIds: number[] = []; // Changed to number[] assuming ChompResult.id is Int
let createdMysteryBoxIds: string[] = [];
let createdMysteryBoxTriggerIds: string[] = [];
let createdMysteryBoxPrizeIds: string[] = [];

async function createUser(userData: Partial<Prisma.UserCreateInput> = {}): Promise<User> {
  const userId = userData.id || uuidv4();
  const user = await prisma.user.create({
    data: {
      id: userId,
      username: userData.username || `testuser-${userId.substring(0, 8)}`,
      // Assuming displayName and email are not strictly required or handled differently
      // For example, email might be related via an Email model
      // wallets: userData.wallets || { create: { address: `${userId}_wallet` } }
      // Simplify wallet creation if not complex for tests, or ensure userData.wallets is correct type
      ...(userData.wallets ? { wallets: userData.wallets } : { wallets: { create: { address: `${userId}_wallet`} } })
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function createStack(stackData: Partial<Prisma.StackCreateInput> = {}): Promise<Stack> {
  const stack = await prisma.stack.create({
    data: {
      name: stackData.name || `Test Stack ${uuidv4().substring(0,8)}`,
      isActive: stackData.isActive === undefined ? true : stackData.isActive,
      image: stackData.image || 'test_image.png',
      ...stackData,
    },
  });
  createdStackIds.push(stack.id);
  return stack;
}

async function createQuestion(questionData: Omit<Partial<Prisma.QuestionCreateInput>, 'stack'> & { stackId?: number }): Promise<Question> {
  const { stackId, ...restData } = questionData;
  const question = await prisma.question.create({
    data: {
      uuid: restData.uuid || uuidv4(),
      question: restData.question || 'Test Question?',
      type: restData.type || QuestionType.MultiChoice,
      source: restData.source || `test-source-${uuidv4().substring(0,8)}`,
      description: restData.description || 'Test Question Description',
      ...(stackId && { stack: { connect: { id: stackId } } }),
      ...restData,
    }
  });
  createdQuestionIds.push(question.id);
  return question;
}

async function createChompResult(chompResultData: { 
    userId: string;
    questionId: number;
    rewardTokenAmount?: number | string | Decimal;
    result?: ResultType;
    transactionStatus?: TransactionStatus;
    customData?: Omit<Prisma.ChompResultCreateInput, 'user' | 'question' | 'rewardTokenAmount' | 'result' | 'transactionStatus' | 'revealNft'>
}): Promise<ChompResult> {
    const dataToCreate: Prisma.ChompResultCreateInput = {
        user: { connect: { id: chompResultData.userId } },
        question: { connect: { id: chompResultData.questionId } },
        rewardTokenAmount: chompResultData.rewardTokenAmount ? new Decimal(chompResultData.rewardTokenAmount) : new Decimal(0),
        result: chompResultData.result || ResultType.Claimed,
        transactionStatus: chompResultData.transactionStatus || TransactionStatus.Completed,
        ...(chompResultData.customData || {}),
    };

    // Add revealNft if result is Claimed or Revealed and no other identifier is present
    if (
        (dataToCreate.result === ResultType.Claimed || dataToCreate.result === ResultType.Revealed) &&
        !(chompResultData.customData && 'revealNft' in chompResultData.customData) && // check if revealNft is already in customData
        !(chompResultData.customData && 'burnTransactionSignature' in chompResultData.customData) && // check if burnTransactionSignature is in customData
        !dataToCreate.burnTransactionSignature // check if burnTransactionSignature is directly on dataToCreate (less likely with current structure)
    ) {
        dataToCreate.revealNft = {
            create: {
                nftId: `test-nft-${uuidv4()}`,
                userId: chompResultData.userId,
                nftType: 'Genesis', // Or some other default/configurable type
            }
        };
    }

    const result = await prisma.chompResult.create({ data: dataToCreate });
    createdChompResultIds.push(result.id); // id should be number if auto-increment
    return result;
}

// Add more helper functions for Deck, MysteryBox, MysteryBoxTrigger, MysteryBoxPrize as needed

async function cleanupDatabase() {
  // Delete in reverse order of creation and/or dependency
    await prisma.mysteryBoxPrize.deleteMany({ where: { id: { in: createdMysteryBoxPrizeIds } } });
    await prisma.mysteryBoxTrigger.deleteMany({ where: { id: { in: createdMysteryBoxTriggerIds } } });
    await prisma.mysteryBox.deleteMany({ where: { id: { in: createdMysteryBoxIds } } });
    
    // ChompResult might have a RevealNft. Ensure RevealNft is deleted if not cascaded from ChompResult.
    // Prisma schema for ChompResult has: revealNft   RevealNft?  @relation(fields: [revealNftId], references: [nftId])
    // Prisma schema for RevealNft has: chompResult ChompResult? (no explicit @relation)
    // If onDelete: Cascade is not on RevealNft field in ChompResult, explicit delete of RevealNft might be needed first.
    // However, the current ChompResult delete should handle related RevealNfts if they were created *through* the ChompResult relation.
    // Let's ensure any RevealNfts tied to users are cleaned up before users if they are not linked via ChompResults being deleted.
    // This would primarily be if RevealNfts were created independently and linked to users directly in tests.

    await prisma.chompResult.deleteMany({ where: { id: { in: createdChompResultIds } } }); 
    
    // It's safer to delete RevealNfts linked to test users directly after ChompResults, 
    // in case some were created but not linked via a ChompResult that gets deleted.
    await prisma.revealNft.deleteMany({ where: { userId: { in: createdUserIds } } });

    await prisma.questionOption.deleteMany({ where: { questionId: { in: createdQuestionIds } } });
    await prisma.deckQuestion.deleteMany({ where: { questionId: { in: createdQuestionIds } } });
    // FungibleAssetTransactionLog can be linked to questionId or userId
    await prisma.fungibleAssetTransactionLog.deleteMany({ where: { OR: [{questionId: { in: createdQuestionIds }}, {userId: { in: createdUserIds }}] } });
    // MysteryBoxTrigger can also be linked to deckId (not currently tracked for cleanup, but good to note)
    // Re-check dependencies: MysteryBoxTrigger is deleted above. Questions are deleted below.
    await prisma.question.deleteMany({ where: { id: { in: createdQuestionIds } } });
    // Decks are not explicitly created in these leaderboard tests, but if they were, they'd be here.
    await prisma.deck.deleteMany({ where: { id: { in: createdDeckIds } } }); 
    await prisma.stack.deleteMany({ where: { id: { in: createdStackIds } } });
    await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
    // MysteryBox also has a direct link to userId, already handled by createdMysteryBoxIds, but good to be aware.
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });

  createdUserIds = [];
  createdQuestionIds = [];
  createdStackIds = [];
  createdDeckIds = [];
  createdChompResultIds = [];
  createdMysteryBoxIds = [];
  createdMysteryBoxTriggerIds = [];
  createdMysteryBoxPrizeIds = [];
}

describe('getTotalBonkClaimed', () => {
  beforeEach(async () => {
    (getCurrentUser as jest.Mock).mockReset();
    (getCurrentUser as jest.Mock).mockResolvedValue(null); // No logged-in user by default
  });

  afterEach(async () => {
    await cleanupDatabase();
  });
  
  // Remove this afterAll if afterEach is handling cleanup comprehensively
  // afterAll(async () => {
  //   await cleanupDatabase(); 
  // });

  test('should return correct BONK amount for a user with ChompResults only', async () => {
    const user1 = await createUser({ id: 'user1_cr_only' });
    const stack1 = await createStack();
    const question1 = await createQuestion({ stackId: stack1.id });
    await createChompResult({ userId: user1.id, questionId: question1.id, rewardTokenAmount: 100 });
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].user.id).toBe(user1.id);
    expect(result.ranking[0].value).toBe(100);
    expect(result.ranking[0].rank).toBe(1);
  });

  // Helper for MysteryBox related entities
  async function createMysteryBox(mbData: Omit<Partial<Prisma.MysteryBoxCreateInput>, 'user'> & { userId: string }): Promise<MysteryBox> {
    const { userId, ...restMbData } = mbData;
    const mysteryBox = await prisma.mysteryBox.create({
        data: {
            id: restMbData.id || uuidv4(),
            user: { connect: { id: userId } },
            status: restMbData.status || 'Opened', 
            ...restMbData,
        }
    });
    createdMysteryBoxIds.push(mysteryBox.id);
    return mysteryBox;
  }

  async function createMysteryBoxTrigger(
    mbtData: Omit<Partial<Prisma.MysteryBoxTriggerCreateInput>, 'MysteryBox' | 'question' | 'deck'> & { mysteryBoxId: string; questionId?: number; deckId?: number}
  ): Promise<MysteryBoxTrigger> {
    const { mysteryBoxId, questionId, deckId, ...restMbtData } = mbtData;
    const data: Prisma.MysteryBoxTriggerCreateInput = {
        id: restMbtData.id || uuidv4(),
        MysteryBox: { connect: { id: mysteryBoxId } }, 
        triggerType: restMbtData.triggerType || 'CampaignReward', 
        ...(questionId && { question: { connect: { id: questionId } } }),
        ...(deckId && { deck: { connect: { id: deckId } } }),
        ...restMbtData,
    };
    const trigger = await prisma.mysteryBoxTrigger.create({ data });
    createdMysteryBoxTriggerIds.push(trigger.id);
    return trigger;
  }

  async function createMysteryBoxPrize(
      mbpData: Omit<Partial<Prisma.MysteryBoxPrizeCreateInput>, 'mysteryBoxTrigger'> & { mysteryBoxTriggerId: string }
  ): Promise<MysteryBoxPrize> {
    const { mysteryBoxTriggerId, ...restMbpData } = mbpData;
    const data: Prisma.MysteryBoxPrizeCreateInput = {
        id: restMbpData.id || uuidv4(),
        mysteryBoxTrigger: { connect: { id: mysteryBoxTriggerId } }, 
        status: restMbpData.status || 'Claimed', 
        prizeType: restMbpData.prizeType || 'Token',
        amount: restMbpData.amount || '0',
        size: restMbpData.size || 'Small', 
        ...(restMbpData.prizeType === 'Token' && { tokenAddress: restMbpData.tokenAddress || BONK_TOKEN_ADDRESS }),
        ...restMbpData
    };
    const prize = await prisma.mysteryBoxPrize.create({ data });
    createdMysteryBoxPrizeIds.push(prize.id);
    return prize;
  }

  test('should return correct BONK amount for a user with MysteryBoxPrizes only', async () => {
    const user1 = await createUser({ id: 'user1_mb_only' });
    const stack1 = await createStack(); 
    const question1 = await createQuestion({ stackId: stack1.id });
    const mb = await createMysteryBox({ userId: user1.id });
    const mbt = await createMysteryBoxTrigger({ mysteryBoxId: mb.id, questionId: question1.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt.id, amount: '200', tokenAddress: BONK_TOKEN_ADDRESS });
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].user.id).toBe(user1.id);
    expect(result.ranking[0].value).toBe(200);
    expect(result.ranking[0].rank).toBe(1);
  });

  test('should sum BONK amounts for a user with both ChompResults and MysteryBoxPrizes', async () => {
    const user1 = await createUser({ id: 'user1_both' });
    const stack1 = await createStack();
    const q1 = await createQuestion({ stackId: stack1.id });
    const q2 = await createQuestion({ stackId: stack1.id }); 
    await createChompResult({ userId: user1.id, questionId: q1.id, rewardTokenAmount: 150 });
    const mb = await createMysteryBox({ userId: user1.id });
    const mbt = await createMysteryBoxTrigger({ mysteryBoxId: mb.id, questionId: q2.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt.id, amount: '250', tokenAddress: BONK_TOKEN_ADDRESS });
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].user.id).toBe(user1.id);
    expect(result.ranking[0].value).toBe(400); 
    expect(result.ranking[0].rank).toBe(1);
  });
  
  test('should rank multiple users correctly with mixed rewards', async () => {
    const user1 = await createUser({ id: 'user1_rank', username: 'User1Rank' });
    const user2 = await createUser({ id: 'user2_rank', username: 'User2Rank' });
    const user3 = await createUser({ id: 'user3_rank', username: 'User3Rank' });
    const stack = await createStack();
    const q1 = await createQuestion({ stackId: stack.id });
    const q2 = await createQuestion({ stackId: stack.id });
    const q3 = await createQuestion({ stackId: stack.id });
    const q4 = await createQuestion({ stackId: stack.id });
    await createChompResult({ userId: user1.id, questionId: q1.id, rewardTokenAmount: 100 });
    const mb1 = await createMysteryBox({ userId: user1.id, id: 'mb1_rank' });
    const mbt1 = await createMysteryBoxTrigger({ mysteryBoxId: mb1.id, questionId: q2.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt1.id, amount: '200', tokenAddress: BONK_TOKEN_ADDRESS });
    await createChompResult({ userId: user2.id, questionId: q3.id, rewardTokenAmount: 50 });
    const mb3 = await createMysteryBox({ userId: user3.id, id: 'mb3_rank' });
    const mbt3 = await createMysteryBoxTrigger({ mysteryBoxId: mb3.id, questionId: q4.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt3.id, amount: '400', tokenAddress: BONK_TOKEN_ADDRESS });
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(3); 
    expect(result.ranking[0].user.id).toBe(user3.id);
    expect(result.ranking[0].value).toBe(400);
    expect(result.ranking[0].rank).toBe(1);
    expect(result.ranking[1].user.id).toBe(user1.id);
    expect(result.ranking[1].value).toBe(300);
    expect(result.ranking[1].rank).toBe(2);
    expect(result.ranking[2].user.id).toBe(user2.id);
    expect(result.ranking[2].value).toBe(50);
    expect(result.ranking[2].rank).toBe(3);
  });

  test('should filter by stackId correctly', async () => {
    const user1 = await createUser({ id: 'user1_stack_filter' });
    const user2 = await createUser({ id: 'user2_stack_filter' });
    const stack1 = await createStack({ name: 'Stack1' });
    const stack2 = await createStack({ name: 'Stack2' });
    const q_s1_1 = await createQuestion({ stackId: stack1.id });
    const q_s2_1 = await createQuestion({ stackId: stack2.id });
    await createChompResult({ userId: user1.id, questionId: q_s1_1.id, rewardTokenAmount: 100 });
    const mb_u1_s1 = await createMysteryBox({ userId: user1.id, id: 'mb_u1_s1' });
    const mbt_u1_s1 = await createMysteryBoxTrigger({ mysteryBoxId: mb_u1_s1.id, questionId: q_s1_1.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt_u1_s1.id, amount: '50', tokenAddress: BONK_TOKEN_ADDRESS });
    await createChompResult({ userId: user2.id, questionId: q_s2_1.id, rewardTokenAmount: 200 });
    const mb_u2_s2 = await createMysteryBox({ userId: user2.id, id: 'mb_u2_s2' });
    const mbt_u2_s2 = await createMysteryBoxTrigger({ mysteryBoxId: mb_u2_s2.id, questionId: q_s2_1.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt_u2_s2.id, amount: '75', tokenAddress: BONK_TOKEN_ADDRESS });
    await createChompResult({ userId: user1.id, questionId: q_s2_1.id, rewardTokenAmount: 30 });
    const resultStack1 = await getTotalBonkClaimed({}, stack1.id, createdUserIds);
    expect(resultStack1.ranking).toHaveLength(1);
    expect(resultStack1.ranking[0].user.id).toBe(user1.id);
    expect(resultStack1.ranking[0].value).toBe(150);
    const resultStack2 = await getTotalBonkClaimed({}, stack2.id, createdUserIds);
    expect(resultStack2.ranking).toHaveLength(2);
    expect(resultStack2.ranking[0].user.id).toBe(user2.id);
    expect(resultStack2.ranking[0].value).toBe(275);
    const user1Stack2Data = resultStack2.ranking.find(r => r.user.id === user1.id);
    expect(user1Stack2Data).toBeDefined();
    expect(user1Stack2Data!.value).toBe(30); 
    const resultGlobal = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(resultGlobal.ranking).toHaveLength(2);
    expect(resultGlobal.ranking[0].user.id).toBe(user2.id);
    expect(resultGlobal.ranking[0].value).toBe(275); 
    expect(resultGlobal.ranking[1].user.id).toBe(user1.id);
    expect(resultGlobal.ranking[1].value).toBe(180); 
  });

  test('should filter by dateFilter correctly for claimedAt (MysteryBox) and createdAt (Chomp)', async () => {
    const user1 = await createUser({ id: 'user1_date_filter' });
    const stack = await createStack();
    const question1 = await createQuestion({ stackId: stack.id }); // Unique question
    const question2 = await createQuestion({ stackId: stack.id }); // Another unique question

    const dateInFilter = new Date('2023-07-15T12:00:00.000Z');
    const dateBeforeFilter = new Date('2023-07-10T12:00:00.000Z');
    const dateAfterFilter = new Date('2023-07-20T12:00:00.000Z');
    const dateFilter = {
      createdAt: { 
        gte: new Date('2023-07-15T00:00:00.000Z'), 
        lte: new Date('2023-07-15T23:59:59.999Z') 
      }
    };
    // Chomp result within the date filter range (uses question1)
    await createChompResult({ userId: user1.id, questionId: question1.id, rewardTokenAmount: 100, customData: { createdAt: dateInFilter } });
    // Chomp result outside the date filter range (uses question2)
    await createChompResult({ userId: user1.id, questionId: question2.id, rewardTokenAmount: 500, customData: { createdAt: dateBeforeFilter }});
    
    const mb_in = await createMysteryBox({ userId: user1.id, id: 'mb_in_date' });
    // Link mystery box to one of the questions, e.g., question1 for consistency, or a new one if needed
    const mbt_in = await createMysteryBoxTrigger({ mysteryBoxId: mb_in.id, questionId: question1.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt_in.id, amount: '200', tokenAddress: BONK_TOKEN_ADDRESS, claimedAt: dateInFilter });
    
    const mb_after = await createMysteryBox({ userId: user1.id, id: 'mb_after_date' });
    const mbt_after = await createMysteryBoxTrigger({ mysteryBoxId: mb_after.id, questionId: question2.id });
    await createMysteryBoxPrize({ mysteryBoxTriggerId: mbt_after.id, amount: '700', tokenAddress: BONK_TOKEN_ADDRESS, claimedAt: dateAfterFilter });
    
    const result = await getTotalBonkClaimed(dateFilter, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].user.id).toBe(user1.id);
    expect(result.ranking[0].value).toBe(300);
  });

  test('should return empty ranking if no rewards found', async () => {
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(0);
  });

  test('should handle non-numeric or zero amounts from MysteryBoxPrizes gracefully', async () => {
    // User will be created with a dynamic UUID by default
    const user1 = await createUser(); 
    const stack = await createStack();
    const q1 = await createQuestion({ stackId: stack.id });
    const q2 = await createQuestion({ stackId: stack.id });
    const q3 = await createQuestion({ stackId: stack.id });
    const q4 = await createQuestion({ stackId: stack.id });

    // Valid ChompResult
    await createChompResult({ userId: user1.id, questionId: q1.id, rewardTokenAmount: 50 });

    // MysteryBoxPrizes with various amounts
    const mb = await createMysteryBox({ userId: user1.id });
    
    const mbt1 = await createMysteryBoxTrigger({ mysteryBoxId: mb.id, questionId: q2.id, id: 'mbt_invalid' });
    await createMysteryBoxPrize({ 
        mysteryBoxTriggerId: mbt1.id, 
        amount: 'abc', // Invalid non-numeric
        tokenAddress: BONK_TOKEN_ADDRESS 
    });

    const mbt2 = await createMysteryBoxTrigger({ mysteryBoxId: mb.id, questionId: q3.id, id: 'mbt_zero' });
    await createMysteryBoxPrize({ 
        mysteryBoxTriggerId: mbt2.id, 
        amount: '0', // Zero amount (should be filtered by `amount: { not: "0" }` in query, but also handled in code)
        tokenAddress: BONK_TOKEN_ADDRESS 
    });

    const mbt3 = await createMysteryBoxTrigger({ mysteryBoxId: mb.id, questionId: q4.id, id: 'mbt_valid_float' });
    await createMysteryBoxPrize({ 
        mysteryBoxTriggerId: mbt3.id, 
        amount: '75.5', // Valid float
        tokenAddress: BONK_TOKEN_ADDRESS 
    });

    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].user.id).toBe(user1.id);
    // Expected: 50 (chomp) + 75.5 (valid mystery prize) = 125.5, rounded to 126
    // The `amount: { not: "0" }` in the `mysteryBoxPrizes` query should filter out the zero amount prize.
    // The `parseFloat` will result in NaN for 'abc', which is also filtered out by `!isNaN(prizeAmount) && prizeAmount > 0`
    expect(result.ranking[0].value).toBe(Math.round(50 + 75.5)); 
  });
  
  test('should correctly show loggedInUserScore if a current user is present', async () => {
    const user1 = await createUser({ id: 'user1_logged_in', username: 'User1LoggedIn' });
    const loggedInUser = await createUser({ id: 'user2_logged_in', username: 'User2LoggedIn' });
    
    // Mock getCurrentUser to return our loggedInUser object
    // Need to ensure the mock returns a structure that matches what mapLeaderboardData expects for `user`
    (getCurrentUser as jest.Mock).mockResolvedValue({
        id: loggedInUser.id,
        // Add other fields that mapLeaderboardData might access from `user` object if any
        // For simplicity, assuming only `id` is used for matching in mapLeaderboardData for this test
    });

    const stack = await createStack();
    const q1 = await createQuestion({ stackId: stack.id });
    const q2 = await createQuestion({ stackId: stack.id });

    // User1 gets more points
    await createChompResult({ userId: user1.id, questionId: q1.id, rewardTokenAmount: 100 });

    // LoggedInUser (user2) gets fewer points
    await createChompResult({ userId: loggedInUser.id, questionId: q2.id, rewardTokenAmount: 50 });
    
    const result = await getTotalBonkClaimed({}, undefined, createdUserIds);

    expect(result.ranking).toHaveLength(2);
    // User1: 100 (Rank 1)
    // LoggedInUser (user2): 50 (Rank 2)
    expect(result.ranking[0].user.id).toBe(user1.id);
    expect(result.ranking[0].value).toBe(100);
    expect(result.ranking[0].rank).toBe(1);

    expect(result.ranking[1].user.id).toBe(loggedInUser.id);
    expect(result.ranking[1].value).toBe(50);
    expect(result.ranking[1].rank).toBe(2);

    expect(result.loggedInUserScore).toBeDefined();
    expect(result.loggedInUserScore?.loggedInUserRank).toBe(2);
    expect(result.loggedInUserScore?.loggedInUserPoints).toBe(50);
  });

});
