import { Layout } from "../../../layout";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../../ui/empty";

type ErrorStateTemplateProps = {
  title: string;
  description: string;
};

export function ErrorStateTemplate({
  title,
  description,
}: ErrorStateTemplateProps) {
  return (
    <Layout>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Layout>
  );
}
