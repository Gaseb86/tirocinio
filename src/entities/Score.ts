import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "./index";

class Score extends Model<
  InferAttributes<Score>,
  InferCreationAttributes<Score>
> {
  declare id?: number;
  declare answer: string;
  declare reply: string;
  declare score: number;
}

Score.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "score",
    tableName: "score",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Score;
