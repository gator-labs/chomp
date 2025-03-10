# CHOMP

CHOMP, a gamified social consensus platform that gets you best-in-class insights.

For the user, it's a fast-play quiz, polling or trivia game that gets you the most likely answers to a question. Under the hood, we implement a set of social consensus mechanisms adapted from empirical research around the wisdom of the crowd problem. Through first giving your own answer, and then your perception of others’ answer to the same question, we can obtain the true state of the world, even when most players of the game do not know what that true state is.

CHOMP is the first mini-game product created by Gator Labs. We intend to build out more gamified applications that feed into Gator's underlying reputation graph and data layer, which would be composable with businesses looking to build with a reputation graph or highly accurate information that benefits their end users.

## Play the game

[CHOMP now](https://app.chomp.games/)

## Getting started

Prerequisites:

- Install Docker
- Create a [Dynamic](https://www.dynamic.xyz/) account
- Solana RPC like Helius
- Solana account priv key for the Treasury
- Redis 

```sh
# install dependencies
$ yarn

# setup environment variables
$ cp .env.example .env.local

# start DB
$ yarn compose:db:up

# run migrations
$ yarn prisma:migrate

# start the app
$ yarn dev
```

## How CHOMP works

CHOMP takes your responses of the 1st Order Question (your response to the statement/question), and the 2nd Order Question (your perceived sentiment of how others would respond to the statement/question), and puts them through Gator's novel mechanism that infer the most likely right answer of the question.

CHOMP's mechanism is driven by empirical research around the "[Wisdom of the Crowd](https://arxiv.org/pdf/2102.02666.pdf)" problem. We are adapting this mechanism for several question formats and rolling them out gradually on CHOMP

The components of CHOMP include:

- NextJS dapp frontend
- Dynamic Wallet for auth and signing
- Integrated with SPL for token transfers and burning

### User journey

CHOMP is two sided, including people who ask questions and people who answer questions. Question askers are often representing a company that wants to engage the public with their brand. Question answerers are often regular people with some amount of knowledge.

1. Question asker deposits capital to fund engagement rewards
2. Question asker asks questions
3. CHOMPer CHOMPs one or more questions
4. At some point in the future, the question answer can be revealed after burning $BONK
5. User rewarded if they got the answer correct

![CHOMP Overview](./docs/ChompOverview.jpg)

### Wisdom of the Crowd

This is the code used in the "Suprisingly Popular" algorithm underlying our first prediction algorithm. 

```py
def get_SP_answer_binary(first_order_percent_A, first_order_percent_B, second_order_percent_A, second_order_percent_B):

    a = first_order_percent_A - second_order_percent_A
    b = first_order_percent_B - second_order_percent_B

    if a > b:
        answer = 'A'
    elif b > a:
        answer = 'B'
    else:
        answer = 'Tie'

    return answer
```

We are in the process of adapting another set of "[Wisdom of the Crowd](https://arxiv.org/pdf/2102.02666.pdf)" mechanisms for multiple-choice questions.


### **Core Entities**
1. **User**: Represents the players participating in CHOMP. A user has attributes like `firstName`, `lastName`, `username`, linked wallets, emails, and their game history.
2. **Wallet**: Links blockchain addresses to a specific user. Each wallet is uniquely identified and tied to its user.
3. **Question**: Stores the trivia, polling, or quiz questions. Includes metadata like type, correct answers, and associated rewards.
4. **Deck**: Groups questions into thematic sets or campaigns, such as daily challenges or sponsored decks.
5. **MysteryBox**: Tracks rewards (e.g., tokens, credits) and the conditions under which they are claimed or triggered. In the DB, this is split up into MysteryBox, MysteryBoxPrize, MysteryBoxTrigger, and MysteryBoxAllowlist.
6. **ChompResult**: Logs game outcomes, such as whether a user revealed an answer, burned tokens, or claimed a reward.

### **Key Relationships**
- **User and Wallet**: A one-to-many relationship, as a user can have multiple wallets.
- **User and QuestionAnswer**: Tracks which questions a user has answered and the accuracy of their responses.
- **Question and QuestionOption**: Each question has multiple options, with specific attributes marking the correct or calculated correct answers.
- **Deck and Question**: A many-to-many relationship via `DeckQuestion`, linking questions to decks for structured gameplay.
- **MysteryBox and MysteryBoxPrize**: A one-to-many relationship defining the rewards contained in each box.


## Testing

SPL token interaction is thoroughly tested for transfer and burn correctness. [Bankrun](https://github.com/kevinheavey/solana-bankrun/tree/main) is used for testing on-chain transactions. See `__tests__` for code.

```sh
# Setup test environment
cp .env.example .env.test

# Run tests
yarn test
```

## Restoring database

To restore the database from the backup file, follow the below steps:

1. Add a backup file in the scripts folder
2. Rename it to `backup.sql.gz`
3. Make sure that DATABASE_URL env is set to the target database for restoration
4. Verify that the DATABASE_URL is clean, without extra parameters (e.g., it should look like postgresql://postgres:postgres@localhost:5432/chomp-db). Please remove `?schema=public` too.

**Run the following command**
```sh
yarn dev:restore-db
```

If you see a “restore successful” message, you can safely ignore some errors. After verifying the restored database, don’t forget to remove the backup file.

## Add Users in MysteryBox Allowlist

1. Add a csv file in the scripts folder (only addresses, no header)
2. Make sure the name of file is `allowlist.csv`
3. Verify the DATABASE_URL env

**Run the following command**
```sh
yarn dev:add-allowlist-users
```

> Tag: It's entitled to certain campaign or group.

Input any tags if you want else you can skip by enter. You will receive success message.
