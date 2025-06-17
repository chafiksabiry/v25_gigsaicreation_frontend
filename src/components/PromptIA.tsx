import React, { useState } from "react";
import { Send, Briefcase, Brain, HelpCircle, PlusCircle } from "lucide-react";
import { GigWorkflow } from "./GigWorkflow";
import { Suggestions } from "./Suggestions";
import { GigForm } from "./GigForm";
import { ConfirmGig } from "./ConfirmGig";
import type { ParsedGig, Gig } from "../lib/types";
import type { GigData } from "../types";
import { saveGigData } from "../lib/api";

interface GigFormProps {
  gig: ParsedGig;
  onSave: (updatedGig: ParsedGig) => void;
  onCancel: () => void;
}

function App() {
  const [naturalInput, setNaturalInput] = useState("");
  const [parsedGig, setParsedGig] = useState<ParsedGig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const generateDestinationZone = async (title: string, description: string, type: string) => {
    try {
      const response = await fetch('/api/generate-destination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category: type
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate destination zone');
      }

      const suggestions = await response.json();
      return suggestions[0] || ''; // Return the first suggested zone or empty string
    } catch (error) {
      console.error('Error generating destination zone:', error);
      return '';
    }
  };

  const parseGigDescription = async (input: string) => {
    setIsProcessing(true);
    try {
      const quantity = input.match(/\d+/)?.[0] || "0";
      const timeline = input.includes("week") ? "Weekly" : "Flexible";
      const type = input.toLowerCase().includes("sales")
        ? "Sales"
        : "Customer Service";

      const title = `${type} Campaign - ${quantity} Actions`;
      
      // Generate destination zone using AI
      const destinationZone = await generateDestinationZone(title, input, type);

      setParsedGig({
        title,
        quantity: parseInt(quantity),
        timeline: timeline,
        type: type,
        description: input,
        status: "draft",
        destination_zone: destinationZone
      });
    } catch (error) {
      console.error('Error parsing gig description:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalInput.trim()) {
      await parseGigDescription(naturalInput);
    }
  };

  const convertToGig = (parsedGig: ParsedGig): Gig => ({
    id: "",
    creator_id: "",
    title: parsedGig.title,
    description: parsedGig.description,
    type: parsedGig.type,
    quantity: parsedGig.quantity,
    timeline: parsedGig.timeline,
    requirements: [],
    skills_required: [],
    languages_required: [],
    kpis: [],
    compensation: {
      type: parsedGig.commission?.base || "",
      amount: parseFloat(parsedGig.commission?.baseAmount || "0"),
      currency: parsedGig.commission?.currency || "USD"
    },
    status: parsedGig.status || "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const handlePublish = async () => {
    if (!parsedGig) return;
    
    try {
      const gigData = convertToGigData(parsedGig);
      await saveGigData(gigData);
      setIsConfirming(false);
    } catch (error) {
      console.error("Error publishing gig:", error);
    }
  };

  const convertToGigData = (parsedGig: ParsedGig): GigData => ({
    userId: "",
    companyId: "",
    title: parsedGig.title,
    description: parsedGig.description,
    category: "",
    destination_zone: parsedGig.destination_zone || "",
    callTypes: [],
    highlights: [],
    requirements: {
      essential: [],
      preferred: []
    },
    benefits: [],
    availability: {
      schedule: [{
        day: "",
        hours: {
          start: "",
          end: ""
        },
      }],
      timeZones: [],
      flexibility: [],
      minimumHours: {
        daily: 8,
        weekly: 40,
        monthly: 160
      }
    },
    schedule: {
      schedules: [{
        day: "",
        hours: {
          start: "",
          end: ""
        }
      }],
      timeZones: [],
      flexibility: [],
      minimumHours: {
        daily: undefined,
        weekly: undefined,
        monthly: undefined
      }
    },
    commission: {
      base: "",
      baseAmount: "",
      bonus: "",
      bonusAmount: "",
      structure: "",
      currency: "USD",
      minimumVolume: {
        amount: "",
        period: "",
        unit: ""
      },
      transactionCommission: {
        type: "",
        amount: ""
      },
      kpis: []
    },
    leads: {
      types: [],
      sources: [],
      distribution: {
        method: "",
        rules: []
      },
      qualificationCriteria: []
    },
    skills: {
      languages: [{ language: "English", proficiency: "C1", iso639_1: "en" }],
      soft: [{
        skill: "Communication",
        level: 1
      }],
      professional: [{
        skill: "Brand Identity Design",
        level: 1
      }],
      technical: [{
        skill: "Adobe Illustrator",
        level: 1
      }],
      certifications: []
    },
    seniority: {
      level: "",
      yearsExperience: 0,
    },
    team: {
      size: 0,
      structure: [],
      territories: [],
      reporting: {
        to: "",
        frequency: ""
      },
      collaboration: []
    },
    tools: {
      provided: [],
      required: []
    },
    training: {
      initial: {
        duration: "",
        format: "",
        topics: []
      },
      ongoing: {
        frequency: "",
        format: "",
        topics: []
      },
      support: []
    },
    metrics: {
      kpis: [],
      targets: {},
      reporting: {
        frequency: "",
        metrics: []
      }
    },
    documentation: {
      templates: {},
      reference: {},
      product: [],
      process: [],
      training: []
    },
    compliance: {
      requirements: [],
      certifications: [],
      policies: []
    },
    equipment: {
      required: [],
      provided: []
    }
  });

  const handleGigUpdate = (updatedGig: ParsedGig) => {
    setParsedGig(updatedGig);
    setIsEditing(false);
    setIsConfirming(true);
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
                    {/* <button
                      type="button"
                      onClick={() => setShowSuggestions(true)}
                      className="text-green-600 hover:text-green-700 flex items-center text-sm"
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      View Suggestions
                    </button> */}

                    {/* <div className="flex justify-between items-center mb-6"> */}
                    <button
                      type="button"
                      onClick={() => (window.location.href="/app5")}
                      className="text-green-600 hover:text-green-700 flex items-center text-sm"
                    >
                      <PlusCircle className="w-5 h-5 mr-1" />
                      <span>Create Manually</span>
                    </button>
                    {/* </div> */}
                  </div>
                </div>

                {showGuidance && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Writing Tips</h3>
                    <ul className="text-sm text-blue-600 space-y-2">
                      <li>• Be specific about your target audience and location</li>
                      <li>• Mention key requirements and qualifications</li>
                      <li>• Include details about schedule and availability</li>
                      <li>• Specify any technical requirements or tools needed</li>
                      <li>• Describe the compensation structure if possible</li>
                    </ul>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    id="description"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder="Example: I need an experienced sales representative to make 50 callsper week for 3 months, targeting Spanish-speaking customers. Looking for 25% conversion rate to qualified leads."
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
              parsedGig ? (
                <ConfirmGig
                  gig={convertToGigData(parsedGig)}
                  onConfirm={handlePublish}
                  onCancel={() => setIsEditing(true)}
                />
              ) : null
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
                    <GigWorkflow
                      gig={convertToGig(parsedGig)}
                      onUpdate={(updatedGig) => {
                        setParsedGig({
                          ...parsedGig,
                          title: updatedGig.title,
                          description: updatedGig.description,
                          type: updatedGig.type,
                          quantity: updatedGig.quantity,
                          timeline: updatedGig.timeline,
                          status: updatedGig.status,
                          commission: {
                            base: updatedGig.compensation.type,
                            baseAmount: updatedGig.compensation.amount.toString(),
                            currency: updatedGig.compensation.currency,
                            minimumVolume: {
                              amount: "",
                              period: "",
                              unit: ""
                            },
                            transactionCommission: {
                              type: "",
                              amount: ""
                            }
                          }
                        });
                      }}
                    />
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
