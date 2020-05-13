import { sum } from "./utils.js";
import chai from "chai";

const t = { foo: "bar", arr: [{ foo: "bar" }] };

chai.expect({ foo: "bar", arr: [{ foo: "bar" }] }).to.deep.equal(t);
