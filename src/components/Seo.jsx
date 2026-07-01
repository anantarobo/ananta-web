import { useEffect } from 'react'

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://anantarobotics.com').replace(/\/$/, '')
const SITE_NAME = 'ANANTA ROBOTICS'
const DESCRIPTION =
  'ANANTA ROBOTICS builds autonomous solar panel cleaning robots in Surat, Gujarat. Waterless, labour-free cleaning to recover lost solar energy.'
const OG_IMAGE = `${SITE_URL}/image1.jpeg`

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Logo.png`,
  description: DESCRIPTION,
  email: 'anantarobotics925@gmail.com',
  telephone: '+91-95124-94999',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Surat',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  areaServed: 'IN',
  sameAs: [],
}

function upsertMeta(attribute, key, content) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id)
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.id = id
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(data)
}

export default function Seo() {
  useEffect(() => {
    document.title = `${SITE_NAME} | Solar Panel Cleaning Robots in Surat`

    upsertMeta('name', 'description', DESCRIPTION)
    upsertMeta(
      'name',
      'keywords',
      'solar panel cleaning robot, autonomous solar cleaning, ANANTA ROBOTICS, Surat, Gujarat, waterless solar cleaning, rooftop solar robot, solar panel maintenance',
    )
    upsertMeta('name', 'author', SITE_NAME)
    upsertMeta('name', 'robots', 'index, follow')
    upsertMeta('name', 'geo.region', 'IN-GJ')
    upsertMeta('name', 'geo.placename', 'Surat')

    upsertLink('canonical', `${SITE_URL}/`)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', `${SITE_NAME} | Solar Panel Cleaning Robots`)
    upsertMeta('property', 'og:description', DESCRIPTION)
    upsertMeta('property', 'og:url', `${SITE_URL}/`)
    upsertMeta('property', 'og:image', OG_IMAGE)
    upsertMeta('property', 'og:locale', 'en_IN')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', `${SITE_NAME} | Solar Panel Cleaning Robots`)
    upsertMeta('name', 'twitter:description', DESCRIPTION)
    upsertMeta('name', 'twitter:image', OG_IMAGE)

    upsertJsonLd('seo-organization-schema', ORGANIZATION_SCHEMA)
  }, [])

  return null
}
