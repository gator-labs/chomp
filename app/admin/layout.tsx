import { AdminTabNavigation } from "../components/AdminTabNavigation/AdminTabNavigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <AdminTabNavigation />
      <main>{children}</main>
    </div>
  );
}
