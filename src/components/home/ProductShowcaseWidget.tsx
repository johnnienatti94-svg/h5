'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ProductShowcaseWidget as IProductShowcaseWidget, ProductItem } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: IProductShowcaseWidget;
}

export default function ProductShowcaseWidget({ widget }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const products = widget.products || [];

  // Group products into pairs: 2 per slide x 3 slides = 6 products (Spec Sec 12.1)
  const slides: ProductItem[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    slides.push(products.slice(i, i + 2));
  }

  const handleScroll = () => {
    if (!trackRef.current) return;
    const scrollLeft = trackRef.current.scrollLeft;
    const clientWidth = trackRef.current.clientWidth;
    if (clientWidth > 0) {
      const page = Math.round(scrollLeft / clientWidth);
      setActiveSlide(Math.min(page, slides.length - 1));
    }
  };

  const scrollToSlide = (idx: number) => {
    if (!trackRef.current) return;
    const clientWidth = trackRef.current.clientWidth;
    trackRef.current.scrollTo({
      left: idx * clientWidth,
      behavior: 'smooth',
    });
    setActiveSlide(idx);
  };

  return (
    <div className={styles.widgetSection}>
      {/* Header with editable title & view all link (Spec Sec 12) */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.sectionTitle}>
            <span>🔥</span>
            <span>{widget.title}</span>
          </h2>
          {widget.subtitle && <p className={styles.sectionSubtitle}>{widget.subtitle}</p>}
        </div>
        <Link href={widget.viewAllLink || '/catalog'} className={styles.viewAllLink}>
          ดูทั้งหมด ›
        </Link>
      </div>

      {/* 2 Products per slide x 3 slides (Spec Sec 12.1) */}
      <div className={styles.showcaseSlider}>
        <div className={styles.slidesTrack} ref={trackRef} onScroll={handleScroll}>
          {slides.map((pair, slideIdx) => (
            <div key={slideIdx} className={styles.slidePair}>
              {pair.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productMedia}>
                    {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                    {product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/')) ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '36px' }}>{product.imageUrl || '📦'}</span>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>{product.name}</h3>

                    <div className={styles.priceGroup}>
                      <span className={styles.promoPrice}>
                        ฿{product.promoPrice.toLocaleString()}
                      </span>
                      {product.originalPrice > product.promoPrice && (
                        <span className={styles.originalPrice}>
                          ฿{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {product.installmentMonths && (
                      <span className={styles.installmentBadge}>
                        ผ่อน 0% {product.installmentMonths} ด.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 3 Slide Dots Pagination (Spec Sec 12.1) */}
        {slides.length > 1 && (
          <div className={styles.showcasePagination}>
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.showcaseDot} ${idx === activeSlide ? styles.showcaseDotActive : ''}`}
                onClick={() => scrollToSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
