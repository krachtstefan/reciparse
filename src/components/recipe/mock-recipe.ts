import type { Recipe } from "@/components/recipe/recipe-output"

export const mockRecipe: Recipe = {
  title: "Creamy Tuscan Chicken",
  description:
    "A rich and comforting one-pan dish featuring tender chicken thighs in a sun-dried tomato and spinach cream sauce. Perfect for weeknight dinners.",
  servings: 4,
  prepTime: "10 min",
  cookTime: "25 min",
  totalTime: "35 min",
  difficulty: "Easy",
  cuisine: "Italian",
  tags: ["One-Pan", "Comfort Food", "Italian", "Gluten-Free"],
  ingredients: [
    {
      group: "Chicken",
      items: [
        "4 boneless, skinless chicken thighs",
        "1 tsp smoked paprika",
        "1 tsp garlic powder",
        "Salt and black pepper to taste",
        "2 tbsp olive oil",
      ],
    },
    {
      group: "Sauce",
      items: [
        "3 cloves garlic, minced",
        "1/2 cup sun-dried tomatoes, chopped",
        "1 cup heavy cream",
        "1/2 cup chicken broth",
        "1/3 cup freshly grated Parmesan",
        "2 cups fresh baby spinach",
        "1 tsp Italian seasoning",
      ],
    },
  ],
  instructions: [
    {
      step: 1,
      text: "Season chicken thighs with smoked paprika, garlic powder, salt, and pepper on both sides.",
    },
    {
      step: 2,
      text: "Heat olive oil in a large skillet over medium-high heat. Sear chicken for 4-5 minutes per side until golden brown and cooked through. Remove and set aside.",
    },
    {
      step: 3,
      text: "In the same skillet, reduce heat to medium. Add minced garlic and sun-dried tomatoes. Cook for 1 minute until fragrant.",
    },
    {
      step: 4,
      text: "Pour in heavy cream and chicken broth. Stir in Italian seasoning and bring to a gentle simmer.",
    },
    {
      step: 5,
      text: "Add Parmesan cheese and stir until melted and sauce thickens slightly, about 2-3 minutes.",
    },
    {
      step: 6,
      text: "Fold in baby spinach and cook until wilted. Return chicken to the pan and spoon sauce over the top. Serve immediately.",
    },
  ],
  notes:
    "Serve over pasta, rice, or crusty bread. Leftovers keep well in the fridge for up to 3 days. You can substitute half-and-half for heavy cream for a lighter version.",
}
