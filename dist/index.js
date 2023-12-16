"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const morgan = require("morgan");
const config = require("config");
const PORT = config.get("PORT");
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello, this is Express + TypeScript");
});
app.post("/", (req, res) => {
    console.log(req.body);
    res.send("Hello, this is Express + TypeScript");
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // await mongoose.connect(Uri, {
            //   useNewUrlParser: true,
            //   useUnifiedTopology: true,
            //   useCreateIndex: true,
            // });
            app.listen(process.env.PORT || PORT, () => {
                console.log("Server started");
            });
        }
        catch (e) {
            console.log(e, "error");
        }
    });
}
start();
