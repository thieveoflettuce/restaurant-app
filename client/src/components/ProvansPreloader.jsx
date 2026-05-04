import React, { useEffect, useRef, useState } from 'react';
import { STROKE_PATHS } from '../strokes-array';

/**
 * ProvansPreloader — splash-экран с написанием логотипа «Прованс».
 *
 * Поведение:
 *  1) DRAWING — анимация написания штрихами кисти (mask reveal по картинке `logoSrc`).
 *  2) MORPHING — после готовности сайта SVG-контейнер «улетает» (translate+scale)
 *     в координаты элемента `morphTargetSelector` (по умолчанию `.hero-title-image`).
 *     Параллельно cream-фон угасает, а тёмный обрезанный логотип кросс-фейдится
 *     в `morphLogoSrc` (например, белый вариант) — так финальный кадр прелоадера
 *     визуально совпадает с тем, что есть в hero-title.
 *  3) DONE — `onFinished` зовётся, прелоадер можно размонтировать; элемент
 *     hero-title уже виден на нужном месте без рывка.
 *
 *  Если `.hero-title-image` не найден (например, открыт другой роут), компонент
 *  просто плавно угасает как раньше.
 */

const LOGO_DATA_URL = typeof window !== 'undefined' ? (window.PROVANS_LOGO_URL || null) : null;

export default function ProvansPreloader({
  siteReady = false,
  onFinished,
  duration = 2800,
  minDisplay,
  fadeOut = 600,
  background = 'cream',
  tagline = null,
  strokeWidth = 130,
  strokePaths = STROKE_PATHS,
  logoSrc,
  morphTargetSelector = '.hero-title-image',
  morphLogoSrc,
  morphDuration = 900,
}) {
  const svgRef = useRef(null);
  const morphRef = useRef(null);
  const targetElRef = useRef(null);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [phase, setPhase] = useState('drawing'); // drawing | morphing | done
  const [morphStyle, setMorphStyle] = useState(null);
  const [bgFading, setBgFading] = useState(false);
  const startedAt = useRef(0);

  // Анимация написания.
  useEffect(() => {
    const svg = svgRef.current;
    const paths = strokePaths;
    if (!svg || !paths) return;
    startedAt.current = performance.now();

    const NS = 'http://www.w3.org/2000/svg';
    const group = svg.querySelector('#brushGroup');
    group.innerHTML = '';
    const els = [];
    const lens = [];
    for (const stroke of paths) {
      const d = typeof stroke === 'string' ? stroke : stroke?.d;
      const width = typeof stroke === 'object' && stroke?.width ? stroke.width : strokeWidth;
      if (!d) continue;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke-width', String(width));
      group.appendChild(p);
      const len = p.getTotalLength();
      p.setAttribute('stroke-dasharray', String(len));
      p.setAttribute('stroke-dashoffset', String(len));
      els.push(p);
      lens.push(len);
    }

    const totalLen = lens.reduce((a, b) => a + b, 0);
    const liftMs = 100;
    const totalLifts = lens.length - 1;
    const drawDur = Math.max(800, duration - totalLifts * liftMs);

    let segIdx = 0;
    let segStart = performance.now();
    let raf;
    let timer;

    const tick = (now) => {
      const segLen = lens[segIdx];
      const segDur = drawDur * (segLen / totalLen);
      const k = Math.min(1, (now - segStart) / segDur);
      const off = lens[segIdx] * (1 - k);
      els[segIdx].setAttribute('stroke-dashoffset', off);
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        els[segIdx].setAttribute('stroke-dashoffset', 0);
        segIdx++;
        if (segIdx >= els.length) {
          if (tagline) setTimeout(() => setTaglineVisible(true), 200);
          setTimeout(() => setAnimDone(true), 400);
          return;
        }
        timer = setTimeout(() => {
          segStart = performance.now();
          raf = requestAnimationFrame(tick);
        }, liftMs);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [duration, strokeWidth, tagline, strokePaths]);

  // Триггер morph (или простой fade-out, если цели нет).
  useEffect(() => {
    if (phase !== 'drawing' || !animDone || !siteReady) return;
    const minMs = minDisplay ?? (duration + 400);
    const elapsed = performance.now() - startedAt.current;
    const wait = Math.max(0, minMs - elapsed);

    const t = setTimeout(() => {
      const source = morphRef.current;
      const target = morphTargetSelector
        ? document.querySelector(morphTargetSelector)
        : null;

      if (!source || !target) {
        // Fallback — просто fade-out.
        setBgFading(true);
        setPhase('morphing');
        setTimeout(() => onFinished && onFinished(), fadeOut);
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const sx = targetRect.width / sourceRect.width;
      const sy = targetRect.height / sourceRect.height;
      const tx =
        (targetRect.left + targetRect.width / 2) -
        (sourceRect.left + sourceRect.width / 2);
      const ty =
        (targetRect.top + targetRect.height / 2) -
        (sourceRect.top + sourceRect.height / 2);

      // Прячем целевой элемент на время morph, чтобы не было двойника.
      target.style.opacity = '0';
      targetElRef.current = target;

      setMorphStyle({
        transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`,
      });
      setBgFading(true);
      setPhase('morphing');

      setTimeout(() => {
        if (targetElRef.current) {
          // В тот же кадр, что и unmount: убираем inline-стиль —
          // hero-title-image сразу появляется на финальной позиции.
          targetElRef.current.style.opacity = '';
          targetElRef.current = null;
        }
        onFinished && onFinished();
      }, morphDuration);
    }, wait);

    return () => clearTimeout(t);
  }, [
    phase,
    animDone,
    siteReady,
    duration,
    minDisplay,
    fadeOut,
    morphTargetSelector,
    morphDuration,
    onFinished,
  ]);

  // Подстраховка: если компонент размонтировался во время morph,
  // не оставляем целевой элемент скрытым.
  useEffect(() => {
    return () => {
      if (targetElRef.current) {
        targetElRef.current.style.opacity = '';
        targetElRef.current = null;
      }
    };
  }, []);

  const bgColor =
    background === 'ink' ? '#1c1a14' :
    background === 'white' ? '#ffffff' :
    background === 'paper' ? '#ebe2cf' :
    '#f4ecd8';

  const src = logoSrc || LOGO_DATA_URL;
  const isMorphing = phase === 'morphing';
  const fadeMs = isMorphing ? morphDuration : fadeOut;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: bgFading ? 'none' : 'auto',
      }}
    >
      {/* Фон отдельным слоем — угасает, не влияя на лого. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: bgColor,
          opacity: bgFading ? 0 : 1,
          transition: `opacity ${fadeMs}ms ease-out`,
        }}
      />

      {/* Центрирующий слой с лого и подписью. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={morphRef}
          style={{
            width: 'min(60vw, 700px)',
            aspectRatio: '3491 / 1187',
            transformOrigin: 'center center',
            transition: isMorphing
              ? `transform ${morphDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : undefined,
            willChange: 'transform',
            ...(morphStyle || {}),
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 3491 1187"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-label="Прованс"
          >
            <defs>
              <mask id="provans-reveal" maskUnits="userSpaceOnUse" x="-200" y="-200" width="3891" height="1587">
                <rect x="-200" y="-200" width="3891" height="1587" fill="black" />
                <g id="brushGroup" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
              </mask>
            </defs>
            {src && (
              <image
                href={src}
                x="0" y="0" width="3491" height="1187"
                preserveAspectRatio="none"
                mask="url(#provans-reveal)"
                style={{
                  opacity: isMorphing && morphLogoSrc ? 0 : 1,
                  transition: `opacity ${Math.round(morphDuration * 0.55)}ms ease-out`,
                }}
              />
            )}
            {morphLogoSrc && (
              <image
                href={morphLogoSrc}
                x="0" y="0" width="3491" height="1187"
                preserveAspectRatio="none"
                style={{
                  opacity: isMorphing ? 1 : 0,
                  transition: `opacity ${Math.round(morphDuration * 0.55)}ms ease-in`,
                }}
              />
            )}
          </svg>
        </div>

        {tagline && (
          <div
            style={{
              marginTop: 18,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(14px, 1.8vw, 22px)',
              letterSpacing: '0.18em',
              color: background === 'ink' ? '#c9b676' : '#8b7a3f',
              opacity: isMorphing ? 0 : (taglineVisible ? 1 : 0),
              transform: taglineVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity ${isMorphing ? Math.round(morphDuration * 0.5) : 700}ms ease-out, transform 700ms ease-out`,
            }}
          >
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ProvansPreloader = ProvansPreloader;
}
