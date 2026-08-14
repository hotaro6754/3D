import { usePortfolioData } from '../../hooks/usePortfolioData';
import FightingGame from '../fighting-game/FightingGame';
import './classic.css';

export default function ClassicPortfolio() {
  const data = usePortfolioData();

  if (!data) return null;

  return (
    <div className="classic-portfolio" style={{ overflowX: 'hidden' }}>
      {/* PROLOGUE */}
      <div className="page-container" id="hero-container">
        <h1 className="chapter-title gs-slam" style={{ marginTop: '5vh' }}>
          PROLOGUE<br />
          <span style={{ fontSize: '0.4em', color: 'var(--text-main)', textShadow: '3px 3px 0px var(--accent)' }}>THE GHOST</span>
        </h1>
        <div className="fog-overlay"></div>
        <div className="kanji-bg" style={{ top: '5vh', left: '-5vw', transform: 'rotate(-90deg)' }}>浪人</div>
        
        <div className="manga-grid grid-hero">
          <div className="panel panel-avatar gs-slam">
            <div className="halftone" style={{ zIndex: 1 }}></div>
            {/* Using a placeholder for avatar until assets are moved */}
            <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
            <div className="speech-bubble gs-parallax">俺の道</div>
          </div>
          
          <div className="panel panel-title panel-shadow gs-slam" style={{ transitionDelay: '0.1s' }}>
            <div className="halftone" style={{ backgroundImage: 'radial-gradient(circle, var(--bg) 2px, transparent 2.5px)' }}></div>
            <div className="panel-content">
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 6rem)', letterSpacing: '-1px', lineHeight: 1 }}>
                {data.hero.name_first}<br />{data.hero.name_last}
              </h1>
              <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2.5rem)', color: 'var(--text-main)', textShadow: '2px 2px 0px var(--accent)', marginTop: '15px' }}>
                {data.hero.title}
              </h3>
            </div>
          </div>

          <div className="panel panel-bio panel-shadow gs-slam panel-slanted-1" style={{ transitionDelay: '0.2s' }}>
            <div className="halftone"></div>
            <div className="panel-content">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>{data.hero.bio_intro}</p>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{data.hero.bio_details}</p>
              <div style={{ marginTop: '20px' }}>
                {data.hero.badges.map((b, i) => <span key={i} className="manga-badge">{b}</span>)}
              </div>
            </div>
          </div>

          <div className="panel panel-stats panel-shadow gs-slam panel-slanted-2" style={{ transitionDelay: '0.3s', color: '#fff' }}>
            <div className="halftone halftone-accent"></div>
            <div className="panel-content">
              <h2 style={{ fontSize: '3rem', marginBottom: '10px', borderBottom: '4px solid #fff' }}>STATUS</h2>
              <div className="stat-row" style={{ borderColor: 'rgba(255,255,255,0.3)' }}><span>LEVEL</span> <span style={{ color: '#000' }}>{data.hero.stats.level}</span></div>
              <div className="stat-row" style={{ borderColor: 'rgba(255,255,255,0.3)' }}><span>CLASS</span> <span style={{ color: '#000' }}>{data.hero.stats.class}</span></div>
              <div className="stat-row" style={{ borderColor: 'rgba(255,255,255,0.3)', border: 'none' }}><span>GUILD</span> <span style={{ color: '#000' }}>{data.hero.stats.guild}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER 1: ARSENAL */}
      <div className="page-container">
        <h1 className="chapter-title gs-slam">
          CHAPTER 01<br />
          <span style={{ fontSize: '0.4em', color: 'var(--text-main)', textShadow: '3px 3px 0px var(--accent)' }}>THE ARSENAL</span>
        </h1>
        <div className="kanji-bg" style={{ top: '20vh', right: '-5vw' }}>自律型AI</div>
        <div className="manga-grid grid-arsenal">
          {data.projects.map(p => (
            <div key={p.id} className={`panel panel-shadow interactive gs-slam ${p.css_classes}`}>
              <a href={p.link} target="_blank" rel="noreferrer" className="project-link"></a>
              <div className="speed-lines"></div>
              <div className="halftone"></div>
              <div className="sfx sfx-hover" style={{ top: '10px', right: '20px' }}>{p.sfx}</div>
              <div className="panel-content">
                <h2 className="project-title">{p.name}</h2>
                <p className="project-desc">{p.desc}</p>
                <div style={{ marginTop: '25px' }}>
                  {p.tags.map((t, i) => <span key={i} className="manga-badge">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAPTER 2: SECURITY */}
      <div className="page-container">
        <h1 className="chapter-title gs-slam">
          CHAPTER 02<br />
          <span style={{ fontSize: '0.4em', color: 'var(--text-main)', textShadow: '3px 3px 0px var(--accent)' }}>THREAT INTEL</span>
        </h1>
        <div className="kanji-bg" style={{ top: '10vh', left: '-5vw' }}>防衛</div>
        <div className="manga-grid grid-arsenal">
          <div className="panel panel-shadow gs-slam panel-wide">
            <div className="halftone"></div>
            <div className="panel-content">
              <h2>SECURITY PROFILE</h2>
              <p>{data.security.profile}</p>
            </div>
          </div>
          <div className="panel panel-shadow gs-slam">
            <div className="halftone"></div>
            <div className="panel-content">
              <h2>CERTIFICATIONS</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.security.roadmap.map((c, i) => <li key={i} style={{ borderBottom: '1px solid #333', padding: '5px 0' }}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER 3: SKILLS */}
      <div className="page-container">
        <h1 className="chapter-title gs-slam">
          CHAPTER 03<br />
          <span style={{ fontSize: '0.4em', color: 'var(--text-main)', textShadow: '3px 3px 0px var(--accent)' }}>KNOWLEDGE</span>
        </h1>
        <div className="manga-grid grid-skills" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {data.skills.map((skillGroup, idx) => (
            <div key={idx} className="panel panel-shadow gs-slam">
              <div className="halftone"></div>
              <div className="panel-content">
                <h3 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '10px' }}>{skillGroup.category}</h3>
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skillGroup.items.map((item, i) => <span key={i} className="manga-badge" style={{ fontSize: '0.7rem' }}>{item}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EPILOGUE (Fighting Game) */}
      <div className="page-container" style={{ marginTop: '10vh' }}>
        <h1 className="chapter-title gs-slam">
          EPILOGUE<br />
          <span style={{ fontSize: '0.4em', color: 'var(--text-main)', textShadow: '3px 3px 0px var(--accent)' }}>THE FINAL DUEL</span>
        </h1>
        <FightingGame mode="story" />
      </div>

    </div>
  );
}
