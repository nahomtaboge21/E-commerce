import { useEffect } from 'react';

const SITE_URL_TOKEN = '__LUNIVA_SITE_URL__';

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

export function useSeo({
  title,
  description,
  canonicalPath,
  image = '/luniva-logo.png',
  type = 'website',
  noIndex = false,
  structuredData = null,
}) {
  const structuredDataJson = structuredData ? JSON.stringify(structuredData) : '';

  useEffect(() => {
    const siteUrl = (window.__LUNIVA_SITE_URL__ || window.location.origin).replace(/\/$/, '');
    const canonicalUrl = new URL(canonicalPath || window.location.pathname, `${siteUrl}/`).toString();
    const imageUrl = image ? new URL(image, `${siteUrl}/`).toString() : '';
    const pageTitle = title || 'Luniva公式オンラインストア';
    const pageDescription = (description || '日本全国送料無料、60日間返金保証。毎日の暮らしに寄り添うアイテムをお届けするLuniva公式オンラインストアです。').replace(/\s+/g, ' ').slice(0, 160);
    const robots = noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

    document.title = pageTitle;
    setMeta('name', 'description', pageDescription);
    setMeta('name', 'robots', robots);
    setMeta('name', 'googlebot', robots);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:locale', 'ja_JP');
    setMeta('property', 'og:site_name', 'Luniva');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:url', canonicalUrl);
    if (imageUrl) {
      setMeta('property', 'og:image', imageUrl);
      setMeta('property', 'og:image:alt', 'Luniva公式オンラインストア');
      setMeta('name', 'twitter:image', imageUrl);
    }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);
    setCanonical(canonicalUrl);

    let schemaElement = document.getElementById('luniva-page-structured-data');
    if (structuredDataJson) {
      if (!schemaElement) {
        schemaElement = document.createElement('script');
        schemaElement.id = 'luniva-page-structured-data';
        schemaElement.type = 'application/ld+json';
        document.head.appendChild(schemaElement);
      }
      schemaElement.textContent = structuredDataJson
        .replaceAll(SITE_URL_TOKEN, siteUrl)
        .replace(/</g, '\\u003c');
    } else if (schemaElement) {
      schemaElement.remove();
    }
  }, [title, description, canonicalPath, image, type, noIndex, structuredDataJson]);
}

export const SITE_URL_TOKEN_VALUE = SITE_URL_TOKEN;
