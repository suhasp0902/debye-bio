import { Link } from 'react-router-dom';
import '../LandingPage.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="landing-body flex flex-col min-h-screen">
      <nav className="landing-nav">
        <Link className="nav-logo" to="/">
          D<span>E</span>BYE
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/designer">Designer</Link>
        </div>
      </nav>

      <main className="flex-1 landing-section flex items-center justify-center pt-24 pb-12">
        <div className="reference-waves" aria-hidden="true" />
        
        <div className="section-shell max-w-md w-full px-4 relative z-10">
          <div className="text-center mb-6">
            <div className="eyebrow flex justify-center mb-2">{title}</div>
            <h2 className="headline-l !text-4xl" style={{ textWrap: 'balance' }}>{subtitle}</h2>
          </div>
          
          <div className="auth-panel p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="landing-footer py-8">
        <Link to="/">Debye</Link>
        <p>© 2026 Debye Bio. EDA Software for Living Tissue.</p>
      </footer>
    </div>
  );
}
