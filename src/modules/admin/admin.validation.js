import Joi from "joi";
import { isValidOBJ } from "../../middleware/validation.middleware.js";
import { roles } from "../../DB/models/user.model.js";


export const changeRoleSchema = Joi.object({
  userId: Joi.custom(isValidOBJ).required(),
   role: Joi.string()
      .valid(...Object.keys(roles))
      .required(),
});



