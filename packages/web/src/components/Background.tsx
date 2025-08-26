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

      const newShapes: FloatingShape[] = Array.from({ length: 3 }, (_, i) => ({
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
      const newParticles = Array.from({ length: 10 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);


  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Static mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)'
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
            y: [`${shape.y}%`, `${(shape.y + 10) % 100}%`, `${shape.y}%`],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
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

      {/* Static particle-like dots */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Background;