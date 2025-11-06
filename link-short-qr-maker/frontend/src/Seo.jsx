import { Helmet } from 'react-helmet-async';
import React from 'react';

export default function Seo({ title, description, url, image, children }) {
  const siteTitle = 'Harsh Agarwal — Link Shortener & QR Maker';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDesc = description || 'Create short links and downloadable QR codes quickly.';
  const canonical = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />

      {children}
    </Helmet>
  );
}
