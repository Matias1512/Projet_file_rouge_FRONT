import { Box, VStack, Link, IconButton, Text, Flex, useColorModeValue, Button, useColorMode, Icon } from "@chakra-ui/react";
import { FaHome, FaClock, FaDumbbell, FaTrophy, FaGift, FaShoppingBag, FaUser, FaPlus, FaSun, FaMoon } from "react-icons/fa";

const NavItem = ({ href, icon, label, active, color, onClick }) => (
    <Flex
        as={href ? Link : Button}
        href={href}
        onClick={onClick}
        display="flex"
        alignItems="center"
        gap={3}
        px={5}
        py={3}
        borderRadius="xl"
        fontWeight="bold"
        fontSize="sm"
        transition="background-color 0.2s, color 0.2s"
        bg={active ? "red.400" : "transparent"}
        color={active ? "light" : color}
        _hover={{ bg: "gray.100", color: "gray.700" }}
        width="100%"
        justifyContent="flex-start"
    >
        <Icon as={icon} boxSize={5} color={color} />
        <Text>{label}</Text>
    </Flex>
);

const NavBar = () => {
  const textColor = useColorModeValue("dark", "light");

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="nav" w="250px" minH="100vh" p={4} boxShadow="md" bg={colorMode} color={textColor}>
      <VStack spacing={2} align="stretch">
        <NavItem href="/" icon={FaHome} label="MON COURS" active color={textColor} />
        <NavItem href="#" icon={FaClock} label="DEFIS" color={textColor} />
        <NavItem href="#" icon={FaUser} label="PROFIL" color={textColor} />
        <NavItem href="/achievements" icon={FaTrophy} label="BADGE" color={textColor} />
        <NavItem 
          onClick={toggleColorMode} 
          icon={colorMode === "light" ? FaMoon : FaSun} 
          label={colorMode === "light" ? "MODE SOMBRE" : "MODE LUMIERE"} 
          color={textColor}
        />
      </VStack>
    </Box>
  );
};

const LayoutNavBar = ({ children }) => {
  return (
    <Flex>
      <NavBar />
      <Box flex={1}>{children}</Box>
    </Flex>
  );
};

export { NavBar, LayoutNavBar };