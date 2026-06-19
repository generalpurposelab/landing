'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Nav({ variant = 'fixed' }: { variant?: 'fixed' | 'static' }) {
  const pathname = usePathname();
  const btnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const btn = btnRef.current;
    const overlay = overlayRef.current;
    if (!btn || !overlay) return;

    function openMenu() {
      if (busyRef.current) return;
      openRef.current = true;
      btn!.classList.add('open');
      overlay!.classList.add('open');
      btn!.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!openRef.current || busyRef.current) return;
      busyRef.current = true;
      overlay!.querySelectorAll('.menu-nav a').forEach((a) => {
        (a as HTMLElement).style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        (a as HTMLElement).style.opacity = '0';
        (a as HTMLElement).style.transform = 'translateY(-6px)';
      });
      setTimeout(() => {
        overlay!.classList.remove('open');
        btn!.classList.remove('open');
        btn!.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }, 160);
      setTimeout(() => {
        overlay!.querySelectorAll('.menu-nav a').forEach((a) => {
          (a as HTMLElement).style.transition = '';
          (a as HTMLElement).style.opacity = '';
          (a as HTMLElement).style.transform = '';
        });
        openRef.current = false;
        busyRef.current = false;
      }, 500);
    }

    function handleBtnClick(e: Event) {
      e.stopPropagation();
      openRef.current ? closeMenu() : openMenu();
    }

    function handleOverlayClick(e: Event) {
      if (!(e.target as Element).closest('.menu-nav')) closeMenu();
    }

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && openRef.current) closeMenu();
    }

    btn.addEventListener('click', handleBtnClick);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeydown);
    overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

    return () => {
      btn.removeEventListener('click', handleBtnClick);
      overlay.removeEventListener('click', handleOverlayClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/join', label: 'Join Us' },
  ];

  return (
    <>
      {variant === 'static' && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '36px 52px' }}>
          <Link href="/" style={{ display: 'block', width: 148, color: 'var(--ink)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
            <Image src="/assets/Union.svg" alt="General Purpose" width={148} height={40} style={{ width: '100%', height: 'auto' }} />
          </Link>
        </nav>
      )}

      <button className="menu-btn" ref={btnRef} aria-label="Open menu" aria-expanded="false">
        <div className="dot-grid">
          {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
        </div>
      </button>

      <div className="menu-overlay" ref={overlayRef} role="dialog" aria-modal="true">
        <Link href="/" className="menu-wordmark" aria-label="General Purpose — Home">
          <Image src="/assets/Union.svg" alt="General Purpose" width={160} height={44} style={{ width: '100%', height: 'auto', filter: 'invert(1)' }} />
        </Link>
        <nav className="menu-nav">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
