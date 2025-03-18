import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
// import App from "./App";
import theme from "./theme";
import { NavBar, Layout } from "./components/NavBar";
import Lessons from "./components/Lessons";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Layout>
        <Lessons />
      </Layout>
    </ChakraProvider>
  </React.StrictMode>
);
