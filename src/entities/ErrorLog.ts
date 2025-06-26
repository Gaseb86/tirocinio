import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "./index";

export enum ErrorType {
  OpenAI = "OpenAI",
  DataBase = "DataBase",
  Other = "Other",
}

class ErrorLog extends Model<
  InferAttributes<ErrorLog>,
  InferCreationAttributes<ErrorLog>
> {
  declare id?: number;
  declare error_datetime: Date;
  declare stack_trace?: string;
  declare error_message?: string;
  declare error_type: ErrorType;
}

ErrorLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    error_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    stack_trace: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_type: {
      type: DataTypes.ENUM,
      values: Object.values(ErrorType),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ErrorLog",
    tableName: "error_log",
    freezeTableName: true,
    timestamps: false,
  }
);

export default ErrorLog;
