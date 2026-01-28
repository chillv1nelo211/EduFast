import React, { useContext, useState } from "react";
import { FileContext } from "./FileContext";
import { Pdf } from "./Pdfview";
import { ProcessQuestion } from "../../wailsjs/go/main/App";

export default function MostarPdf() {
  const { blobUrl, preguntas, respuestas, setRespuestas } =
    useContext(FileContext);

  const [cargando, setCargando] = useState(false);

  const responderPregunta = async (index, pregunta) => {
    try {
      setCargando(true);

      const respuesta = await ProcessQuestion(pregunta);

      setRespuestas((prev) => ({
        ...prev,
        [index]: respuesta,
      }));
    } catch (err) {
      console.error("Error respondiendo pregunta:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {cargando && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-xl animate-pulse">
              Procesando respuesta...
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <h2 className="font-bold mb-2">Documento</h2>
        {blobUrl ? (
          <Pdf fileUrl={blobUrl} />
        ) : (
          <p>No hay archivo seleccionado.</p>
        )}
      </div>

      {preguntas && preguntas.length > 0 ? (
        preguntas.map((p, index) => (
          <ul key={index} className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
              Pregunta {index + 1}
            </li>

            <li className="list-row flex items-center justify-between w-full">
              <div>
                <div className="whitespace-pre-wrap text-2xl text-white">
                  {p}
                </div>
              </div>

              <button
                onClick={() => responderPregunta(index, p)}
                className="bg-green-700 w-[300px] border rounded border-[#060640] p-2"
              >
                Responder / Explicar
              </button>
            </li>

            {respuestas[index] && (
              <div className="mt-3 p-3 bg-base-100 border rounded">
                <h4 className="font-semibold">Respuesta:</h4>
                <p className="whitespace-pre-wrap text-white">
                  {respuestas[index]}
                </p>
              </div>
            )}
          </ul>
        ))
      ) : (
        <p className="text-gray-500">No se detectaron preguntas.</p>
      )}
    </div>
  );
}
