import Ajv from "ajv";
import comSchema from "./commitment.json";

const ajv = new Ajv();

export const checkCom = (obj: unknown) => {
  console.time("compile");
  const validateCom = ajv.compile(comSchema);
  console.timeEnd("compile");
  const valid = validateCom(obj);
  if (valid) return true;
  return validateCom.errors ?? [];
};
