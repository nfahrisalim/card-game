import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import "nes.css/css/nes.min.css";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
