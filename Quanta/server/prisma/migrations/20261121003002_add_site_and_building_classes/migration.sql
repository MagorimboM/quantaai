-- CreateTable
CREATE TABLE "site_classes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "site_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_classes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "building_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_site_classes" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "siteClassId" TEXT NOT NULL,

    CONSTRAINT "recipe_site_classes_pkey" PRIMARY KEY ("recipeId","siteClassId")
);

-- CreateTable
CREATE TABLE "recipe_building_classes" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "buildingClassId" TEXT NOT NULL,

    CONSTRAINT "recipe_building_classes_pkey" PRIMARY KEY ("recipeId","buildingClassId")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_classes_userId_name_key" ON "site_classes"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "building_classes_userId_name_key" ON "building_classes"("userId", "name");

-- CreateIndex
CREATE INDEX "recipe_site_classes_siteClassId_idx" ON "recipe_site_classes"("siteClassId");

-- CreateIndex
CREATE INDEX "recipe_building_classes_buildingClassId_idx" ON "recipe_building_classes"("buildingClassId");

-- AddForeignKey
ALTER TABLE "site_classes" ADD CONSTRAINT "site_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building_classes" ADD CONSTRAINT "building_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_site_classes" ADD CONSTRAINT "recipe_site_classes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_site_classes" ADD CONSTRAINT "recipe_site_classes_siteClassId_fkey" FOREIGN KEY ("siteClassId") REFERENCES "site_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_site_classes" ADD CONSTRAINT "recipe_site_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_building_classes" ADD CONSTRAINT "recipe_building_classes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_building_classes" ADD CONSTRAINT "recipe_building_classes_buildingClassId_fkey" FOREIGN KEY ("buildingClassId") REFERENCES "building_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_building_classes" ADD CONSTRAINT "recipe_building_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
