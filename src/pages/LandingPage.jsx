import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import '../LandingPage.css';

const features = [
  {
    num: '01 / MODULE',
    name: 'Cell & Tissue Library',
    desc: 'Electrical properties of every major tissue pre-loaded. Skin, heart muscle, blood vessel, gut lining, cortex.',
  },
  {
    num: '02 / MODULE',
    name: 'Electrode Interface Model',
    desc: 'Randles circuit + Cole-Cole model. The boundary where metal meets biology, modelled mathematically.',
  },
  {
    num: '03 / MODULE',
    name: 'Noise Budget Engine',
    desc: 'Thermal, 1/f flicker, motion artifact, shot noise, biological background - all five sources quantified.',
  },
  {
    num: '04 / MODULE',
    name: 'Design Rule Checker',
    desc: 'DRC equivalent for bioelectronics. Biological, electrical, and biocompatibility violations flagged automatically.',
  },
  {
    num: '05 / MODULE',
    name: 'AI Copilot',
    desc: 'Domain-grounded agent. Every response retrieved from a curated biological knowledge base.',
  },
  {
    num: '06 / MODULE',
    name: 'Regulatory Export',
    desc: 'ISO 10993 biocompatibility matrix auto-generated. FDA and EU MDR documentation drafted from your design.',
  },
];

const worlds = [
  {
    title: '[Biology] - Domain Knowledge',
    items: [
      'How tissue conducts electricity across frequencies',
      'Which materials the immune system accepts or rejects',
      'What biological noise looks like versus real signal',
      'How cells respond to electrical stimulation over time',
    ],
  },
  {
    title: '[Electronics] - Engineering Knowledge',
    items: [
      'How to design sensors for tiny electrical signals',
      'How electrode geometry affects impedance',
      'How to calculate noise floors mathematically',
      'How to route a design to a fabrication factory',
    ],
  },
];

const validationChecks = [
  {
    title: 'Tissue impedance window',
    metric: '180 ohm - 2.1 Mohm',
    desc: 'Checks electrode geometry against the selected tissue model.',
  },
  {
    title: 'Charge injection safety',
    metric: '3.2x margin',
    desc: 'Compares stimulation parameters with material charge limits.',
  },
  {
    title: 'Material biocompatibility fit',
    metric: 'ISO-ready',
    desc: 'Flags chronic-contact materials before the design reaches fabrication.',
  },
  {
    title: 'Signal transfer confidence',
    metric: 'Detectable',
    desc: 'Validates that the interface can carry signal through biological load.',
  },
];

const useCases = [
  {
    num: '01',
    name: 'Continuous Glucose Monitor',
    tag: 'Metabolic - 14-day wear',
    desc: 'Subcutaneous electrode coated with enzyme layer. Fouling resistance over wear period validated before fabrication.',
  },
  {
    num: '02',
    name: 'Cardiac Arrhythmia Patch',
    tag: 'Cardiology - 30-day ECG',
    desc: 'Multi-layer signal propagation through chest tissue modelled. Motion artifact dominant noise source quantified.',
  },
  {
    num: '03',
    name: 'Spinal Cord Stimulator',
    tag: 'Chronic Pain - 10-year implant',
    desc: 'Anisotropic white matter conductivity modelled. Volume of tissue activated predicted per parameter set.',
  },
];

function SoftRibbon({ color, position, rotation, scale = 1, delay = 0 }) {
  const meshRef = useRef(null);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.7, -0.15, 0),
    new THREE.Vector3(-1.35, 0.55, 0.18),
    new THREE.Vector3(0.1, -0.15, -0.12),
    new THREE.Vector3(1.35, 0.35, 0.16),
    new THREE.Vector3(2.65, -0.2, 0),
  ]);
  const geometry = new THREE.TubeGeometry(curve, 88, 0.035, 14, false);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + delay;
    if (!meshRef.current) return;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.32) * 0.045;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.48) * 0.08;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} rotation={rotation} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.74} metalness={0.02} />
    </mesh>
  );
}

function ClayInterfaceModel() {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = 0.42 + Math.sin(clock.elapsedTime * 0.25) * 0.12;
    groupRef.current.rotation.x = -0.34 + Math.sin(clock.elapsedTime * 0.18) * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.24} floatIntensity={0.5}>
      <group ref={groupRef} position={[0.35, -0.15, 0]} rotation={[-0.34, 0.42, -0.06]}>
        <RoundedBox args={[2.65, 0.28, 2.65]} radius={0.18} smoothness={12} position={[0, 0.48, 0]}>
          <meshStandardMaterial color="#f7fbff" roughness={0.82} metalness={0.02} />
        </RoundedBox>
        <RoundedBox args={[2.82, 0.2, 2.82]} radius={0.18} smoothness={12} position={[0, 0.22, 0]}>
          <meshStandardMaterial color="#1291d5" roughness={0.78} metalness={0.04} />
        </RoundedBox>
        <RoundedBox args={[2.56, 0.18, 2.56]} radius={0.16} smoothness={12} position={[0, -0.04, 0]}>
          <meshStandardMaterial color="#f5b836" roughness={0.76} metalness={0.01} />
        </RoundedBox>
        <RoundedBox args={[2.96, 0.24, 2.96]} radius={0.2} smoothness={12} position={[0, -0.34, 0]}>
          <meshStandardMaterial color="#0b67b2" roughness={0.72} metalness={0.04} />
        </RoundedBox>
        <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.018, 18, 120]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} emissive="#8de9ff" emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[0.55, 0.08, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.016, 18, 72]} />
          <meshStandardMaterial color="#fff7ce" roughness={0.5} emissive="#f6bf45" emissiveIntensity={0.16} />
        </mesh>
      </group>
    </Float>
  );
}

function BioInterfaceScene() {
  return (
    <Canvas camera={{ position: [0, 0.8, 7], fov: 42 }} dpr={[1, 1.6]} aria-hidden="true">
      <color attach="background" args={['#dff9ff']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2.3} color="#ffffff" />
      <pointLight position={[-4, -1, 4]} intensity={1.4} color="#ffd36f" />
      <pointLight position={[3, 1, 3]} intensity={1.2} color="#36d7ea" />
      <SoftRibbon color="#26c6df" position={[0, 1.58, -1.6]} rotation={[-0.1, 0.1, -0.1]} scale={1.34} />
      <SoftRibbon color="#0c79c9" position={[-0.3, -1.18, -1.1]} rotation={[0.08, 0.26, 0.18]} scale={1.48} delay={1.1} />
      <SoftRibbon color="#f8c64d" position={[0.25, 0.12, -1.35]} rotation={[0.05, -0.16, 0.05]} scale={1.56} delay={2.2} />
      <ClayInterfaceModel />
      <Sparkles count={32} scale={[5.2, 3.2, 2.2]} size={2.2} speed={0.24} color="#ffffff" opacity={0.44} />
    </Canvas>
  );
}

export default function LandingPage() {
  const heroRuleRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      anchors: true,
    });

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const ruleEls = document.querySelectorAll('.section-rule, .hero-rule');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.14 },
    );

    const ruleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('wide');
        });
      },
      { threshold: 0.25 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    ruleEls.forEach((el) => ruleObserver.observe(el));

    requestAnimationFrame(() => {
      heroRuleRef.current?.classList.add('wide');
    });

    return () => {
      revealObserver.disconnect();
      ruleObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-body">
      <nav className="landing-nav" aria-label="Landing page navigation">
        <a className="nav-logo" href="#hero" aria-label="Debye home">
          <BrandLogo idPrefix="lp" />
        </a>
        <div className="nav-links">
          <a href="#problem">Problem</a>
          <a href="#solution">Solution</a>
          <a href="#simulation">Simulation</a>
          <a href="#platform">Applications</a>
          <Link to="/designer">Launch</Link>
        </div>
      </nav>

      <main>
        <section id="hero" className="landing-section hero-section">
          <div className="reference-waves" aria-hidden="true" />
          <div className="hero-scene">
            <BioInterfaceScene />
          </div>

          <div className="section-shell hero-shell">
            <div className="eyebrow reveal reveal-d1">Debye Bio</div>
            <h1 className="headline-xl reveal reveal-d2">
              Design software that understands living tissue.
            </h1>
            <div className="hero-rule" ref={heroRuleRef} />
            <p className="body-text hero-copy reveal reveal-d3">
              The first electronic design platform built for bio-electronic interfaces. Every electrode,
              every tissue, every noise source - modelled natively.
            </p>
            <div className="hero-actions reveal reveal-d5">
              <Link to="/designer" className="cta primary-cta">
                Launch EDA Designer
              </Link>
              <a href="#problem" className="cta secondary-cta">
                See the Gap
              </a>
            </div>
          </div>
        </section>

        <section id="problem" className="landing-section">
          <div className="section-shell centered">
            <div className="eyebrow reveal">02 - The Problem</div>
            <h2 className="headline-l reveal">Two worlds. Zero shared language.</h2>
            <p className="body-text centered-copy reveal">
              Every team building a medical device that touches the human body needs two types of
              expertise that no design tool currently bridges.
            </p>

            <div className="world-grid reveal">
              {worlds.map((world) => (
                <article className="world-panel" key={world.title}>
                  <h3>{world.title}</h3>
                  <ul>
                    {world.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="measure-block reveal">
              <div className="measure-track">
                <span />
              </div>
              <p>Cost per failed iteration - $500K - $2M | Avg cycle - 6-12 weeks</p>
            </div>
          </div>
        </section>

        <section id="solution" className="landing-section solution-section">
          <div className="section-shell">
            <div className="split-intro">
              <div>
                <div className="eyebrow reveal">03 - The Solution</div>
                <h2 className="headline-l reveal">
                  What if the software already knew the biology?
                </h2>
              </div>
              <p className="body-text reveal">
                Debye encodes biological knowledge natively - every tissue model, every electrode
                material, every noise source. Place an electrode. The tool already knows what tissue it is
                touching.
              </p>
            </div>

            <div className="feature-grid reveal">
              {features.map((feature) => (
                <article className="feature-cell" key={feature.name}>
                  <div className="feature-num">{feature.num}</div>
                  <h3>{feature.name}</h3>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="simulation" className="landing-section">
          <div className="section-shell centered">
            <div className="eyebrow reveal">04 - Live Simulation</div>
            <h2 className="headline-l reveal">
              Validate the tissue interface before fabrication.
            </h2>
            <p className="body-text centered-copy reveal">
              Debye checks whether the biological load, electrode material, stimulation envelope,
              and signal path can work together before a prototype is built.
            </p>

            <div className="validation-board reveal">
              <div className="validation-stack" aria-label="Validation flow">
                {['Tissue', 'Electrode interface', 'Circuit load'].map((label) => (
                  <div className="validation-layer" key={label}>
                    <span>{label}</span>
                    <strong>validated</strong>
                  </div>
                ))}
                <div className="validation-line">
                  <i />
                  <b />
                </div>
              </div>

              <div className="validation-grid">
                {validationChecks.map((check) => (
                  <article className="validation-card" key={check.title}>
                    <span>PASS</span>
                    <h3>{check.title}</h3>
                    <strong>{check.metric}</strong>
                    <p>{check.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="drc" className="landing-section">
          <div className="section-shell drc-shell">
            <div>
              <div className="eyebrow reveal">05 - Design Rule Check</div>
              <h2 className="headline-l reveal">
                Spell-check for medical devices. Instant. Automatic.
              </h2>
            </div>
            <div className="drc-list reveal">
              <article className="drc-item">
                <span className="drc-status error" />
                <div>
                  <strong>BIO-001</strong>
                  <h3>Electrode impedance out of range</h3>
                  <p>2.1 MOhm at 1 kHz exceeds optimal range for glucose sensing. Increase area to &gt;= 2000 um2.</p>
                </div>
              </article>
              <article className="drc-item">
                <span className="drc-status pass" />
                <div>
                  <strong>PASS</strong>
                  <h3>8 checks passed</h3>
                  <p>ISO 10993 compliant. Charge density within safe limits. Biocompatibility verified.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="platform" className="landing-section">
          <div className="section-shell">
            <div className="eyebrow reveal">06 - Applications</div>
            <h2 className="headline-l reveal">Every device. One platform.</h2>
            <div className="usecase-list reveal">
              {useCases.map((item) => (
                <article className="usecase-row" key={item.name}>
                  <span>{item.num}</span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.tag}</p>
                  </div>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cta-section" className="landing-section final-section">
          <div className="section-shell centered">
            <div className="eyebrow reveal">Debye EDA Suite</div>
            <h2 className="headline-xl reveal">
              The teams building the next generation of medtech should not be designing blind.
            </h2>
            <div className="section-rule reveal" />
            <Link to="/designer" className="cta primary-cta reveal">
              Launch Designer Demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a href="#hero">Debye</a>
        <div>
          <a href="#problem">Problem</a>
          <a href="#solution">Solution</a>
          <a href="#simulation">Simulation</a>
          <Link to="/designer">Launch</Link>
        </div>
        <p>(c) 2026 Debye Bio. EDA Software for Living Tissue.</p>
      </footer>
    </div>
  );
}
