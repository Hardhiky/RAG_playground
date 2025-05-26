import React, { useState, useEffect } from "react";
import axios from "axios";

interface Source {
  text: string;
  score: number;
  source: string;
}

interface RAGResult {
  answer: string;
  sources: Source[];
  latency: number;
}

interface Results {
  [key: string]: RAGResult;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [querying, setQuerying] = useState<boolean>(false);
  const [uploadedDocs, setUploadedDocs] = useState<
    { filename: string; doc_id: string }[]
  >([]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFile = async () => {
    if (!files.length) return alert("Please select at least one PDF file.");
    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post("http://localhost:8000/upload/", formData);
      setUploadedDocs(res.data.uploaded_files);
      alert(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error("Upload failed:", error); // Now using the error
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return alert("Please enter a query.");
    if (models.length === 0)
      return alert("Please select at least one RAG architecture.");

    setQuerying(true);

    try {
      const res = await axios.post("http://localhost:8000/query/", {
        query,
        models,
      });
      setResults(res.data);
    } catch (error) {
      console.error("Query failed:", error); // Now using the error
      alert("Query failed. Please try again.");
    } finally {
      setQuerying(false);
    }
  };

  const toggleModel = (name: string) => {
    setModels((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-200">
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <section className="text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-indigo-400">
            RAG Architectures Playground
          </h1>
          <p className="text-gray-400">
            Compare different RAG pipelines with multiple PDFs
          </p>
        </section>

        {/* Upload Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Upload PDFs
          </h2>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              multiple
              className="block w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={uploadFile}
              disabled={uploading || !files.length}
              className={`px-6 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 disabled:bg-indigo-800 transition ${
                uploading ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Processing..." : "Upload & Process"}
            </button>
          </div>

          {/* Uploaded Files List */}
          {uploadedDocs.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-gray-300 mb-2">
                Uploaded Documents:
              </p>
              <ul className="space-y-1">
                {uploadedDocs.map((doc, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-400 flex items-center"
                  >
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {doc.filename}
                    <span className="ml-2 text-xs text-gray-500">
                      ({doc.doc_id.slice(0, 8)}...)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Query Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Ask a Question
          </h2>

          <div className="mb-4">
            <label htmlFor="query" className="block text-gray-300 mb-2">
              Your Query
            </label>
            <textarea
              id="query"
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question about the uploaded documents..."
              className="w-full rounded border border-gray-600 p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <p className="font-medium text-gray-300 mb-2">
              Select RAG Architectures:
            </p>
            <div className="flex flex-wrap gap-4">
              {["basic", "self_query", "reranker"].map((model) => (
                <label
                  key={model}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-500"
                    checked={models.includes(model)}
                    onChange={() => toggleModel(model)}
                  />
                  <span className="ml-2 capitalize text-gray-300">
                    {model.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuery}
            disabled={querying}
            className={`w-full bg-indigo-600 text-white font-semibold px-6 py-3 rounded hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 disabled:bg-indigo-800 transition ${
              querying ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {querying ? "Analyzing..." : "Get Answers"}
          </button>
        </section>

        {/* Results Section */}
        {results && (
          <section className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
              Results Comparison
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(results).map(([model, res]) => (
                <div
                  key={model}
                  className="border border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-all bg-gray-800"
                >
                  <h3 className="text-xl font-semibold mb-3 text-indigo-400 capitalize">
                    {model}
                  </h3>

                  <div className="mb-3">
                    <p className="text-sm text-gray-400">
                      <strong>Latency:</strong> {res.latency.toFixed(2)}s
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Sources:</strong> {res.sources.length}
                    </p>
                  </div>

                  <p className="mb-4 text-gray-100">
                    <strong>Answer:</strong> {res.answer}
                  </p>

                  <div className="mb-3">
                    <strong className="text-sm text-gray-400">
                      Context Snippets:
                    </strong>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {res.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-gray-700 p-2 rounded border border-gray-600"
                        >
                          <p className="text-gray-300">
                            {source.text.substring(0, 100)}...
                          </p>
                          <p className="text-indigo-400 mt-1">
                            {source.source} • Score: {source.score.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
