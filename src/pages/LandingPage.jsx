import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
        if (e.isIntersecting) {
          const fill = e.target;
          fill.style.width = '72%';
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => barObs.observe(b));

    // Noise bars logic
    const noiseSection = document.getElementById('noise-bars');
    const noiseObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const allFills = document.querySelectorAll('.noise-fill');
          allFills.forEach((f, i) => {
            setTimeout(() => {
              f.style.width = f.dataset.w;
            }, i * 180);
          });
        }
      });
    }, { threshold: 0.3 });
    if (noiseSection) noiseObs.observe(noiseSection);

    // Impedance curve logic
    const simVisual = document.getElementById('sim-visual');
    const curveObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const impCurve = document.getElementById('imp-curve');
          const phaseCurve = document.getElementById('phase-curve');
          if (impCurve) {
            impCurve.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
            impCurve.style.strokeDashoffset = '0';
          }
          if (phaseCurve) {
            phaseCurve.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.4,0,0.2,1) 0.3s';
            phaseCurve.style.strokeDashoffset = '0';
          }
        }
      });
    }, { threshold: 0.2 });
    if (simVisual) curveObs.observe(simVisual);

    const chapObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          const chapMap = {
            'hero': 1, 'problem': 2, 'solution': 3, 'simulation': 4,
            'drc': 5, 'platform': 6, 'cta-section': 7
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
      noiseObs.disconnect();
      curveObs.disconnect();
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
          <li><a href="#problem">Problem</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#simulation">Simulation</a></li>
          <li><a href="#platform">Applications</a></li>
          <li><Link to="/designer">Designer</Link></li>
        </ul>
      </nav>

      {/* HERO STATUS */}
      <div className="hero-status">
        <div className="pulse-dot"></div>
        <span>Engine Online</span>
      </div>
      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>

      {/* ══ SECTION 01: HERO ═════════════════════════════════════════════ */}
      <section id="hero" className="landing-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="hud-ref tr">REF.01.A / DESIGN SUITE</div>
        <div className="chapter-bg">01</div>

        <div className="hero-inner">
          <div className="label reveal reveal-d1">
            <span className="label-gold">Debye Bio</span>
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
            <span className="bracket">[TISSUE-AWARE]</span>
            <span className="bracket">[SIMULATION-FIRST]</span>
          </div>

          <div className="reveal reveal-d6">
            <Link to="/designer" className="cta">Launch EDA Designer</Link>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 02: THE PROBLEM ═══════════════════════════════════════ */}
      <section id="problem" className="landing-section">
        <div className="hud-ref tl">ENV_02 / STATUS: ACTIVE</div>
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
          </div>
          <div className="world-divider"></div>
          <div className="world-col">
            <div className="world-title">[Electronics] — Engineering Knowledge</div>
            <div className="world-item">How to design sensors for tiny electrical signals</div>
            <div className="world-item">How electrode geometry affects impedance</div>
            <div className="world-item">How to calculate noise floors mathematically</div>
            <div className="world-item">How to route a design to a fabrication factory</div>
          </div>
        </div>

        <div className="measure-bar reveal">
          <div className="measure-bar-fill"></div>
        </div>
        <div className="hud-data reveal">Cost per failed iteration — $500K – $2M &nbsp;|&nbsp; Avg cycle — 6–12 weeks</div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 03: THE SOLUTION ══════════════════════════════════════ */}
      <section id="solution" className="landing-section">
        <div className="hud-ref tl">ENV_03 / SOLUTION</div>
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

        <div className="feature-grid reveal">
          <div className="feature-cell">
            <div className="feature-num">01 / MODULE</div>
            <div className="feature-name">Cell & Tissue Library</div>
            <div className="feature-desc">Electrical properties of every major tissue pre-loaded. Skin, heart muscle, blood vessel, gut lining, cortex.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">02 / MODULE</div>
            <div className="feature-name">Electrode Interface Model</div>
            <div className="feature-desc">Randles circuit + Cole-Cole model. The boundary where metal meets biology, modelled mathematically.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">03 / MODULE</div>
            <div className="feature-name">Noise Budget Engine</div>
            <div className="feature-desc">Thermal, 1/f flicker, motion artifact, shot noise, biological background — all five sources quantified.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">04 / MODULE</div>
            <div className="feature-name">Design Rule Checker</div>
            <div className="feature-desc">DRC equivalent for bioelectronics. Biological, electrical, and biocompatibility violations flagged automatically.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">05 / MODULE</div>
            <div className="feature-name">AI Copilot</div>
            <div className="feature-desc">Domain-grounded agent. Every response retrieved from a curated biological knowledge base.</div>
          </div>
          <div className="feature-cell">
            <div className="feature-num">06 / MODULE</div>
            <div className="feature-name">Regulatory Export</div>
            <div className="feature-desc">ISO 10993 biocompatibility matrix auto-generated. FDA and EU MDR documentation drafted from your design.</div>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 04: SIMULATION PREVIEW ═══════════════════════════════ */}
      <section id="simulation" className="landing-section">
        <div className="hud-ref tl">ENV_04 / SIMULATION ENGINE</div>
        <div className="chapter-bg">04</div>

        <div className="label reveal">04 — Live Simulation</div>
        <div className="headline-l reveal">
          Noise budget.<br />Before you <span className="gold">build anything.</span>
        </div>

        <div className="body-text reveal" style={{ marginTop: '16px' }}>
          Five noise sources. Quantified individually. Every design, every biological environment.
        </div>

        <div className="sim-visual reveal" id="sim-visual">
          <svg className="sim-svg" viewBox="0 0 700 200" preserveAspectRatio="none">
            <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1="80" x2="700" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1="120" x2="700" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1="160" x2="700" y2="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="280" y1="0" x2="280" y2="200" stroke="rgba(236,208,111,0.2)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="285" y="15" fill="rgba(236,208,111,0.5)" fontSize="9" fontFamily="monospace">1 kHz</text>
            <path id="imp-curve"
              d="M 0,10 C 40,12 80,18 140,35 C 200,52 240,78 280,110 C 320,138 380,158 440,168 C 500,175 580,180 700,184"
              stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="1200" strokeDashoffset="1200" />
            <path id="phase-curve"
              d="M 0,140 C 60,138 100,130 140,108 C 180,86 220,62 280,50 C 340,40 400,38 460,42 C 520,48 600,60 700,70"
              stroke="rgba(236,208,111,0.5)" strokeWidth="1" fill="none" strokeDasharray="900" strokeDashoffset="900" />
          </svg>
        </div>

        <div className="noise-bars" id="noise-bars">
          <div className="noise-row-outer">
            <div className="noise-label">Thermal</div>
            <div className="noise-track"><div className="noise-fill" data-w="45%"></div></div>
            <div className="noise-val">2.1 µVrms</div>
          </div>
          <div className="noise-row-outer">
            <div className="noise-label">Amplifier 1/f</div>
            <div className="noise-track"><div className="noise-fill" data-w="35%"></div></div>
            <div className="noise-val">1.6 µVrms</div>
          </div>
          <div className="noise-row-outer">
            <div className="noise-label">Motion Artifact</div>
            <div className="noise-track"><div className="noise-fill gold-fill" data-w="26%"></div></div>
            <div className="noise-val">1.2 µVrms</div>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 05: DRC ════════════════════════════════════════════════ */}
      <section id="drc" className="landing-section">
        <div className="chapter-bg">05</div>
        <div className="label reveal">05 — Design Rule Check</div>
        <div className="headline-l reveal">
          Spell-check for<br />medical devices.<br /><span className="gold">Instant. Automatic.</span>
        </div>

        <div className="drc-list reveal">
          <div className="drc-item">
            <div className="drc-status error"></div>
            <div className="drc-code">BIO-001</div>
            <div className="drc-text">
              <div className="drc-title">Electrode impedance out of range</div>
              <div className="drc-detail">2.1 MΩ at 1 kHz exceeds optimal range for glucose sensing. Increase area to ≥ 2000 µm².</div>
            </div>
          </div>
          <div className="drc-item">
            <div className="drc-status pass"></div>
            <div className="drc-code">PASS</div>
            <div className="drc-text">
              <div className="drc-title">8 checks passed</div>
              <div className="drc-detail">ISO 10993 compliant &nbsp;·&nbsp; Charge density within safe limits &nbsp;·&nbsp; Biocompatibility verified</div>
            </div>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 06: USE CASES ══════════════════════════════════════════ */}
      <section id="platform" className="landing-section">
        <div className="chapter-bg">06</div>
        <div className="label reveal">06 — Applications</div>
        <div className="headline-l reveal">
          Every device.<br />One platform.
        </div>

        <div style={{ marginTop: '8px' }} className="reveal">
          <div className="usecase-row">
            <div className="usecase-num">01</div>
            <div>
              <div className="usecase-name">Continuous Glucose Monitor</div>
              <div className="usecase-tag">Metabolic — 14-day wear</div>
            </div>
            <div className="usecase-desc">Subcutaneous electrode coated with enzyme layer. Fouling resistance over wear period validated before fabrication.</div>
          </div>
          <div className="usecase-row">
            <div className="usecase-num">02</div>
            <div>
              <div className="usecase-name">Cardiac Arrhythmia Patch</div>
              <div className="usecase-tag">Cardiology — 30-day ECG</div>
            </div>
            <div className="usecase-desc">Multi-layer signal propagation through chest tissue modelled. Motion artifact dominant noise source quantified.</div>
          </div>
          <div className="usecase-row">
            <div className="usecase-num">03</div>
            <div>
              <div className="usecase-name">Spinal Cord Stimulator</div>
              <div className="usecase-tag">Chronic Pain — 10-year implant</div>
            </div>
            <div className="usecase-desc">Anisotropic white matter conductivity modelled. Volume of tissue activated predicted per parameter set.</div>
          </div>
        </div>
      </section>

      <hr className="thin" />

      {/* ══ SECTION 07: CTA ════════════════════════════════════════════════ */}
      <section id="cta-section" className="landing-section">
        <div className="chapter-bg" style={{ fontSize: '20vw', right: 'auto', left: '-2vw' }}>07</div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="label reveal" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span className="label-gold">Debye EDA Suite</span>
          </div>

          <div className="headline-xl reveal" style={{ margin: '0 auto' }}>
            The teams building<br />the next 20 years of medtech<br />should not be<br /><span className="gold">designing blind.</span>
          </div>

          <div className="section-rule reveal" style={{ margin: '40px auto', maxWidth: '300px' }}></div>

          <div className="reveal">
            <Link to="/designer" className="cta">Launch Designer Demo</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="footer-logo"><span className="gold-sq">■</span> Debye</div>
        <ul className="footer-links">
          <li><a href="#problem">Problem</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#simulation">Simulation</a></li>
          <li><Link to="/designer">Designer</Link></li>
        </ul>
        <div className="footer-meta">© 2026 Debye Bio &nbsp;·&nbsp; EDA Software for Living Tissue</div>
      </footer>
    </div>
  );
}
