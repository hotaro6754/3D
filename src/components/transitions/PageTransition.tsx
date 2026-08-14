import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const defaultBlocks = ["var(--ink)", "var(--accent)", "var(--neon-cyan)"];

function DefaultTransition() {
  return (
    <>
      {defaultBlocks.map((color, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            inset: 0,
            background: color,
            zIndex: 999 - i,
            originX: 0,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{
            duration: 0.45,
            delay: i * 0.05,
            times: [0, 0.4, 0.6, 1],
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </>
  );
}

function AboutTransition() {
  const panels = [
    { color: "var(--ink)", top: "-12vh", left: "-18vw", width: "86vw", delay: 0 },
    { color: "var(--neon-cyan)", top: "24vh", left: "-10vw", width: "72vw", delay: 0.05 },
    { color: "var(--fg)", top: "58vh", left: "-14vw", width: "82vw", delay: 0.1 },
  ];

  return (
    <>
      {panels.map((panel, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            top: panel.top,
            left: panel.left,
            width: panel.width,
            height: "26vh",
            background: panel.color,
            zIndex: 999 - i,
            clipPath: "polygon(0 0, 100% 0, calc(100% - 120px) 100%, 0 100%)",
            transform: "rotate(-18deg)",
            transformOrigin: "left center",
          }}
          initial={{ x: -500, opacity: 0 }}
          animate={{ x: [-500, 20, 0], opacity: [1, 1, 0] }}
          transition={{
            duration: 0.52,
            delay: panel.delay,
            times: [0, 0.68, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </>
  );
}

function SocialsTransition() {
  const stripes = [
    { color: "var(--ink)", left: "72vw", width: "24vw", delay: 0 },
    { color: "var(--neon-cyan)", left: "80vw", width: "14vw", delay: 0.06 },
    { color: "var(--fg)", left: "88vw", width: "8vw", delay: 0.12 },
  ];

  return (
    <>
      {stripes.map((stripe, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            top: "-6vh",
            left: stripe.left,
            width: stripe.width,
            height: "112vh",
            background: stripe.color,
            zIndex: 999 - i,
            transform: "skewX(-16deg)",
            transformOrigin: "top",
          }}
          initial={{ y: -1200, opacity: 1 }}
          animate={{ y: [-1200, 0, 0, 1200] }}
          transition={{
            duration: 0.56,
            delay: stripe.delay,
            times: [0, 0.42, 0.58, 1],
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </>
  );
}

function ResumeTransition() {
  const cards = [
    { top: "14vh", color: "var(--ink)", delay: 0 },
    { top: "31vh", color: "var(--neon-cyan)", delay: 0.05 },
    { top: "48vh", color: "var(--fg)", delay: 0.1 },
    { top: "65vh", color: "var(--ink)", delay: 0.15 },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            left: "-6vw",
            top: card.top,
            width: "78vw",
            height: "14vh",
            background: card.color,
            zIndex: 999 - i,
            clipPath: "polygon(0 0, 97% 0, 100% 100%, 3% 100%)",
            boxShadow: card.color === "var(--fg)" ? "10px 0 0 var(--accent)" : "none",
          }}
          initial={{ x: -900, opacity: 1 }}
          animate={{ x: [-900, 30, 0, 900] }}
          transition={{
            duration: 0.6,
            delay: card.delay,
            times: [0, 0.48, 0.7, 1],
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </>
  );
}

function WorldTransition() {
  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--accent)",
        zIndex: 999,
        originY: 1,
      }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: [0, 1, 1, 0] }}
      transition={{
        duration: 0.6,
        times: [0, 0.4, 0.6, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
    />
  );
}

function TransitionOverlay({ variant }: { variant: string }) {
  if (variant === "about") return <AboutTransition />;
  if (variant === "resume") return <ResumeTransition />;
  if (variant === "socials") return <SocialsTransition />;
  if (variant === "world") return <WorldTransition />;
  return <DefaultTransition />;
}

export interface PageTransitionProps {
  children: React.ReactNode;
  variant?: "default" | "about" | "resume" | "socials" | "world";
}

export default function PageTransition({ children, variant = "default" }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} style={{ position: "relative" }}>
        <TransitionOverlay variant={variant} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.18 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
