/**
 * This component is used to display an error message when a deck cannot be loaded.
 * It has a button to try again.
 */
export default function ErrorDeck({ refetch }: { refetch: () => void }) {
  return (
    <span
      key={0}
      className="flex items-center justify-center gap-2 text-sm text-gray-400 py-8"
    >
      Unable to load decks.{" "}
      <button
        onClick={() => {
          refetch();
        }}
        className="underline hover:text-gray-200"
      >
        Try Again
      </button>
    </span>
  );
}
