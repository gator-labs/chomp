export default function BotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-sora bg-[#0D0D0D] text-white flex justify-center">
      {children}
    </div>
  );
}
