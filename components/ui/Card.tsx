import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export default function Card({ elevated = false, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-3xl border border-slate-100",
        elevated ? "shadow-xl" : "shadow-sm",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
