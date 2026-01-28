import { Navbar } from "../components/Navbar";
import MostarPdf from "../components/MostarPdf";
import { Link } from "react-router-dom";

export const SectionPdf = () => {
  return (
    <div>
      <Navbar />
      <MostarPdf></MostarPdf>;
    </div>
  );
};
