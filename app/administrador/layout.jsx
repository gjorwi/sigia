import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
  title: "SIGIA - Sistema de Gestión Integral de Almacenes",
  description: "Sistema de Gestión Integral de Almacenes",
};

export default function RootLayout({ children }) {

  return (
    <div className="min-h-screen bg-white/98 overflow-hidden relative">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
