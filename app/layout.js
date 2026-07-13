export const metadata = {
  title: "Copilote Stratégique",
  description: "Votre copilote stratégique personnel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
