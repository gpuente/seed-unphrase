import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

const Background = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState<FloatingShape[]>([]);
  const [particles, setParticles] = useState<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    // Generate floating shapes
    const generateShapes = () => {
      const colors = [
        'rgba(139, 92, 246, 0.1)', // Purple
        'rgba(6, 182, 212, 0.1)',  // Cyan  
        'rgba(245, 158, 11, 0.1)', // Amber
        'rgba(16, 185, 129, 0.1)', // Emerald
      ];

      const newShapes: FloatingShape[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 15,
      }));

      setShapes(newShapes);
    };

    generateShapes();
    
    // Generate particle positions
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated mesh gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Mouse-following gradient */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: `${mousePosition.x - 12}%`,
          y: `${mousePosition.y - 12}%`,
        }}
        transition={{
          type: "spring",
          damping: 100,
          stiffness: 5,
          mass: 5,
        }}
      />

      {/* Floating geometric shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: shape.size,
            height: shape.size,
            background: shape.color,
            filter: 'blur(20px)',
          }}
          initial={{
            x: `${shape.x}%`,
            y: `${shape.y}%`,
          }}
          animate={{
            x: [`${shape.x}%`, `${(shape.x + 20) % 100}%`, `${shape.x}%`],
            y: [`${shape.y}%`, `${(shape.y + 15) % 100}%`, `${shape.y}%`],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Particle-like dots with parallax effect */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => {
          const parallaxStrength = 0.05; // Slightly more noticeable movement
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.2, 1],
                x: -(mousePosition.x - 50) * parallaxStrength,
                y: -(mousePosition.y - 50) * parallaxStrength,
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
                x: { type: "spring", damping: 10, stiffness: 150 },
                y: { type: "spring", damping: 10, stiffness: 150 },
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Background;