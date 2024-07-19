import { calculateReward } from "@/app/utils/algo";

test("rewards: multiple choice objective", async () => {
  const userId = '37203323-f3a5-412b-ba4e-0b4d95bdf75d'
  const questionId = 166
  const questionIds = [questionId]

  const actualReward = await calculateReward(userId, questionIds)
  expect(actualReward).toStrictEqual([{"questionId": 166, "rewardAmount":  6778.502776581657}])
})