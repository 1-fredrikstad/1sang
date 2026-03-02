'use client';

// TODO make into switch case

import { useTheme } from '../hooks/useTheme';
export default function SwitchThemeButton() {
  const { changeTheme } = useTheme();
  return (
    <div className="flex space-x-1">
      <button
        title="Dark"
        onClick={() => changeTheme('dark')}
        className="w-5 h-5 bg-[#2E2E2E] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Småspeider"
        onClick={() => changeTheme(null)}
        className="w-5 h-5 bg-[#FFF292] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Bever"
        onClick={() => changeTheme('brown')}
        className="w-5 h-5 bg-[#917931] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Stifinner"
        onClick={() => changeTheme('blue')}
        className="w-5 h-5 bg-[#69869F] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Vandrer"
        onClick={() => changeTheme('green')}
        className="w-5 h-5 bg-[#91C575] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Rover"
        onClick={() => changeTheme('pink')}
        className="w-5 h-5 bg-[#C475A8] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
      <button
        title="Leder"
        onClick={() => changeTheme('turqouise')}
        className="w-5 h-5 bg-[#82DCF2] rounded-full outline-1 outline-[#e6e4e2] mr-1"
      ></button>
    </div>
  );
}
