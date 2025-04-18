import InfoDrawer from "@/app/components/InfoDrawer/InfoDrawer";

type SecondOrderAnswerInfoDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SecondOrderAnswerInfoDrawer({
  isOpen,
  onClose,
}: SecondOrderAnswerInfoDrawerProps) {
  return (
    <InfoDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Your second order answer"
    >
      <div className="text-sm mb-6 space-y-4">
        <p>
          The second order answer represent what a player predicted OTHERS would
          guess.
        </p>
        <p>
          We take the average of each user&apos;s prediction to generate this
          result. Mathematically this won&apos;t always add up to 100%!
        </p>
      </div>
    </InfoDrawer>
  );
}
