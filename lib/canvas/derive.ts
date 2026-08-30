import type { CanvasNode, Edge, SiteContent } from '@/types/content';

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

export function deriveEdges(nodes: CanvasNode[]): Edge[] {
  const hubs = nodes.filter((node) => node.kind === 'hub');

  return nodes.flatMap((node) => {
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
}
