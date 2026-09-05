import { defineField, defineType } from 'sanity';

const hover = defineField({
  name: 'hoverDescription',
  title: 'Hover line',
  type: 'string',
  validation: (rule) => rule.required().max(90),
});

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    hover,
    defineField({
      name: 'heroVideoUrl',
      title: 'Vimeo URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'posterImage',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', type: 'blockContent' }),
    defineField({ name: 'credits', type: 'array', of: [{ type: 'credit' }] }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', type: 'string' })],
        },
        { type: 'videoUrl' },
      ],
    }),
    defineField({
      name: 'canvasPosition',
      type: 'canvasPosition',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'client', media: 'thumbnail' },
  },
});

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    hover,
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'body', type: 'blockContent' }),
    defineField({
      name: 'canvasPosition',
      type: 'canvasPosition',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
});

export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About section',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      type: 'string',
      options: {
        list: [
          { title: 'Team', value: 'team' },
          { title: 'Process', value: 'process' },
          { title: 'Why', value: 'why' },
          { title: 'Services', value: 'services' },
          { title: 'Poem', value: 'poem' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      hidden: ({ document }) => document?.key === 'poem',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.key === 'poem') {
            return true;
          }
          return value ? true : 'Required';
        }),
    }),
    hover,
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', type: 'blockContent' }),
    defineField({
      name: 'teamMembers',
      type: 'array',
      hidden: ({ document }) => document?.key !== 'team',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'role', type: 'string' }),
            defineField({
              name: 'portrait',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string' })],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'processSteps',
      type: 'array',
      hidden: ({ document }) => document?.key !== 'process',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'step', type: 'number' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'text' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'offer',
      type: 'object',
      hidden: ({ document }) => document?.key !== 'services',
      fields: [defineField({ name: 'statement', type: 'text', rows: 2 })],
    }),
    defineField({
      name: 'services',
      type: 'array',
      hidden: ({ document }) => document?.key !== 'services',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string' }),
            defineField({
              name: 'slug',
              type: 'slug',
              options: { source: 'title' },
            }),
            defineField({ name: 'description', type: 'text' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      hidden: ({ document }) => document?.key !== 'services',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', type: 'string' }),
            defineField({ name: 'answer', type: 'text', rows: 6 }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),
    defineField({
      name: 'canvasPosition',
      type: 'canvasPosition',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'key' } },
});

export const contactInfo = defineType({
  name: 'contactInfo',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'newBusinessName',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'formRecipient',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    hover,
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'canvasPosition',
      type: 'canvasPosition',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'wordmarkLeft',
      type: 'string',
      initialValue: 'Third',
    }),
    defineField({
      name: 'wordmarkRight',
      type: 'string',
      initialValue: 'Kind',
    }),
    defineField({
      name: 'hubs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              type: 'string',
              options: {
                list: [
                  { title: 'Work', value: 'work' },
                  { title: 'Thoughts', value: 'thoughts' },
                  { title: 'About', value: 'about' },
                  { title: 'Contact', value: 'contact' },
                ],
              },
            }),
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'description', type: 'text' }),
            defineField({ name: 'canvasPosition', type: 'canvasPosition' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'ambientTiles',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'id', type: 'string' }),
            defineField({
              name: 'image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string' })],
            }),
            defineField({ name: 'canvasPosition', type: 'canvasPosition' }),
            defineField({ name: 'opacity', type: 'number' }),
          ],
        },
      ],
    }),
    defineField({ name: 'defaultSeo', type: 'seo' }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'url', type: 'url' }),
          ],
        },
      ],
    }),
    defineField({ name: 'poem', type: 'blockContent' }),
  ],
});
