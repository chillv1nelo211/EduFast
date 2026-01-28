import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Inicio } from "./pages/inicio";
import { SectionPdf } from "./pages/pdj";
import { FileProvider } from "./components/FileContext";

function App() {
  return (
    <FileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/pdf" element={<SectionPdf />} />
        </Routes>
      </BrowserRouter>
    </FileProvider>
  );
}

export default App;
