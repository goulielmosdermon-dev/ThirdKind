import { groq } from 'next-sanity';

const imageFields = groq`{
  alt,
  hotspot,
  crop,
  asset->{
    _id,
    url,
    metadata { dimensions { width, height } }
  }
}`;

const portableFields = groq`{
  ...,
  _type == "image" => {
    ...,
    alt,
    hotspot,
    crop,
    asset->{
      _id,
      url,
      metadata { dimensions { width, height } }
    }
  }
}`;

export const siteContentQuery = groq`{
  "settings": *[_type == "siteSettings"][0]{
    _id,
    _type,
    wordmarkLeft,
    wordmarkRight,
    hubs[]{ key, label, description, canvasPosition },
    ambientTiles[]{ id, opacity, canvasPosition, image ${imageFields} },
    defaultSeo{ title, description, ogImage ${imageFields} },
    socialLinks[]{ label, url },
    poem[] ${portableFields}
  },
  "projects": *[_type == "project"] | order(order asc){
    _id,
    _type,
    title,
    client,
    slug,
    order,
    hoverDescription,
    heroVideoUrl,
    featured,
    canvasPosition,
    credits[]{ role, name },
    thumbnail ${imageFields},
    posterImage ${imageFields},
    body[] ${portableFields},
    gallery[]{
      _type,
      _type == "image" => { ..., alt, hotspot, crop, asset->{ _id, url, metadata { dimensions { width, height } } } },
      _type == "videoUrl" => { url }
    }
  },
  "articles": *[_type == "article"] | order(publishedAt desc){
    _id,
    _type,
    title,
    slug,
    publishedAt,
    hoverDescription,
    excerpt,
    canvasPosition,
    seo{ title, description, ogImage ${imageFields} },
    coverImage ${imageFields},
    body[] ${portableFields}
  },
  "aboutSections": *[_type == "aboutSection"]{
    _id,
    _type,
    key,
    title,
    hoverDescription,
    canvasPosition,
    thumbnail ${imageFields},
    body[] ${portableFields},
    teamMembers[]{ name, role, portrait ${imageFields} },
    processSteps[]{ step, title, description },
    services[]{ title, slug, description }
  },
  "contact": *[_type == "contactInfo"][0]{
    _id,
    _type,
    heading,
    newBusinessName,
    email,
    formRecipient,
    hoverDescription,
    canvasPosition,
    thumbnail ${imageFields}
  }
}`;
