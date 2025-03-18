import { Box, VStack, Link, IconButton, Text, Flex, useColorModeValue, Button, useColorMode } from "@chakra-ui/react";
import { FaHome, FaVolumeUp, FaDumbbell, FaTrophy, FaGift, FaShoppingBag, FaUser, FaPlus, FaSun, FaMoon } from "react-icons/fa";

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
    bg={active ? "#e5f7d4" : "transparent"}
    color={active ? "#58cc02" : color}
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
        <NavItem href="#" icon={<FaVolumeUp size={20} />} label="SONS" color={textColor} />
        <NavItem href="#" icon={<FaDumbbell size={20} />} label="ENTRAÎNEMENT" color={textColor} />
        <NavItem href="#" icon={<FaTrophy size={20} />} label="LIGUES" color={textColor} />
        <NavItem href="#" icon={<FaGift size={20} />} label="QUÊTES" color={textColor} />
        <NavItem href="#" icon={<FaShoppingBag size={20} />} label="BOUTIQUE" color={textColor} />
        <NavItem href="#" icon={<FaUser size={20} />} label="PROFIL" color={textColor} />
        <NavItem href="#" icon={<FaPlus size={20} />} label="PLUS" color={textColor} />
        <Button onClick={toggleColorMode}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
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