import type {
  AboutSectionKey,
  CanvasNode,
  Edge,
  HubKey,
  SiteContent,
} from '@/types/content';

const ABOUT_SWATCH: Partial<Record<AboutSectionKey, string>> = {
  why: '#F2FF00',
  services: '#2F6BFF',
  process: '#FF1A1A',
  poem: '#FFFFFF',
};

export function deriveCanvasNodes(content: SiteContent): CanvasNode[] {
  const hubs: CanvasNode[] = content.settings.hubs.map((hub) => ({
    id: `hub-${hub.key}`,
    kind: 'hub',
    hubKey: hub.key,
    label: hub.label,
    description: hub.description,
    position: hub.canvasPosition,
  }));

  const projectLeaves: CanvasNode[] = content.projects.map((project) => ({
    id: project._id,
    kind: 'leaf',
    hubKey: 'work',
    href: `/work/${project.slug.current}`,
    title: `${project.client} — ${project.title}`,
    hoverDescription: project.hoverDescription,
    thumbnail: project.thumbnail,
    documentId: project._id,
    position: project.canvasPosition,
  }));

  const articleLeaves: CanvasNode[] = content.articles.map((article) => ({
    id: article._id,
    kind: 'leaf',
    hubKey: 'thoughts',
    href: `/thoughts/${article.slug.current}`,
    title: article.title,
    hoverDescription: article.hoverDescription,
    thumbnail: article.coverImage,
    documentId: article._id,
    position: article.canvasPosition,
  }));

  const aboutLeaves: CanvasNode[] = content.aboutSections.map((section) => ({
    id: section._id,
    kind: 'leaf',
    hubKey: 'about',
    href: `/about/${section.key}`,
    title: section.title,
    hoverDescription: section.hoverDescription,
    thumbnail: section.thumbnail,
    documentId: section._id,
    position: section.canvasPosition,
    swatch: ABOUT_SWATCH[section.key],
  }));

  const contactLeaf: CanvasNode = {
    id: content.contact._id,
    kind: 'leaf',
    hubKey: 'contact',
    href: '/contact',
    title: content.contact.heading,
    hoverDescription: content.contact.hoverDescription,
    thumbnail: content.contact.thumbnail,
    documentId: content.contact._id,
    position: content.contact.canvasPosition,
    swatch: '#B44AFF',
  };

  const ambient: CanvasNode[] = content.settings.ambientTiles.map((tile) => ({
    id: tile.id,
    kind: 'ambient',
    image: tile.image,
    opacity: tile.opacity,
    position: tile.canvasPosition,
  }));

  return [
    ...hubs,
    ...projectLeaves,
    ...articleLeaves,
    ...aboutLeaves,
    contactLeaf,
    ...ambient,
  ];
}

const BRIDGE_SPOKES: ReadonlyArray<readonly [string, HubKey]> = [
  ['project-scytales', 'thoughts'],
  ['project-noirgaze', 'thoughts'],
  ['project-a-m', 'about'],
  ['article-leading-the-creative-landscape', 'work'],
  ['article-storytelling-wins', 'work'],
  ['article-b2b', 'work'],
  ['article-donations', 'about'],
  ['about-team', 'work'],
  ['about-process', 'thoughts'],
];

const HUB_SPINE: ReadonlyArray<readonly [HubKey, HubKey]> = [
  ['work', 'thoughts'],
  ['work', 'about'],
  ['thoughts', 'about'],
];

export function deriveEdges(nodes: CanvasNode[]): Edge[] {
  const hubs = nodes.filter((node) => node.kind === 'hub');
  const ids = new Set(nodes.map((node) => node.id));

  const spokes: Edge[] = nodes.flatMap((node) => {
    if (node.kind !== 'leaf') {
      return [];
    }

    const hub = hubs.find((candidate) => candidate.hubKey === node.hubKey);
    if (!hub) {
      return [];
    }

    return [
      {
        id: `edge-${hub.id}-${node.id}`,
        fromNodeId: hub.id,
        toNodeId: node.id,
        kind: 'spoke' as const,
      },
    ];
  });

  const bridges: Edge[] = BRIDGE_SPOKES.flatMap(([leafId, hubKey]) => {
    const leaf = nodes.find((node) => node.id === leafId);
    const hub = hubs.find((candidate) => candidate.hubKey === hubKey);
    if (!leaf || !hub || leaf.kind !== 'leaf' || leaf.hubKey === hubKey) {
      return [];
    }

    return [
      {
        id: `edge-${hub.id}-${leaf.id}`,
        fromNodeId: hub.id,
        toNodeId: leaf.id,
        kind: 'spoke' as const,
      },
    ];
  });

  const spine: Edge[] = HUB_SPINE.flatMap(([fromKey, toKey]) => {
    const from = hubs.find((hub) => hub.hubKey === fromKey);
    const to = hubs.find((hub) => hub.hubKey === toKey);
    if (!from || !to || !ids.has(from.id) || !ids.has(to.id)) {
      return [];
    }

    return [
      {
        id: `edge-spine-${from.id}-${to.id}`,
        fromNodeId: from.id,
        toNodeId: to.id,
        kind: 'related' as const,
      },
    ];
  });

  return [...spokes, ...bridges, ...spine];
}
