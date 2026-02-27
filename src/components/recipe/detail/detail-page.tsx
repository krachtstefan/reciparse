import { Suspense } from "react";
import { Layout } from "../../layout";
import { ExtractedPanel, ExtractedPanelSkeleton } from "./extracted-panel";

export function DetailPage() {
  return (
    <Layout>
      <Suspense fallback={<ExtractedPanelSkeleton />}>
        <ExtractedPanel />
      </Suspense>
    </Layout>
  );
}
