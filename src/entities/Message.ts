import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "./index";

export enum MessageType {
  GPT = "GPT",
  Admin = "Admin",
  User = "User",
  Ticket = "Ticket"
}

class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id?: number;
  declare user_id: string;
  declare assistant_id: string;
  declare thread_id?: string;
  declare message: string;
  declare type: MessageType;
  declare datetime: Date;
  declare ticketOpen: boolean;
  declare ticket_id?: number | null;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    assistant_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    thread_id: {
      type: DataTypes.STRING(45) || null,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(MessageType),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ticketOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.INTEGER || null,
    }
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "message",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Message;
