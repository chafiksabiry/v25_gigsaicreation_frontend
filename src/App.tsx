import React, { useState } from "react";
import { Send, Briefcase, Brain, HelpCircle, PlusCircle } from "lucide-react";
import { GigWorkflow } from "./components/GigWorkflow";
import { Suggestions } from "./components/Suggestions";
import { GigForm } from "./components/GigForm";
import { ConfirmGig } from "./components/ConfirmGig";
import type { ParsedGig } from "./lib/types";

function App() {
  const [naturalInput, setNaturalInput] = useState("");
  const [parsedGig, setParsedGig] = useState<ParsedGig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const parseGigDescription = (input: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const quantity = input.match(/\d+/)?.[0] || "0";
      const timeline = input.includes("week") ? "Weekly" : "Flexible";
      const type = input.toLowerCase().includes("sales")
        ? "Sales"
        : "Customer Service";

      setParsedGig({
        title: `${type} Campaign - ${quantity} Actions`,
        quantity: parseInt(quantity),
        timeline: timeline,
        type: type,
        description: input,
        status: "draft",
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalInput.trim()) {
      parseGigDescription(naturalInput);
    }
  };

  const handleGigUpdate = (updatedGig: ParsedGig) => {
    setParsedGig(updatedGig);
    setIsEditing(false);
    setIsConfirming(true);
  };

  const handlePublish = () => {
    if (parsedGig) {
      setParsedGig({ ...parsedGig, status: "published" });
      setIsConfirming(false);
    }
  };

  if (showSuggestions) {
    return (
      <Suggestions
        input={naturalInput}
        onBack={() => setShowSuggestions(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
      {/* Button at the top left */}
      <button
  type="button"
  onClick={() => (window.location.href = "/gigs")}
  className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 z-10"
>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
  </svg>
  <span>Back to Gigs</span>
</button>

      <div className="max-w-4xl mx-auto pt-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create a New Gig on HARX
          </h1>
          <p className="text-lg text-gray-600">
            Describe your needs naturally, and let AI structure your gig posting
          </p>
        </div>

        {!parsedGig && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Describe your needs naturally
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowGuidance(!showGuidance)}
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Writing Tips
                    </button>
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/gigsmanual")}
                      className="text-green-600 hover:text-green-700 flex items-center text-sm"
                    >
                      <PlusCircle className="w-5 h-5 mr-1" />
                      <span>Create Manually</span>
                    </button>
                  </div>
                </div>

                {showGuidance && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                    <h4 className="font-medium mb-2">
                      How to describe your gig effectively:
                    </h4>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <span className="font-medium">Desired Outcome:</span>{" "}
                        Specify the expected results (e.g., "I need 100 sales
                        calls that convert at least 20% to qualified leads")
                      </li>
                      <li>
                        <span className="font-medium">Timeline:</span> Include
                        your timeframe (e.g., "within the next 2 weeks" or "over
                        a 3-month period")
                      </li>
                      <li>
                        <span className="font-medium">Requirements:</span>{" "}
                        Mention any specific skills or qualifications (e.g.,
                        "must have insurance sales experience and speak fluent
                        Spanish")
                      </li>
                      <li>
                        <span className="font-medium">Example:</span>
                        "I need an experienced insurance sales representative to
                        make 50 calls per week for 3 months, targeting
                        Spanish-speaking customers. Looking for 25% conversion
                        rate to qualified leads."
                      </li>
                    </ul>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    id="description"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder="Example: I need an experienced sales representative to make 50 calls per week for 3 months, targeting Spanish-speaking customers. Looking for 25% conversion rate to qualified leads."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    onClick={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        naturalInput.trim() &&
                        !isProcessing
                      ) {
                        setShowSuggestions(true);
                      }
                    }}
                    disabled={!naturalInput.trim() || isProcessing}
                    className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {isProcessing && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
              <span className="text-gray-600">Processing your request...</span>
            </div>
          </div>
        )}

        {parsedGig && !isProcessing && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            {isEditing ? (
              <GigForm
                gig={parsedGig}
                onSave={handleGigUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : isConfirming ? (
              <ConfirmGig
                gig={parsedGig}
                onConfirm={handlePublish}
                onEdit={() => setIsEditing(true)}
              />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                    Gig Details
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Title
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {parsedGig.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Quantity
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {parsedGig.quantity} actions
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Timeline
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {parsedGig.timeline}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Type
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {parsedGig.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {parsedGig.description}
                      </p>
                    </div>
                  </div>
                </div>

                {parsedGig.status === "draft" && (
                  <div className="mt-8">
                    <button
                      onClick={() => setIsConfirming(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Briefcase className="w-5 h-5" />
                      <span>Review & Publish</span>
                    </button>
                  </div>
                )}

                {parsedGig.status === "published" && (
                  <div className="mt-8">
                    <GigWorkflow gig={parsedGig} onUpdate={setParsedGig} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
