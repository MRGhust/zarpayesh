export function MasterFooter() {
  return (
    <footer className="mt-10 border-t border-white/5 bg-obsidian-950/75 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-8 min-w-0">
        {/* Semantic SEO & FAQ Accordion Section */}
        <section
          aria-label="پرسش‌های متداول و راهنمای بازار طلا، سکه و ارز"
          className="border-b border-white/[0.06] pb-7"
        >
          <h2 className="font-bold text-sm sm:text-base text-bullion-light mb-3">
            راهنمای پایش قیمت لحظه‌ای دلار، طلا ۱۸ عیار و سکه در زرپایش
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-on-surface-variant">
            <details className="group bg-obsidian-card/60 border border-white/[0.06] rounded-xl p-3.5">
              <summary className="font-bold text-on-surface cursor-pointer list-none flex items-center justify-between gap-2">
                <span>منبع قیمت لحظه‌ای دلار، طلا و سکه کجاست؟</span>
                <span className="text-bullion group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-2 leading-6">
                تمامی نرخ‌های ارز آزاد (دلار، یورو، درهم، لیر، پوند و گریونا)،
                طلای ۱۸ عیار، مظنه مثقال و مسکوکات طلا به صورت مستقیم از شبکه
                اطلاع‌رسانی طلا، سکه و ارز (TGJU.org) دریافت و پس از اعتبارسنجی
                به تومان و ریال نمایش داده می‌شوند.
              </p>
            </details>

            <details className="group bg-obsidian-card/60 border border-white/[0.06] rounded-xl p-3.5">
              <summary className="font-bold text-on-surface cursor-pointer list-none flex items-center justify-between gap-2">
                <span>حباب سکه امامی و ارزش ذاتی چگونه محاسبه می‌شود؟</span>
                <span className="text-bullion group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-2 leading-6">
                ارزش ذاتی هر مسکوک بر پایه وزن استاندارد طلا (مثلاً ۸.۱۳۳ گرم با
                عیار ۲۱.۶ برای سکه تمام) و نرخ روز طلای خالص محاسبه می‌گردد.
                اختلاف قیمت فروش بازار با ارزش ذاتی طلای سکه، میزان حباب اسمی و
                درصد حباب را مشخص می‌کند.
              </p>
            </details>

            <details className="group bg-obsidian-card/60 border border-white/[0.06] rounded-xl p-3.5">
              <summary className="font-bold text-on-surface cursor-pointer list-none flex items-center justify-between gap-2">
                <span>فرمول محاسبه فاکتور طلای ۱۸ عیار با اجرت چیست؟</span>
                <span className="text-bullion group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-2 leading-6">
                در محاسبه‌گر فاکتور طلای زرپایش، ابتدا وزن طلا در قیمت روز گرم
                ۱۸ عیار ضرب شده و سپس اجرت ساخت، سود فروشنده و مالیات بر ارزش
                افزوده (صرفاً روی جمع اجرت و سود فروشنده، نه اصل طلا) به تفکیک
                محاسبه می‌شود.
              </p>
            </details>

            <details className="group bg-obsidian-card/60 border border-white/[0.06] rounded-xl p-3.5">
              <summary className="font-bold text-on-surface cursor-pointer list-none flex items-center justify-between gap-2">
                <span>دریافت هشدار قیمت و نصب وب‌اپلیکیشن (PWA) چگونه است؟</span>
                <span className="text-bullion group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-2 leading-6">
                می‌توانید زرپایش را از طریق دکمهٔ «نصب وب‌اپ» روی صفحهٔ اصلی
                موبایل یا دسکتاپ نصب کنید، هشدار سقف و کف قیمت ثبت نمایید یا از
                بات تلگرام زرپایش برای دریافت خودکار نرخ‌ها و نمودارها استفاده
                کنید.
              </p>
            </details>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold text-bullion mb-2.5">
              زرپایش | ترمینال هوشمند طلا، سکه و ارز
            </h2>
            <p className="text-xs text-on-surface-variant leading-7 max-w-md">
              پایش قیمت ارز، طلا و سکه با نرخ و تاریخچهٔ TGJU. ساعت دریافت داده
              با زمان آخرین اعلام قیمت در منبع متفاوت است.
            </p>
          </div>
          <div className="text-xs text-on-surface-variant leading-7">
            <p>
              هشدار مرورگر فقط هنگام باز بودن سایت بررسی می‌شود؛ برای اعلام
              خودکار از بات استفاده کنید.
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
      </div>
    </footer>
  );
}
