import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/index.jsx';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function generateMonthsList() {
  const now = new Date();
  const startYear = now.getFullYear() - 5;
  const endYear = now.getFullYear() + 5;
  const list = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 0; m < 12; m++) {
      list.push({ year: y, month: m });
    }
  }
  return list;
}

const MONTHS_LIST = generateMonthsList();

function findIndex(year, month) {
  return MONTHS_LIST.findIndex((item) => item.year === year && item.month === month);
}

function MonthScrollPicker({ isOpen, onClose, selectedMonth, onSelect }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const centeredRef = useRef(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  // Touch tracking
  const touchRef = useRef({ startY: 0, startOffset: 0, lastY: 0, lastTime: 0, velocity: 0 });
  const offsetRef = useRef(0);
  const animRef = useRef(null);
  const isDragging = useRef(false);
  const wheelAreaRef = useRef(null);

  const getTargetOffset = (index) => -(index * ITEM_HEIGHT);

  const clampIndex = (idx) => Math.max(0, Math.min(idx, MONTHS_LIST.length - 1));

  const getIndexFromOffset = (offset) => {
    return clampIndex(Math.round(-offset / ITEM_HEIGHT));
  };

  const renderItems = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
  }, []);

  const snapTo = useCallback((targetIndex, animated = true) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const target = getTargetOffset(targetIndex);
    centeredRef.current = targetIndex;
    setDisplayIndex(targetIndex);

    if (!animated) {
      offsetRef.current = target;
      renderItems();
      return;
    }

    const start = offsetRef.current;
    const distance = target - start;
    const duration = 300;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      offsetRef.current = start + distance * ease;
      renderItems();

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, [renderItems]);

  const handleMomentum = useCallback((velocity) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    let currentOffset = offsetRef.current;
    let currentVelocity = velocity;
    const friction = 0.95;

    const animate = () => {
      currentVelocity *= friction;
      currentOffset += currentVelocity;

      // Clamp to valid range
      const minOffset = getTargetOffset(MONTHS_LIST.length - 1);
      const maxOffset = 0;
      currentOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));

      offsetRef.current = currentOffset;
      renderItems();

      if (Math.abs(currentVelocity) > 0.5) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to nearest
        const idx = getIndexFromOffset(currentOffset);
        snapTo(idx, true);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, [renderItems, snapTo]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    isDragging.current = true;
    const touch = e.touches[0];
    touchRef.current = {
      startY: touch.clientY,
      startOffset: offsetRef.current,
      lastY: touch.clientY,
      lastTime: performance.now(),
      velocity: 0,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const delta = touch.clientY - touchRef.current.startY;
    const now = performance.now();
    const dt = now - touchRef.current.lastTime;

    if (dt > 0) {
      touchRef.current.velocity = (touch.clientY - touchRef.current.lastY) / dt * 16;
    }
    touchRef.current.lastY = touch.clientY;
    touchRef.current.lastTime = now;

    let newOffset = touchRef.current.startOffset + delta;
    // Rubber band at edges
    const minOffset = getTargetOffset(MONTHS_LIST.length - 1);
    const maxOffset = 0;
    if (newOffset > maxOffset) {
      newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    } else if (newOffset < minOffset) {
      newOffset = minOffset + (newOffset - minOffset) * 0.3;
    }

    offsetRef.current = newOffset;
    renderItems();
  }, [renderItems]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const velocity = touchRef.current.velocity;

    if (Math.abs(velocity) > 2) {
      handleMomentum(velocity);
    } else {
      const idx = getIndexFromOffset(offsetRef.current);
      snapTo(idx, true);
    }
  }, [handleMomentum, snapTo]);

  // Mouse wheel support (for desktop testing)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = clampIndex(centeredRef.current + direction);
    snapTo(newIndex, true);
  }, [snapTo]);

  // Attach native touch/wheel listeners with { passive: false }
  useEffect(() => {
    const el = wheelAreaRef.current;
    if (!el || !isOpen) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Initialize position when picker opens
  useEffect(() => {
    if (isOpen) {
      const idx = findIndex(selectedMonth.year, selectedMonth.month);
      const validIdx = idx >= 0 ? idx : 0;
      centeredRef.current = validIdx;
      offsetRef.current = getTargetOffset(validIdx);
      setDisplayIndex(validIdx);
      renderItems();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, selectedMonth, renderItems]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    const item = MONTHS_LIST[centeredRef.current];
    if (item) onSelect(item);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onSelect({ year: now.getFullYear(), month: now.getMonth() });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // Render visible items centered on displayIndex
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div className="animate-slide-up w-[calc(100%-32px)] max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-2xl"
      >
        {/* Title */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('picker.month.title')}
          </h3>
        </div>

        {/* Scroll wheel */}
        <div
          ref={wheelAreaRef}
          className="relative mx-5 overflow-hidden"
          style={{ height: CONTAINER_HEIGHT }}
        >
          {/* Top gradient */}
          <div
            className="absolute top-0 left-0 right-0 z-10 pointer-events-none month-picker-gradient-top"
            style={{ height: ITEM_HEIGHT * 2 }}
          />

          {/* Bottom gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none month-picker-gradient-bottom"
            style={{ height: ITEM_HEIGHT * 2 }}
          />

          {/* Center highlight band */}
          <div
            className="absolute left-0 right-0 z-0 rounded-xl bg-[#F4F3EF] dark:bg-[#2D2B28]"
            style={{ top: centerOffset * ITEM_HEIGHT, height: ITEM_HEIGHT }}
          />

          {/* Items - positioned via transform */}
          <div
            ref={containerRef}
            className="absolute left-0 right-0 z-[1]"
            style={{
              top: centerOffset * ITEM_HEIGHT,
              transform: `translate3d(0, ${getTargetOffset(findIndex(selectedMonth.year, selectedMonth.month))}px, 0)`,
              willChange: 'transform',
            }}
          >
            {MONTHS_LIST.map((item, index) => {
              const distance = Math.abs(index - displayIndex);
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.45 : distance === 2 ? 0.25 : 0.15;
              const scale = distance === 0 ? 1 : distance === 1 ? 0.93 : 0.87;

              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className="flex items-center justify-center select-none"
                  style={{ height: ITEM_HEIGHT }}
                  onClick={() => snapTo(index, true)}
                >
                  <span
                    style={{
                      opacity,
                      transform: `scale(${scale})`,
                      fontSize: distance === 0 ? '16px' : '14px',
                      fontWeight: distance === 0 ? 600 : 400,
                      color: distance === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'opacity 0.15s, transform 0.15s, font-size 0.15s',
                    }}
                  >
                    {t(`months.${item.month}`)} {item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-5">
          <button
            type="button"
            onClick={handleCurrentMonth}
            className="flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl transition
              text-[#1B4965] dark:text-[#5FA8D3] bg-[#E8F0F4] dark:bg-[#1B2B35]
              active:scale-[0.97]"
          >
            {t('filter.month')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl transition
              text-white bg-[#1B4965] dark:bg-[#5FA8D3] shadow-sm
              active:scale-[0.97]"
          >
            {t('picker.month.confirm')}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

export default MonthScrollPicker;
