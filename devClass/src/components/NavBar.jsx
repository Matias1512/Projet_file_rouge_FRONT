import { Box, VStack, Link, IconButton, Text, Flex, useColorModeValue, Button, useColorMode, Icon } from "@chakra-ui/react";
import { FaHome, FaClock, FaDumbbell, FaTrophy, FaGift, FaShoppingBag, FaUser, FaPlus, FaSun, FaMoon } from "react-icons/fa";

const NavItem = ({ href, icon, label, active, color }) => (
  <Link
    href={href}
    display="flex"
    alignItems="center"
    gap={3}
    px={5}
    py={3}
    borderRadius="xl"
    fontWeight="bold"
    fontSize="sm"
    transition="background-color 0.2s, color 0.2s"
    bg={active ? "blue.400" : "transparent"}
    color={active ? "light" : color}
    _hover={{ bg: "gray.100", color: "gray.700" }}
  >
    <IconButton
      aria-label={label}
      icon={icon}
      size="md"
      variant="ghost"
      borderRadius="lg"
      color={color}
    />
    <Text>{label}</Text>
  </Link>
);

const NavBar = () => {
  const textColor = useColorModeValue("dark", "light");

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="nav" w="250px" minH="100vh" p={4} boxShadow="md" bg={colorMode} color={textColor}>
      <VStack spacing={2} align="stretch">
        <NavItem href="#" icon={<FaHome size={20} />} label="MON COURS" active color={textColor} />
        <NavItem href="#" icon={<FaClock size={20} />} label="DEFIS" color={textColor} />
        <NavItem href="#" icon={<FaUser size={20} />} label="PROFIL" color={textColor} />
        <NavItem href="#" icon={<FaTrophy size={20} />} label="BADGE" color={textColor} />
        <Button onClick={toggleColorMode} mt={4} leftIcon={<Icon as={colorMode === "light" ? FaMoon : FaSun} />}>
        {colorMode === "light" ? "Mode Sombre" : "Mode Lumière"}
        </Button>
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