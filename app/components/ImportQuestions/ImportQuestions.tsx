"use client";
import { useToast } from "@/app/providers/ToastProvider";
import {
  QuestionImportModel,
  questionImportSchema,
} from "@/app/schemas/questionImport";
import { processCsv } from "@/app/utils/file";
import { formatErrorsToString } from "@/app/utils/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { ZodError } from "zod";
import { Button } from "../ui/button";
import { DataTable } from "../DataTable/DataTable";
import { columns, questionImportColumns } from "./Columns";

type ImportQuestionsProps = {
  action: (data: QuestionImportModel[]) => Promise<void>;
};

export function ImportQuestions({ action }: ImportQuestionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<QuestionImportModel[]>([]);
  const [errors, setErrors] = useState<ZodError[]>([]);

  const { errorToast } = useToast();

  const handleCsvProcessAsync = async (file: File) => {
    const result = await processCsv<QuestionImportModel>(
      file,
      questionImportColumns,
      questionImportSchema,
    );

    setValues(result.values);
    setErrors(result.errors);
    if (result.errors.length > 0) {
      const errorsStrings = result.errors.map((error) =>
        formatErrorsToString({ success: false, error }),
      );
      errorToast("Errors found", errorsStrings.join("\n"));
    }

    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    handleCsvProcessAsync(e.target.files[0]);
  };

  const handleSave = async () => {
    if (errors?.length > 0) {
      return;
    }

    await action(values);
  };

  return (
    <div>
      <div className="flex justify-between gap-2 mb-2">
        <div className="basis-1/3">
          <Button
            disabled={errors.length > 0}
            isFullWidth
            onClick={() => handleSave()}
          >
            Save
          </Button>
        </div>
        <div className="basis-1/3">
          <label
            className="cursor-pointer block w-full text-center bg-primary text-gray-900 rounded-lg py-3"
            htmlFor="fileInput"
          >
            Import
          </label>
          <input
            ref={fileInputRef}
            multiple={false}
            className="hidden"
            id="fileInput"
            type="file"
            accept=".csv"
            onInput={handleFileChange}
          />
        </div>
        <div className="basis-1/3">
          <Link target="_blank" href="/templates/question-template.csv">
            <Button isFullWidth>Download template</Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={values}></DataTable>
    </div>
  );
}
