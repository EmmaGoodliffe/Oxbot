import Ajv from "ajv";
import batchSchema from "./batch.json";

const ajv = new Ajv();

export const checkBatch = (obj: unknown) => {
  console.time("compile");
  const validate = ajv.compile(batchSchema);
  console.timeEnd("compile");
  const valid = validate(obj);
  if (valid) return true;
  return validate.errors ?? [];
};
