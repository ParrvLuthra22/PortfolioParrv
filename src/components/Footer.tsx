'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-padding py-8 bg-black border-t border-white/10">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-mono text-white/50">
            © {currentYear} Parrv. All rights reserved.
          </p>

          <p className="text-mono text-white/50">
            Designed & Built with <span className="text-mustard">intention</span>
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-mono text-white/50 hover:text-mustard transition-colors duration-300 flex items-center gap-2"
            data-cursor="link"
          >
            Back to top
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}