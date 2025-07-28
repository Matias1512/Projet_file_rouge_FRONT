// src/components/LayoutWithNavbar.jsx
import { LayoutNavBar } from "./NavBar";
import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";

const LayoutWithNavbar = () => {
  return (
    <Flex h="100vh" overflow="hidden">
      <LayoutNavBar />
      <Box flex="1" p={0} h="100vh" overflow="hidden">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default LayoutWithNavbar;
