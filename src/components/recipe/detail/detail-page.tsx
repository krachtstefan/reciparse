import { useLoaderData } from "@tanstack/react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "../../layout";
import { CopyLinkButton } from "./copy-link-button";
import { RecipeDetail } from "./recipe-detail";

export function DetailPage() {
  const { recipe } = useLoaderData({ from: "/recipe/$recipeId" });

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Extracted Recipe</CardTitle>
          <CardAction>
            <CopyLinkButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
            <RecipeDetail recipe={recipe} />
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
