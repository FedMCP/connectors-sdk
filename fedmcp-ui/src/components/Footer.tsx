

'use client';

import Link from 'next/link';

/**
 * Global site footer.
 * Renders project copyright, GitHub link, and a handy “back to top”.
 */
const Footer = () => {
  return (
    <footer className="border-t mt-24 py-8 text-sm text-gray-500">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <span>© {new Date().getFullYear()} FedMCP Open‑Source Project</span>

        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/FedMCP"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors"
          >
            GitHub
          </Link>

          <Link
            href="#top"
            className="hover:text-indigo-600 transition-colors"
          >
            Back&nbsp;to&nbsp;top&nbsp;↑
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;