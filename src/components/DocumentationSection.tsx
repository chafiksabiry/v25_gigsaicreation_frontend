import React, { useRef, useState } from "react";
import { Cloudinary } from "cloudinary-core";
import { InfoText } from "./InfoText";
import {
  Trash2,
  FileText,
  Upload,
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen,
  Briefcase,
  GraduationCap,
  CheckCircle,
  File,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface Document {
  name: string;
  url: string;
  uploading?: boolean;
}

interface DocumentationSectionProps {
  data: {
    product: Document[];
    process: Document[];
    training: Document[];
  };
  onChange: (data: any) => void;
  skipValidation?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onReview?: () => void;
  isLastSection?: boolean;
}

export function DocumentationSection({
  data,
  onChange,
  skipValidation = false,
  onNext,
  onPrevious,
  onReview,
  isLastSection = false,
}: DocumentationSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentUpload, setCurrentUpload] = useState<{
    type: string;
    name: string;
  } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileUpload = async (type: keyof typeof data, file: File) => {
    setUploadError(null);
    console.log("Uploading file:", file);

    // Vérification de la taille du fichier uniquement si skipValidation est false
    if (!skipValidation) {
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          "File size exceeds 20MB limit. " +
            "For large files, please consider:\n" +
            "1. Splitting the document into smaller parts\n" +
            "2. Using a file compression tool before uploading\n" +
            "3. Converting to a more efficient format"
        );
        return;
      }

      // Vérification du type de fichier uniquement si skipValidation est false
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(file.type)) {
        setUploadError(
          "Invalid file type. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX files."
        );
        return;
      }
    }

    try {
      let fileToUpload = file;

      // If file is PDF and larger than 10MB, attempt compression
      if (file.type === "application/pdf" && file.size > 10 * 1024 * 1024) {
        try {
          // Read the file as ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          // Create a new Blob with the same content
          const compressedBlob = new Blob([arrayBuffer], { type: file.type });
          // Create a new File from the Blob
          fileToUpload = new (File as any)([compressedBlob], file.name);
        } catch (error) {
          console.warn(
            "Compression failed, proceeding with original file:",
            error
          );
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "bf1katla");

      // Upload vers Cloudinary - using raw upload endpoint for documents
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dyqg8x26j/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Error: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Upload result:", result);

      if (result.secure_url) {
        const docUrl = result.secure_url; // URL générée par Cloudinary

        // Créer un objet Document avec un URL par défaut
        const newDoc: Document = {
          name: file.name,
          url: docUrl, // L'URL est initialement vide
          uploading: true,
        };

        // Ajouter le document avec l'URL vide à l'UI
        onChange({ ...data, [type]: [...data[type], newDoc] });
        setCurrentUpload({ type, name: file.name });

        // Mise à jour de l'URL du document
        // const docIndex = data[type].findIndex(doc => doc.name === file.name && doc.uploading);
        // if (docIndex !== -1) {
        //   const newDocs = [...data[type]];
        //   newDocs[docIndex] = { name: file.name, url: docUrl, uploading: false };
        //   onChange({ ...data, [type]: newDocs });
        // }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload file. Please try again."
      );
      onChange({
        ...data,
        [type]: data[type].filter(
          (doc) => doc.name !== file.name || !doc.uploading
        ),
      });
    } finally {
      setCurrentUpload(null);
    }
  };

  const handleRemove = async (type: keyof typeof data, index: number) => {
    const newDocs = [...data[type]];
    newDocs.splice(index, 1);
    onChange({
      ...data,
      [type]: newDocs,
    });
  };

  const triggerFileUpload = (type: keyof typeof data) => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-type", type);
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const type = e.target.getAttribute("data-type") as keyof typeof data;

    if (files && files.length > 0 && type) {
      handleFileUpload(type, files[0]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getDocTypeIcon = (type: keyof typeof data) => {
    switch (type) {
      case "product":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "process":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case "training":
        return <GraduationCap className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getDocTypeColor = (type: keyof typeof data) => {
    switch (type) {
      case "product":
        return "from-blue-50 to-indigo-50";
      case "process":
        return "from-purple-50 to-pink-50";
      case "training":
        return "from-emerald-50 to-teal-50";
    }
  };

  const renderDocumentList = (type: keyof typeof data, title: string) => (
    <div className={`bg-gradient-to-r ${getDocTypeColor(type)} rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg">
          {getDocTypeIcon(type)}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            {type === "product" && "Product specifications and user guides"}
            {type === "process" &&
              "Standard operating procedures and workflows"}
            {type === "training" && "Training materials and resources"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data[type].map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="p-2 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doc.name}
              </p>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Document</span>
                </a>
              )}
            </div>
            {currentUpload?.type === type &&
            currentUpload?.name === doc.name ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <button
                onClick={() => handleRemove(type, index)}
                className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => triggerFileUpload(type)}
          className="w-full flex items-center justify-center gap-2 p-3 text-gray-700 bg-white/80 hover:bg-white rounded-lg border-2 border-dashed border-gray-300 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Upload {title}</span>
        </button>
      </div>

      {data[type].length > 0 && (
        <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Documents:</span>
            <span className="font-medium text-gray-900">
              {data[type].length}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const isValid = Object.values(data).some((docs) => docs.length > 0);

  const handlePublishGig = async () => {
    try {
      setIsPublishing(true);
      const gigData = {
        title: "Gig Documentation", // You might want to get this from props or state
        description:
          "Documentation for products, processes, and training materials",
        documents: data,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gigData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish gig");
      }

      const result = await response.json();
      console.log("Gig published successfully:", result);
    } catch (error) {
      console.error("Error publishing gig:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to publish gig. Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {uploadError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600 whitespace-pre-line">
              {uploadError}
            </p>
          </div>
        </div>
      )}

      <InfoText className="bg-blue-50 border-blue-100 text-blue-800">
        Upload and manage documentation for products, processes, and training
        materials. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.
      </InfoText>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileInputChange}
      />

      <div className="grid grid-cols-1 gap-6">
        {renderDocumentList("product", "Product Documentation")}
        {renderDocumentList("process", "Process Guides")}
        {renderDocumentList("training", "Training Materials")}
      </div>

      {/* Summary */}
      {Object.values(data).some((docs) => docs.length > 0) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Documentation Summary
          </h4>
          <div className="space-y-2">
            {Object.entries(data).map(
              ([type, docs]) =>
                docs.length > 0 && (
                  <div key={type} className="flex items-center gap-2">
                    {getDocTypeIcon(type as keyof typeof data)}
                    <span className="text-sm text-gray-600">
                      {docs.length} {type} document{docs.length > 1 ? "s" : ""}{" "}
                      uploaded
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  </div>
                )
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          // onClick={handlePublishGig}
          onClick={() => (window.location.href = "/gigs")}
          // disabled={isPublishing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish Gig
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
