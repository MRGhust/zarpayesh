export function MasterFooter() {
  return (
    <footer className="mt-10 border-t border-white/5 bg-obsidian-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-bold text-bullion mb-3">زرپایش</h2>
          <p className="text-xs text-on-surface-variant leading-7 max-w-md">
            پایش قیمت ارز، طلا و سکه با نرخ و تاریخچهٔ TGJU. ساعت دریافت داده با
            زمان آخرین اعلام قیمت در منبع متفاوت است.
          </p>
        </div>
        <div className="text-xs text-on-surface-variant leading-7">
          <p>
            هشدار مرورگر فقط هنگام باز بودن سایت بررسی می‌شود؛ برای اعلام خودکار
            از بات استفاده کنید.
          </p>
          <div className="flex flex-wrap gap-5 mt-3">
            <a
              href="https://www.tgju.org/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-bullion"
            >
              منبع قیمت‌ها ↗
            </a>
            <a
              href="https://t.me/az_be_ma_mabot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-bullion"
            >
              بات تلگرام ↗
            </a>
            <a
              href="https://github.com/MRGhust/zarpayesh"
              target="_blank"
              rel="noreferrer"
              className="hover:text-bullion"
            >
              کد پروژه ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
