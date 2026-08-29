import "./hesap.css";

export default function HesapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hesap">{children}</div>;
}
