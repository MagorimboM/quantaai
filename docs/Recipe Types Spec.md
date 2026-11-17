Quanta · Recipe builder

# Rate-based and Advanced recipes

Two ways to build a recipe, and how each one runs from the builder to the takeoff. Each piece is marked, so you can see what exists and pick up the rest from here.

Built written and tested here, not in your app yet Drawn designed in Figma To build nothing yet

## Two types of recipe

The person picks the type when they start a recipe, and it is locked once saved. Both types use the same ingredient rows. A material's own unit is the unit of its quantity, and nothing converts units. If a unit doesn't suit, the person creates a new material.

RATE_BASED

### Rate-based recipe

One total, and every ingredient scales from it. This is how every recipe works today.

Example · 110mm brick wall, per m²

| Ingredient | Rate per 1 m² |
| --- | --- |
| Common brick | 60 Nr |
| Mortar | 0.03 m³ |
| Bricklayer | 0.9 hr |

At takeoff

One box. Wall area = 40 m² gives 60 × 40 = **2,400 Nr** of common brick.

Form fields

Name, category, description, "Quantities are per" unit, site condition, then ingredients with a plain quantity.

Use it when

Every ingredient follows the same measurement.

ADVANCED

### Advanced recipe

The recipe defines its own inputs. Each ingredient follows the input it is linked to, and an input can be worked out from other inputs.

Example · the same wall

| Input | Kind | Formula |
| --- | --- | --- |
| Wall length (m) | Entered |  |
| Wall height (m) | Entered |  |
| Wall area (m²) | Calculated | `Wall length * Wall height` |

| Ingredient | Quantity formula | At 12 m × 2.4 m |
| --- | --- | --- |
| Common brick | `60 * Wall area` | 1,728 Nr |
| Long reach brick, top | `10 * Wall length` | 120 Nr |
| Bricklayer | `0.9 * Wall area` | 25.92 hr |

At takeoff

Two boxes, length and height. Wall area shows as a read-only line (28.8 m²) and every quantity updates as they type.

Use it when

Some ingredients follow length and others follow area or height.

## The flow, start to finish

Five steps, in order. Each shows what the person does and what the system does.

1

### Choose the type

**Person:** clicks "+ New Recipe" in the library, or "Create recipe" in Add line item, then picks Rate-based or Advanced from two cards.

**System:** opens the matching form. The type cannot be changed after the recipe is saved.

2

### Build the recipe

**Person:** fills in the details and adds ingredients. For Advanced, adds inputs first, then writes a quantity formula on each ingredient. Tapping an input name inserts it into the formula.

**System:** checks every formula as they type. A bad one turns its row red with the reason, and Save stays blocked until nothing is red.

3

### Save

**Person:** clicks "Add new Recipe".

**System:** parses every formula again on the server, then saves the recipe, its inputs and its ingredients in one transaction. A duplicate live name gives 409. An unknown category gives 400.

4

### Use it in a takeoff

**Person:** picks the recipe in Add line item. Rate-based asks for one number. Advanced asks for each entered input.

**System:** shows calculated inputs and quantities live. On save, the server works the quantities out again from the figures sent and stores the line with those figures.

5

### Afterwards

**Edit:** ingredients, inputs and formulas can change, the type cannot. **Archive:** hidden from the library, existing takeoffs keep working. **Delete:** refused with 409 while any takeoff uses the recipe.

## Formulas

Formulas are text read by a small parser on the screen and again on the server. They are never run as code.

### What a formula can contain

- Numbers: `60`, `0.03`
- Input names, with spaces and any capitals: `Wall length`
- Operators: `+ - * /` and also `×` `÷`
- Brackets: `(Length + Width) * 2`
- A minus sign at the start: `-Length + 3`

When names overlap, the longest match wins, so `Wall length` is never read as `Wall` plus `length`.

### Two kinds of input

**Entered** is typed by the person at takeoff, such as Wall length.

**Calculated** has a formula over the inputs *listed above it*, such as Wall area. Order is stored, so a formula can never loop back on itself.

An ingredient can use any input. An ingredient never uses another ingredient.

### Messages the form shows

| Message | When |
| --- | --- |
| Enter a formula. | The box is empty |
| “Lenght” isn’t one of this recipe’s inputs. | Unknown name. Offers "Add as an input" |
| A bracket is missing its closing bracket. | `(Length + Width` |
| A closing bracket has no opening bracket. | `Length + Width)` |
| The formula ends too soon. | `10 *` |
| Check the formula. | Anything else, such as `Length Width` |

Deleting an input turns every formula that used it red.

## Data

Proposed shape. The migration marks every existing recipe as RATE_BASED, so nothing changes for them.

### Schema

```
enum RecipeMeasureType { RATE_BASED  ADVANCED }
enum RecipeInputKind   { ENTERED  CALCULATED }

model Recipe {
  // existing fields stay
  measureType  RecipeMeasureType @default(RATE_BASED)
  inputs       RecipeInput[]
}

model RecipeInput {
  id        String          @id @default(uuid())
  recipeId  String
  position  Int             // order matters
  name      String
  unit      String          // a label only
  kind      RecipeInputKind
  formula   String?         // CALCULATED only
  recipe    Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  @@unique([recipeId, name])
}

// RecipeMaterial, RecipeLabour, RecipeOverhead
quantity  Decimal?   // RATE_BASED
formula   String?    // ADVANCED

// TakeoffItem
inputValues  Json?   // ADVANCED: the entered figures
```

### An Advanced recipe as the API sends it

```
{
  "name": "110mm Brick Wall",
  "categoryId": "…",
  "measureType": "ADVANCED",
  "inputs": [
    { "name": "Wall length", "unit": "m",  "kind": "ENTERED" },
    { "name": "Wall height", "unit": "m",  "kind": "ENTERED" },
    { "name": "Wall area",   "unit": "m²", "kind": "CALCULATED",
      "formula": "Wall length * Wall height" }
  ],
  "materials": [
    { "materialId": "…", "formula": "60 * Wall area" },
    { "materialId": "…", "formula": "10 * Wall length" }
  ],
  "labour": [
    { "labourId": "…", "formula": "0.9 * Wall area" }
  ]
}
```

A Rate-based recipe sends `"unit": "m²"` and a `"quantity"` on each ingredient, and no inputs.

## Backend

The server owns every real number. The browser shows live previews, and the server recalculates.

### Checks when saving a recipe

Both types

- Name, category and at least one ingredient
- Duplicate live name gives 409, unknown category gives 400

Rate-based

- A unit, and every quantity above zero

Advanced

- At least one entered input
- Input names are unique
- Every formula parses and uses only known names
- A calculated input uses only inputs above it

### Takeoff calculation

```
RATE_BASED
  qty = ingredient.quantity × measurement

ADVANCED
  values = {}
  for input in recipe.inputs (by position)
    values[name] = ENTERED
      ? body.inputValues[name]
      : evaluate(input.formula, values)
  for ingredient
    qty = evaluate(ingredient.formula, values)

reject  missing or negative entered value
        divide by zero, unknown name
```

### Shared parser

Port `recipeFormula.ts` to the server and add an `evaluate` function beside the check. Keep the same grammar on both sides.

The check passes the 17 test cases written for it. Reuse them as the server's tests, and add numeric cases such as `(Length + Width) * 2`.

### Migration

- Add the two enums and the `RecipeInput` table
- Existing recipes become RATE_BASED
- Existing ingredient rows keep their `quantity`, and `formula` stays empty
- Takeoff lines are untouched

## Frontend

One shared modal opens from the library and from Add line item. The type chooser sits at its start.

| Piece | What it does | Status |
| --- | --- | --- |
| `TypeChooser` | Two cards at the start of the modal. Passes the type down. | To build |
| Rate-based form | Your current form, unchanged. | Exists |
| `RecipeBuilderFormPage` (Advanced) | Details, inputs, formula rows, red states, tap-to-insert. Save only checks for now. | Built Drawn |
| `recipeFormula.ts` | `checkFormula(formula, knownNames)` returns an error and any unknown name. | Built |
| Takeoff inputs in Add line item | One box for Rate-based. Entered boxes and calculated lines for Advanced. | To build |
| `CreateRecipeApi` types | Add `measureType`, `inputs` and `formula` to the request and response files. | To build |
| Library cards and edit form | Show the type. Edit keeps it fixed. Show labour and overheads. | To build |
| Figma screens | Advanced builder, default and with problems. The chooser and the takeoff are not drawn. | Drawn |

## Build plan

A suggested order. Tick items off as you go. Ticks are kept in this browser only.

### Order of work

[ ] Schema and migrationExisting recipes become RATE_BASED. [ ] Server formula parser and evaluatePort recipeFormula.ts, reuse its tests. [ ] Create route accepts both typesValidation from the Backend card. [ ] Type chooser, then wire both formsUpdate the CreateRecipeApi types first. [ ] Takeoff calculation on the serverStore inputValues on the line. [ ] Takeoff inputs in Add line item [ ] Library cards and edit formShow the type, keep it locked. [ ] Tests for both types, end to end

### Decision · takeoff lines Open

Store the entered input figures on the line, or only the final quantities?

**Suggested:** store the figures, so a line can always be recalculated and shown as typed.

### Decision · editing a used recipe Open

When a recipe that takeoffs use is edited, do old lines keep their quantities or follow the new formulas?

**Suggested:** old lines keep their quantities, as they do today.

### Decision · recipe unit Open

An Advanced recipe has no single unit, but `Recipe.unit` is required today.

**Suggested:** make it optional, and set it only for Rate-based recipes.

### Decision · duplicate materials Open

Does the create-material code refuse the same name with a different unit? If it does, people need names like "Brick (per m²)".

**Suggested:** check this when you reach the backend.