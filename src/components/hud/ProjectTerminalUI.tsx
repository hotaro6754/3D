import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import projectDataRaw from '../../data/content.json';

interface Props {
  projectId: string;
  onClose: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.05 }
  },
  exit: { 
    opacity: 0,
    transition: { when: 'afterChildren', staggerChildren: 0.03, staggerDirection: -1 }
  }
};

const slideInRight: Variants = {
  hidden: { x: 40, opacity: 0, skewX: -2 },
  visible: { x: 0, opacity: 1, skewX: -2, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } },
  exit: { x: 40, opacity: 0, skewX: -2, transition: { type: 'tween', duration: 0.2 } }
};

const slideInLeft: Variants = {
  hidden: { x: -40, opacity: 0, skewX: -2 },
  visible: { x: 0, opacity: 1, skewX: -2, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } },
  exit: { x: -40, opacity: 0, skewX: -2, transition: { type: 'tween', duration: 0.2 } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: 15, transition: { type: 'tween', duration: 0.2 } }
};

const C_CYAN = '#00e5ff';
const C_NAVY = '#001a33';
const C_MAGENTA = '#ff007f';
const C_WHITE = '#ffffff';

export const ProjectTerminalUI: React.FC<Props> = ({ projectId, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const renderContent = () => {
    if (projectId === 'home') {
      const h = projectDataRaw.hero;
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
          <motion.div variants={slideInRight} style={{ borderBottom: `4px solid ${C_CYAN}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '3rem', color: C_CYAN, margin: 0, textTransform: 'uppercase' }}>
              {h.name_first} {h.name_last}
            </h1>
            <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0 0', color: C_MAGENTA, textTransform: 'uppercase' }}>
              {h.title}
            </h2>
          </motion.div>
          <motion.p variants={fadeIn} style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {h.bio_intro}
            <br/><br/>
            {h.bio_details}
          </motion.p>
          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {h.badges.map((b, i) => (
              <span key={i} style={{ background: C_CYAN, color: C_NAVY, padding: '0.4rem 0.8rem', fontWeight: 'bold' }}>
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      );
    }
    
    if (projectId.startsWith('projects:')) {
      const pid = projectId.split(':')[1];
      const proj = projectDataRaw.projects.find(p => p.id === pid);
      if (!proj) return <div style={{color:'red'}}>Project not found</div>;
      
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem', border: `1px solid ${C_CYAN}`, background: 'rgba(0,26,51,0.8)' }}>
          <motion.div variants={slideInLeft} style={{ marginBottom: '2rem', borderBottom: `2px solid ${C_CYAN}`, paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#aaa', fontSize: '1rem' }}>ACTIVE PROJECT</h3>
            <h1 style={{ fontSize: '3rem', color: C_WHITE, margin: 0, textTransform: 'uppercase' }}>
              {proj.name}
            </h1>
          </motion.div>
          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 2 }}>
              <h4 style={{ color: C_CYAN, marginBottom: '0.5rem' }}>DESCRIPTION</h4>
              <p style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>{proj.desc}</p>
              
              <h4 style={{ color: C_CYAN, marginBottom: '0.5rem' }}>TECH STACK</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {proj.tags.map(t => <span key={t} style={{ padding: '0.2rem 0.5rem', border: `1px solid ${C_MAGENTA}`, fontSize: '0.8rem' }}>{t}</span>)}
              </div>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '2rem' }}>
              <h4 style={{ color: C_CYAN, marginBottom: '0.5rem' }}>STATUS</h4>
              <p style={{ color: '#0f0', fontWeight: 'bold', marginBottom: '1.5rem' }}>ONLINE</p>
              
              <h4 style={{ color: C_CYAN, marginBottom: '0.5rem' }}>LINKS</h4>
              {proj.link ? (
                <a href={proj.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: C_CYAN, color: C_NAVY, textDecoration: 'none', fontWeight: 'bold' }}>
                  [ ACCESS REPOSITORY ]
                </a>
              ) : (
                <p style={{ color: '#aaa' }}>INTERNAL CLASSIFIED</p>
              )}
            </div>
          </motion.div>
        </div>
      );
    }
    
    if (projectId === 'security:birthday') {
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
          <motion.h1 variants={slideInRight} style={{ fontSize: '3rem', color: '#ff3333', marginBottom: '2rem', borderBottom: `2px solid #ff3333` }}>
            THREAT DETECTED
          </motion.h1>
          <motion.div variants={fadeIn} style={{ fontSize: '1.2rem', lineHeight: 2, marginBottom: '2rem', fontFamily: 'monospace' }}>
            <p><span style={{ color: '#aaa' }}>CLASSIFICATION:</span> <span style={{ color: C_CYAN, fontWeight: 'bold' }}>BIRTHDAY</span></p>
            <p><span style={{ color: '#aaa' }}>SEVERITY:</span> <span style={{ color: '#ff3333', fontWeight: 'bold' }}>EXTREMELY HIGH</span></p>
            <br />
            <p><span style={{ color: '#aaa' }}>RECOMMENDED RESPONSE:</span></p>
            <p style={{ color: C_MAGENTA, fontWeight: 'bold', fontSize: '1.5rem', marginTop: '0.5rem' }}>SEND WISHES</p>
          </motion.div>
        </div>
      );
    }

    if (projectId === 'security:profile') {
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
          <motion.h1 variants={slideInRight} style={{ fontSize: '3rem', color: C_MAGENTA, marginBottom: '2rem', borderBottom: `2px solid ${C_MAGENTA}` }}>
            SECURITY PROFILE
          </motion.h1>
          <motion.p variants={fadeIn} style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {projectDataRaw.security.profile}
          </motion.p>
        </div>
      );
    }

    if (projectId === 'security:projects') {
      const projs = projectDataRaw.projects.filter(p => p.id === 'offsec-mentor' || p.id === 'aegis');
      return (
        <div style={{ maxWidth: '900px', width: '100%', padding: '2rem' }}>
          <motion.h1 variants={slideInLeft} style={{ fontSize: '2.5rem', color: C_MAGENTA, marginBottom: '2rem' }}>
            SECURITY RESEARCH & TOOLS
          </motion.h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projs.map((p, i) => (
              <motion.a key={i} variants={slideInRight} href={p.link} target="_blank" rel="noreferrer" style={{
                display: 'block', padding: '2rem', borderLeft: `4px solid ${C_MAGENTA}`, textDecoration: 'none', color: '#fff',
                background: 'rgba(255, 0, 127, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: C_MAGENTA }}>{p.name}</h2>
                <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>{p.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      );
    }

    if (projectId === 'security:certs') {
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
          <motion.h1 variants={slideInRight} style={{ fontSize: '2.5rem', color: C_MAGENTA, marginBottom: '2rem' }}>
            CERTIFICATION & ROADMAP
          </motion.h1>
          <motion.div variants={fadeIn} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#aaa' }}>ACTIVE ROADMAP</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {projectDataRaw.security.roadmap.map(c => (
                <div key={c} style={{ padding: '1rem', border: `1px solid ${C_MAGENTA}`, color: C_MAGENTA, fontWeight: 'bold' }}>{c}</div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeIn}>
            <h3 style={{ color: '#aaa', marginBottom: '1rem' }}>ACHIEVED</h3>
            {projectDataRaw.achievements.map((a, i) => (
              <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: C_CYAN, marginRight: '1rem' }}>{a.name}</span>
                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>// {a.issuer}</span>
              </div>
            ))}
          </motion.div>
        </div>
      );
    }

    if (projectId.startsWith('skills:')) {
      const sid = projectId.split(':')[1];
      const matchMap: Record<string, string> = {
        'programming': 'PROGRAMMING',
        'web': 'WEB / FULL STACK',
        'ai': 'AI / ML',
        'cyber': 'CYBERSECURITY',
        'systems': 'SYSTEMS & TOOLS'
      };
      const cat = matchMap[sid];
      const skillGroup = projectDataRaw.skills.find(s => s.category === cat);
      if (!skillGroup) return null;

      return (
        <div style={{ maxWidth: '600px', width: '100%', padding: '2rem', background: C_NAVY, border: `2px solid ${C_CYAN}` }}>
          <motion.h1 variants={slideInLeft} style={{ fontSize: '2rem', color: C_CYAN, marginBottom: '2rem', borderBottom: `1px solid ${C_CYAN}` }}>
            {skillGroup.category}
          </motion.h1>
          <motion.div variants={fadeIn} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {skillGroup.items.map((item, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(0,229,255,0.1)', borderLeft: `4px solid ${C_CYAN}` }}>
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      );
    }

    if (projectId === 'experience') {
      const quests = projectDataRaw.quests;
      return (
        <div style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
          <motion.h1 variants={fadeIn} style={{ fontSize: '2.5rem', color: '#f0b000', marginBottom: '2rem' }}>
            STATION TIMETABLE // EXPERIENCE
          </motion.h1>
          <div style={{ borderLeft: '2px solid #f0b000', paddingLeft: '2rem', marginLeft: '1rem' }}>
            {quests.map((q, i) => (
              <motion.div key={i} variants={slideInLeft} style={{ position: 'relative', marginBottom: '3rem' }}>
                <div style={{ position: 'absolute', left: '-2.4rem', top: '0.2rem', width: '0.8rem', height: '0.8rem', borderRadius: '50%', background: '#f0b000' }} />
                <h3 style={{ fontSize: '1.4rem', color: '#f0b000' }}>{q.role}</h3>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{q.company} <span style={{ opacity: 0.5, fontSize: '0.9rem', marginLeft: '1rem' }}>{q.duration}</span></h4>
                <p style={{ opacity: 0.8 }}>{q.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (projectId === 'contact') {
      return (
        <div style={{ maxWidth: '600px', width: '100%', padding: '2rem', background: C_NAVY, border: `2px solid ${C_MAGENTA}` }}>
          <motion.h1 variants={slideInRight} style={{ fontSize: '2rem', color: C_MAGENTA, marginBottom: '2rem' }}>
            SECURE COMMS LINK
          </motion.h1>
          <motion.div variants={fadeIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href={projectDataRaw.socials.github} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '1rem', background: 'rgba(255,0,127,0.1)', color: '#fff', textDecoration: 'none', border: `1px solid ${C_MAGENTA}` }}>
              [E] OPEN GITHUB
            </a>
            <a href={projectDataRaw.socials.linkedin} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '1rem', background: 'rgba(255,0,127,0.1)', color: '#fff', textDecoration: 'none', border: `1px solid ${C_MAGENTA}` }}>
              [E] OPEN LINKEDIN
            </a>
            <a href={`mailto:${projectDataRaw.socials.email}`} style={{ display: 'block', padding: '1rem', background: 'rgba(255,0,127,0.1)', color: '#fff', textDecoration: 'none', border: `1px solid ${C_MAGENTA}` }}>
              [E] SEND TRANSMISSION (EMAIL)
            </a>
          </motion.div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="project-terminal-overlay"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0, 26, 51, 0.85)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        color: '#fff', fontFamily: '"Space Mono", monospace, sans-serif',
        overflow: 'hidden', backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 300 }}>
        <button
          onClick={onClose}
          style={{
            background: C_CYAN, color: C_NAVY, border: 'none',
            padding: '0.8rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 'bold', letterSpacing: '0.1em'
          }}
        >
          [ CLOSE / ESC ]
        </button>
      </div>
      
      {renderContent()}
      
    </motion.div>
  );
};
