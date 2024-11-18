import StackCard from "@/app/components/StackCard/StackCard";
import StacksHeader from "@/app/components/StacksHeader/StacksHeader";
import { getAllStacks, getDailyDecks } from "@/app/queries/stack";

const StacksPage = async () => {
  const [stacks, dailyDecks] = await Promise.all([
    getAllStacks(),
    getDailyDecks(),
  ]);

  return (
    <div className="pt-4 flex flex-col gap-8 overflow-hidden w-full max-w-lg mx-auto px-4">
      <StacksHeader backAction="back" heading="Stacks" />
      <ul className="flex flex-col gap-2 pb-2 overflow-auto">
        <StackCard
          imageSrc={"/images/chompy.png"}
          decksToAnswer={dailyDecks.decksToAnswer?.length}
          decksToReveal={dailyDecks.decksToReveal?.length}
          name="Daily Decks"
          id="daily-deck"
          numberOfDecks={dailyDecks.length}
        />
        {stacks.map((stack) => (
          <StackCard
            key={stack.id}
            imageSrc={stack.image}
            decksToAnswer={stack.decksToAnswer?.length}
            decksToReveal={stack.decksToReveal?.length}
            name={stack.name}
            id={stack.id}
            numberOfDecks={stack.decks.length}
          />
        ))}
      </ul>
    </div>
  );
};

export default StacksPage;
