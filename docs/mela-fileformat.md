# Mela File Format

This page covers everything you need to know to make use of the file
formats Mela uses to export and import recipes.

---

## `.melarecipes` (ZIP)

- Mela uses a `melarecipes` file when exporting multiple recipes into
  a single file.
- It's basically just a zipped folder that contains a `.melarecipe`
  file for every recipe.
- Renaming the extension to `.zip` will let you easily open it in the
  Finder, for example.

---

## `.melarecipe` (JSON)

This is the file format Mela uses to export single recipes. It's just a
JSON file which you can open in any text editor.

### Fields

| Field          | Type     | Description                                                                                                                                             |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | String   | Identifier. For web-imported recipes, Mela uses the URL (without schema). Otherwise it's a UUID. Do not leave this empty if creating a file for import. |
| `title`        | String   | Title of the recipe.                                                                                                                                    |
| `text`         | String   | Short description displayed after the title and info in Mela. Supported Markdown: links.                                                                |
| `images`       | [String] | Array of Base64-encoded images.                                                                                                                         |
| `categories`   | [String] | Array of category names. (Note: Mela currently does not allow commas in a category name.)                                                               |
| `yield`        | String   | Yield or servings.                                                                                                                                      |
| `prepTime`     | String   | Preparation time.                                                                                                                                       |
| `cookTime`     | String   | Cook time.                                                                                                                                              |
| `totalTime`    | String   | Total time it takes to prepare and cook the dish. (This doesn't have to equal `prepTime + cookTime`.)                                                   |
| `ingredients`  | String   | Ingredients, separated by `\n`. Supported Markdown: links and `#` for group titles.                                                                     |
| `instructions` | String   | Instructions, separated by `\n`. Supported Markdown: `#`, `*`, `**`, and links.                                                                         |
| `notes`        | String   | Notes displayed right after the instructions. Supported Markdown: `#`, `*`, `**`, and links.                                                            |
| `nutrition`    | String   | Nutrition information. Supported Markdown: `#`, `*`, `**`, and links.                                                                                   |
| `link`         | String   | This doesn't have to be a URL --- it's basically just the source of the recipe and will accept any string.                                              |

---

### Ignored Fields

The JSON file also contains the following fields which are ignored when
importing into Mela:

- `favorite` (Bool) --- true or false\
- `wantToCook` (Bool) --- true or false\
- `date` (Double) --- seconds since 00:00:00 UTC on 1 January 2001
