'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getAuthUser } from '@/lib/auth';
import styles from './CartDrawer.module.css';

interface BranchOption {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
}

const FALLBACK_BRANCHES: BranchOption[] = [
  {
    id: 'centralworld',
    name: 'MeePro Flagship Store CentralWorld',
    address: 'ชั้น 4 โซน Atrium (ใกล้ลิฟต์แก้ว) CentralWorld กรุงเทพฯ',
    phone: '02-255-9001',
    hours: '10:00 - 22:00 น.',
  },
  {
    id: 'siam-paragon',
    name: 'MeePro Experience Store Siam Paragon',
    address: 'ชั้น 3 โซน Living & Technology สยามพารากอน กรุงเทพฯ',
    phone: '02-610-8112',
    hours: '10:00 - 21:30 น.',
  },
  {
    id: 'mega-bangna',
    name: 'MeePro Store Mega Bangna',
    address: 'ชั้น 2 โซน Mega Tech เมกาบางนา สมุทรปราการ',
    phone: '02-105-1556',
    hours: '10:00 - 22:00 น.',
  },
  {
    id: 'future-park-rangsit',
    name: 'MeePro Store Future Park Rangsit',
    address: 'ชั้น 3 โซน Digital Park ฟิวเจอร์พาร์ครังสิต ปทุมธานี',
    phone: '02-958-0011',
    hours: '10:30 - 21:30 น.',
  },
  {
    id: 'central-chiang-mai',
    name: 'MeePro Store Central Festival Chiang Mai',
    address: 'ชั้น 3 โซน IT เซ็นทรัลเฟสติวัล เชียงใหม่',
    phone: '053-999-888',
    hours: '10:00 - 21:30 น.',
  },
];

const TIME_SLOTS = [
  '10:30 - 11:30 น.',
  '11:30 - 12:30 น.',
  '13:00 - 14:00 น.',
  '14:30 - 15:30 น.',
  '16:00 - 17:00 น.',
  '17:30 - 18:30 น.',
  '19:00 - 20:00 น.',
];

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    discountAmount,
    totalPrice,
    estimatedMonthlyInstallment,
    appliedVoucher,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyVoucher,
    removeVoucher,
    clearCart,
  } = useCart();

  // Wizard state: 'cart' | 'login' | 'fulfillment' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'login' | 'fulfillment' | 'success'>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-drawer Login / Register state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginCooldown, setLoginCooldown] = useState(60);

  // Fulfillment state
  const [branches, setBranches] = useState<BranchOption[]>(FALLBACK_BRANCHES);
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(FALLBACK_BRANCHES[0].id);
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [appointmentTime, setAppointmentTime] = useState<string>(TIME_SLOTS[1]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Load stores from API on mount
  useEffect(() => {
    let active = true;
    fetch('/api/stores')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.data?.stores) && data.data.stores.length > 0) {
          const mapped: BranchOption[] = data.data.stores.map((s: any) => ({
            id: s.id || s.slug,
            name: s.name,
            address: s.fullAddress || s.address || '',
            phone: s.displayPhone || s.phone,
            hours: Array.isArray(s.openingHours) ? s.openingHours.join(', ') : s.openingHours,
          }));
          setBranches(mapped);
          if (mapped[0]) setSelectedBranchId(mapped[0].id);
        }
      })
      .catch(() => {
        // Keep fallback
      });
    return () => {
      active = false;
    };
  }, []);

  // Cooldown timer for inline login
  useEffect(() => {
    if (loginStep !== 'otp' || loginCooldown <= 0) return;
    const timer = window.setTimeout(() => setLoginCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [loginStep, loginCooldown]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    const res = applyVoucher(code);
    setCouponFeedback(res.message);
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => setCouponFeedback(null), 3500);
  };

  // Step 1 -> Check login or prompt
  const handleProceedToFulfillment = async () => {
    if (items.length === 0) return;
    setErrorMessage(null);

    const user = await getAuthUser();
    if (!user) {
      // User must login first
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('meepro_customer_name') : '';
      if (storedName) setLoginName(storedName);
      setCheckoutStep('login');
      return;
    }

    // Prefill customer details
    setCustomerName(user.contactName || (typeof window !== 'undefined' ? localStorage.getItem('meepro_customer_name') : '') || '');
    setCustomerPhone(user.phone || '');
    setCheckoutStep('fulfillment');
  };

  // Inline Login Request OTP
  const handleInlineRequestOtp = async () => {
    const clean = loginPhone.replace(/\D/g, '');
    if (!/^0[689]\d{8}$/.test(clean)) {
      setLoginError('กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก (06, 08, 09)');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถส่งรหัส OTP ได้');
      }
      setLoginCooldown(data.cooldownRemaining || 60);
      setLoginStep('otp');
    } catch (err: any) {
      setLoginError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoginLoading(false);
    }
  };

  // Inline Login Verify OTP
  const handleInlineVerifyOtp = async () => {
    if (loginOtp.length !== 6) {
      setLoginError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const clean = loginPhone.replace(/\D/g, '');
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          code: loginOtp,
          name: loginName.trim() || undefined,
          privacyAccepted: true,
          privacyPolicyVersion: '1.0',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'รหัส OTP ไม่ถูกต้อง');
      }

      const assignedName = loginName.trim() || data.user?.contactName || 'ลูกค้า MeePro';
      if (typeof window !== 'undefined') {
        localStorage.setItem('meepro_customer_name', assignedName);
        localStorage.setItem(
          'meepro_customer_auth',
          JSON.stringify({
            userId: data.user?.id || 'customer',
            phone: clean,
            phone_verified: true,
            contactName: assignedName,
          })
        );
      }

      setCustomerName(assignedName);
      setCustomerPhone(clean);
      setCheckoutStep('fulfillment');
    } catch (err: any) {
      setLoginError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP');
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 2 -> Submit Order
  const handleFinalOrderSubmit = async () => {
    if (items.length === 0 || isSubmitting) return;

    if (!customerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลของผู้สั่งซื้อ');
      return;
    }
    const cleanCustPhone = customerPhone.replace(/\D/g, '');
    if (!/^0[689]\d{8}$/.test(cleanCustPhone)) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)');
      return;
    }

    const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Authoritative quote validation
      const quoteRes = await fetch('/api/checkout/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          couponCode: appliedVoucher || undefined,
          installmentMonths: 10,
        }),
      });

      const quoteData = await quoteRes.json();
      if (!quoteRes.ok || !quoteData.success) {
        setErrorMessage(quoteData.error || 'การตรวจสอบสินค้าล้มเหลว กรุณาลองใหม่อีกครั้ง');
        setIsSubmitting(false);
        return;
      }

      // 2. Atomic order submission
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const customerAddress =
        fulfillmentType === 'delivery'
          ? (deliveryAddress.trim() || 'จัดส่งถึงบ้าน (เจ้าหน้าที่จะโทรสอบถามที่อยู่จัดส่ง)')
          : `รับที่สาขา: ${selectedBranch.name} (${selectedBranch.address})`;

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          token: quoteData.quote.token,
          idempotencyKey,
          customer: {
            name: customerName.trim(),
            phone: cleanCustPhone,
            address: customerAddress,
          },
          fulfillment: {
            type: fulfillmentType,
            branchId: selectedBranch.id,
            branchName: selectedBranch.name,
            branchAddress: selectedBranch.address,
            appointmentDate,
            appointmentTime,
            deliveryAddress:
              fulfillmentType === 'delivery'
                ? (deliveryAddress.trim() || 'จัดส่งถึงบ้าน (เจ้าหน้าที่จะโทรสอบถามที่อยู่จัดส่ง)')
                : undefined,
          },
          paymentMethod: 'installment_0_percent',
          installmentMonths: 10,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setErrorMessage(orderData.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
        setIsSubmitting(false);
        return;
      }

      setConfirmedOrder({
        orderId: orderData.order.orderId,
        customerName: customerName.trim(),
        customerPhone: cleanCustPhone,
        fulfillmentType,
        branchName: selectedBranch.name,
        branchAddress: selectedBranch.address,
        appointmentDate,
        appointmentTime,
        deliveryAddress:
          fulfillmentType === 'delivery'
            ? (deliveryAddress.trim() || 'จัดส่งถึงบ้าน (เจ้าหน้าที่จะโทรสอบถามที่อยู่จัดส่ง)')
            : '',
        totalPrice,
        monthlyPayment: estimatedMonthlyInstallment,
      });

      setCheckoutStep('success');
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];

  return (
    <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {checkoutStep === 'fulfillment' || checkoutStep === 'login' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                aria-label="ย้อนกลับ"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
            ) : (
              <span className="material-symbols-outlined text-[22px] text-[#007ACC]">shopping_bag</span>
            )}

            <span className="font-bold text-[16px] text-[#0F172A]">
              {checkoutStep === 'cart'
                ? 'ตะกร้าสินค้าของฉัน'
                : checkoutStep === 'login'
                ? 'เข้าสู่ระบบเพื่อสั่งซื้อ'
                : checkoutStep === 'fulfillment'
                ? 'เลือกวิธีรับสินค้า & นัดหมาย'
                : 'สั่งซื้อสำเร็จ'}
            </span>

            {checkoutStep === 'cart' && <span className={styles.itemCountBadge}>{totalCount}</span>}
          </div>

          <button
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="ปิดตะกร้า"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ================= STEP: SUCCESS ================= */}
        {checkoutStep === 'success' ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mb-4 shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined text-[36px]">check</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">สร้างคำสั่งซื้อสำเร็จ!</h3>

            {confirmedOrder?.orderId && (
              <div className="inline-block bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-lg my-2 tracking-wider">
                เลขที่คำสั่งซื้อ: {confirmedOrder.orderId}
              </div>
            )}

            {/* Notification Highlight Banner */}
            <div className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 my-3 text-left">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#FF6E00] text-[22px] mt-0.5 shrink-0">
                  phone_in_talk
                </span>
                <div>
                  <h4 className="font-bold text-xs text-[#FF6E00] leading-snug">
                    แอดมินได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
                  </h4>
                  <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                    เจ้าหน้าที่จะโทรติดต่อกลับหาคุณทางเบอร์{' '}
                    <strong className="text-slate-900 font-bold">{confirmedOrder?.customerPhone}</strong>{' '}
                    เพื่อยืนยันคำสั่งซื้อและคอนเฟิร์มเวลานัดหมายรับเครื่อง
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Details Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs space-y-2 mb-4">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">ผู้สั่งซื้อ:</span>
                <span className="font-semibold text-slate-800">{confirmedOrder?.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">วิธีรับสินค้า:</span>
                <span className="font-semibold text-slate-800">
                  {confirmedOrder?.fulfillmentType === 'pickup' ? '🏪 รับที่สาขา' : '🚚 จัดส่งถึงบ้าน'}
                </span>
              </div>

              {confirmedOrder?.fulfillmentType === 'pickup' ? (
                <>
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-slate-500 block mb-0.5">สาขาที่นัดรับ:</span>
                    <span className="font-semibold text-slate-800">{confirmedOrder?.branchName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">วัน-เวลานัดรับ:</span>
                    <span className="font-semibold text-slate-800">
                      {confirmedOrder?.appointmentDate} ({confirmedOrder?.appointmentTime})
                    </span>
                  </div>
                </>
              ) : (
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-slate-500 block mb-0.5">ที่อยู่จัดส่ง:</span>
                  <span className="font-semibold text-slate-800">{confirmedOrder?.deliveryAddress}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 font-bold text-slate-900">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className="text-sm text-[#FF6E00]">฿{confirmedOrder?.totalPrice?.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="w-full py-3 bg-[#007ACC] hover:bg-[#0061A3] text-white rounded-xl font-bold text-sm transition-all shadow-md"
              onClick={() => {
                setCheckoutStep('cart');
                setIsCartOpen(false);
              }}
            >
              เสร็จสิ้น / ปิดหน้าต่าง
            </button>
          </div>
        ) : checkoutStep === 'login' ? (
          /* ================= STEP: INLINE LOGIN / REGISTER ================= */
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between bg-slate-50">
            <div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-4">
                <div className="flex items-center gap-2 mb-2 text-[#FF6E00]">
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                  <h3 className="font-bold text-sm text-slate-900">เข้าสู่ระบบ / ลงทะเบียนเพื่อสั่งซื้อ</h3>
                </div>
                <p className="text-xs text-slate-500">
                  กรุณากรอกเบอร์โทรศัพท์และชื่อของคุณ เพื่อให้แอดมินโทรติดต่อกลับยืนยันการรับเครื่อง
                </p>
              </div>

              {loginStep === 'phone' ? (
                <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="เช่น คุณสมชาย ใจดี"
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#007ACC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      หมายเลขโทรศัพท์มือถือ <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center h-11 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-[#007ACC]">
                      <span className="px-3 bg-slate-100 text-xs font-bold text-slate-700 border-r border-slate-200">
                        +66
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="08x-xxx-xxxx"
                        className="w-full h-full px-3 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-xs text-red-600 font-medium">{loginError}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">กรอกรหัส OTP 6 หลักที่ส่งไปยังเบอร์</p>
                    <p className="text-sm font-bold text-[#007ACC] mt-0.5">{loginPhone}</p>
                    <p className="text-[11px] text-slate-400 mt-1">(รหัสทดสอบ: 123456)</p>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="รหัส OTP 6 หลัก"
                    className="w-full h-12 text-center tracking-[0.4em] font-extrabold text-xl bg-slate-50 border-2 border-slate-200 focus:border-[#007ACC] rounded-xl focus:outline-none"
                    autoFocus
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <button
                      type="button"
                      disabled={loginCooldown > 0 || loginLoading}
                      onClick={handleInlineRequestOtp}
                      className="text-[#007ACC] font-semibold hover:underline disabled:opacity-40"
                    >
                      ขอรหัสใหม่
                    </button>
                    <span>{loginCooldown > 0 ? `${loginCooldown} วินาที` : 'พร้อมขอใหม่'}</span>
                  </div>

                  {loginError && (
                    <p className="text-xs text-red-600 font-medium">{loginError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3">
              {loginStep === 'phone' ? (
                <button
                  type="button"
                  disabled={loginLoading || !loginPhone || !loginName}
                  onClick={handleInlineRequestOtp}
                  className="w-full h-12 rounded-xl bg-[#FF6E00] hover:bg-[#E65100] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
                >
                  {loginLoading ? 'กำลังส่ง OTP...' : 'ขอรับรหัส OTP เพื่อดำเนินการต่อ'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loginLoading || loginOtp.length !== 6}
                  onClick={handleInlineVerifyOtp}
                  className="w-full h-12 rounded-xl bg-[#007ACC] hover:bg-[#0061A3] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
                >
                  {loginLoading ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP และเลือกวิธีรับสินค้า'}
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              )}
            </div>
          </div>
        ) : checkoutStep === 'fulfillment' ? (
          /* ================= STEP: FULFILLMENT & APPOINTMENT ================= */
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between bg-slate-50">
            <div className="space-y-4">
              {/* Method Switcher Tabs */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    fulfillmentType === 'pickup'
                      ? 'bg-white text-[#FF6E00] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>รับสินค้าที่สาขา</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'bg-white text-[#007ACC] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>จัดส่งถึงบ้าน (ฟรี)</span>
                </button>
              </div>

              {/* Branch & Appointment Section (When Pickup) */}
              {fulfillmentType === 'pickup' ? (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. เลือกสาขาที่สะดวกรับเครื่อง
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#FF6E00] focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>

                    {selectedBranchObj && (
                      <div className="mt-2 p-2.5 rounded-lg bg-orange-50/70 border border-orange-100 text-[11px] text-slate-600 leading-relaxed">
                        <p className="font-semibold text-slate-800">📍 {selectedBranchObj.address}</p>
                        {selectedBranchObj.hours && <p className="mt-0.5 text-slate-500">⏰ {selectedBranchObj.hours}</p>}
                        {selectedBranchObj.phone && <p className="text-slate-500">📞 {selectedBranchObj.phone}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      2. วันที่นัดหมายรับเครื่อง
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      3. ช่วงเวลาที่สะดวกรับเครื่อง
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setAppointmentTime(slot)}
                          className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                            appointmentTime === slot
                              ? 'bg-orange-50 border-[#FF6E00] text-[#FF6E00] font-bold ring-1 ring-[#FF6E00]'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Home Delivery Section (Staff will contact for address) */
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#FF6E00] text-[22px] shrink-0 mt-0.5">
                      phone_in_talk
                    </span>
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold text-slate-900">ไม่ต้องระบุที่อยู่จัดส่งในระบบ</p>
                      <p className="text-slate-600 mt-0.5 text-[11px]">
                        เมื่อกดสั่งซื้อเรียบร้อย เจ้าหน้าที่ MeePro จะโทรติดต่อกลับหาคุณเพื่อยืนยันคำสั่งซื้อและสอบถามที่อยู่จัดส่งโดยตรง
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    <span>บริการส่งฟรีทั่วประเทศ จัดส่งด่วนถึงบ้านพร้อมประกันขนส่ง</span>
                  </div>
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">ข้อมูลผู้สั่งซื้อ (แอดมินจะโทรติดต่อกลับ)</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ชื่อผู้สั่งซื้อ"
                      className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">เบอร์โทรติดต่อกลับ</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="เบอร์โทรศัพท์ 10 หลัก"
                      className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Recap */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวมสินค้า ({items.length} รายการ):</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>ส่วนลดคูปอง:</span>
                    <span>-฿{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่ง / ค่าบริการสาขา:</span>
                  <span className="text-emerald-600 font-bold">ฟรี (฿0)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>ยอดสุทธิ:</span>
                  <span className="text-[#FF6E00]">฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  ผ่อน 0% (10 เดือน) ~ ฿{estimatedMonthlyInstallment.toLocaleString()}/ด.
                </div>
              </div>
            </div>

            {/* Submit Order Action */}
            <div className="pt-3">
              {errorMessage && (
                <div className="mb-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalOrderSubmit}
                className="w-full h-12 rounded-xl bg-[#FF6E00] hover:bg-[#E65100] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ (แอดมินจะติดต่อกลับ)'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isSubmitting ? 'hourglass_top' : 'check_circle'}
                </span>
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-2">
                🔒 สั่งจองสะดวก ไม่ต้องชำระเงินทันที — เจ้าหน้าที่จะโทรติดต่อกลับเพื่อคอนเฟิร์ม
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* ================= STEP: EMPTY CART ================= */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3 className={styles.emptyTitle}>ตะกร้าของคุณยังว่างอยู่</h3>
            <p className={styles.emptySubtitle}>
              เลือกดูสมาร์ตโฟนหรือแกดเจ็ตโปรโมชั่นพิเศษ แล้วเพิ่มลงในตะกร้าได้เลย
            </p>
            <button
              className={styles.shopNowBtn}
              onClick={() => {
                setIsCartOpen(false);
                window.location.href = '/catalog';
              }}
            >
              เลือกชมสินค้าทันที
            </button>
          </div>
        ) : (
          /* ================= STEP: CART ITEMS & SUMMARY ================= */
          <>
            {/* Items List */}
            <div className={styles.itemList}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className={styles.itemCard}>
                  <div className={styles.itemMedia}>
                    {product.imageUrl &&
                    (product.imageUrl.startsWith('http') ||
                      product.imageUrl.startsWith('/') ||
                      product.imageUrl.includes('.')) ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.itemImage}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[28px]">{product.imageUrl || '📱'}</span>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{product.name}</h4>
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>
                        ฿{product.promoPrice.toLocaleString()}
                      </span>
                      {product.originalPrice > product.promoPrice && (
                        <span className={styles.itemOriginalPrice}>
                          ฿{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className={styles.installmentNote}>
                      ผ่อน 0% {product.installmentMonths} ด. ~ ฿
                      {Math.round(product.promoPrice / product.installmentMonths).toLocaleString()}/ด.
                    </div>

                    {/* Quantity controls */}
                    <div className={styles.qtyRow}>
                      <div className={styles.qtyBox}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(product.id, -1)}
                          aria-label="ลดจำนวน"
                        >
                          -
                        </button>
                        <span className={styles.qtyNumber}>{quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(product.id, 1)}
                          aria-label="เพิ่มจำนวน"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(product.id)}
                        aria-label="ลบออกจากตะกร้า"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Section */}
            <div className={styles.voucherSection}>
              <div className={styles.voucherInputRow}>
                <input
                  type="text"
                  placeholder="กรอกโค้ดส่วนลด เช่น MEEPRO500"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className={styles.voucherInput}
                />
                <button
                  type="button"
                  className={styles.applyCouponBtn}
                  onClick={() => handleApplyCoupon()}
                >
                  ใช้โค้ด
                </button>
              </div>

              {couponFeedback && (
                <div className={styles.voucherFeedback}>{couponFeedback}</div>
              )}

              {appliedVoucher ? (
                <div className={styles.appliedVoucherPill}>
                  <span>🎟️ ใช้โค้ด {appliedVoucher} (ลด ฿{discountAmount.toLocaleString()})</span>
                  <button type="button" onClick={removeVoucher} className={styles.removeVoucherBtn}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className={styles.quickVouchers}>
                  <span className="text-[11px] text-[#64748B]">โค้ดแนะนำ:</span>
                  <button
                    type="button"
                    className={styles.quickCodePill}
                    onClick={() => handleApplyCoupon('MEEPRO500')}
                  >
                    MEEPRO500 (-฿500)
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary & Checkout Footer */}
            <div className={styles.footer}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>ยอดรวมสินค้า</span>
                <span className={styles.summaryVal}>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>ส่วนลดคูปอง</span>
                  <span className={styles.summaryDiscount}>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>ค่าจัดส่ง / รับที่สาขา</span>
                <span className="text-[#16A365] font-semibold text-[13px]">ฟรีค่าบริการ</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <div>
                  <div className={styles.totalLabel}>ยอดรวมทั้งสิ้น</div>
                  <div className={styles.installmentHighlight}>
                    หรือผ่อน 0% เพียง <strong>฿{estimatedMonthlyInstallment.toLocaleString()}</strong>/ด.
                  </div>
                </div>
                <div className={styles.totalAmount}>
                  ฿{totalPrice.toLocaleString()}
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#FDE8E8',
                    border: '1px solid #F8B4B4',
                    color: '#9B1C1C',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    margin: '8px 0',
                    lineHeight: 1.4,
                  }}
                >
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleProceedToFulfillment}
              >
                <span>ดำเนินการสั่งซื้อ / ผ่อนชำระ</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
