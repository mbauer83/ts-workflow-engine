import { expectType } from "tsd";
import { failure, success, type Result } from "../src/common/result.js";

const ok = success({ value: 42 as const });
expectType<Result<{ value: 42 }, never>>(ok);

if (ok.success) {
  expectType<{ value: 42 }>(ok.value);
}

const err = failure({ code: "E_FAIL" as const });
expectType<Result<never, { code: "E_FAIL" }>>(err);

if (!err.success) {
  expectType<{ code: "E_FAIL" }>(err.error);
}
