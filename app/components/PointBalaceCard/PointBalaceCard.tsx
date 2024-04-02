type PointBalaceCardProps = {
  amount: number;
};

export default function PointBalaceCard({ amount }: PointBalaceCardProps) {
  return (
    <div className="flex justify-between items-center rounded-full px-6 py-4 bg-[#333]">
      <span className="text-s leading-4">Chomp Points</span>

      <span className="text-s leading-4">
        <span className="font-bold">{amount}</span> Pts
      </span>
    </div>
  );
}
