'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './about.module.css';

const beliefs = [
  { num: '00', title: 'General Purpose', copy: ['is a technology studio that applies frontier intelligence to shape our collective future. From winning an XPrize by deploying autonomous systems in the Brazilian Amazon to protect biodiversity, to developing new benchmarks with OpenAI for low-resource-languages, we pursue engineering, design, and research projects across a range of scales and domains.', 'This page is a collection of principles that guide our work.'] },
  { num: '01', title: 'Problem first', copy: 'We practice problem-led design. Every project begins with immersions, with system mapping, and with primary and secondary research to ensure we have an embodied understanding of a space before we propose or build solutions. This requires the intellectual honesty of knowing when technology, or AI, are not a suitable solution.' },
  { num: '02', title: 'Distribute the future', copy: "The jagged frontier of technological advancement doesn't advance evenly. Our purpose is to distribute the future." },
  { num: '03', title: 'Create for the next generations', copy: "Our aspiration is to look beyond our lifetimes, and to build for generations that haven't been born yet." },
  { num: '04', title: 'Design with, not for', copy: 'Co-create with users. From discovery and insight, to implementation and iteration, we design alongside stakeholders at every stage of the process.' },
  { num: '05', title: 'Simple is sophisticated', copy: "Occam's Razor is the essential wisdom. Don't make things complicated when simple will suffice." },
  { num: '06', title: 'Unlearn to move forward', copy: 'Much of the traditional knowledge about how to build products, and how to run a company, no longer applies. This requires relentless unlearning.' },
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
          className={`${styles.beliefs} ${hoveredIdx !== null && openIdx === null ? styles.listHovered : ''}`}
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
