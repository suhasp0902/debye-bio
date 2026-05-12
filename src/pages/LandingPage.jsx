import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from '../components/ThreeScene';
import '../LandingPage.css';

export default function LandingPage() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const flashRef = useRef(null);
  const heroRuleRef = useRef(null);
  const lastChapter = useRef(0);

  useEffect(() => {
    // ─── CURSOR ──────────────────────────────────────────────────────
    let mx = 0, my = 0, rx = 0, ry = 0;
    const moveCursor = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`;
        dotRef.current.style.top = `${my}px`;
      }
    };

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`;
        ringRef.current.style.top = `${ry}px`;
      }
      requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', moveCursor);
    animRing();

    const handleMouseEnter = () => document.body.classList.add('hovering');
    const handleMouseLeave = () => document.body.classList.remove('hovering');
    const interactiveElements = document.querySelectorAll('a, button, .usecase-row, .feature-cell, .cta');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // ─── CHAPTER FLASH ──────────────────────────────────────────────
    const triggerFlash = (num) => {
      if (num === lastChapter.current) return;
      lastChapter.current = num;
      if (flashRef.current) {
        flashRef.current.textContent = String(num).padStart(2, '0');
        flashRef.current.style.opacity = '1';
        setTimeout(() => { if(flashRef.current) flashRef.current.style.opacity = '0'; }, 600);
      }
    };

    // ─── SCROLL REVEALS ─────────────────────────────────────────────
    const reveals = document.querySelectorAll('.reveal');
    const rules = document.querySelectorAll('.section-rule');
    const bars = document.querySelectorAll('.measure-bar-fill');
    const sections = document.querySelectorAll('.landing-section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));

    const ruleObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('wide');
      });
    }, { threshold: 0.3 });
    rules.forEach(r => ruleObs.observe(r));

    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.style.width = '72%';
      });
    }, { threshold: 0.3 });
    bars.forEach(b => barObs.observe(b));

    const chapObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          const chapMap = {
            'hero': 1, 'problem': 2, 'solution': 3, 'simulation': 4,
            'drc': 5, 'platform': 6, 'market': 7, 'analogy': 8, 'cta-section': 9
          };
          if (chapMap[id]) triggerFlash(chapMap[id]);
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => chapObs.observe(s));

    // ─── PARALLAX ─────────────────────────────────────────────────
    const handleScroll = () => {
      const sy = window.scrollY;
      document.querySelectorAll('.chapter-bg').forEach(el => {
        el.style.transform = `translateY(calc(-50% + ${sy * 0.05}px))`;
      });
      document.querySelectorAll('.wire-diagram').forEach(el => {
        el.style.transform = `translateY(calc(-50% + ${sy * 0.03}px))`;
      });
    };
    window.addEventListener('scroll', handleScroll);

    // Initial Hero Rule
    setTimeout(() => { if(heroRuleRef.current) heroRuleRef.current.classList.add('in'); }, 600);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('scroll', handleScroll);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      observer.disconnect();
      ruleObs.disconnect();
      barObs.disconnect();
      chapObs.disconnect();
    };
  }, []);

  return (
    <div className="landing-body">
      {/* CURSOR */}
      <div id="cursor-dot" ref={dotRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>

      {/* CHAPTER FLASH */}
      <div id="chapter-flash" ref={flashRef}>01</div>

      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-logo">D<span>E</span>BYE</div>
        <ul className="nav-links">
          <li><a href="#problem" className="active">Problem</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#platform">Platform</a></li>
          <li><Link to="/designer">Designer</Link></li>
        </ul>
      </nav>

      {/* HERO STATUS */}
      <div className="hero-status">
        <div className="pulse-dot"></div>
        <span>System Online</span>
      </div>
      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>

      {/* THREE JS CANVAS */}
      <div className="hero-canvas-container">
        <ThreeScene />
      </div>

      {/* ══ SECTION 01: HERO ═════════════════════════════════════════════ */}
      <section id="hero" className="landing-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="hud-ref tr">REF.01.A / 48.2N — 11.5E</div>
        <div className="chapter-bg">01</div>

        <div className="hero-inner">
          <div className="label reveal reveal-d1">
            <span className="label-gold">Debye Bio — S26</span>
          </div>

          <div className="headline-xl reveal reveal-d2">
            Design software<br />that understands<br /><span className="gold">living tissue.</span>
          </div>

          <div className="hero-rule" ref={heroRuleRef}></div>

          <div className="body-text reveal reveal-d4" style={{ maxWidth: '480px' }}>
            The first electronic design platform built for bio-electronic interfaces.
            Every electrode, every tissue, every noise source — modelled natively.
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }} className="reveal reveal-d5">
            <span className="bracket">[EDA FOR BIOELECTRONICS]</span>
            <span className="bracket">[AI-NATIVE]</span>
            <span className="bracket">[TISSUE-AWARE]</span>
          </div>

          <div className="reveal reveal-d6">
            <Link to="/designer" className="cta">Launch Designer Demo</Link>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 02: THE PROBLEM ═══════════════════════════════════════ */}
      <section id="problem" className="landing-section">
        <div className="hud-ref tl">ENV_02 / STATUS: ACTIVE</div>
        <div className="hud-ref br">REF.02.B</div>
        <div className="chapter-bg">02</div>

        <div className="label reveal">02 — The Problem</div>
        <div className="headline-l reveal" style={{ maxWidth: '700px' }}>
          Two worlds.<br />Zero shared language.
        </div>

        <div className="body-text reveal" style={{ marginTop: '20px' }}>
          Every team building a medical device that touches the human body needs two types of expertise that no design tool currently bridges.
        </div>

        <div className="two-worlds reveal">
          <div className="world-col">
            <div className="world-title">[Biology] — Domain Knowledge</div>
            <div className="world-item">How tissue conducts electricity across frequencies</div>
            <div className="world-item">Which materials the immune system accepts or rejects</div>
            <div className="world-item">What biological noise looks like versus real signal</div>
            <div className="world-item">How cells respond to electrical stimulation over time</div>
            <div className="world-item">Which proteins and markers to target per disease</div>
          </div>
          <div className="world-divider"></div>
          <div className="world-col">
            <div className="world-title">[Electronics] — Engineering Knowledge</div>
            <div className="world-item">How to design sensors for tiny electrical signals</div>
            <div className="world-item">How electrode geometry affects impedance</div>
            <div className="world-item">How to calculate noise floors mathematically</div>
            <div className="world-item">How to route a design to a fabrication factory</div>
            <div className="world-item">How to build circuits that have never existed</div>
          </div>
        </div>

        <div className="measure-bar reveal">
          <div className="measure-bar-fill"></div>
        </div>
        <div className="hud-data reveal">Cost per failed iteration — $500K – $2M &nbsp;|&nbsp; Avg cycle — 6–12 weeks &nbsp;|&nbsp; Market — $54B by 2030</div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 03: THE SOLUTION ══════════════════════════════════════ */}
      <section id="solution" className="landing-section">
        <div className="hud-ref tl">ENV_03 / SOLUTION</div>
        <div className="hud-ref tr">Ø ELECTRODE — TISSUE INTERFACE</div>
        <div className="chapter-bg">03</div>

        <div className="wire-diagram">
          <svg width="320" height="380" viewBox="0 0 320 380" fill="none">
            <rect x="130" y="20" width="60" height="120" stroke="white" strokeWidth="0.6" />
            <line x1="130" y1="50" x2="190" y2="50" stroke="white" strokeWidth="0.4" strokeDasharray="4 4" />
            <line x1="130" y1="80" x2="190" y2="80" stroke="white" strokeWidth="0.4" strokeDasharray="4 4" />
            <line x1="130" y1="110" x2="190" y2="110" stroke="white" strokeWidth="0.4" strokeDasharray="4 4" />
            <path d="M130 140 L160 170 L190 140" stroke="white" strokeWidth="0.6" fill="none" />
            <line x1="80" y1="175" x2="240" y2="175" stroke="white" strokeWidth="0.8" />
            <line x1="80" y1="180" x2="240" y2="180" stroke="white" strokeWidth="0.4" opacity="0.4" />
            <line x1="60" y1="210" x2="260" y2="210" stroke="white" strokeWidth="0.4" strokeDasharray="6 3" />
            <line x1="60" y1="240" x2="260" y2="240" stroke="white" strokeWidth="0.4" strokeDasharray="6 3" />
            <line x1="60" y1="270" x2="260" y2="270" stroke="white" strokeWidth="0.4" strokeDasharray="6 3" />
            <line x1="60" y1="300" x2="260" y2="300" stroke="white" strokeWidth="0.4" strokeDasharray="6 3" />
            <line x1="60" y1="330" x2="260" y2="330" stroke="white" strokeWidth="0.4" strokeDasharray="6 3" />
            <text x="200" y="95" fill="white" fontSize="8" fontFamily="monospace" opacity="0.5">ELECTRODE</text>
            <text x="196" y="172" fill="white" fontSize="7" fontFamily="monospace" opacity="0.4">INTERFACE</text>
            <text x="210" y="255" fill="white" fontSize="8" fontFamily="monospace" opacity="0.4">TISSUE</text>
            <circle cx="160" cy="162" r="6" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6" />
          </svg>
        </div>

        <div className="label reveal">03 — The Solution</div>
        <div className="headline-l reveal" style={{ maxWidth: '600px' }}>
          What if the software<br />already knew<br /><span className="gold">the biology?</span>
        </div>

        <div className="body-text reveal" style={{ marginTop: '20px', maxWidth: '480px' }}>
          Debye encodes biological knowledge natively — every tissue model, every electrode material, every noise source. Place an electrode. The tool already knows what tissue it is touching.
        </div>

        <div className="section-rule reveal"></div>

        <div className="feature-grid reveal">
          <div className="feature-cell">
            <div className="feature-num">01 / MODULE</div>
            <div className="feature-name">Cell & Tissue Library</div>
            <div className="feature-desc">Electrical properties of every major tissue pre-loaded. Skin, heart muscle, blood vessel, gut lining, cortex. Pick the target — the tool knows its behaviour.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">02 / MODULE</div>
            <div className="feature-name">Electrode Interface Model</div>
            <div className="feature-desc">Randles circuit + Cole-Cole model. The boundary where metal meets biology, modelled mathematically. Impedance predicted before fabrication.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">03 / MODULE</div>
            <div className="feature-name">Noise Budget Engine</div>
            <div className="feature-desc">Thermal, 1/f flicker, motion artifact, shot noise, biological background — all five sources quantified. Signal detectability answered before anything is built.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">04 / MODULE</div>
            <div className="feature-name">Design Rule Checker</div>
            <div className="feature-desc">DRC equivalent for bioelectronics. Biological, electrical, and biocompatibility violations flagged automatically. No manual audit required.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">05 / MODULE</div>
            <div className="feature-name">AI Copilot</div>
            <div className="feature-desc">Domain-grounded agent. Every response retrieved from a curated biological knowledge base. Cites real papers. Never guesses.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">06 / MODULE</div>
            <div className="feature-name">Regulatory Export</div>
            <div className="feature-desc">ISO 10993 biocompatibility matrix auto-generated. FDA and EU MDR documentation drafted from your design choices. Compliance as a byproduct.</div>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 09: CTA ════════════════════════════════════════════════ */}
      <section id="cta-section" className="landing-section">
        <div className="chapter-bg" style={{ fontSize: '20vw', right: 'auto', left: '-2vw' }}>09</div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="label reveal" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span className="label-gold">Early Access — S26</span>
          </div>

          <div className="headline-xl reveal" style={{ margin: '0 auto' }}>
            Every major medical device<br />of the next 20 years will have<br />electronics touching<br /><span className="gold">biology.</span>
          </div>

          <div className="section-rule reveal" style={{ margin: '40px auto', maxWidth: '300px' }}></div>

          <div className="body-text reveal" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
            The teams building those devices should not be designing blind. Debye is what changes that.
          </div>

          <div className="reveal">
            <Link to="/designer" className="cta">Request Early Access & Try Designer</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="footer-logo"><span className="gold-sq">■</span> Debye</div>
        <ul className="footer-links">
          <li><a href="#problem">Problem</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#platform">Platform</a></li>
          <li><Link to="/designer">Designer</Link></li>
        </ul>
        <div className="footer-meta">© 2026 Debye Bio &nbsp;·&nbsp; EDA Software for Living Tissue &nbsp;·&nbsp; San Francisco</div>
      </footer>
    </div>
  );
}
