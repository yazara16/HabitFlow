import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CelebrationProps {
  active: boolean;
  durationMs?: number;
  onDone?: () => void;
}

export default function Celebration({ active, durationMs = 1400, onDone }: CelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, durationMs);
      return () => clearTimeout(t);
    }
  }, [active, durationMs, onDone]);

  const pieces = useMemo(() => {
    const colors = [
      "#ef4444", // red-500
      "#f59e0b", // amber-500
      "#10b981", // emerald-500
      "#3b82f6", // blue-500
      "#8b5cf6", // violet-500
      "#f97316", // orange-500
    ];
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: (Math.random() * 60 - 30), // -30%..30%
      delay: Math.random() * 0.2,
      rot: Math.random() * 180 - 90,
      scale: 0.8 + Math.random() * 0.6,
    }));
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex items-start justify-center mt-24">
            {pieces.map((p) => (
              <motion.span
                key={p.id}
                initial={{ y: -10, x: 0, rotate: 0, opacity: 0 }}
                animate={{
                  y: [0, 40, 140, 220],
                  x: [0, p.x, p.x * 1.5, p.x * 2],
                  rotate: [0, p.rot],
                  opacity: [0, 1, 1, 0],
                  scale: p.scale,
                }}
                transition={{ duration: durationMs / 1000, ease: "easeOut", delay: p.delay }}
                style={{
                  width: 8,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: p.color,
                  display: "inline-block",
                  marginLeft: 6,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
