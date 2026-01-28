import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.js?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export const Pdf = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const zoomIn = () => setScale((prev) => prev + 0.2);
  const zoomOut = () => setScale((prev) => (prev > 0.5 ? prev - 0.2 : prev));

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap bg-gray-100 p-3 rounded-lg shadow">
        <button onClick={zoomOut} className="px-3 py-1 bg-gray-300 rounded">
          ➖ Zoom
        </button>

        <button onClick={zoomIn} className="px-3 py-1 bg-gray-300 rounded">
          ➕ Zoom
        </button>

        <span className="font-medium">
          {numPages ? `Total: ${numPages} páginas` : "Cargando..."}
        </span>
      </div>

      <div
        className="
          h-[450px]    /* ⚡ tamaño moderado */
          w-full 
          overflow-y-scroll 
          overflow-x-hidden 
          border 
          rounded-lg 
          p-4 
          bg-white 
          shadow-inner
        "
      >
        {loading && (
          <p className="text-center text-gray-500 animate-pulse">
            Cargando PDF...
          </p>
        )}

        {fileUrl && (
          <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
            {numPages &&
              Array.from({ length: numPages }, (_, i) => (
                <div key={i} className="mb-6 flex justify-center">
                  <Page
                    pageNumber={i + 1}
                    scale={scale}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="shadow-md"
                  />
                </div>
              ))}
          </Document>
        )}
      </div>
    </div>
  );
};
