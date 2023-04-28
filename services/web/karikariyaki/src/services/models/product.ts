import { PopulateOptions, Types } from "mongoose";

// Models
import { ProductModel, VariantModel } from "@models";

// Services
import { DatabaseService, StringService } from "@services";

interface DefaultParams {
    id?: string;
    name?: string;
    variants?: Types.ObjectId[];
}

type QueryableParams = DefaultParams;

type CreatableParams = Pick<DefaultParams, "name">;

type EditableParams = Pick<DefaultParams, "name">;

export class ProductService {
    public static visibleParameters = ["name", "variants"];

    private static _populateOptions = {
        path: "variants",
        select: "name",
    } as PopulateOptions;

    public static async queryAll() {
        await DatabaseService.getConnection();

        return ProductModel.find().select(ProductService.visibleParameters);
    }

    public static async query(values: QueryableParams) {
        await DatabaseService.getConnection();

        const query = [];

        if (values.id) {
            return (
                await ProductModel.findById(
                    StringService.toObjectId(values.id)
                ).select(ProductService.visibleParameters)
            ).populate(ProductService._populateOptions);
        }

        if (values.name) {
            query.push({
                name: DatabaseService.generateBroadQuery(values.name),
            });
        }

        if (values.variants) {
            query.push({ variants: values.variants });
        }

        return await ProductModel.find(
            query.length === 0 ? null : { $or: query }
        )
            .select(ProductService.visibleParameters)
            .populate(ProductService._populateOptions);
    }

    public static async save(values: CreatableParams) {
        await DatabaseService.getConnection();

        const newEntry = new ProductModel();

        newEntry.name = values.name.trim();

        return newEntry.save();
    }

    public static async update(id: string, values: EditableParams) {
        await DatabaseService.getConnection();

        values.name = values.name?.trim();

        return ProductModel.findByIdAndUpdate(
            StringService.toObjectId(id),
            { $set: values },
            { new: true, runValidators: true }
        )
            .select(ProductService.visibleParameters)
            .populate(ProductService._populateOptions);
    }

    public static async delete(id: string) {
        await DatabaseService.getConnection();

        const productId = StringService.toObjectId(id);

        const foundVariants = await VariantModel.find({
            product: productId,
        });

        for (const foundVariant of foundVariants) {
            await VariantModel.findByIdAndDelete(foundVariant._id);
        }

        return ProductModel.findByIdAndDelete(productId);
    }
}
