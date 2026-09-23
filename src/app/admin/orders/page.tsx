'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import styles from '../admincn.module.css';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  amount: number;
  installmentMonths: number;
  monthlyPayment: number;
  paymentMethod: string;
  status: 'CONFIRMED' | 'PENDING' | 'PROCESSING' | 'FAILED';
  createdAt: string;
}

const DEMO_ORDERS: OrderItem[] = [
  {
    id: '1',
    orderNumber: 'MP-20260923-8812',
    customerName: 'คุณพัชราภรณ์ วัฒนากุล',
    customerPhone: '081-234-5678',
    productName: 'iPhone 16 Pro Max 256GB Desert Titanium',
    amount: 44900,
    installmentMonths: 10,
    monthlyPayment: 4490,
    paymentMethod: 'KBANK 0% (10ด.)',
    status: 'CONFIRMED',
    createdAt: '10 นาทีที่แล้ว',
  },
  {
    id: '2',
    orderNumber: 'MP-20260923-4129',
    customerName: 'คุณณัฐพล สุขเจริญ',
    customerPhone: '089-876-5432',
    productName: 'Samsung Galaxy S25 Ultra 512GB Titanium Silver',
    amount: 40900,
    installmentMonths: 10,
    monthlyPayment: 4090,
    paymentMethod: 'SCB 0% (10ด.)',
    status: 'CONFIRMED',
    createdAt: '25 นาทีที่แล้ว',
  },
  {
    id: '3',
    orderNumber: 'MP-20260923-7741',
    customerName: 'คุณวรรณิศา รุ่งโรจน์',
    customerPhone: '062-333-4455',
    productName: 'iPad Air 11 นิ้ว (M2) 128GB Wi-Fi',
    amount: 21900,
    installmentMonths: 6,
    monthlyPayment: 3650,
    paymentMethod: 'KTC 0% (6ด.)',
    status: 'PROCESSING',
    createdAt: '1 ชั่วโมงที่แล้ว',
  },
  {
    id: '4',
    orderNumber: 'MP-20260923-1092',
    customerName: 'คุณธนกฤต มั่งมี',
    customerPhone: '095-444-8899',
    productName: 'MacBook Air 13 นิ้ว M3 256GB Midnight',
    amount: 39900,
    installmentMonths: 24,
    monthlyPayment: 1663,
    paymentMethod: 'Krungsri 0% (24ด.)',
    status: 'PENDING',
    createdAt: '2 ชั่วโมงที่แล้ว',
  },
  {
    id: '5',
    orderNumber: 'MP-20260923-5561',
    customerName: 'คุณกิตติศักดิ์ พรชัย',
    customerPhone: '084-555-1212',
    productName: 'AirPods Pro (2nd Gen) USB-C',
    amount: 7990,
    installmentMonths: 3,
    monthlyPayment: 2664,
    paymentMethod: 'PromptPay QR',
    status: 'CONFIRMED',
    createdAt: '3 ชั่วโมงที่แล้ว',
  },
  {
    id: '6',
    orderNumber: 'MP-20260923-3320',
    customerName: 'คุณศศิธร เจริญผล',
    customerPhone: '086-777-9988',
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    amount: 11990,
    installmentMonths: 6,
    monthlyPayment: 1999,
    paymentMethod: 'TrueMoney Wallet',
    status: 'PENDING',
    createdAt: '4 ชั่วโมงที่แล้ว',
  },
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'PROCESSING'>('ALL');

  const filteredOrders = DEMO_ORDERS.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.productName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px' }}>
          🛍️ จัดการรายการสั่งซื้อ & สินเชื่อ (Orders & Commerce — AdminCN)
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          ตรวจสอบคำสั่งซื้อที่ผ่านระบบ Server-Authoritative Checkout พร้อมรายละเอียดสัญญาสินเชื่อ/ผ่อน 0%
        </p>
      </div>

      {/* 1. Statistics Cards (AdminCN Pattern) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>ยอดรวมคำสั่งซื้อวันนี้</span>
            <div className={styles.statIcon}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={styles.statValue}>฿167,580</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>↑ +18.4%</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>เทียบกับเมื่อวาน</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>สัญญาผ่อนชำระ 0% อนุมัติแล้ว</span>
            <div className={styles.statIcon} style={{ color: '#34D399' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div className={styles.statValue}>42 รายการ</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>↑ +12.0%</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>สัญญารับเครื่องศูนย์</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>รอส่งมอบที่สาขา (Pick up)</span>
            <div className={styles.statIcon} style={{ color: '#FBBF24' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className={styles.statValue}>14 เครื่อง</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>✓ 98.2%</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>ตรงตามนัดหมาย</span>
          </div>
        </div>
      </div>

      {/* 2. AdminCN Orders DataTable Container */}
      <div className={styles.tableContainer}>
        {/* Table Toolbar */}
        <div className={styles.tableToolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              className={styles.tableSearchInput}
              placeholder="ค้นหาเลขที่คำสั่งซื้อ, ลูกค้า, หรือสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.tableFilterPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${statusFilter === 'ALL' ? styles.filterPillActive : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              ทั้งหมด ({DEMO_ORDERS.length})
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${statusFilter === 'CONFIRMED' ? styles.filterPillActive : ''}`}
              onClick={() => setStatusFilter('CONFIRMED')}
            >
              ยืนยันแล้ว
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${statusFilter === 'PENDING' ? styles.filterPillActive : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              รอดำเนินการ
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${statusFilter === 'PROCESSING' ? styles.filterPillActive : ''}`}
              onClick={() => setStatusFilter('PROCESSING')}
            >
              กำลังเตรียมเครื่อง
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>เลขที่คำสั่งซื้อ</th>
                <th>ข้อมูลลูกค้า</th>
                <th>สินค้าที่สั่งซื้อ</th>
                <th>ยอดชำระ / การผ่อน</th>
                <th>ช่องทางชำระเงิน</th>
                <th>สถานะ</th>
                <th style={{ textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#60A5FA', letterSpacing: '0.02em' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{order.createdAt}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{order.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{order.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#CBD5E1', maxWidth: '280px', lineHeight: 1.4 }}>
                      {order.productName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#F8FAFC' }}>
                      ฿{order.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 700 }}>
                      ผ่อน ฿{order.monthlyPayment.toLocaleString()} × {order.installmentMonths} ด.
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td>
                    {order.status === 'CONFIRMED' && (
                      <span className={`${styles.statusPill} ${styles.statusPaid}`}>
                        <CheckCircle2 size={12} /> ยืนยันแล้ว
                      </span>
                    )}
                    {order.status === 'PENDING' && (
                      <span className={`${styles.statusPill} ${styles.statusPending}`}>
                        <Clock size={12} /> รอตรวจสอบ
                      </span>
                    )}
                    {order.status === 'PROCESSING' && (
                      <span className={`${styles.statusPill} ${styles.statusProcessing}`}>
                        <RefreshCw size={12} /> เตรียมส่งมอบ
                      </span>
                    )}
                    {order.status === 'FAILED' && (
                      <span className={`${styles.statusPill} ${styles.statusFailed}`}>
                        <AlertCircle size={12} /> ไม่สำเร็จ
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className={styles.headerLink}
                      style={{ display: 'inline-flex', padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => alert(`ดูรายละเอียดคำสั่งซื้อ ${order.orderNumber}`)}
                    >
                      <Eye size={12} />
                      <span>ดูข้อมูล</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
