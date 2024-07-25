import { getHistoryDecks } from "@/app/actions/history";
import History from "../History/History";

const HistoryList = async () => {
  const deckHistory = await getHistoryDecks();

  return <History deckHistory={deckHistory} />;
};

export default HistoryList;
