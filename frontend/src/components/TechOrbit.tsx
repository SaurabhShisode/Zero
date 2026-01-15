import { motion } from "framer-motion";

const techs = [
  "/icons/java.png",
  "/icons/react.png",
  "/icons/c++.png",
  "/icons/typescript.png",
  "/icons/javascript.png",
  "/icons/mysql.png",
];

const path =
  "M 200,60 a 140,140 0 1,1 0,280 a 140,140 0 1,1 0,-280";

const DURATION = 28;

export default function TechOrbit() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute right-[-400px] w-[800px] h-[800px]"
    >
      {techs.map((src, i) => (
        <motion.image
          key={i}
          href={src}
          width="50"
          height="50"
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "linear",
            delay: -(DURATION / techs.length) * i
          }}
          style={{
            offsetPath: `path('${path}')`,
          
            opacity: 0.7
          }}
        />
      ))}
    </svg>
  );
}
