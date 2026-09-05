import { defineField, defineType } from 'sanity';

export const canvasPosition = defineType({
  name: 'canvasPosition',
  title: 'Canvas position',
  type: 'object',
  fields: [
    defineField({
      name: 'x',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(4800),
    }),
    defineField({
      name: 'y',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(3000),
    }),
    defineField({
      name: 'tileWidth',
      type: 'number',
      options: { list: [96, 128, 176, 224] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tileHeight',
      type: 'number',
      options: { list: [96, 128, 176, 224] },
    }),
    defineField({ name: 'rotation', type: 'number' }),
  ],
});

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({
      name: 'ogImage',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
    }),
  ],
});

export const credit = defineType({
  name: 'credit',
  title: 'Credit',
  type: 'object',
  fields: [
    defineField({
      name: 'role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const videoUrl = defineType({
  name: 'videoUrl',
  title: 'Video URL',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt' }],
    },
  ],
});
