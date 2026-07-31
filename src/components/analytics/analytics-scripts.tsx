"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  getConsentServerSnapshot,
  getStoredConsent,
  subscribeConsent,
} from "@/components/analytics/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Monta GA4/Meta Pixel solo si:
 *  1. la variable de entorno correspondiente está configurada, y
 *  2. el visitante aceptó cookies de analítica (banner de consentimiento).
 */
export function AnalyticsScripts() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getStoredConsent,
    getConsentServerSnapshot
  );

  if (consent !== "granted") return null;

  return (
    <>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
