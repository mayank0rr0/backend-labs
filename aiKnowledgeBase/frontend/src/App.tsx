import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from "./routes";

export default function App() {
  return <>
    <BrowserRouter>
      <Routes>
        {routes.map(x => <Route path={x.path} element={<x.component />}/>)}
      </Routes>
    </BrowserRouter>
  </>
}