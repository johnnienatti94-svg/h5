import React from 'react';
import styles from './MobileContainer.module.css';

interface MobileContainerProps {
  children: React.ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className={styles.outerWrapper}>
      <div className={styles.container} id="mobile-app-root">
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
