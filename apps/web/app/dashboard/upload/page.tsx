import { UploadZone } from "@/components/upload/upload-zone";

export default function UploadPage() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Document</h1>
        <p className="text-slate-500 text-lg">
          Upload a document (invoice, receipt, CV, etc.) and our AI will automatically classify and extract data from it.
        </p>
      </div>

      <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <UploadZone />
      </div>
    </div>
  );
}
