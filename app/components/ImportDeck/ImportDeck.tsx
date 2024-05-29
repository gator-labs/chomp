"use client";
import { DeckImportModel, deckImportSchema } from "@/app/schemas/deckImport";
import { processCsv } from "@/app/utils/file";
import { formatErrorsToString } from "@/app/utils/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ZodError } from "zod";
import { Button } from "../Button/Button";
import { DataTable } from "../DataTable/DataTable";
import { columns, deckImportColumns } from "./Columns";

type ImportDeckProps = {
  action: (data: DeckImportModel[]) => Promise<void>;
};

export function ImportDeck({ action }: ImportDeckProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<DeckImportModel[]>([]);
  const [errors, setErrors] = useState<ZodError[]>([]);

  const handleCsvProcessAsync = async (file: File) => {
    const result = await processCsv<DeckImportModel>(
      file,
      deckImportColumns,
      deckImportSchema,
    );

    setValues(result.values);
    setErrors(result.errors);
    if (result.errors.length > 0) {
      const errorsStrings = result.errors.map((error) =>
        formatErrorsToString({ success: false, error }),
      );
      toast.error(
        <div>
          {errorsStrings.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>,
        { style: { width: 1280, left: -484 } },
      );
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
            className="cursor-pointer block w-full text-center bg-primary text-btn-text-primary rounded-lg py-3"
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
          <Link target="_blank" href="/templates/deck-template.csv">
            <Button isFullWidth>Download template</Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={values}></DataTable>
      <ToastContainer position="bottom-center" autoClose={false} />
    </div>
  );
}
