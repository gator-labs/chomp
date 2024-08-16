import prisma from "@/app/services/prisma";
import { calculateCorrectAnswer } from "@/app/utils/algo";

test("rewards for single subjective question", async () => {
  const questionId = 268

  const actualReward = await calculateCorrectAnswer([questionId])
  console.log("Got answer", actualReward)

  const secondOrderResponses = await prisma.questionAnswer.findMany({
    where: {
      // selected: true,
      questionOption: {
        // questionId, 
        id: 573
        // calculatedIsCorrect: true
      }
    },
    select: {
      id: true,
      questionOptionId: true,
      selected: true,
      percentage: true
    }
  })
  console.log('secondOrderResponses', secondOrderResponses)

    // Filter out null values
    const validData = secondOrderResponses.filter(entry => entry.percentage !== null);
    // Extract the percentages
    const percentages = validData.map(entry => entry.percentage);
    // Calculate the sum
    const sum = percentages.reduce((total, num) => total! + num!, 0);
    // Count the number of valid entries
    const count = percentages.length;
    // Calculate the average
    const secondOrderMean = Math.round(sum! / count)
    console.log('secondOrderMean', secondOrderMean)  
})