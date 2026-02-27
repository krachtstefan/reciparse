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
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
