import { Box, VStack, Link, IconButton, Text, Flex } from "@chakra-ui/react";
import { FaHome, FaVolumeUp, FaDumbbell, FaTrophy, FaGift, FaShoppingBag, FaUser, FaPlus } from "react-icons/fa";

const NavItem = ({ href, icon, label, active }) => (
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
    color={active ? "#58cc02" : "gray.500"}
    _hover={{ bg: "gray.100", color: "gray.700" }}
  >
    <IconButton
      aria-label={label}
      icon={icon}
      size="md"
      variant="ghost"
      bg={active ? "#e5f7d4" : "transparent"}
      borderRadius="lg"
    />
    <Text>{label}</Text>
  </Link>
);

const NavBar = () => {
  return (
    <Box as="nav" w="250px" minH="100vh" p={4} boxShadow="md" bg="white">
      <VStack spacing={2} align="stretch">
        <NavItem href="#" icon={<FaHome size={20} />} label="MON COURS" active />
        <NavItem href="#" icon={<FaVolumeUp size={20} />} label="SONS" />
        <NavItem href="#" icon={<FaDumbbell size={20} />} label="ENTRAÎNEMENT" />
        <NavItem href="#" icon={<FaTrophy size={20} />} label="LIGUES" />
        <NavItem href="#" icon={<FaGift size={20} />} label="QUÊTES" />
        <NavItem href="#" icon={<FaShoppingBag size={20} />} label="BOUTIQUE" />
        <NavItem href="#" icon={<FaUser size={20} />} label="PROFIL" />
        <NavItem href="#" icon={<FaPlus size={20} />} label="PLUS" />
      </VStack>
    </Box>
  );
};

const Layout = ({ children }) => {
    return (
        <Flex>
        <NavBar />
        <Box flex={1}>{children}</Box>
        </Flex>
    );
};

export { NavBar, Layout };
