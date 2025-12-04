import type { Metadata } from "next";
import FinalResultClient from "./FinalResultClient";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getVerificationMetadata(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    const response = await fetch(`${baseUrl}/rpc/getPublicVerificationResult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId: id }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json.result || json;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const awaitedParams = await params;
  const id = awaitedParams.id;
  const data = await getVerificationMetadata(id);

  if (!data?.finalResult) {
    return {
      title: "Verificación en proceso",
      description: "Analizando la veracidad de la información en CheckeApp.",
    };
  }

  const { metadata, imageUrl, finalText } = data.finalResult;

  const title =
    metadata?.title || data.originalText || "Resultado de Verificación";
  const description =
    metadata?.main_claim ||
    `${finalText?.substring(0, 160)}...` ||
    "Verificación detallada realizada por CheckeApp.";

  const image = imageUrl || "/og-image-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function FinalResultPage({ params }: Props) {
  const awaitedParams = await params;
  return <FinalResultClient verificationId={awaitedParams.id} />;
}
