import {
  generateBinaryTestQuestion,
  generateMultipleChoiceTestQuestion,
} from "@/app/actions/question/generateTestQuestion";
import AdminBinaryQuestionGeneratorForm from "@/app/components/AdminBinaryQuestionGeneratorForm/AdminBinaryQuestionGeneratorForm";
import AdminMultiChoiceQuestionGeneratorForm from "@/app/components/AdminMultiChoiceQuestionGeneratorForm/AdminMultiChoiceQuestionGeneratorForm";

export default async function Page() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-black text-white overflow-hidden">
      <h1 className="text-4xl font-semibold text-center mb-8">
        Staging Database Commands
      </h1>

      {/* Binary Question Generator Form */}
      <div className="space-y-6">
        <AdminBinaryQuestionGeneratorForm action={generateBinaryTestQuestion} />
      </div>

      {/* Multiple Choice Question Generator Form */}
      <div className="space-y-6">
        <AdminMultiChoiceQuestionGeneratorForm
          action={generateMultipleChoiceTestQuestion}
        />
      </div>
    </div>
  );
}
