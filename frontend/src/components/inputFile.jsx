import React, { useContext } from "react";
import { FileContext } from "./FileContext";

// importa tus funciones de Go (Wails)
import { ProcessPDF, ExtractQuestions } from "../../wailsjs/go/main/App";

export const InputFile = () => {
  const { setFile, setBlobUrl, setExtractedText, setPreguntas, setRespuestas } =
    useContext(FileContext);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

  
    setRespuestas({});

    setFile(file);

   
    const url = URL.createObjectURL(file);
    setBlobUrl(url);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];

       
        const result = await ProcessPDF(base64);

        if (!result.ok) {
          setExtractedText(" ERROR: " + result.error);
          setPreguntas([]);
          return;
        }

       
        setExtractedText(result.text || "");

     
        const q = await ExtractQuestions(result.text || "");
        setPreguntas(q || []);
      } catch (err) {
        console.error("Error procesando PDF:", err);
        setExtractedText("Error inesperado");
        setPreguntas([]);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div class="flex items-center justify-center w-full">
      <div
        for="dropzone-file"
        class="flex flex-col items-center justify-center w-3/5 h-64 bg-[#2C2C47] rounded-xl cursor-pointer hover:bg-neutral-tertiary-medium border border-[#060640]"
      >
        <div class="flex flex-col items-center justify-center text-body pt-5 pb-6">
          <svg
            class="w-8 h-8 mb-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
            />
          </svg>
          <p class="mb-2 text-sm">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="mb-4"
        />
      </div>
    </div>
  );
};
