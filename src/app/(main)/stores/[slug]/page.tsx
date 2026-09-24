import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock3, ExternalLink, MapPin, Navigation, Phone, Store } from 'lucide-react';
import CopyMapLinkButton from '@/components/branches/CopyMapLinkButton';
import styles from '@/components/branches/StoreDetail.module.css';
import { getPublishedBranchBySlug } from '@/server/repositories/branchesRepository';

export const dynamic = 'force-dynamic';

interface StoreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedBranchBySlug(slug);
  if (!result.ok) return { title: 'ไม่พบสาขา | MeePro', robots: { index: false, follow: false } };
  return {
    title: `${result.data.name} | MeePro Store`,
    description: result.data.fullAddress,
    alternates: { canonical: `/stores/${result.data.slug}` },
  };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { slug } = await params;
  const result = await getPublishedBranchBySlug(slug);

  if (!result.ok) {
    return (
      <div className={styles.page}>
        <div className={styles.unavailable}>
          <Store size={36} aria-hidden="true" />
          <h1>สาขานี้ไม่มีให้บริการ</h1>
          <p>สาขาอาจยังไม่ได้เผยแพร่ ปิดให้บริการ หรือข้อมูลสาขายังไม่พร้อมใช้งาน</p>
          <Link href="/stores">ดูสาขาที่เปิดให้บริการ</Link>
        </div>
      </div>
    );
  }

  const branch = result.data;
  return (
    <div className={styles.page}>
      <Link href="/stores" className={styles.backLink}><ArrowLeft size={18} aria-hidden="true" /> กลับไปหน้าสาขา</Link>
      <article className={styles.card}>
        {branch.imageUrl && (
          <div className={styles.imageFrame}>
            <Image src={branch.imageUrl} alt={branch.imageAlt || `ภาพสาขา ${branch.name}`} fill sizes="(max-width: 900px) 100vw, 900px" className={styles.image} priority />
          </div>
        )}
        <div className={styles.content}>
          <span className={styles.eyebrow}>MEEPRO STORE</span>
          <h1>{branch.name}</h1>

          <div className={styles.details}>
            <section className={styles.detail}>
              <div className={styles.icon}><MapPin size={20} aria-hidden="true" /></div>
              <div><h2>ที่อยู่</h2><p>{branch.fullAddress}</p></div>
            </section>
            <section className={styles.detail}>
              <div className={styles.icon}><Phone size={20} aria-hidden="true" /></div>
              <div><h2>โทรศัพท์</h2><a href={branch.telHref}>{branch.displayPhone}</a></div>
            </section>
            {branch.openingHours.length > 0 && (
              <section className={styles.detail}>
                <div className={styles.icon}><Clock3 size={20} aria-hidden="true" /></div>
                <div><h2>เวลาเปิดให้บริการ</h2><ul>{branch.openingHours.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul></div>
              </section>
            )}
            {branch.directions && (
              <section className={styles.detail}>
                <div className={styles.icon}><Navigation size={20} aria-hidden="true" /></div>
                <div><h2>คำแนะนำการเดินทาง</h2><p>{branch.directions}</p></div>
              </section>
            )}
          </div>

          <section className={styles.mapBox}>
            <h2>Google Maps</h2>
            <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapUrl}>{branch.googleMapsUrl}</a>
            <CopyMapLinkButton url={branch.googleMapsUrl} />
          </section>

          <div className={styles.actions}>
            <a href={branch.telHref} className={styles.secondary}><Phone size={19} aria-hidden="true" /> โทร {branch.displayPhone}</a>
            <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.primary}><ExternalLink size={19} aria-hidden="true" /> เปิด Google Maps</a>
          </div>
        </div>
      </article>
    </div>
  );
}
