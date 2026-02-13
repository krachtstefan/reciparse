type MelaRecipeForDownload = {
  title?: string | null;
};

type DownloadFileOptions = {
  data: BlobPart | BlobPart[];
  filename: string;
  mimeType: string;
};

export const getMelaRecipeFilename = (title?: string | null) => {
  const slug = (title ?? "")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "recipe"}.melarecipe`;
};

const downloadFile = ({ data, filename, mimeType }: DownloadFileOptions) => {
  const blob = new Blob(Array.isArray(data) ? data : [data], {
    type: mimeType,
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const downloadMelaRecipe = (melaRecipe: MelaRecipeForDownload) => {
  const json = JSON.stringify(melaRecipe, null, 2);
  const filename = getMelaRecipeFilename(melaRecipe.title);

  downloadFile({
    data: json,
    filename,
    mimeType: "application/json",
  });
};
