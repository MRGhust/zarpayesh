"use client";
import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X, WifiOff } from "lucide-react";
import { usePWAInstall, useOnlineStatus } from "@/hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowGuide(true);
          }
        }}
        className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-bullion/15 hover:bg-bullion/25 text-bullion-light border border-bullion/35 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap shrink-0"
        title="نصب اپلیکیشن زرپایش (PWA)"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="hidden lg:inline">نصب وب‌اپ</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
            className="w-full max-w-md bg-obsidian-card border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-bullion/15 border border-bullion/30 flex items-center justify-center text-bullion">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="pwa-guide-title" className="font-bold text-sm sm:text-base text-on-surface">
                    نصب وب‌اپلیکیشن زرپایش (PWA)
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    دسترسی سریع تمام‌صفحه و کش آفلاین روی موبایل و دسکتاپ
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="بستن راهنمای نصب"
                onClick={() => setShowGuide(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant leading-6 bg-obsidian-950/70 rounded-2xl p-4 border border-white/[0.06]">
              {isIOS ? (
                <>
                  <p className="text-on-surface font-semibold">
                    نصب روی آیفون و آیپد (Safari):
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Share className="w-4 h-4 text-bullion shrink-0" />
                    <span>
                      ۱. در نوار پایین مرورگر سافاری روی دکمهٔ{" "}
                      <strong className="text-on-surface">Share</strong> بزنید.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PlusSquare className="w-4 h-4 text-bullion shrink-0" />
                    <span>
                      ۲. گزینهٔ{" "}
                      <strong className="text-on-surface">
                        Add to Home Screen
                      </strong>{" "}
                      را انتخاب و تایید کنید.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-on-surface font-semibold">
                    نصب روی اندروید، کروم یا دسکتاپ:
                  </p>
                  <p>
                    ۱. از منوی مرورگر (سه نقطه بالای صفحه) گزینهٔ{" "}
                    <strong className="text-on-surface">
                      Install App / Add to Home screen
                    </strong>{" "}
                    را انتخاب کنید.
                  </p>
                  <p>
                    ۲. در صورت باز بودن در قاب پیش‌نمایش، ابتدا سایت را در تب
                    مستقیم مرورگر باز کرده و سپس دکمهٔ نصب را بزنید.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full min-h-[44px] gold-gradient-btn rounded-xl text-xs font-bold"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 text-obsidian-950 px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-md"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>حالت آفلاین — نمایش آخرین داده‌های ذخیره‌شده</span>
    </div>
  );
};
