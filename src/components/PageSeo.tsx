import { Helmet } from 'react-helmet-async';

interface PageSeoProps {
  title: string;
  description: string;
  canonical: string;
}

export default function PageSeo({ title, description, canonical }: PageSeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
