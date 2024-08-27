type TabsProps = {
  tabs: string[];
  activeTab: number;
  setActiveTab: (tab: number) => void;
};
export default function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="flex w-full bg-neutral-700 p-1 rounded-3xl">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`flex-1 py-2 px-5 rounded-3xl ${
            index === activeTab
              ? "bg-white text-neutral-800"
              : "text-neutral-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
