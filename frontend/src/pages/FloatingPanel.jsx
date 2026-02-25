import { useEffect, useState } from "react";
import "../styles/FloatingPanel.css";

function FloatingPanel() {
  const screens = [
    "📊 AUDIT FORM PDF GENERATION",
    "🏢 PPN AND COMPANY ",
    "📅 AUDIT SUBMISSION FORM",
    "✅ All Audits  Synced Successfully"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
  if (!screens || screens.length === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % screens.length);
  }, 4000);

  return () => clearInterval(interval);
}, [screens]);

  return (
    <div className="top-navbar">
      {screens[currentIndex]}
    </div>
  );
}

export default FloatingPanel;