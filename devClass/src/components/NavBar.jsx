import { Box, VStack, Link, Text, Flex, useColorModeValue, Button, useColorMode, Icon } from "@chakra-ui/react";
import { FaHome, FaClock, FaTrophy, FaUser, FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import PropTypes from 'prop-types';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const NavItem = ({ href, icon, label, active, color, onClick }) => (
    <Flex
        as={href && !onClick ? Link : Button}
        href={href && !onClick ? href : undefined}
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
        variant="ghost"
    >
        <Icon as={icon} boxSize={5} color={color} />
        <Text>{label}</Text>
    </Flex>
);

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

const NavBar = () => {
  const textColor = useColorModeValue("dark", "light");
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box as="nav" w="250px" minH="100vh" p={4} boxShadow="md" bg={useColorModeValue("gray.100", "gray.800")} color={textColor} borderRight="2px solid" borderRightColor="red.500">
      <VStack spacing={2} align="stretch">
        <NavItem href="/" icon={FaHome} label="MON COURS" active color={textColor} />
        <NavItem href="/challenges" icon={FaClock} label="DEFIS" color={textColor} />
        <NavItem href="/profile" icon={FaUser} label="PROFIL" color={textColor} />
        <NavItem href="/achievements" icon={FaTrophy} label="BADGE" color={textColor} />
        <NavItem 
          onClick={toggleColorMode} 
          icon={colorMode === "light" ? FaMoon : FaSun} 
          label={colorMode === "light" ? "MODE SOMBRE" : "MODE LUMIERE"} 
          color={textColor}
        />
        {isAuthenticated && (
          <NavItem 
            onClick={handleLogout} 
            icon={FaSignOutAlt} 
            label="DECONNEXION" 
            color={textColor}
          />
        )}
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

LayoutNavBar.propTypes = {
  children: PropTypes.node.isRequired
};

export { NavBar, LayoutNavBar };