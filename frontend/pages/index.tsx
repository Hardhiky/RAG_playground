import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);
    await axios.post("http://localhost:8000/upload/", formData);
  };

  const handleQuery = async () => {
    const res = await axios.post("http://localhost:8000/query/", {
      query,
      models,
    });
    setResults(res.data);
  };

  const toggleModel = (name) => {
    setModels(
      models.includes(name)
        ? models.filter((m) => m !== name)
        : [...models, name],
    );
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border p-2"
      />

      <div>
        <label>
          <input type="checkbox" onChange={() => toggleModel("basic")} /> Basic
        </label>
        <label>
          <input type="checkbox" onChange={() => toggleModel("self_query")} />{" "}
          Self-Query
        </label>
        <label>
          <input type="checkbox" onChange={() => toggleModel("reranker")} />{" "}
          Reranker
        </label>
      </div>

      <button
        onClick={handleQuery}
        className="bg-blue-500 text-white px-4 py-2"
      >
        Submit
      </button>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(results).map(([model, res]: any) => (
            <div className="p-4 border rounded" key={model}>
              <h3 className="text-lg font-bold">{model.toUpperCase()}</h3>
              <p>
                <strong>Latency:</strong> {res.latency}s
              </p>
              <p>
                <strong>Answer:</strong> {res.answer}
              </p>
              <p>
                <strong>Context:</strong>{" "}
                <pre className="whitespace-pre-wrap">{res.context}</pre>
              </p>
              {res.reranker_score && (
                <p>
                  <strong>Reranker Score:</strong> {res.reranker_score}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
