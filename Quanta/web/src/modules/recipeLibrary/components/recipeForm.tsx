import { useEffect, useState } from "react";
import { getUserRecipeCategories } from "@/modules/recipeLibrary/api/api";
import type {
  Category,
  Materials,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import type { SetRecipeListState } from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";
import { MdClose } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";

// TODO :: do sanitization of the input -> throw errors and message if user inputs invalid data. 
// TODO :: connect api requests : update recipe to the backend
// TODO :: import or implement the confirmation that the request was executed successfully at the backend. 
// TODO :: filter out the recipe, with the old data from the list and replace it with the new updated recipe. 

type EditableRecipe = {
  recipeId: string;
  categoryId: string;
  recipeName: string;
  categoryName: string;
  recipeDescription: string;
  tags: string[];
  materials: Materials[];
};

export function RecipeForm({
  recipeId,
  categoryId,
  recipeName,
  categoryName,
  recipeDescription,
  tags,
  materials,
  setRecipeListState,
  showRecipeForm,
}: {
  recipeId: string;
  categoryId: string;
  recipeName: string;
  categoryName: string;
  recipeDescription: string;
  tags: string[];
  materials: Materials[];
  setRecipeListState: SetRecipeListState;
  showRecipeForm: () => void;
}) {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [updatedRecipe, setUpdatedRecipe] = useState<EditableRecipe>({
    recipeId,
    categoryId,
    recipeName,
    categoryName,
    recipeDescription,
    tags,
    materials,
  });

  useEffect(() => {
    async function getCategoryList() {
      const response = await getUserRecipeCategories({
        companyId: "seed-company-001",
      });
      const filteredCategories = response.categories.filter(
        (category) => category.categoryId !== categoryId,
      );
      setCategoryList(filteredCategories);
    }

    getCategoryList();
  }, [categoryId]);

  function deleteMaterial(material: Materials) {
    setUpdatedRecipe((prevRecipe) => ({
      ...prevRecipe,
      materials: prevRecipe.materials.filter(
        (uploadedMaterial) => uploadedMaterial.name !== material.name,
      ),
    }));
  }

  function updateMaterial(index: number, field: keyof Materials, value: string) {
    setUpdatedRecipe((prevRecipe) => {
      const updatedMaterials = [...prevRecipe.materials];
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
      return { ...prevRecipe, materials: updatedMaterials };
    });
  }

  async function requestRecipeUpdate() {
    // TODO: no "update recipe" endpoint exists in api.ts yet.
    showRecipeForm();
  }

  const inputClass =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm " +
    "text-zinc-900 placeholder:text-zinc-400 focus:outline-none " +
    "focus:ring-2 focus:ring-zinc-900";
  const labelClass = "mb-1 block text-xs font-medium text-zinc-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-base font-semibold text-zinc-900">Edit Recipe</h1>
          <button
            onClick={() => showRecipeForm()}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Recipe Name</label>
            <input
              title="recipe-name-input"
              onChange={(event) =>
                setUpdatedRecipe((prevRecipe) => ({
                  ...prevRecipe,
                  recipeName: event.target.value,
                }))
              }
              placeholder={recipeName}
              type="text"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              onChange={(event) =>
                setUpdatedRecipe((prevRecipe) => ({
                  ...prevRecipe,
                  categoryName: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value={categoryName}>{categoryName}</option>
              {categoryList.map((category) => (
                <option key={category.categoryId} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <input
              title="recipe-description-input"
              placeholder={recipeDescription}
              onChange={(event) =>
                setUpdatedRecipe((prevRecipe) => ({
                  ...prevRecipe,
                  recipeDescription: event.target.value,
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tags{" (comma separated)"}</label>
            <input
              placeholder={tags.toLocaleString()}
              onChange={(event) =>
                setUpdatedRecipe((prevRecipe) => ({
                  ...prevRecipe,
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Materials</label>
            <ul className="space-y-2">
              {updatedRecipe.materials.map((material, index) => (
                <li
                  key={material.name}
                  className="flex items-center gap-2 rounded-md border border-zinc-200 p-2"
                >
                  <input
                    title="recipe-material-name-input"
                    type="text"
                    placeholder={material.name}
                    onChange={(event) =>
                      updateMaterial(index, "name", event.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    title="recipe-materials-unit-measure-quant"
                    type="text"
                    placeholder={material.unitMeasureQuant}
                    onChange={(event) =>
                      updateMaterial(index, "unitMeasureQuant", event.target.value)
                    }
                    className={`${inputClass} w-20`}
                  />
                  <input
                    title="recipe-materials-unit-measure"
                    type="text"
                    placeholder={material.unitMeasure}
                    onChange={(event) =>
                      updateMaterial(index, "unitMeasure", event.target.value)
                    }
                    className={`${inputClass} w-20`}
                  />
                  <button
                    onClick={() => deleteMaterial(material)}
                    className="shrink-0 rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <button
            onClick={() => showRecipeForm()}
            className="
              inline-flex items-center gap-2 rounded-md border
              border-zinc-300 bg-white px-4 py-2 text-sm font-medium
              text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50
              hover:text-zinc-900 cursor-pointer
            "
          >
            Cancel
          </button>
          <button
            onClick={() => requestRecipeUpdate()}
            className="
              inline-flex items-center gap-2 rounded-md bg-zinc-900
              px-4 py-2 text-sm font-medium text-white transition-colors
              hover:bg-zinc-800 cursor-pointer
            "
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}