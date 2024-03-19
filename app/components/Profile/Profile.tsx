export function Profile() {
  return <pre>{JSON.stringify(session.data, null, 2)}</pre>;
}
