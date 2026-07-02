'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './about.module.css';

const beliefs = [
  { num: '00', title: 'General Purpose', copy: ['is a technology studio that applies frontier intelligence to shape our collective future. From winning an XPrize by deploying autonomous systems in the Brazilian Amazon to protect biodiversity, to developing new benchmarks with OpenAI for low-resource-languages, we pursue engineering, design, and research projects across a range of scales and domains.', 'This page is a collection of principles that guide our work.'] },
  { num: '01', title: 'Create for future generations', copy: 'Show them that we looked beyond our lifetimes, and built for them.' },
  { num: '02', title: 'Problem-led', copy: 'We believe in problem-led design, and in immersing to understand.' },
  { num: '03', title: 'Simple is sophisticated', copy: null },
  { num: '04', title: 'Distribute the future', copy: "The jagged frontier of technological advancement doesn't advance evenly." },
  { num: '05', title: 'Unlearning is essential', copy: null },
  { num: '06', title: 'Design with, not for', copy: 'Avoid the savior complex.' },
  { num: '07', title: 'Say please and thank you', copy: "When the agents take over, we want to be on their good side." },
];

export default function AboutClient() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const beliefRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Set gradient opacities on titles
    beliefRefs.current.forEach((el, i) => {
      if (el) {
        const op = (1 - (i / (beliefs.length - 1)) * 0.75).toFixed(2);
        el.style.setProperty('--title-op', op);
      }
    });

    // Scroll reveal
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    beliefRefs.current.forEach((el, i) => {
      if (el) {
        el.style.transitionDelay = `${i * 48}ms`;
        observer.observe(el);
      }
    });

    if (ruleRef.current) {
      setTimeout(() => ruleRef.current?.classList.add(styles.dotRuleVisible), 300);
    }

    return () => observer.disconnect();
  }, []);

  function toggleBelief(idx: number) {
    if (beliefs[idx].copy === null) return;
    setOpenIdx(prev => prev === idx ? null : idx);
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.beliefsSection}>
        <ol
          className={`${styles.beliefs} ${hoveredIdx !== null ? styles.listHovered : ''}`}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {beliefs.map((b, i) => (
            <li
              key={i}
              ref={el => { beliefRefs.current[i] = el; }}
              className={`${styles.belief} ${openIdx === i ? styles.open : ''} ${hoveredIdx === i ? styles.isHovered : ''}`}
              data-idx={i}
              onMouseEnter={() => setHoveredIdx(i)}
            >
              <span className={styles.beliefNum}>{b.num}</span>

              {b.copy !== null ? (
                <button
                  className={styles.beliefTrigger}
                  aria-expanded={openIdx === i}
                  onClick={() => toggleBelief(i)}
                >
                  <h2 className={styles.beliefTitle}>{b.title}</h2>
                  <span className={styles.beliefIcon}>+</span>
                </button>
              ) : (
                <div className={styles.beliefTriggerStatic}>
                  <h2 className={styles.beliefTitle}>{b.title}</h2>
                </div>
              )}

              {b.copy !== null && (
                <div className={styles.beliefExpand}>
                  <div className={styles.beliefExpandInner}>
                    {Array.isArray(b.copy)
                      ? b.copy.map((para, j) => <p key={j} className={styles.beliefCopy}>{para}</p>)
                      : <p className={styles.beliefCopy}>{b.copy}</p>
                    }
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div ref={ruleRef} className={styles.dotRule} />
    </div>
  );
}
