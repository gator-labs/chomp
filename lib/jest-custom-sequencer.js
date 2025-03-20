const Sequencer = require("@jest/test-sequencer").default;

/**
 * Plugin for jest to run tests in specific order,
 * this will only be used until we solve the flaky tests problem
 *
 * You can run tests by:
 *  - Alphabetically
 *  - Specify which tests to run and in which order
 *  - randomly
 */
class CustomSequencer extends Sequencer {
  /**
   * Select tests for shard requested via --shard=shardIndex/shardCount
   * Sharding is applied before sorting
   */
  shard(/*tests, { shardIndex, shardCount }*/) {
    throw new Error("Should not run in shard");
    //const shardSize = Math.ceil(tests.length / shardCount);
    //const shardStart = shardSize * (shardIndex - 1);
    //const shardEnd = shardSize * shardIndex;
    //
    //return [...tests]
    //  .sort((a, b) => (a.path > b.path ? 1 : -1))
    //  .slice(shardStart, shardEnd);
  }

  /**
   * Choose your sort strategy here
   */
  sort(tests) {
    //console.log("We have n tests:", tests.length);

    //return this.sortSpecific(tests);
    return this.sortAlphabetically(tests);
    //return this.sortRandomly(tests);
  }

  sortSpecific(tests) {
    // Define the order of test files here

    //const order = [
    //  "__tests__/lib/bots.test.ts",
    //  "__tests__/lib/mysteryBox/create-campaign-mystery-box.test.ts",
    //  "__tests__/queries/history/new-question-history-header-data.test.ts",
    //  "__tests__/actions/credits/verifyPayment.test.ts",
    //];

    const order = [
      "__tests__/actions/get_alltime-leaderboard.test.ts",
      "__tests__/actions/mystery-box.test.ts",
      "__tests__/queries/home/get-premium-deck.test.ts",
      "__tests__/queries/history/question-history.test.ts",
      "__tests__/queries/home/get-total-claimed-credit.test.ts",
      "__tests__/queries/home/get-free-deck.test.ts",
      "__tests__/api/process-credits/route.test.ts",
    ];

    // Filter out tests that are not in the `order` array
    const filteredTests = tests.filter((test) =>
      order.find((orderedTest) => test.path.includes(orderedTest)),
    );

    // Sort the filtered tests according to the `order` array
    return filteredTests.sort((a, b) => {
      const indexA = order.indexOf(a.path);
      const indexB = order.indexOf(b.path);
      return indexA - indexB;
    });
  }

  /**
   * Sort test to determine order of execution
   * Sorting is applied after sharding
   */
  sortAlphabetically(tests) {
    // Test structure information
    // https://github.com/jestjs/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    const copyTests = [...tests];
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
  }

  /**
   * Sort tests randomly
   */
  sortRandomly(tests) {
    const copyTests = [...tests];
    return copyTests.sort(() => Math.random() - 0.5);
  }
}

module.exports = CustomSequencer;
