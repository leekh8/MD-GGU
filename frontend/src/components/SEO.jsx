import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({ title, description, keywords }) => {
  const url = window.location.href;
  const today = new Date().toISOString().split("T")[0];

  // Open Graph 이미지 URL 설정 (필요에 따라 수정)
  const imageUrl = `${url}/og-image.png`;

  // JSON-LD 구조화 데이터 생성
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite", // WebSite 유형으로 설정
    name: title,
    description: description,
    url: url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* JSON-LD 구조화 데이터 */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
