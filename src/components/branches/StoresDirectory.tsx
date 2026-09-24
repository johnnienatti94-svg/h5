'use client';

import { MapPin, Search, Store } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { PublicBranch } from '@/features/branches/types';
import BranchDetailsDialog from './BranchDetailsDialog';
import styles from './StoresDirectory.module.css';

interface StoresDirectoryProps {
  branches: PublicBranch[];
  loadError?: string | null;
}

export default function StoresDirectory({ branches, loadError = null }: StoresDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [region, setRegion] = useState(searchParams.get('region') ?? 'all');
  const [returnFocusElement, setReturnFocusElement] = useState<HTMLElement | null>(null);
  const [openedFromDirectory, setOpenedFromDirectory] = useState(false);

  const regions = useMemo(
    () => Array.from(new Set(branches.map((branch) => branch.region).filter((value): value is string => Boolean(value)))).sort(),
    [branches],
  );

  const filteredBranches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');
    return branches.filter((branch) => {
      const matchesRegion = region === 'all' || branch.region === region;
      const haystack = [branch.name, branch.fullAddress, branch.province, branch.region].filter(Boolean).join(' ').toLocaleLowerCase('th-TH');
      return matchesRegion && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [branches, query, region]);

  const selectedSlug = searchParams.get('branch');
  const selectedBranch = selectedSlug ? branches.find((branch) => branch.slug === selectedSlug) ?? null : null;

  const buildUrl = (branchSlug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (branchSlug) params.set('branch', branchSlug);
    else params.delete('branch');
    const suffix = params.toString();
    return suffix ? `${pathname}?${suffix}` : pathname;
  };

  const openBranch = (branch: PublicBranch, trigger: HTMLButtonElement) => {
    setReturnFocusElement(trigger);
    if (selectedSlug) {
      router.replace(buildUrl(branch.slug), { scroll: false });
      return;
    }
    setOpenedFromDirectory(true);
    router.push(buildUrl(branch.slug), { scroll: false });
  };

  const closeBranch = () => {
    if (openedFromDirectory) {
      setOpenedFromDirectory(false);
      router.back();
    } else {
      router.replace(buildUrl(), { scroll: false });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}><Store size={28} aria-hidden="true" /></div>
        <div>
          <span className={styles.eyebrow}>MEEPRO STORE</span>
          <h1>ค้นหาสาขา MeePro</h1>
          <p>ค้นหาสาขาที่เผยแพร่แล้ว ดูที่อยู่ เบอร์โทร เวลาเปิดบริการ และลิงก์ Google Maps ที่บันทึกโดยทีมงาน</p>
        </div>
      </header>

      <section className={styles.filters} aria-label="ค้นหาและกรองสาขา">
        <label className={styles.searchField}>
          <span className={styles.srOnly}>ค้นหาจากชื่อสาขาหรือที่อยู่</span>
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อสาขา ที่อยู่ หรือจังหวัด"
          />
        </label>

        <div className={styles.regionFilters} role="group" aria-label="กรองตามภูมิภาค">
          <button type="button" className={region === 'all' ? styles.activeFilter : styles.filterButton} onClick={() => setRegion('all')} aria-pressed={region === 'all'}>
            ทุกภูมิภาค
          </button>
          {regions.map((regionName) => (
            <button
              key={regionName}
              type="button"
              className={region === regionName ? styles.activeFilter : styles.filterButton}
              onClick={() => setRegion(regionName)}
              aria-pressed={region === regionName}
            >
              {regionName}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.resultsHeader} aria-live="polite">
        <span>{loadError ? 'ไม่สามารถโหลดข้อมูลสาขา' : `พบ ${filteredBranches.length} สาขา`}</span>
        {(query || region !== 'all') && (
          <button type="button" onClick={() => { setQuery(''); setRegion('all'); }}>ล้างตัวกรอง</button>
        )}
      </div>

      {loadError ? (
        <div className={styles.stateCard} role="alert">
          <MapPin size={30} aria-hidden="true" />
          <h2>ข้อมูลสาขายังไม่พร้อมใช้งาน</h2>
          <p>{loadError}</p>
          <button type="button" onClick={() => window.location.reload()}>ลองอีกครั้ง</button>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className={styles.stateCard}>
          <Search size={30} aria-hidden="true" />
          <h2>ไม่พบสาขาที่ตรงกับการค้นหา</h2>
          <p>ลองใช้ชื่อจังหวัด ชื่อศูนย์การค้า หรือเปลี่ยนภูมิภาค</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBranches.map((branch) => (
            <article key={branch.id} className={styles.card}>
              <div className={styles.cardTopline}>
                <span>{branch.region || branch.province || 'MeePro Store'}</span>
                <span className={styles.activeBadge}>เปิดให้บริการ</span>
              </div>
              <h2>{branch.name}</h2>
              <p className={styles.address}>{branch.fullAddress}</p>
              <div className={styles.cardMeta}>
                <a href={branch.telHref}>{branch.displayPhone}</a>
                {branch.openingHours[0] && <span>{branch.openingHours[0]}</span>}
              </div>
              <button type="button" className={styles.detailsButton} onClick={(event) => openBranch(branch, event.currentTarget)}>
                <MapPin size={18} aria-hidden="true" />
                ดูรายละเอียดสาขา
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedSlug && (
        <BranchDetailsDialog
          branch={selectedBranch}
          unavailableSlug={selectedBranch ? undefined : selectedSlug}
          onClose={closeBranch}
          returnFocusElement={returnFocusElement}
        />
      )}
    </div>
  );
}
