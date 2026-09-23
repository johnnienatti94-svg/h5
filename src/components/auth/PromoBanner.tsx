export function PromoBanner() {
  return <section className="relative h-[180px] overflow-hidden rounded-2xl bg-promo px-4 pt-[19px] text-white" aria-label="โปรโมชั่น MeePro" data-node-id="1:5">
    <h2 className="w-[180px] text-[22px] font-bold leading-normal">ดีลดี มือถือโดนใจ<br />ในราคาคุ้มกว่า</h2>
    <p className="mt-1 text-xs font-medium">ช้อปง่าย • ปลอดภัย • มีโปรโฟน</p>
    <div className="absolute left-[229px] top-[38px] h-[104px] w-[58px] rounded-xl border border-[#D9E5F0] bg-white" aria-hidden="true"><span className="absolute left-[9px] top-[9px] h-[18px] w-[18px] rounded-full bg-ink" /></div>
    <div className="absolute left-[204px] top-[135px] h-3 w-[105px] rounded-full bg-[#CCF2F7]" aria-hidden="true" />
  </section>;
}
export function BannerPagination() {
  return <div className="flex h-[46px] items-center justify-center gap-2" aria-label="สไลด์ที่ 1 จาก 4">{[0,1,2,3].map((dot)=><span key={dot} className={`h-1.5 w-1.5 rounded-full ${dot===0?"bg-action":"bg-[#D1D9E3]"}`} />)}</div>;
}
