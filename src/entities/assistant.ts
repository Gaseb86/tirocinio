import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "./index";

class Assistant extends Model<
  InferAttributes<Assistant>,
  InferCreationAttributes<Assistant>
> {
  declare id: number;
  declare assistant_id: number;
  declare name?: string;
  declare img?: string;
}

Assistant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assistant_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
    },
    img: {
      type: DataTypes.TEXT('long'),
    }
  },
  {
    sequelize,
    modelName: "assistant",
    tableName: "assistant",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Assistant;
