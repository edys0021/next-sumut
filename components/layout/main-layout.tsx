import { ReactNode } from "react";
import "./main-layout.css";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      {children}
    </div>
  );
}