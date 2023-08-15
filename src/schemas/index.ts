import Ajv from "ajv";
import batchSchema from "./batched.json";

const ajv = new Ajv();

export const checkBatch = (obj: unknown) => {
  const validate = ajv.compile(batchSchema);
  const valid = validate(obj);
  if (valid) return true;
  return validate.errors ?? [];
};
