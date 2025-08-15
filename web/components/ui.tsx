"use client";

import { clsx } from "clsx";

export function Pill({ children, color="slate" }: { children: any; color?: "green"|"red"|"yellow"|"slate"|"blue" }) {
  const map: Record<string,string> = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    slate: "bg-slate-100 text-slate-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return <span className={clsx("badge", map[color])}>{children}</span>;
}

export const ButtonBig = ({ label, onClick, color }:{
  label: string;
  onClick?: () => void;
  color: "green"|"red"|"yellow"|"blue";
}) => {
  const map: Record<string,string> = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    blue: "bg-blue-600 hover:bg-blue-700",
  };
  return (
    <button onClick={onClick} className={clsx("w-full text-white py-4 rounded-xl text-lg font-semibold shadow", map[color])}>
      {label}
    </button>
  );
};
