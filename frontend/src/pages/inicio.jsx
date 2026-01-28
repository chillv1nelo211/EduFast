import { Link } from "react-router-dom";
import { InputFile } from "../components/inputFile";
import { Navbar } from "../components/Navbar";
import Particles from "../Animation/perlas";
import TextType from "../Animation/letra";

export const Inicio = () => {
  return (
    <div>
      <Navbar></Navbar>
      <div className="flex flex-col items-center justify-center w-full h-96 text-[70px] font-mono">
        <TextType
          text={["Bienvenidos A EduFast", "Aprende y diviertete :)"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
        />
      </div>

      <div className="absolute inset-0 -z-10 w-full h-full">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={300}
          particleSpread={9}
          speed={0.4}
          particleBaseSize={220}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full h-3/5">
        <InputFile />
        <Link to="/pdf">
          <button className="px-4 py-2 bg-blue-600 text-white rounded mt-4">
            Ir al lector PDF
          </button>
        </Link>
      </div>
    </div>
  );
};
