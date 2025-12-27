"use client";
import React, { useState } from "react";

const page = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.text);
      } else {
        setResponse("Error: " + data.message || data.error);
      }
    } catch (error) {
      setResponse("Error: Failed to connect to Gemini API");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-32 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Cyborg Robotics - AI Assistant
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="prompt"
              className="block text-gray-700 font-medium mb-2"
            >
              Ask Gemini AI about Robotics & Coding:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ask anything about robotics, coding, or STEM education..."
              disabled={loading}
            />
            <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-2">
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() =>
                  setPrompt("Explain the basics of robotics for kids")
                }
              >
                Basics of robotics
              </span>
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() =>
                  setPrompt(
                    "What are the best programming languages for beginners? "
                  )
                }
              >
                Programming languages
              </span>
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() =>
                  setPrompt("How to start learning AI and machine learning? ")
                }
              >
                AI/ML learning
              </span>
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() =>
                  setPrompt("Explain how coding can help in problem solving")
                }
              >
                Problem solving
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white font-medium ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Ask Gemini"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompt("");
                setResponse("");
              }}
              className="px-4 py-2 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium text-gray-700">Response:</h3>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <div className="text-gray-600 whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>

      <div className="text-center text-gray-600">
        <p>all the best for Your learning journey</p>
      </div>
    </div>
  );
};

export default page;
