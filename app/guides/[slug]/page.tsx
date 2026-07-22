import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { GUIDES, getGuide } from "@/lib/guides";
import { absoluteUrl, breadcrumbSchema, ORGANIZATION_NAME } from "@/lib/seo";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const canonical = absoluteUrl(`/guides/${guide.slug}`);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: guide.title,
      description: guide.description,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.shortTitle, path: `/guides/${guide.slug}` },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
    publisher: { "@type": "Organization", name: ORGANIZATION_NAME, url: absoluteUrl("/") },
    inLanguage: "en-US",
  };

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />

      <p className="text-[11px] uppercase tracking-[0.15em] text-gold mb-2">{guide.kicker}</p>
      <h1 className="font-serif text-3xl sm:text-4xl mb-2">{guide.title}</h1>

      <div className="mt-6">
        <guide.Body />
      </div>

      <div className="mt-12 border-t border-charcoal/10 pt-6">
        <Link href="/guides" className="text-sm text-burgundy hover:underline">
          ← All guides
        </Link>
      </div>
    </article>
  );
}
