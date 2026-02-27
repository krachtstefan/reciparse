import { Layout } from "../../layout";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../ui/empty";

export function RecipeNotFound() {
  return (
    <Layout>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Recipe not found</EmptyTitle>
          <EmptyDescription>
            The recipe you are looking for does not exist.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Layout>
  );
}
