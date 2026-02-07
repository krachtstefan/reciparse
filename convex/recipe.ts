import { query } from "./_generated/server";

export const getRecipes = query({
  handler: async (context) => {
    const recipes = await context.db.query("recipes").collect();
    return recipes;
  },
});
