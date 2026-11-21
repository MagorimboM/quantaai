// A trade category. The same list classifies recipes and the materials in them.
export type Category = {
  id: string;
  name: string;
};

// A ground condition a recipe can be built for (muddy, sandy, coastal...)
export type SiteCondition = {
  id: string;
  name: string;
};

// A building class a recipe can suit (Residential, Commercial...)
export type BuildingClassOption = {
  id: string;
  name: string;
  description: string;
};

// A site (soil reactivity) class a recipe can suit (Class A, Class S...)
export type SiteClassOption = {
  id: string;
  name: string;
  description: string;
};

// A material found by the search, with the unit its quantities are measured in
export type MaterialSearchResult = {
  id: string;
  name: string;
  unit: string;
};

export type CreateRecipeResponse = {
  id: string;
  name: string;
};