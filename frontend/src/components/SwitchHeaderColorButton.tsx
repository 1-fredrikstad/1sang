'use client';

// TODO make into switch case
import { useThemeMode } from '../context/ThemeProvider';

export default function SwitchThemeButton() {
  const { setHeaderColor } = useThemeMode();
  return (
    <div className="flex space-x-1">
      <button
        title="Dark"
        onClick={() => setHeaderColor('dark_gray')}
        className="w-5 h-5 bg-[#2E2E2E] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Småspeider"
        onClick={() => setHeaderColor('light_yellow')}
        className="w-5 h-5 bg-[#FFF292] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Bever"
        onClick={() => setHeaderColor('brown')}
        className="w-5 h-5 bg-[#917931] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Stifinner"
        onClick={() => setHeaderColor('dark_blue')}
        className="w-5 h-5 bg-[#69869F] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Vandrer"
        onClick={() => setHeaderColor('light_green')}
        className="w-5 h-5 bg-[#91C575] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Rover"
        onClick={() => setHeaderColor('pink')}
        className="w-5 h-5 bg-[#C475A8] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Leder"
        onClick={() => setHeaderColor('turquoise')}
        className="w-5 h-5 bg-[#82DCF2] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
    </div>
  );
}
