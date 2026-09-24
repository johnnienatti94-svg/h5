'use client';

import React, { useState, useEffect } from 'react';
import { CustomerGreetingWidget as ICustomerGreetingWidget } from '@/types/widget';
import { getAuthUser } from '@/lib/auth';
import { getSystemConfig, SystemConfig } from '@/lib/adminSystem';
import styles from './homeWidgets.module.css';

interface Props {
  widget: ICustomerGreetingWidget;
}

export default function CustomerGreetingWidget({ widget }: Props) {
  const [phone, setPhone] = useState<string>('089-123-4567');
  const [sysConfig, setSysConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    let active = true;
    void getAuthUser().then((user) => {
      if (active && user?.phone) setPhone(user.phone);
    });
    setSysConfig(getSystemConfig());
    return () => {
      active = false;
    };
  }, []);

  if (widget.isActive === false) return null;

  const cfg = widget.config || {};
  const isMembershipEnabled =
    (sysConfig?.membershipEnabled ?? true) && (widget.showMembership ?? cfg.showMembership ?? true);
  const isRewardsEnabled =
    (sysConfig?.rewardsEnabled ?? true) && (widget.showPoints ?? cfg.showPoints ?? true);

  const points = widget.defaultPoints ?? cfg.defaultPoints ?? 450;
  const tier = widget.membershipTier || cfg.membershipTier || 'Gold';

  // Format display phone: 089-xxx-4567
  const displayPhone = phone.length >= 10
    ? `${phone.slice(0, 3)}-xxx-${phone.slice(-4)}`
    : phone;

  return (
    <div className={styles.widgetSection}>
      <div className={styles.greetingCard}>
        <div className={styles.userMeta}>
          <div className={styles.userAvatar}>
            👤
          </div>
          <div>
            <div className={styles.userGreeting}>สวัสดีครับ</div>
            <div className={styles.userName}>
              <span>{displayPhone}</span>
              {isMembershipEnabled && (
                <span className={styles.tierBadge}>{tier}</span>
              )}
            </div>
          </div>
        </div>

        {isRewardsEnabled && (
          <div className={styles.pointsBox}>
            <span className={styles.pointsLabel}>คะแนนสะสม MeePro</span>
            <span className={styles.pointsValue}>{points.toLocaleString()}</span>
            <span className={styles.pointsUnit}>พอยท์ • พร้อมแลกส่วนลด</span>
          </div>
        )}
      </div>
    </div>
  );
}
