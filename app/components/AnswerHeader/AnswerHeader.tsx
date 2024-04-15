"use client";

import { QuestionTag, Tag as TagType } from "@prisma/client";
import { useState } from "react";
import { FilterIcon } from "../Icons/FilterIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import { Modal } from "../Modal/Modal";
import { Tag } from "../Tag/Tag";

export type AnswerHeaderProps = {
  questionTags: (QuestionTag & { tag: TagType })[];
};

export const AnswerHeader: React.FC<AnswerHeaderProps> = ({ questionTags }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <div className="flex justify-between mb-5">
      <div className="flex gap-2">
        {questionTags.map((questionTag) => (
          <Tag tag={questionTag.tag.tag} isSelected key={questionTag.id} />
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div onClick={() => setIsInfoModalOpen(true)}>
          <InfoIcon width={30} height={30} />
        </div>
        <FilterIcon width={30} height={30} />
      </div>

      <Modal
        title="How Chomp works"
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      >
        <p className="mb-3">
          Chomp takes your responses of the 1st Order Question (your response to
          the statement/question), and the 2nd Order Question (your best guess
          of how others would respond to the statement/question), and puts it
          through a distillation social consensus mechanism that infer the most
          likely right answer of the question. This mechanism works even when
          most of the participants do not know what the right answer is.
        </p>

        <p>
          Chomp&apos;s mechanism is driven by empirical research around the
          &quot;Wisdom of the Crowd&quot; problem. We are adapting this
          mechanism for several question and polling formats that will be rolled
          out on Chomp.
        </p>
      </Modal>
    </div>
  );
};
