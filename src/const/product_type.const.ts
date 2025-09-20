export const ProductTypes = [
	"Food",
	"Beverage",
	"Clothes",
	"Furniture",
	"Tools",
] as const;

export const enum ProductType {
	Food = "Food",
	Beverage = "Beverage",
	Clothes = "Clothes",
	Furniture = "Furniture",
	Tools = "Tools",
}

export type ProductTypeValue = keyof typeof ProductType;
