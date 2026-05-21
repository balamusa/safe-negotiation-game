import ReactMarkdown from "react-markdown";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  const content = await getContent("mentor");

  return (
    <main className="min-h-screen bg-amber-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
          <div className="prose prose-gray max-w-none text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_strong]:text-gray-900">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}
