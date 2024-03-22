export default async function Page({ params }: { params: { id: string } }) {
  return <div>{params.id} question page</div>;
}
