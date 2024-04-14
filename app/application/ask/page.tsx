export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-2 px-4 py-8">
      <h1 className="text-[32px] mb-2 font-bold">Coming Soon 🦺</h1>
      <p>We are working hard to build out the Ask feature.</p>
      <p>But if you have a question you want to ask Chomp, don't wait!</p>
      <p>
        Submit it{' '}
        <a
          className="text-pink font-bold"
          href="https://forms.gle/F2YAxcVtaWb6ANh49"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>{' '}
        and we will add it to the queue and reward you once the feature is
        ready!
      </p>
    </div>
  );
}
