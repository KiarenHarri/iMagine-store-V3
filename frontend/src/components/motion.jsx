import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export const MaskedLine = ({ children, delay = 0, as: Tag = "span", className = "" }) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span
      className="block will-change-transform"
      initial={{ y: "115%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export const Reveal = ({ children, delay = 0, y = 36, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.85, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export const ease = EASE;
