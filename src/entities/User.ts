import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "./index";
import Message from "./Message";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare user_id: string;
  declare telegram_id?: string;
  declare thread_id: string;
  declare assistant_id: string;
  declare last_time_used: Date;
  declare username?: string | null;
}

User.init(
  {
    user_id: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      allowNull: false,
    },
    telegram_id: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    thread_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    assistant_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    last_time_used: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user",
    freezeTableName: true,
    timestamps: false,
  }
);

User.hasMany(Message, {
  foreignKey: "user_id",
  sourceKey: "user_id",
  as: "messages",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default User;
