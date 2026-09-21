import styles from './MobileContainer.module.css';

interface MobileContainerProps {
  children: React.ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <main className={styles.container} id="main-content">
      {children}
    </main>
  );
}
