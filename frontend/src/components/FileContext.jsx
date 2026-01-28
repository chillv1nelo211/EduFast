import React, { createContext, useState } from "react";

export const FileContext = createContext(null);

export const FileProvider = ({ children }) => {
  const [file, setFile] = useState(null); // File object
  const [blobUrl, setBlobUrl] = useState(null); // URL.createObjectURL(file)
  const [extractedText, setExtractedText] = useState(""); // texto extraído por ProcessPDF
  const [preguntas, setPreguntas] = useState([]); // preguntas extraídas
  const [respuestas, setRespuestas] = useState({}); // respuestas por índice

  return (
    <FileContext.Provider
      value={{
        file,
        setFile,
        blobUrl,
        setBlobUrl,
        extractedText,
        setExtractedText,
        preguntas,
        setPreguntas,
        respuestas,
        setRespuestas,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
