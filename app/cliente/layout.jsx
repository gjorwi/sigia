import ClienteLayoutClient from "./ClienteLayoutClient";

export const metadata = {
  title: "SIGIA - Cliente",
  description: "Sistema de Gestión Integral de Almacenes - Área de Cliente",
};

export default function RootLayout({ children }) {
  return <ClienteLayoutClient>{children}</ClienteLayoutClient>;
}