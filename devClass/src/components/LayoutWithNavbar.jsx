// src/components/LayoutWithNavbar.jsx
import { LayoutNavBar } from "./NavBar";
import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";

const LayoutWithNavbar = () => {
  return (
    <Flex>
      <LayoutNavBar />
      <Box flex="1" p={4}>
        <Outlet />
      </Box>
    </Flex>
  );
};

export default LayoutWithNavbar;
