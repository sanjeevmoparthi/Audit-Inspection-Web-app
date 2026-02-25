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
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screens.length);
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-navbar">
      {screens[currentIndex]}
    </div>
  );
}

export default FloatingPanel;