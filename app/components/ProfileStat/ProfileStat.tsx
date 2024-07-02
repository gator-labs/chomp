import { ReactElement } from "react";
import { InfoIcon } from "../Icons/InfoIcon";

type ProfileStatProps = {
  icon: ReactElement;
  label: string;
  value: string;
};

export function ProfileStat({ icon, label, value }: ProfileStatProps) {
  return (
    <div>
      <div>{icon}</div>
      <div>
        <div>{label}</div>
        <div>
          <div>{value}</div>
          <button>
            <InfoIcon height={24} width={24} fill="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
